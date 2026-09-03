const DEFAULT_DATA = {
  hero: {
    title: "Training that sees the person behind every case.",
    text: "The Aegis Institute supports Discord communities and individuals through personalised consulting and structured education — built around your rules, your people, and your goals.",
    cardTitle: "Two branches. One standard of care.",
    cardText: "Consulting for communities that want clarity — education for staff and aspiring moderators who want to know where to start."
  },

  services: [
    {
      label: "SERVER OWNERS",
      title: "Outsourced staff training",
      description: "High-quality training, assessments and feedback aligned to your rules and procedures.",
      bullets: [
        "Training, assessments & educator support",
        "Structured standards",
        "Actionable feedback"
      ]
    },
    {
      label: "PLAYERS",
      title: "Moderator & Advanced Fundamentals",
      description: "Preparation for aspiring moderators and supervisors who want to build practical skills.",
      bullets: [
        "Moderator fundamentals",
        "Advanced fundamentals",
        "Practical scenarios"
      ]
    }
  ],

  work: [
    {
      label: "STAFF DEVELOPMENT",
      title: "Structured staff programmes",
      description: "Clear pathways for trainees, moderators, supervisors and leadership teams."
    },
    {
      label: "STANDARDS",
      title: "Policies that people can actually use",
      description: "Practical policies, procedures and expectations written around the way your community operates."
    },
    {
      label: "CONSULTING",
      title: "An external perspective",
      description: "Honest feedback on systems, staff structures, training and community operations."
    },
    {
      label: "EDUCATION",
      title: "Training built around scenarios",
      description: "Learn through examples and situations that staff can actually encounter."
    }
  ],

  contact: {
    title: "Let's talk about what your community needs.",
    text: "Have a question, project idea, or training requirement? Send a message and the Aegis team can help."
  }
};


/* =========================================================
   MAIN WORKER
========================================================= */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/auth/discord") {
      return startDiscordLogin(env);
    }

    if (url.pathname === "/api/auth/callback") {
      return discordCallback(request, env);
    }

    if (url.pathname === "/api/auth/me") {
      return getMe(request, env);
    }

    if (url.pathname === "/api/auth/logout") {
      return logout();
    }

    if (url.pathname === "/api/content") {
      if (request.method === "GET") {
        return getContent(env);
      }

      if (request.method === "PUT") {
        return saveContent(request, env);
      }

      return json(
        {
          error: "Method not allowed."
        },
        405
      );
    }

    return env.ASSETS.fetch(request);
  }
};


/* =========================================================
   DISCORD LOGIN
========================================================= */

function startDiscordLogin(env) {
  const state = crypto.randomUUID();

  const clientId =
    String(env.DISCORD_CLIENT_ID || "").trim();

  const redirectUri =
    String(env.DISCORD_REDIRECT_URI || "").trim();

  if (!clientId || !redirectUri) {
    return new Response(
      "Discord OAuth is not configured correctly on this Worker.",
      {
        status: 500,
        headers: {
          "Content-Type": "text/plain; charset=UTF-8"
        }
      }
    );
  }

  /*
    IMPORTANT:

    We only request "identify".

    We do NOT request guilds.members.read anymore.

    The bot will check the user's server roles after
    Discord returns the OAuth code.
  */

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: redirectUri,
    scope: "identify",
    state: state
  });

  const discordUrl =
    "https://discord.com/oauth2/authorize?" +
    params.toString();

  return new Response(null, {
    status: 302,

    headers: {
      Location: discordUrl,

      "Set-Cookie":
        `aegis_oauth_state=${state}; ` +
        "Path=/; " +
        "HttpOnly; " +
        "Secure; " +
        "SameSite=Lax; " +
        "Max-Age=600",

      "Cache-Control": "no-store"
    }
  });
}


/* =========================================================
   DISCORD CALLBACK
========================================================= */

async function discordCallback(request, env) {
  const url = new URL(request.url);

  const oauthError =
    url.searchParams.get("error");

  const oauthErrorDescription =
    url.searchParams.get("error_description");

  if (oauthError) {
    return new Response(
      "Discord OAuth error: " +
      oauthError +
      (
        oauthErrorDescription
          ? " - " + oauthErrorDescription
          : ""
      ),
      {
        status: 400,

        headers: {
          "Content-Type":
            "text/plain; charset=UTF-8",

          "Cache-Control":
            "no-store"
        }
      }
    );
  }

  const code =
    url.searchParams.get("code");

  const returnedState =
    url.searchParams.get("state");

  const cookies =
    request.headers.get("Cookie") || "";

  const stateCookie =
    getCookie(
      cookies,
      "aegis_oauth_state"
    );

  if (
    !code ||
    !returnedState ||
    !stateCookie ||
    returnedState !== stateCookie
  ) {
    return new Response(
      "Invalid OAuth state. Please try logging in again.",
      {
        status: 400,

        headers: {
          "Content-Type":
            "text/plain; charset=UTF-8",

          "Cache-Control":
            "no-store"
        }
      }
    );
  }

  try {
    /*
      Exchange the OAuth code for an access token.
    */

    const accessToken =
      await exchangeCode(
        code,
        env
      );

    /*
      Get the Discord user.
    */

    const user =
      await discordGet(
        "https://discord.com/api/v10/users/@me",
        accessToken
      );

    /*
      Check this user's roles using the BOT.

      This means we don't need to request
      guilds.members.read from the user.
    */

    const member =
      await getGuildMemberUsingBot(
        user.id,
        env
      );

    const roles =
      Array.isArray(member.roles)
        ? member.roles
        : [];

    /*
      Get the role IDs that are allowed to edit
      the Aegis website.
    */

    const allowedRoles =
      String(
        env.AUTHORIZED_ROLE_IDS || ""
      )
        .split(",")
        .map(role => role.trim())
        .filter(Boolean);

    /*
      User is authorized if they have at least
      one of the configured roles.
    */

    const authorized =
      roles.some(role =>
        allowedRoles.includes(role)
      );

    /*
      Create website session.
    */

    const sessionSecret =
      String(
        env.SESSION_SECRET || ""
      ).trim();

    if (!sessionSecret) {
      throw new Error(
        "SESSION_SECRET is not configured."
      );
    }

    const payload = {
      userId: user.id,

      username:
        user.global_name ||
        user.username,

      authorized,

      exp:
        Date.now() +
        8 * 60 * 60 * 1000
    };

    const session =
      await signSession(
        payload,
        sessionSecret
      );

    const destination =
      authorized
        ? "/admin.html"
        : "/";

    return new Response(null, {
      status: 302,

      headers: {
        Location: destination,

        "Set-Cookie": [
          `aegis_session=${session}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=28800`,

          "aegis_oauth_state=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0"
        ],

        "Cache-Control": "no-store"
      }
    });

  } catch (error) {
    return new Response(
      "Discord login failed: " +
      (
        error &&
        error.message
          ? error.message
          : "Unknown error."
      ),
      {
        status: 500,

        headers: {
          "Content-Type":
            "text/plain; charset=UTF-8",

          "Cache-Control":
            "no-store"
        }
      }
    );
  }
}


/* =========================================================
   GET GUILD MEMBER USING BOT
========================================================= */

async function getGuildMemberUsingBot(
  userId,
  env
) {
  const guildId =
    String(
      env.DISCORD_GUILD_ID || ""
    ).trim();

  const botToken =
    String(
      env.DISCORD_BOT_TOKEN || ""
    ).trim();

  if (!guildId) {
    throw new Error(
      "DISCORD_GUILD_ID is not configured."
    );
  }

  if (!botToken) {
    throw new Error(
      "DISCORD_BOT_TOKEN is not configured."
    );
  }

  const response =
    await fetch(
      `https://discord.com/api/v10/guilds/${guildId}/members/${userId}`,
      {
        method: "GET",

        headers: {
          "Authorization":
            `Bot ${botToken}`,

          "Accept":
            "application/json",

          "User-Agent":
            "Aegis Institute/1.0"
        }
      }
    );

  if (!response.ok) {
    let details = "";

    try {
      const errorData =
        await response.json();

      details =
        errorData.message ||
        errorData.error ||
        "";

    } catch {
      details =
        await response.text()
          .catch(() => "");
    }

    if (response.status === 404) {
      throw new Error(
        "You are not a member of the Aegis Discord server."
      );
    }

    throw new Error(
      "Discord bot could not check your server membership" +
      (
        details
          ? ": " + details
          : ` (HTTP ${response.status})`
      )
    );
  }

  return response.json();
}


/* =========================================================
   DISCORD TOKEN EXCHANGE
========================================================= */

async function exchangeCode(
  code,
  env
) {
  const clientId =
    String(
      env.DISCORD_CLIENT_ID || ""
    ).trim();

  const clientSecret =
    String(
      env.DISCORD_CLIENT_SECRET || ""
    ).trim();

  const redirectUri =
    String(
      env.DISCORD_REDIRECT_URI || ""
    ).trim();

  if (!clientId) {
    throw new Error(
      "DISCORD_CLIENT_ID is unavailable to this Worker."
    );
  }

  if (!clientSecret) {
    throw new Error(
      "DISCORD_CLIENT_SECRET is unavailable to this Worker."
    );
  }

  if (!redirectUri) {
    throw new Error(
      "DISCORD_REDIRECT_URI is unavailable to this Worker."
    );
  }

  const body =
    new URLSearchParams({
      client_id: clientId,

      client_secret: clientSecret,

      grant_type:
        "authorization_code",

      code: code,

      redirect_uri:
        redirectUri
    });

  const response =
    await fetch(
      "https://discord.com/api/v10/oauth2/token",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/x-www-form-urlencoded",

          "User-Agent":
            "Aegis Institute/1.0"
        },

        body:
          body.toString()
      }
    );

  if (!response.ok) {
    let details = "";

    try {
      const errorData =
        await response.json();

      details =
        errorData.error_description ||
        errorData.message ||
        errorData.error ||
        "";

    } catch {
      details =
        await response.text()
          .catch(() => "");
    }

    throw new Error(
      "Discord token exchange failed" +
      (
        details
          ? ": " + details
          : ` (HTTP ${response.status})`
      )
    );
  }

  const data =
    await response.json();

  if (
    !data ||
    !data.access_token
  ) {
    throw new Error(
      "Discord did not return an access token."
    );
  }

  return data.access_token;
}


/* =========================================================
   DISCORD API GET
========================================================= */

async function discordGet(
  url,
  token
) {
  const response =
    await fetch(
      url,
      {
        method: "GET",

        headers: {
          "Authorization":
            `Bearer ${token}`,

          "Accept":
            "application/json",

          "User-Agent":
            "Aegis Institute/1.0"
        }
      }
    );

  if (!response.ok) {
    let details = "";

    try {
      const errorData =
        await response.json();

      details =
        errorData.message ||
        errorData.error_description ||
        errorData.error ||
        "";

    } catch {
      details =
        await response.text()
          .catch(() => "");
    }

    throw new Error(
      "Discord API request failed" +
      (
        details
          ? ": " + details
          : ` (HTTP ${response.status})`
      )
    );
  }

  return response.json();
}


/* =========================================================
   GET CURRENT USER
========================================================= */

async function getMe(
  request,
  env
) {
  const token =
    getCookie(
      request.headers.get("Cookie") || "",
      "aegis_session"
    );

  if (!token) {
    return json({
      authenticated: false,
      authorized: false
    });
  }

  const sessionSecret =
    String(
      env.SESSION_SECRET || ""
    ).trim();

  if (!sessionSecret) {
    return json({
      authenticated: false,
      authorized: false
    });
  }

  const payload =
    await verifySession(
      token,
      sessionSecret
    );

  if (!payload) {
    return json({
      authenticated: false,
      authorized: false
    });
  }

  return json({
    authenticated: true,

    authorized:
      !!payload.authorized,

    username:
      payload.username,

    userId:
      payload.userId
  });
}


/* =========================================================
   GET WEBSITE CONTENT
========================================================= */

async function getContent(
  env
) {
  if (!env.DB) {
    return json(
      DEFAULT_DATA
    );
  }

  try {
    const row =
      await env.DB
        .prepare(
          "SELECT value FROM portal_content WHERE id = 'main'"
        )
        .first();

    if (!row) {
      return json(
        DEFAULT_DATA
      );
    }

    try {
      return json(
        JSON.parse(row.value)
      );
    } catch {
      return json(
        DEFAULT_DATA
      );
    }

  } catch {
    return json(
      DEFAULT_DATA
    );
  }
}


/* =========================================================
   SAVE WEBSITE CONTENT
========================================================= */

async function saveContent(
  request,
  env
) {
  const session =
    await getSession(
      request,
      env
    );

  if (
    !session ||
    !session.authorized
  ) {
    return json(
      {
        error:
          "You are not authorised to edit this website."
      },
      403
    );
  }

  if (!env.DB) {
    return json(
      {
        error:
          "D1 is not configured."
      },
      500
    );
  }

  let data;

  try {
    data =
      await request.json();

  } catch {
    return json(
      {
        error:
          "Invalid JSON data."
      },
      400
    );
  }

  try {
    await env.DB
      .prepare(
        `INSERT INTO portal_content
         (id, value, updated_at)
         VALUES ('main', ?, ?)
         ON CONFLICT(id)
         DO UPDATE SET
           value = excluded.value,
           updated_at = excluded.updated_at`
      )
      .bind(
        "main",
        JSON.stringify(data),
        new Date().toISOString()
      )
      .run();

    return json({
      ok: true
    });

  } catch (error) {
    return json(
      {
        error:
          error &&
          error.message
            ? error.message
            : "Unable to save content."
      },
      500
    );
  }
}


/* =========================================================
   GET SESSION
========================================================= */

async function getSession(
  request,
  env
) {
  const token =
    getCookie(
      request.headers.get("Cookie") || "",
      "aegis_session"
    );

  if (!token) {
    return null;
  }

  const secret =
    String(
      env.SESSION_SECRET || ""
    ).trim();

  if (!secret) {
    return null;
  }

  return verifySession(
    token,
    secret
  );
}


/* =========================================================
   CREATE SESSION SIGNATURE
========================================================= */

async function signSession(
  payload,
  secret
) {
  const encoded =
    base64url(
      new TextEncoder().encode(
        JSON.stringify(payload)
      )
    );

  const key =
    await crypto.subtle.importKey(
      "raw",

      new TextEncoder().encode(
        secret
      ),

      {
        name: "HMAC",
        hash: "SHA-256"
      },

      false,

      ["sign"]
    );

  const signature =
    await crypto.subtle.sign(
      "HMAC",

      key,

      new TextEncoder().encode(
        encoded
      )
    );

  return (
    encoded +
    "." +
    base64url(
      new Uint8Array(
        signature
      )
    )
  );
}


/* =========================================================
   VERIFY SESSION
========================================================= */

async function verifySession(
  token,
  secret
) {
  try {
    if (!token || !secret) {
      return null;
    }

    const parts =
      token.split(".");

    if (
      parts.length !== 2
    ) {
      return null;
    }

    const payloadPart =
      parts[0];

    const signaturePart =
      parts[1];

    const key =
      await crypto.subtle.importKey(
        "raw",

        new TextEncoder().encode(
          secret
        ),

        {
          name: "HMAC",
          hash: "SHA-256"
        },

        false,

        ["verify"]
      );

    const valid =
      await crypto.subtle.verify(
        "HMAC",

        key,

        fromBase64url(
          signaturePart
        ),

        new TextEncoder().encode(
          payloadPart
        )
      );

    if (!valid) {
      return null;
    }

    const payload =
      JSON.parse(
        new TextDecoder().decode(
          fromBase64url(
            payloadPart
          )
        )
      );

    if (
      !payload.exp ||
      payload.exp < Date.now()
    ) {
      return null;
    }

    return payload;

  } catch {
    return null;
  }
}


/* =========================================================
   LOGOUT
========================================================= */

function logout() {
  return new Response(
    JSON.stringify({
      ok: true
    }),

    {
      status: 200,

      headers: {
        "Content-Type":
          "application/json; charset=UTF-8",

        "Set-Cookie":
          "aegis_session=; " +
          "Path=/; " +
          "HttpOnly; " +
          "Secure; " +
          "SameSite=Lax; " +
          "Max-Age=0",

        "Cache-Control":
          "no-store"
      }
    }
  );
}


/* =========================================================
   COOKIE HELPER
========================================================= */

function getCookie(
  cookieString,
  name
) {
  const found =
    cookieString
      .split(";")
      .map(
        value =>
          value.trim()
      )
      .find(
        value =>
          value.startsWith(
            name + "="
          )
      );

  if (!found) {
    return null;
  }

  return found.slice(
    name.length + 1
  );
}


/* =========================================================
   BASE64URL ENCODE
========================================================= */

function base64url(
  bytes
) {
  let binary = "";

  for (
    const byte of bytes
  ) {
    binary += String.fromCharCode(
      byte
    );
  }

  return btoa(binary)
    .replace(
      /\+/g,
      "-"
    )
    .replace(
      /\//g,
      "_"
    )
    .replace(
      /=+$/g,
      ""
    );
}


/* =========================================================
   BASE64URL DECODE
========================================================= */

function fromBase64url(
  value
) {
  const base64 =
    value
      .replace(
        /-/g,
        "+"
      )
      .replace(
        /_/g,
        "/"
      )
      .padEnd(
        Math.ceil(
          value.length / 4
        ) * 4,
        "="
      );

  const binary =
    atob(base64);

  const bytes =
    new Uint8Array(
      binary.length
    );

  for (
    let i = 0;
    i < binary.length;
    i++
  ) {
    bytes[i] =
      binary.charCodeAt(i);
  }

  return bytes;
}


/* =========================================================
   JSON RESPONSE
========================================================= */

function json(
  data,
  status = 200
) {
  return new Response(
    JSON.stringify(data),

    {
      status,

      headers: {
        "Content-Type":
          "application/json; charset=UTF-8",

        "Cache-Control":
          "no-store"
      }
    }
  );
}
