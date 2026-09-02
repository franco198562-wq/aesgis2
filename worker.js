const DEFAULT = {
  departments: [
    { id: "civilian", name: "Civilian Operations", description: "Community information, civilian resources and general operations.", icon: "C", tags: ["GENERAL", "OPERATIONS"] },
    { id: "police", name: "New South Wales Police Force", description: "Documentation and resources for the New South Wales Police Force.", icon: "N", tags: ["EQUIPMENT POLICY", "VEHICLE POLICY", "POLICIES"] },
    { id: "staff", name: "Staff", description: "Staff standards, procedures and internal resources.", icon: "S", tags: ["STAFF", "TRAINING"] }
  ],
  tags: ["STANDARD OPERATING PROCEDURE", "EQUIPMENT POLICY", "POLICY", "STAFF", "TRAINING"]
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    try {
      if (url.pathname === "/api/auth/discord" && request.method === "GET") return oauthStart(env);
      if (url.pathname === "/api/auth/callback" && request.method === "GET") return oauthCallback(request, env);
      if (url.pathname === "/api/auth/me" && request.method === "GET") return authMe(request, env);
      if (url.pathname === "/api/auth/logout" && request.method === "POST") return logout();
      if (url.pathname === "/api/pages" && request.method === "GET") return getPages(env);
      if (url.pathname === "/api/pages" && request.method === "PUT") return putPages(request, env);

      return env.ASSETS.fetch(request);
    } catch (error) {
      console.error(error);
      return json({ error: "Internal server error" }, 500);
    }
  }
};

function oauthStart(env) {
  if (!env.DISCORD_CLIENT_ID || !env.DISCORD_REDIRECT_URI) {
    return new Response("Discord OAuth is not configured.", { status: 500 });
  }

  const state = crypto.randomUUID();
  const params = new URLSearchParams({
    client_id: env.DISCORD_CLIENT_ID,
    response_type: "code",
    redirect_uri: env.DISCORD_REDIRECT_URI,
    scope: "identify guilds.members.read",
    state
  });

  return new Response(null, {
    status: 302,
    headers: {
      Location: "https://discord.com/oauth2/authorize?" + params.toString(),
      "Set-Cookie": `aegis_oauth_state=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`
    }
  });
}

async function oauthCallback(request, env) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const returnedState = url.searchParams.get("state");
  const cookies = request.headers.get("Cookie") || "";
  const stateCookie = getCookie(cookies, "aegis_oauth_state");

  if (!code || !returnedState || !stateCookie || returnedState !== stateCookie) {
    return new Response("Invalid OAuth state.", { status: 400 });
  }

  try {
    const token = await discordToken(code, env);
    const user = await discordGet("https://discord.com/api/users/@me", token);
    const member = await discordGet(
      `https://discord.com/api/users/@me/guilds/${encodeURIComponent(env.DISCORD_GUILD_ID)}/member`,
      token
    );

    const roles = Array.isArray(member.roles) ? member.roles : [];
    const allowed = String(env.AUTHORIZED_ROLE_IDS || "")
      .split(",")
      .map(x => x.trim())
      .filter(Boolean);
    const authorized = roles.some(roleId => allowed.includes(roleId));

    const payload = {
      userId: user.id,
      username: user.global_name || user.username,
      authorized,
      exp: Date.now() + 8 * 60 * 60 * 1000
    };

    const session = await sign(payload, env.SESSION_SECRET);
    const headers = new Headers();
    headers.set("Location", authorized ? "/admin.html" : "/index.html");
    headers.append("Set-Cookie", `aegis_session=${session}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=28800`);
    headers.append("Set-Cookie", "aegis_oauth_state=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0");
    return new Response(null, { status: 302, headers });
  } catch (error) {
    console.error("Discord OAuth error", error);
    return new Response("Discord login failed. Check the OAuth and Discord server configuration.", { status: 500 });
  }
}

async function discordToken(code, env) {
  const body = new URLSearchParams({
    client_id: env.DISCORD_CLIENT_ID,
    client_secret: env.DISCORD_CLIENT_SECRET,
    grant_type: "authorization_code",
    code,
    redirect_uri: env.DISCORD_REDIRECT_URI
  });

  const response = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body
  });

  if (!response.ok) throw new Error("Token exchange failed");
  const data = await response.json();
  if (!data.access_token) throw new Error("Discord did not return an access token");
  return data.access_token;
}

async function discordGet(url, token) {
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!response.ok) throw new Error(`Discord API request failed (${response.status})`);
  return response.json();
}

async function authMe(request, env) {
  const token = getCookie(request.headers.get("Cookie") || "", "aegis_session");
  if (!token) return json({ authenticated: false, authorized: false });

  const payload = await verify(token, env.SESSION_SECRET);
  if (!payload || !payload.exp || payload.exp <= Date.now()) {
    return json({ authenticated: false, authorized: false });
  }

  return json({
    authenticated: true,
    authorized: !!payload.authorized,
    username: payload.username,
    userId: payload.userId
  });
}

function logout() {
  return new Response(JSON.stringify({ ok: true }), {
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": "aegis_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0"
    }
  });
}

async function getPages(env) {
  if (!env.DB) return json(DEFAULT);
  const row = await env.DB.prepare("SELECT value FROM portal_content WHERE id='main'").first();
  if (!row) return json(DEFAULT);

  try {
    return json(JSON.parse(row.value));
  } catch {
    return json(DEFAULT);
  }
}

async function putPages(request, env) {
  const session = await getSession(request, env);
  if (!session?.authorized) return json({ error: "Not authorised" }, 403);
  if (!env.DB) return json({ error: "D1 database is not configured" }, 500);

  let data;
  try {
    data = await request.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  if (!data || !Array.isArray(data.departments) || !Array.isArray(data.tags)) {
    return json({ error: "Invalid portal data" }, 400);
  }

  const clean = {
    departments: data.departments.slice(0, 100).map(d => ({
      id: String(d.id || crypto.randomUUID()).slice(0, 100),
      name: String(d.name || "Untitled Department").slice(0, 120),
      description: String(d.description || "").slice(0, 1000),
      icon: String(d.icon || "A").slice(0, 2),
      tags: Array.isArray(d.tags) ? d.tags.slice(0, 30).map(t => String(t).slice(0, 60)) : []
    })),
    tags: data.tags.slice(0, 100).map(t => String(t).slice(0, 60))
  };

  await env.DB.prepare(
    "INSERT INTO portal_content(id,value,updated_at) VALUES('main',?,?) ON CONFLICT(id) DO UPDATE SET value=excluded.value,updated_at=excluded.updated_at"
  ).bind("main", JSON.stringify(clean), new Date().toISOString()).run();

  return json({ ok: true });
}

async function getSession(request, env) {
  if (!env.SESSION_SECRET) return null;
  const token = getCookie(request.headers.get("Cookie") || "", "aegis_session");
  if (!token) return null;

  const payload = await verify(token, env.SESSION_SECRET);
  if (!payload || !payload.exp || payload.exp <= Date.now()) return null;
  return payload;
}

async function sign(payload, secret) {
  if (!secret) throw new Error("SESSION_SECRET is not configured");
  const encoded = b64(new TextEncoder().encode(JSON.stringify(payload)));
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(encoded));
  return encoded + "." + b64(new Uint8Array(signature));
}

async function verify(token, secret) {
  try {
    if (!secret) return null;
    const [payloadPart, signaturePart] = token.split(".");
    if (!payloadPart || !signaturePart) return null;

    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      fromB64(signaturePart),
      new TextEncoder().encode(payloadPart)
    );

    if (!valid) return null;
    return JSON.parse(new TextDecoder().decode(fromB64(payloadPart)));
  } catch {
    return null;
  }
}

function getCookie(cookieHeader, name) {
  const value = cookieHeader
    .split(";")
    .map(part => part.trim())
    .find(part => part.startsWith(name + "="));
  return value ? value.slice(name.length + 1) : null;
}

function b64(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromB64(value) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(padded);
  return Uint8Array.from(binary, char => char.charCodeAt(0));
}

function json(value, status = 200) {
  return new Response(JSON.stringify(value), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store"
    }
  });
}
