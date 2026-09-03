const HARDCODED_MAIN_PASSWORD = "berzelia";

const PERMISSIONS = [
  "website",
  "design",
  "announcements",
  "login_codes",
  "documents",
  "staff"
];

const DEFAULT_DATA = {
  site_name: "THE AEGIS INSTITUTE",
  site_tagline: "Education, consulting, and professional development.",
  footer_text: "© 2026 The Aegis Institute. All rights reserved.",

  home_hero_kicker: "THE AEGIS INSTITUTE",
  home_hero_title: "Building capability. Creating confidence. Delivering better outcomes.",
  home_hero_text: "The Aegis Institute provides practical education, consulting, and support designed to help people and organisations perform with clarity and confidence.",
  home_hero_primary_button: "Explore Services",
  home_hero_primary_link: "/services.html",
  home_hero_secondary_button: "Contact Us",
  home_hero_secondary_link: "/contact.html",
  home_approach_title: "A practical approach",
  home_approach_text: "We focus on useful knowledge, clear processes, and solutions that can be applied in the real world.",
  home_education_title: "Education",
  home_education_text: "Structured learning designed to build knowledge, capability, and confidence.",
  home_consulting_title: "Consulting",
  home_consulting_text: "Practical guidance and support tailored to your goals and challenges.",
  home_cta_title: "Ready to get started?",
  home_cta_text: "Get in touch with The Aegis Institute to discuss how we can help.",
  home_cta_button: "Contact Us",
  home_cta_link: "/contact.html",

  services_kicker: "WHAT WE DO",
  services_title: "Services built around your needs.",
  services_intro: "Our services combine education, consulting, and ongoing support.",
  services_education_title: "Education & Training",
  services_education_text: "Practical training and learning experiences built around clear outcomes.",
  services_consulting_title: "Consulting",
  services_consulting_text: "Independent guidance, planning, and problem-solving for organisations and individuals.",
  services_support_title: "Ongoing Support",
  services_support_text: "Continued assistance to help turn plans and knowledge into consistent results.",

  work_kicker: "OUR WORK",
  work_title: "Practical work. Meaningful outcomes.",
  work_intro: "Explore examples of the type of work and projects supported by The Aegis Institute.",
  work_project_one_title: "Project One",
  work_project_one_text: "A practical example of education, planning, or consulting work.",
  work_project_two_title: "Project Two",
  work_project_two_text: "A practical example of structured support and professional development.",
  work_project_three_title: "Project Three",
  work_project_three_text: "A practical example of an organisation-focused solution.",

  contact_kicker: "GET IN TOUCH",
  contact_title: "Let's start a conversation.",
  contact_intro: "Have a question, project, or idea? Contact The Aegis Institute and we'll get back to you.",
  contact_discord_label: "Discord",
  contact_discord_text: "Connect with our team through Discord.",
  contact_discord_url: "#",
  contact_email_label: "Email",
  contact_email_text: "Send us an email.",
  contact_email: "",
  contact_form_title: "Contact Under Development",
  contact_form_text: "Our contact form is currently under development. Please use one of the contact methods above.",

  announcement_enabled: "false",
  announcement_title: "Announcement",
  announcement_text: "",
  announcement_link_text: "",
  announcement_link: "",

  design_primary: "#0b1f3a",
  design_primary_dark: "#07152a",
  design_accent: "#18c6c2",
  design_background: "#f5f8fa",
  design_surface: "#ffffff",
  design_surface_alt: "#eaf3f5",
  design_text: "#0b1f3a",
  design_muted: "#66758a",
  design_border: "#dce5ea",
  design_header_bg: "#ffffff",
  design_footer_bg: "#07152a",
  design_footer_text: "#ffffff",
  design_font_family: "Inter, Arial, sans-serif",
  design_heading_weight: "700",
  design_body_size: "16px",
  design_h1_size: "58px",
  design_h2_size: "40px",
  design_h3_size: "22px",
  design_line_height: "1.6",
  design_letter_spacing: "0px",
  design_content_width: "1180px",
  design_section_spacing: "100px",
  design_card_gap: "24px",
  design_card_radius: "20px",
  design_button_radius: "10px",
  design_card_shadow: "0 18px 50px rgba(11,31,58,.08)",
  design_header_height: "78px",
  design_button_padding_x: "24px",
  design_button_padding_y: "13px",
  design_mobile_section_spacing: "64px",
  design_mobile_body_size: "15px",
  design_nav_text_size: "14px",
  design_hero_title_size: "58px",
  design_hero_text_size: "18px",
  design_hero_alignment: "left",
  design_hero_show_visual: "true",
  design_services_show: "true",
  design_work_show: "true",
  design_contact_show: "true",
  design_cta_show: "true",
  design_cards_per_row: "3",
  design_announcement_show: "false"
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8"
    }
  });
}

function now() {
  return new Date().toISOString();
}

function randomString(length = 32) {
  const bytes = crypto.getRandomValues(new Uint8Array(length));

  return Array.from(
    bytes,
    byte => byte.toString(16).padStart(2, "0")
  ).join("");
}

function base64url(bytes) {
  return btoa(
    String.fromCharCode(...new Uint8Array(bytes))
  )
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function fromBase64url(value) {
  const padded =
    value.replace(/-/g, "+").replace(/_/g, "/") +
    "=".repeat((4 - value.length % 4) % 4);

  const binary = atob(padded);

  return Uint8Array.from(
    binary,
    character => character.charCodeAt(0)
  );
}

async function sha256(value) {
  const data = new TextEncoder().encode(value);

  const hash = await crypto.subtle.digest(
    "SHA-256",
    data
  );

  return Array.from(
    new Uint8Array(hash),
    byte => byte.toString(16).padStart(2, "0")
  ).join("");
}

async function hmac(value, secret) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    {
      name: "HMAC",
      hash: "SHA-256"
    },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(value)
  );

  return base64url(signature);
}

async function createSession(type, permissions, env) {
  const payload = {
    type,
    permissions: permissions || [],
    exp: Date.now() + 1000 * 60 * 60 * 24 * 7,
    nonce: randomString(16)
  };

  const encoded = base64url(
    new TextEncoder().encode(
      JSON.stringify(payload)
    )
  );

  const secret =
    env.SESSION_SECRET ||
    "CHANGE_THIS_SESSION_SECRET";

  const signature = await hmac(
    encoded,
    secret
  );

  return `${encoded}.${signature}`;
}

async function verifySession(token, env) {
  if (!token || !token.includes(".")) {
    return null;
  }

  const [encoded, signature] = token.split(".");

  const secret =
    env.SESSION_SECRET ||
    "CHANGE_THIS_SESSION_SECRET";

  const expected = await hmac(
    encoded,
    secret
  );

  if (signature !== expected) {
    return null;
  }

  try {
    const payload = JSON.parse(
      new TextDecoder().decode(
        fromBase64url(encoded)
      )
    );

    if (!payload.exp || payload.exp < Date.now()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

function getCookie(request, name) {
  const cookie = request.headers.get("Cookie") || "";

  const match = cookie.match(
    new RegExp(
      "(?:^|;\\s*)" +
      name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") +
      "=([^;]*)"
    )
  );

  return match
    ? decodeURIComponent(match[1])
    : null;
}

function sessionCookie(token) {
  return [
    `aegis_session=${encodeURIComponent(token)}`,
    "Path=/",
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
    "Max-Age=604800"
  ].join("; ");
}

function clearSessionCookie() {
  return [
    "aegis_session=",
    "Path=/",
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
    "Max-Age=0"
  ].join("; ");
}

async function getSession(request, env) {
  return verifySession(
    getCookie(request, "aegis_session"),
    env
  );
}

function isAdmin(session) {
  return session?.type === "admin";
}

function hasPermission(session, permission) {
  return (
    isAdmin(session) ||
    session?.permissions?.includes(permission)
  );
}

function requirePermission(session, permission) {
  if (!session) {
    return json(
      { error: "Not authenticated." },
      401
    );
  }

  if (!hasPermission(session, permission)) {
    return json(
      {
        error:
          "You do not have permission to perform this action."
      },
      403
    );
  }

  return null;
}

async function getContent(env) {
  const rows = await env.DB.prepare(
    "SELECT id, value FROM portal_content"
  ).all();

  const data = {
    ...DEFAULT_DATA
  };

  for (const row of rows.results || []) {
    data[row.id] = row.value;
  }

  return data;
}

async function saveContent(env, incoming) {
  const data = {
    ...DEFAULT_DATA,
    ...incoming
  };

  const statements = Object.entries(data).map(
    ([id, value]) =>
      env.DB.prepare(
        `INSERT INTO portal_content
        (id, value, updated_at)
        VALUES (?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
        value = excluded.value,
        updated_at = excluded.updated_at`
      ).bind(
        id,
        String(value ?? ""),
        now()
      )
  );

  if (statements.length) {
    await env.DB.batch(statements);
  }

  return getContent(env);
}

function makeCode() {
  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  const bytes =
    crypto.getRandomValues(
      new Uint8Array(10)
    );

  let output = "";

  for (let i = 0; i < 10; i++) {
    output +=
      chars[bytes[i] % chars.length];
  }

  return (
    output.slice(0, 5) +
    "-" +
    output.slice(5)
  );
}

async function loginWithPassword(request, env) {
  const body =
    await request.json().catch(() => ({}));

  const password =
    String(body.password || "");

  if (
    !HARDCODED_MAIN_PASSWORD ||
    HARDCODED_MAIN_PASSWORD ===
      "PUT-YOUR-PASSWORD-HERE"
  ) {
    return json(
      {
        error:
          "Replace PUT-YOUR-PASSWORD-HERE in worker.js with your administrator password."
      },
      500
    );
  }

  if (
    password !==
    HARDCODED_MAIN_PASSWORD
  ) {
    return json(
      {
        error:
          "Incorrect administrator password."
      },
      401
    );
  }

  const token =
    await createSession(
      "admin",
      PERMISSIONS,
      env
    );

  return new Response(
    JSON.stringify({
      ok: true,
      type: "admin",
      permissions: PERMISSIONS
    }),
    {
      status: 200,
      headers: {
        "content-type":
          "application/json; charset=utf-8",
        "Set-Cookie":
          sessionCookie(token)
      }
    }
  );
}

async function loginWithCode(request, env) {
  const body =
    await request.json().catch(() => ({}));

  const rawCode =
    String(body.code || "")
      .trim()
      .toUpperCase();

  if (!rawCode) {
    return json(
      {
        error:
          "Please enter a staff login code."
      },
      400
    );
  }

  const codeHash =
    await sha256(rawCode);

  const row =
    await env.DB.prepare(
      `SELECT
        id,
        name,
        permissions,
        active,
        expires_at
       FROM login_codes
       WHERE code_hash = ?
       LIMIT 1`
    )
      .bind(codeHash)
      .first();

  if (!row || !row.active) {
    return json(
      {
        error:
          "Invalid or inactive staff code."
      },
      401
    );
  }

  if (
    row.expires_at &&
    new Date(row.expires_at).getTime() <
      Date.now()
  ) {
    return json(
      {
        error:
          "This staff code has expired."
      },
      401
    );
  }

  let permissions = [];

  try {
    permissions =
      JSON.parse(
        row.permissions || "[]"
      );
  } catch {
    permissions = [];
  }

  permissions =
    permissions.filter(
      permission =>
        PERMISSIONS.includes(permission)
    );

  await env.DB.prepare(
    `UPDATE login_codes
     SET last_used_at = ?
     WHERE id = ?`
  )
    .bind(now(), row.id)
    .run();

  const token =
    await createSession(
      "staff",
      permissions,
      env
    );

  return new Response(
    JSON.stringify({
      ok: true,
      type: "staff",
      name: row.name,
      permissions
    }),
    {
      status: 200,
      headers: {
        "content-type":
          "application/json; charset=utf-8",
        "Set-Cookie":
          sessionCookie(token)
      }
    }
  );
}

async function handleLogin(request, env) {
  const body =
    await request.json().catch(() => ({}));

  if (
    body.password !== undefined
  ) {
    return loginWithPassword(
      new Request(request, {
        body: JSON.stringify({
          password: body.password
        })
      }),
      env
    );
  }

  if (
    body.code !== undefined
  ) {
    return loginWithCode(
      new Request(request, {
        body: JSON.stringify({
          code: body.code
        })
      }),
      env
    );
  }

  return json(
    {
      error:
        "Enter an administrator password or staff code."
    },
    400
  );
}

async function handleLoginCodes(
  request,
  env,
  session
) {
  const denied =
    requirePermission(
      session,
      "login_codes"
    );

  if (denied) return denied;

  const url =
    new URL(request.url);

  if (request.method === "GET") {
    const rows =
      await env.DB.prepare(
        `SELECT
          id,
          name,
          permissions,
          active,
          expires_at,
          created_at,
          last_used_at
         FROM login_codes
         ORDER BY id DESC`
      ).all();

    const results =
      (rows.results || []).map(row => ({
        ...row,
        permissions:
          JSON.parse(
            row.permissions || "[]"
          )
      }));

    return json(results);
  }

  if (request.method === "POST") {
    const body =
      await request.json()
        .catch(() => ({}));

    const name =
      String(body.name || "").trim();

    if (!name) {
      return json(
        {
          error:
            "A staff member name is required."
        },
        400
      );
    }

    const permissions =
      Array.isArray(body.permissions)
        ? body.permissions.filter(
            permission =>
              PERMISSIONS.includes(
                permission
              )
          )
        : [];

    const code =
      makeCode();

    const codeHash =
      await sha256(code);

    const createdAt =
      now();

    const expiresAt =
      body.expires_at
        ? String(body.expires_at)
        : null;

    const result =
      await env.DB.prepare(
        `INSERT INTO login_codes
        (
          name,
          code_hash,
          permissions,
          active,
          expires_at,
          created_at
        )
        VALUES (?, ?, ?, 1, ?, ?)`
      )
        .bind(
          name,
          codeHash,
          JSON.stringify(
            permissions
          ),
          expiresAt,
          createdAt
        )
        .run();

    return json(
      {
        ok: true,
        id:
          result.meta?.last_row_id,
        name,
        code,
        permissions,
        active: 1,
        expires_at: expiresAt,
        created_at: createdAt
      },
      201
    );
  }

  const match =
    url.pathname.match(
      /^\/api\/login-codes\/(\d+)(?:\/(regenerate))?$/
    );

  if (!match) {
    return json(
      {
        error:
          "Invalid login code route."
      },
      404
    );
  }

  const id =
    Number(match[1]);

  if (
    match[2] === "regenerate" &&
    request.method === "POST"
  ) {
    const code =
      makeCode();

    const codeHash =
      await sha256(code);

    await env.DB.prepare(
      `UPDATE login_codes
       SET code_hash = ?,
           last_used_at = NULL
       WHERE id = ?`
    )
      .bind(
        codeHash,
        id
      )
      .run();

    return json({
      ok: true,
      id,
      code
    });
  }

  if (
    request.method === "PATCH"
  ) {
    const body =
      await request.json()
        .catch(() => ({}));

    const existing =
      await env.DB.prepare(
        "SELECT * FROM login_codes WHERE id = ?"
      )
        .bind(id)
        .first();

    if (!existing) {
      return json(
        {
          error:
            "Login code not found."
        },
        404
      );
    }

    const name =
      body.name !== undefined
        ? String(body.name).trim()
        : existing.name;

    const active =
      body.active !== undefined
        ? body.active
          ? 1
          : 0
        : existing.active;

    const permissions =
      Array.isArray(
        body.permissions
      )
        ? body.permissions.filter(
            permission =>
              PERMISSIONS.includes(
                permission
              )
          )
        : JSON.parse(
            existing.permissions ||
              "[]"
          );

    const expiresAt =
      body.expires_at !== undefined
        ? body.expires_at
          ? String(body.expires_at)
          : null
        : existing.expires_at;

    await env.DB.prepare(
      `UPDATE login_codes
       SET name = ?,
           permissions = ?,
           active = ?,
           expires_at = ?
       WHERE id = ?`
    )
      .bind(
        name,
        JSON.stringify(
          permissions
        ),
        active,
        expiresAt,
        id
      )
      .run();

    return json({
      ok: true
    });
  }

  if (
    request.method === "DELETE"
  ) {
    await env.DB.prepare(
      "DELETE FROM login_codes WHERE id = ?"
    )
      .bind(id)
      .run();

    return json({
      ok: true
    });
  }

  return json(
    {
      error:
        "Method not allowed."
    },
    405
  );
}

async function handleDocuments(
  request,
  env,
  session
) {
  const denied =
    requirePermission(
      session,
      "documents"
    );

  if (denied) return denied;

  const url =
    new URL(request.url);

  if (request.method === "GET") {
    const rows =
      await env.DB.prepare(
        `SELECT
          id,
          title,
          description,
          content,
          permission,
          created_at,
          updated_at
         FROM staff_documents
         ORDER BY id DESC`
      ).all();

    const all =
      rows.results || [];

    const visible =
      isAdmin(session)
        ? all
        : all.filter(
            document =>
              session.permissions?.includes(
                document.permission
              )
          );

    return json(visible);
  }

  if (request.method === "POST") {
    const body =
      await request.json()
        .catch(() => ({}));

    const title =
      String(body.title || "").trim();

    const description =
      String(
        body.description || ""
      );

    const content =
      String(
        body.content || ""
      );

    const permission =
      String(
        body.permission || "staff"
      );

    if (!title) {
      return json(
        {
          error:
            "Document title is required."
        },
        400
      );
    }

    if (
      !PERMISSIONS.includes(
        permission
      )
    ) {
      return json(
        {
          error:
            "Invalid document permission."
        },
        400
      );
    }

    const timestamp =
      now();

    const result =
      await env.DB.prepare(
        `INSERT INTO staff_documents
        (
          title,
          description,
          content,
          permission,
          created_at,
          updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?)`
      )
        .bind(
          title,
          description,
          content,
          permission,
          timestamp,
          timestamp
        )
        .run();

    return json(
      {
        ok: true,
        id:
          result.meta?.last_row_id
      },
      201
    );
  }

  const match =
    url.pathname.match(
      /^\/api\/documents\/(\d+)$/
    );

  if (!match) {
    return json(
      {
        error:
          "Invalid document route."
      },
      404
    );
  }

  const id =
    Number(match[1]);

  if (
    request.method === "PUT"
  ) {
    const body =
      await request.json()
        .catch(() => ({}));

    const existing =
      await env.DB.prepare(
        "SELECT * FROM staff_documents WHERE id = ?"
      )
        .bind(id)
        .first();

    if (!existing) {
      return json(
        {
          error:
            "Document not found."
        },
        404
      );
    }

    const title =
      body.title !== undefined
        ? String(body.title).trim()
        : existing.title;

    const description =
      body.description !== undefined
        ? String(body.description)
        : existing.description;

    const content =
      body.content !== undefined
        ? String(body.content)
        : existing.content;

    const permission =
      body.permission !== undefined
        ? String(body.permission)
        : existing.permission;

    if (!title) {
      return json(
        {
          error:
            "Document title is required."
        },
        400
      );
    }

    if (
      !PERMISSIONS.includes(
        permission
      )
    ) {
      return json(
        {
          error:
            "Invalid document permission."
        },
        400
      );
    }

    await env.DB.prepare(
      `UPDATE staff_documents
       SET title = ?,
           description = ?,
           content = ?,
           permission = ?,
           updated_at = ?
       WHERE id = ?`
    )
      .bind(
        title,
        description,
        content,
        permission,
        now(),
        id
      )
      .run();

    return json({
      ok: true
    });
  }

  if (
    request.method === "DELETE"
  ) {
    await env.DB.prepare(
      "DELETE FROM staff_documents WHERE id = ?"
    )
      .bind(id)
      .run();

    return json({
      ok: true
    });
  }

  return json(
    {
      error:
        "Method not allowed."
    },
    405
  );
}

async function handleAuthMe(
  request,
  env
) {
  const session =
    await getSession(
      request,
      env
    );

  if (!session) {
    return json({
      authenticated: false
    });
  }

  return json({
    authenticated: true,
    type: session.type,
    permissions:
      session.permissions || []
  });
}

async function handleLogout() {
  return new Response(
    JSON.stringify({
      ok: true
    }),
    {
      status: 200,
      headers: {
        "content-type":
          "application/json; charset=utf-8",
        "Set-Cookie":
          clearSessionCookie()
      }
    }
  );
}

async function handleContent(
  request,
  env,
  session
) {
  if (request.method === "GET") {
    return json(
      await getContent(env)
    );
  }

  if (request.method === "PUT") {
    const denied =
      requirePermission(
        session,
        "website"
      );

    if (denied) return denied;

    const body =
      await request.json()
        .catch(() => null);

    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body)
    ) {
      return json(
        {
          error:
            "Invalid website content."
        },
        400
      );
    }

    const saved =
      await saveContent(
        env,
        body
      );

    return json({
      ok: true,
      content: saved
    });
  }

  return json(
    {
      error:
        "Method not allowed."
    },
    405
  );
}

async function routeApi(
  request,
  env
) {
  const url =
    new URL(request.url);

  const path =
    url.pathname;

  if (
    path === "/api/auth/login" &&
    request.method === "POST"
  ) {
    return handleLogin(
      request,
      env
    );
  }

  if (
    path === "/api/auth/me" &&
    request.method === "GET"
  ) {
    return handleAuthMe(
      request,
      env
    );
  }

  if (
    path === "/api/auth/logout" &&
    request.method === "POST"
  ) {
    return handleLogout();
  }

  const session =
    await getSession(
      request,
      env
    );

  if (
    path === "/api/content"
  ) {
    return handleContent(
      request,
      env,
      session
    );
  }

  if (
    path === "/api/login-codes" ||
    /^\/api\/login-codes\/\d+(?:\/regenerate)?$/.test(
      path
    )
  ) {
    return handleLoginCodes(
      request,
      env,
      session
    );
  }

  if (
    path === "/api/documents" ||
    /^\/api\/documents\/\d+$/.test(
      path
    )
  ) {
    return handleDocuments(
      request,
      env,
      session
    );
  }

  return json(
    {
      error:
        "API route not found."
    },
    404
  );
}

export default {
  async fetch(request, env) {
    const url =
      new URL(request.url);

    if (
      url.pathname.startsWith("/api/")
    ) {
      try {
        return await routeApi(
          request,
          env
        );
      } catch (error) {
        console.error(error);

        return json(
          {
            error:
              "Server error.",
            detail:
              error?.message ||
              "Unknown error."
          },
          500
        );
      }
    }

    return env.ASSETS.fetch(
      request
    );
  }
};
