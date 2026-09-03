/* =========================================================
   THE AEGIS INSTITUTE
   CLOUDFLARE WORKER
   Authentication + Website CMS + Staff Portal
========================================================= */

const DEFAULT_DATA = {
  site_name: "The Aegis Institute",
  site_tagline: "Education. Standards. Support.",
  footer_text: "© The Aegis Institute. All rights reserved.",

  home_hero_kicker: "THE AEGIS INSTITUTE",
  home_hero_title: "Training that sees the person behind every case.",
  home_hero_text:
    "The Aegis Institute supports Discord communities and individuals through personalised consulting and structured education — built around your rules, your people, and your goals.",
  home_hero_primary_button: "Explore Services",
  home_hero_primary_link: "/services.html",
  home_hero_secondary_button: "Get in Touch",
  home_hero_secondary_link: "/contact.html",

  home_approach_title: "A practical approach to better communities.",
  home_approach_text:
    "We combine structured education, practical standards and external consulting to help communities build stronger teams.",

  home_education_title: "Education",
  home_education_text:
    "Training, assessments and practical scenarios designed around real community situations.",

  home_consulting_title: "Consulting",
  home_consulting_text:
    "An external perspective on staff structures, policies, procedures and community operations.",

  home_cta_title: "Ready to build something better?",
  home_cta_text:
    "Whether you need staff training, consulting or practical guidance, The Aegis Institute can help.",
  home_cta_button: "Contact Us",
  home_cta_link: "/contact.html",

  services_kicker: "SERVICES",
  services_title: "Support built around your community.",
  services_intro:
    "Choose the support that fits your community, your staff and your goals.",

  services_education_title: "Education & Training",
  services_education_text:
    "Structured training, assessments and scenario-based education for aspiring and current staff.",

  services_consulting_title: "Community Consulting",
  services_consulting_text:
    "Independent advice covering staff structures, policies, procedures, standards and community operations.",

  services_support_title: "Staff Support",
  services_support_text:
    "Practical resources and guidance designed to help staff teams operate with clarity and consistency.",

  work_kicker: "OUR WORK",
  work_title: "Practical systems. Clear standards.",
  work_intro:
    "Our work focuses on creating systems that communities can actually use.",

  work_project_1_title: "Structured Staff Programmes",
  work_project_1_text:
    "Clear pathways for trainees, moderators, supervisors and leadership teams.",

  work_project_2_title: "Practical Policies",
  work_project_2_text:
    "Policies and procedures written around the way each community operates.",

  work_project_3_title: "External Consulting",
  work_project_3_text:
    "An independent perspective on training, staff structures and community operations.",

  contact_kicker: "CONTACT",
  contact_title: "Let's talk about what your community needs.",
  contact_intro:
    "Have a question, project idea, or training requirement? Send a message and the Aegis team can help.",

  contact_discord_label: "Discord",
  contact_discord_text: "Join our Discord community.",
  contact_discord_url: "",

  contact_email_label: "Email",
  contact_email_text: "Send us an email.",
  contact_email: "",
  contact_form_title: "Send a message",
  contact_form_text: "Contact Under Development",

  announcement_enabled: "false",
  announcement_title: "",
  announcement_text: "",
  announcement_link_text: "",
  announcement_link: "",

  design_primary: "#08A6B5",
  design_primary_dark: "#078B98",
  design_accent: "#65E4E8",
  design_background: "#FFFFFF",
  design_surface: "#F5F8FA",
  design_surface_alt: "#EEF7F8",
  design_text: "#0B1728",
  design_muted: "#66758A",
  design_border: "#DCE5EA",
  design_header_bg: "#FFFFFF",
  design_footer_bg: "#071522",
  design_footer_text: "#FFFFFF",

  design_font_family: "Inter, Arial, sans-serif",
  design_heading_weight: "750",
  design_body_size: "16px",
  design_h1_size: "clamp(44px, 6vw, 72px)",
  design_h2_size: "clamp(32px, 4vw, 52px)",
  design_h3_size: "24px",
  design_line_height: "1.6",
  design_letter_spacing: "0px",

  design_content_width: "1180px",
  design_section_spacing: "96px",
  design_card_gap: "24px",
  design_card_radius: "20px",
  design_button_radius: "10px",
  design_card_shadow:
    "0 18px 50px rgba(11, 23, 40, 0.08)",
  design_header_height: "78px",

  design_button_padding_x: "22px",
  design_button_padding_y: "12px",

  design_mobile_section_spacing: "64px",
  design_mobile_body_size: "16px",

  design_nav_text_size: "14px",
  design_hero_title_size: "clamp(44px, 6vw, 72px)",
  design_hero_text_size: "18px",
  design_hero_alignment: "left",

  design_hero_show_visual: "true",
  design_services_show: "true",
  design_work_show: "true",
  design_contact_show: "true",
  design_cta_show: "true",
  design_cards_per_row: "3",
  design_announcement_show: "true"
};


/* =========================================================
   RESPONSE HELPERS
========================================================= */

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
      "Cache-Control": "no-store"
    }
  });
}


function redirect(location) {
  return new Response(null, {
    status: 302,
    headers: {
      Location: location,
      "Cache-Control": "no-store"
    }
  });
}


/* =========================================================
   COOKIE HELPERS
========================================================= */

function getCookie(request, name) {
  const cookies = request.headers.get("Cookie") || "";

  const parts = cookies.split(";");

  for (const part of parts) {
    const index = part.indexOf("=");

    if (index === -1) continue;

    const key = part.slice(0, index).trim();
    const value = part.slice(index + 1).trim();

    if (key === name) {
      return decodeURIComponent(value);
    }
  }

  return null;
}


function createCookie(name, value, maxAge) {
  return (
    `${name}=${encodeURIComponent(value)}; ` +
    `Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`
  );
}


/* =========================================================
   HASHING
========================================================= */

function bytesToHex(bytes) {
  return [...new Uint8Array(bytes)]
    .map(byte => byte.toString(16).padStart(2, "0"))
    .join("");
}


async function sha256(value) {
  const data = new TextEncoder().encode(value);

  const hash = await crypto.subtle.digest(
    "SHA-256",
    data
  );

  return bytesToHex(hash);
}


/* =========================================================
   CONSTANT-TIME STRING COMPARISON
========================================================= */

async function safeEqual(a, b) {
  const left = new TextEncoder().encode(String(a));
  const right = new TextEncoder().encode(String(b));

  if (left.length !== right.length) {
    return false;
  }

  let difference = 0;

  for (let i = 0; i < left.length; i++) {
    difference |= left[i] ^ right[i];
  }

  return difference === 0;
}


/* =========================================================
   SESSION SIGNING
========================================================= */

function base64url(bytes) {
  let binary = "";

  for (const byte of new Uint8Array(bytes)) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}


function base64urlDecode(value) {
  const padded =
    value
      .replace(/-/g, "+")
      .replace(/_/g, "/") +
    "===".slice((value.length + 3) % 4);

  const binary = atob(padded);

  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes;
}


async function signSession(payload, secret) {
  const encodedPayload = base64url(
    new TextEncoder().encode(
      JSON.stringify(payload)
    )
  );

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    {
      name: "HMAC",
      hash: "SHA-256"
    },
    false,
    ["sign", "verify"]
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(encodedPayload)
  );

  return (
    encodedPayload +
    "." +
    base64url(signature)
  );
}


async function verifySession(token, secret) {
  try {
    if (!token || !secret) {
      return null;
    }

    const parts = token.split(".");

    if (parts.length !== 2) {
      return null;
    }

    const encodedPayload = parts[0];
    const encodedSignature = parts[1];

    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      {
        name: "HMAC",
        hash: "SHA-256"
      },
      false,
      ["verify"]
    );

    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      base64urlDecode(encodedSignature),
      new TextEncoder().encode(encodedPayload)
    );

    if (!valid) {
      return null;
    }

    const payload = JSON.parse(
      new TextDecoder().decode(
        base64urlDecode(encodedPayload)
      )
    );

    if (
      !payload.exp ||
      Date.now() > payload.exp
    ) {
      return null;
    }

    return payload;

  } catch {
    return null;
  }
}


/* =========================================================
   SESSION
========================================================= */

async function getSession(request, env) {
  const token = getCookie(
    request,
    "aegis_session"
  );

  if (!token) {
    return null;
  }

  const secret = String(
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


async function createSession(
  env,
  user
) {
  const secret = String(
    env.SESSION_SECRET || ""
  ).trim();

  if (!secret) {
    throw new Error(
      "SESSION_SECRET is not configured."
    );
  }

  const payload = {
    type: user.type,
    name: user.name,
    permissions: user.permissions || [],
    exp:
      Date.now() +
      8 * 60 * 60 * 1000
  };

  return signSession(
    payload,
    secret
  );
}


/* =========================================================
   PERMISSIONS
========================================================= */

const ALL_PERMISSIONS = [
  "website",
  "design",
  "announcements",
  "login_codes",
  "documents",
  "staff"
];


function hasPermission(
  session,
  permission
) {
  if (!session) {
    return false;
  }

  if (session.type === "main") {
    return true;
  }

  return Array.isArray(session.permissions) &&
    session.permissions.includes(permission);
}


function requirePermission(
  session,
  permission
) {
  return hasPermission(
    session,
    permission
  );
}


/* =========================================================
   LOGIN
========================================================= */

async function login(request, env) {
  let body;

  try {
    body = await request.json();
  } catch {
    return json(
      {
        error: "Invalid request."
      },
      400
    );
  }

  const password =
    String(body.password || "");

  const code =
    String(body.code || "").trim();

  const name =
    String(body.name || "").trim();

  /*
    MAIN ADMIN PASSWORD
  */

  if (password) {
    const mainPassword =
      String(
        env.MAIN_PASSWORD || ""
      );

    if (!mainPassword) {
      return json(
        {
          error:
            "MAIN_PASSWORD is not configured in Cloudflare."
        },
        500
      );
    }

    const valid =
      await safeEqual(
        password,
        mainPassword
      );

    if (valid) {
      const session =
        await createSession(
          env,
          {
            type: "main",
            name: "Administrator",
            permissions:
              ALL_PERMISSIONS
          }
        );

      return new Response(
        JSON.stringify({
          ok: true,
          type: "main",
          name: "Administrator",
          redirect: "/admin.html"
        }),
        {
          status: 200,
          headers: {
            "Content-Type":
              "application/json; charset=UTF-8",
            "Set-Cookie":
              createCookie(
                "aegis_session",
                session,
                8 * 60 * 60
              ),
            "Cache-Control": "no-store"
          }
        }
      );
    }
  }


  /*
    STAFF LOGIN CODE
  */

  if (code) {
    if (!env.DB) {
      return json(
        {
          error: "D1 is not configured."
        },
        500
      );
    }

    const codeHash =
      await sha256(code);

    const row =
      await env.DB
        .prepare(
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

    if (!row) {
      return json(
        {
          error: "Invalid staff login code."
        },
        401
      );
    }

    if (!row.active) {
      return json(
        {
          error: "This staff login code is disabled."
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
          error: "This staff login code has expired."
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

    const session =
      await createSession(
        env,
        {
          type: "staff",
          name: row.name,
          permissions
        }
      );

    await env.DB
      .prepare(
        `UPDATE login_codes
         SET last_used_at = ?
         WHERE id = ?`
      )
      .bind(
        new Date().toISOString(),
        row.id
      )
      .run();

    return new Response(
      JSON.stringify({
        ok: true,
        type: "staff",
        name: row.name,
        permissions,
        redirect: "/staff.html"
      }),
      {
        status: 200,
        headers: {
          "Content-Type":
            "application/json; charset=UTF-8",
          "Set-Cookie":
            createCookie(
              "aegis_session",
              session,
              8 * 60 * 60
            ),
          "Cache-Control": "no-store"
        }
      }
    );
  }

  return json(
    {
      error: "Enter your password or staff code."
    },
    400
  );
}


/* =========================================================
   CURRENT USER
========================================================= */

async function getMe(
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
      authenticated: false,
      authorized: false
    });
  }

  return json({
    authenticated: true,
    authorized: true,
    type: session.type,
    name: session.name,
    permissions:
      session.permissions || []
  });
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
          createCookie(
            "aegis_session",
            "",
            0
          ),
        "Cache-Control": "no-store"
      }
    }
  );
}


/* =========================================================
   WEBSITE CONTENT
========================================================= */

async function getContent(env) {
  const defaults = {
    ...DEFAULT_DATA
  };

  if (!env.DB) {
    return json(defaults);
  }

  try {
    const row =
      await env.DB
        .prepare(
          `SELECT value
           FROM portal_content
           WHERE id = 'main'`
        )
        .first();

    if (!row) {
      return json(defaults);
    }

    let saved = {};

    try {
      saved =
        JSON.parse(
          row.value
        );
    } catch {
      saved = {};
    }

    return json({
      ...defaults,
      ...saved
    });

  } catch {
    return json(defaults);
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
    !requirePermission(
      session,
      "website"
    )
  ) {
    return json(
      {
        error:
          "You do not have permission to edit the website."
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

  if (
    !data ||
    typeof data !== "object" ||
    Array.isArray(data)
  ) {
    return json(
      {
        error:
          "Website content must be an object."
      },
      400
    );
  }

  /*
    Prevent accidental storage of huge payloads.
  */

  const serialized =
    JSON.stringify(data);

  if (serialized.length > 500000) {
    return json(
      {
        error:
          "Website content is too large."
      },
      413
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
        serialized,
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
          error?.message ||
          "Unable to save website content."
      },
      500
    );
  }
}


/* =========================================================
   LOGIN CODE MANAGEMENT
========================================================= */

async function getLoginCodes(
  request,
  env
) {
  const session =
    await getSession(
      request,
      env
    );

  if (
    !requirePermission(
      session,
      "login_codes"
    )
  ) {
    return json(
      {
        error: "Forbidden."
      },
      403
    );
  }

  if (!env.DB) {
    return json(
      {
        error: "D1 is not configured."
      },
      500
    );
  }

  const result =
    await env.DB
      .prepare(
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
      )
      .all();

  const rows =
    result.results || [];

  const codes =
    rows.map(row => {
      let permissions = [];

      try {
        permissions =
          JSON.parse(
            row.permissions || "[]"
          );
      } catch {}

      return {
        id: row.id,
        name: row.name,
        permissions,
        active: !!row.active,
        expires_at:
          row.expires_at,
        created_at:
          row.created_at,
        last_used_at:
          row.last_used_at
      };
    });

  return json({
    codes
  });
}


function generateStaffCode() {
  const alphabet =
    "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  const bytes =
    crypto.getRandomValues(
      new Uint8Array(10)
    );

  let result = "";

  for (const byte of bytes) {
    result +=
      alphabet[
        byte % alphabet.length
      ];
  }

  return (
    result.slice(0, 5) +
    "-" +
    result.slice(5)
  );
}


async function createLoginCode(
  request,
  env
) {
  const session =
    await getSession(
      request,
      env
    );

  if (
    !requirePermission(
      session,
      "login_codes"
    )
  ) {
    return json(
      {
        error: "Forbidden."
      },
      403
    );
  }

  if (!env.DB) {
    return json(
      {
        error: "D1 is not configured."
      },
      500
    );
  }

  let body;

  try {
    body =
      await request.json();
  } catch {
    return json(
      {
        error: "Invalid JSON."
      },
      400
    );
  }

  const name =
    String(
      body.name || ""
    ).trim();

  if (!name) {
    return json(
      {
        error:
          "A staff member name is required."
      },
      400
    );
  }

  let permissions =
    Array.isArray(body.permissions)
      ? body.permissions
      : [];

  permissions =
    permissions.filter(
      permission =>
        ALL_PERMISSIONS.includes(
          permission
        )
    );

  const code =
    generateStaffCode();

  const codeHash =
    await sha256(code);

  const expiresAt =
    body.expires_at
      ? new Date(
          body.expires_at
        ).toISOString()
      : null;

  await env.DB
    .prepare(
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
      new Date().toISOString()
    )
    .run();

  return json({
    ok: true,
    code,
    name,
    permissions,
    expires_at:
      expiresAt
  });
}


async function updateLoginCode(
  request,
  env,
  id
) {
  const session =
    await getSession(
      request,
      env
    );

  if (
    !requirePermission(
      session,
      "login_codes"
    )
  ) {
    return json(
      {
        error: "Forbidden."
      },
      403
    );
  }

  if (!env.DB) {
    return json(
      {
        error: "D1 is not configured."
      },
      500
    );
  }

  let body;

  try {
    body =
      await request.json();
  } catch {
    return json(
      {
        error: "Invalid JSON."
      },
      400
    );
  }

  const fields = [];
  const values = [];

  if (
    typeof body.name ===
    "string"
  ) {
    fields.push("name = ?");
    values.push(
      body.name.trim()
    );
  }

  if (
    Array.isArray(
      body.permissions
    )
  ) {
    const permissions =
      body.permissions.filter(
        permission =>
          ALL_PERMISSIONS.includes(
            permission
          )
      );

    fields.push(
      "permissions = ?"
    );

    values.push(
      JSON.stringify(
        permissions
      )
    );
  }

  if (
    typeof body.active ===
    "boolean"
  ) {
    fields.push(
      "active = ?"
    );

    values.push(
      body.active ? 1 : 0
    );
  }

  if (
    body.expires_at ===
    null ||
    typeof body.expires_at ===
      "string"
  ) {
    fields.push(
      "expires_at = ?"
    );

    values.push(
      body.expires_at
        ? new Date(
            body.expires_at
          ).toISOString()
        : null
    );
  }

  if (!fields.length) {
    return json(
      {
        error:
          "Nothing to update."
      },
      400
    );
  }

  values.push(id);

  await env.DB
    .prepare(
      `UPDATE login_codes
       SET ${fields.join(", ")}
       WHERE id = ?`
    )
    .bind(...values)
    .run();

  return json({
    ok: true
  });
}


async function regenerateLoginCode(
  request,
  env,
  id
) {
  const session =
    await getSession(
      request,
      env
    );

  if (
    !requirePermission(
      session,
      "login_codes"
    )
  ) {
    return json(
      {
        error: "Forbidden."
      },
      403
    );
  }

  if (!env.DB) {
    return json(
      {
        error: "D1 is not configured."
      },
      500
    );
  }

  const code =
    generateStaffCode();

  const hash =
    await sha256(code);

  await env.DB
    .prepare(
      `UPDATE login_codes
       SET code_hash = ?,
           last_used_at = NULL
       WHERE id = ?`
    )
    .bind(
      hash,
      id
    )
    .run();

  return json({
    ok: true,
    code
  });
}


async function deleteLoginCode(
  request,
  env,
  id
) {
  const session =
    await getSession(
      request,
      env
    );

  if (
    !requirePermission(
      session,
      "login_codes"
    )
  ) {
    return json(
      {
        error: "Forbidden."
      },
      403
    );
  }

  if (!env.DB) {
    return json(
      {
        error: "D1 is not configured."
      },
      500
    );
  }

  await env.DB
    .prepare(
      `DELETE FROM login_codes
       WHERE id = ?`
    )
    .bind(id)
    .run();

  return json({
    ok: true
  });
}


/* =========================================================
   STAFF DOCUMENTS
========================================================= */

async function getDocuments(
  request,
  env
) {
  const session =
    await getSession(
      request,
      env
    );

  if (!session) {
    return json(
      {
        error: "Not authenticated."
      },
      401
    );
  }

  if (!env.DB) {
    return json(
      {
        error: "D1 is not configured."
      },
      500
    );
  }

  const result =
    await env.DB
      .prepare(
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
      )
      .all();

  const all =
    result.results || [];

  const documents =
    all.filter(
      document =>
        session.type === "main" ||
        hasPermission(
          session,
          document.permission
        )
    );

  return json({
    documents
  });
}


async function createDocument(
  request,
  env
) {
  const session =
    await getSession(
      request,
      env
    );

  if (
    !requirePermission(
      session,
      "documents"
    )
  ) {
    return json(
      {
        error: "Forbidden."
      },
      403
    );
  }

  if (!env.DB) {
    return json(
      {
        error: "D1 is not configured."
      },
      500
    );
  }

  let body;

  try {
    body =
      await request.json();
  } catch {
    return json(
      {
        error: "Invalid JSON."
      },
      400
    );
  }

  const title =
    String(
      body.title || ""
    ).trim();

  if (!title) {
    return json(
      {
        error:
          "Document title is required."
      },
      400
    );
  }

  const description =
    String(
      body.description || ""
    );

  const content =
    String(
      body.content || ""
    );

  const permission =
    ALL_PERMISSIONS.includes(
      body.permission
    )
      ? body.permission
      : "documents";

  const now =
    new Date().toISOString();

  const result =
    await env.DB
      .prepare(
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
        now,
        now
      )
      .run();

  return json({
    ok: true,
    id:
      result.meta?.last_row_id ||
      null
  });
}


async function updateDocument(
  request,
  env,
  id
) {
  const session =
    await getSession(
      request,
      env
    );

  if (
    !requirePermission(
      session,
      "documents"
    )
  ) {
    return json(
      {
        error: "Forbidden."
      },
      403
    );
  }

  if (!env.DB) {
    return json(
      {
        error: "D1 is not configured."
      },
      500
    );
  }

  let body;

  try {
    body =
      await request.json();
  } catch {
    return json(
      {
        error: "Invalid JSON."
      },
      400
    );
  }

  const title =
    String(
      body.title || ""
    ).trim();

  const description =
    String(
      body.description || ""
    );

  const content =
    String(
      body.content || ""
    );

  const permission =
    ALL_PERMISSIONS.includes(
      body.permission
    )
      ? body.permission
      : "documents";

  await env.DB
    .prepare(
      `UPDATE staff_documents
       SET
         title = ?,
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
      new Date().toISOString(),
      id
    )
    .run();

  return json({
    ok: true
  });
}


async function deleteDocument(
  request,
  env,
  id
) {
  const session =
    await getSession(
      request,
      env
    );

  if (
    !requirePermission(
      session,
      "documents"
    )
  ) {
    return json(
      {
        error: "Forbidden."
      },
      403
    );
  }

  if (!env.DB) {
    return json(
      {
        error: "D1 is not configured."
      },
      500
    );
  }

  await env.DB
    .prepare(
      `DELETE FROM staff_documents
       WHERE id = ?`
    )
    .bind(id)
    .run();

  return json({
    ok: true
  });
}


/* =========================================================
   MAIN ROUTER
========================================================= */

export default {
  async fetch(request, env) {
    const url =
      new URL(request.url);

    /*
      AUTH
    */

    if (
      url.pathname ===
      "/api/auth/login" &&
      request.method === "POST"
    ) {
      return login(
        request,
        env
      );
    }

    if (
      url.pathname ===
      "/api/auth/me"
    ) {
      return getMe(
        request,
        env
      );
    }

    if (
      url.pathname ===
      "/api/auth/logout"
    ) {
      return logout();
    }


    /*
      WEBSITE CONTENT
    */

    if (
      url.pathname ===
      "/api/content"
    ) {
      if (
        request.method ===
        "GET"
      ) {
        return getContent(
          env
        );
      }

      if (
        request.method ===
        "PUT"
      ) {
        return saveContent(
          request,
          env
        );
      }

      return json(
        {
          error:
            "Method not allowed."
        },
        405
      );
    }


    /*
      LOGIN CODES
    */

    if (
      url.pathname ===
      "/api/login-codes"
    ) {
      if (
        request.method ===
        "GET"
      ) {
        return getLoginCodes(
          request,
          env
        );
      }

      if (
        request.method ===
        "POST"
      ) {
        return createLoginCode(
          request,
          env
        );
      }

      return json(
        {
          error:
            "Method not allowed."
        },
        405
      );
    }


    const loginCodeMatch =
      url.pathname.match(
        /^\/api\/login-codes\/(\d+)$/
      );

    if (loginCodeMatch) {
      const id =
        Number(
          loginCodeMatch[1]
        );

      if (
        request.method ===
        "PATCH"
      ) {
        return updateLoginCode(
          request,
          env,
          id
        );
      }

      if (
        request.method ===
        "DELETE"
      ) {
        return deleteLoginCode(
          request,
          env,
          id
        );
      }
    }


    const regenerateMatch =
      url.pathname.match(
        /^\/api\/login-codes\/(\d+)\/regenerate$/
      );

    if (regenerateMatch) {
      const id =
        Number(
          regenerateMatch[1]
        );

      if (
        request.method ===
        "POST"
      ) {
        return regenerateLoginCode(
          request,
          env,
          id
        );
      }
    }


    /*
      STAFF DOCUMENTS
    */

    if (
      url.pathname ===
      "/api/documents"
    ) {
      if (
        request.method ===
        "GET"
      ) {
        return getDocuments(
          request,
          env
        );
      }

      if (
        request.method ===
        "POST"
      ) {
        return createDocument(
          request,
          env
        );
      }

      return json(
        {
          error:
            "Method not allowed."
        },
        405
      );
    }


    const documentMatch =
      url.pathname.match(
        /^\/api\/documents\/(\d+)$/
      );

    if (documentMatch) {
      const id =
        Number(
          documentMatch[1]
        );

      if (
        request.method ===
        "PUT"
      ) {
        return updateDocument(
          request,
          env,
          id
        );
      }

      if (
        request.method ===
        "DELETE"
      ) {
        return deleteDocument(
          request,
          env,
          id
        );
      }
    }


    /*
      STATIC WEBSITE
    */

    return env.ASSETS.fetch(
      request
    );
  }
};
