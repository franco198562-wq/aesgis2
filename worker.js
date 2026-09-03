// ============================================================
// THE AEGIS INSTITUTE — PORTAL WORKER
// ============================================================
// Handles:
// - Main administrator login
// - Staff login codes
// - Staff permissions
// - Staff documents
// - Website content editor
// - Announcements
// - D1 database
// - Secure sessions
// - Static website assets
// ============================================================


// ============================================================
// MAIN ADMIN PASSWORD
// ============================================================
//
// CHANGE THIS to your NEW main administrator password.
//
// Do NOT use the password that was previously exposed.
// ============================================================

const MAIN_PASSWORD = "PiZza@Cvc123";


// ============================================================
// PERMISSIONS
// ============================================================

const PERMISSIONS = {
  handbook: "Staff Handbook",
  documents: "General Documents",
  training: "Training",
  resources: "Staff Resources",
  staff_directory: "Staff Directory",
  announcements: "Staff Announcements"
};

const ALL_PERMISSIONS = Object.keys(PERMISSIONS);


// ============================================================
// DEFAULT WEBSITE CONTENT
// ============================================================
//
// These values are used if nothing has been saved in D1 yet.
// Once you edit something through Admin, the D1 value takes over.
// ============================================================

const DEFAULT_CONTENT = {

  // ----------------------------------------------------------
  // GENERAL
  // ----------------------------------------------------------

  site_name: "THE AEGIS INSTITUTE",

  site_tagline: "Professional. Reliable. Forward-thinking.",

  footer_text:
    "The Aegis Institute provides professional education, consulting and operational support.",


  // ----------------------------------------------------------
  // HOME
  // ----------------------------------------------------------

  home_hero_kicker: "THE AEGIS INSTITUTE",

  home_hero_title:
    "Building capability. Creating confidence.",

  home_hero_text:
    "The Aegis Institute provides professional education, consulting and operational support designed to help organisations and individuals perform at their best.",

  home_hero_primary_button:
    "Explore Our Services",

  home_hero_primary_link:
    "/services.html",

  home_hero_secondary_button:
    "Contact Us",

  home_hero_secondary_link:
    "/contact.html",


  home_approach_title:
    "Our approach",

  home_approach_text:
    "We combine practical experience, structured education and thoughtful consulting to deliver solutions that are clear, useful and built around real-world needs.",


  home_education_title:
    "Education",

  home_education_text:
    "Develop knowledge, confidence and practical capability through structured learning and professional development.",


  home_consulting_title:
    "Consulting",

  home_consulting_text:
    "Receive practical guidance and support designed around your organisation, your people and your objectives.",


  home_cta_title:
    "Ready to work with us?",

  home_cta_text:
    "Get in touch with The Aegis Institute to discuss how we can help.",

  home_cta_button:
    "Contact Us",

  home_cta_link:
    "/contact.html",


  // ----------------------------------------------------------
  // SERVICES
  // ----------------------------------------------------------

  services_kicker:
    "WHAT WE DO",

  services_title:
    "Our Services",

  services_intro:
    "Professional services designed to build capability, improve performance and support your goals.",


  services_education_title:
    "Education & Training",

  services_education_text:
    "Structured education and training designed to build practical knowledge and confidence.",


  services_consulting_title:
    "Consulting",

  services_consulting_text:
    "Professional consulting and advice tailored to the needs of your organisation.",


  services_support_title:
    "Operational Support",

  services_support_text:
    "Practical support to help teams operate effectively and achieve their objectives.",


  // ----------------------------------------------------------
  // OUR WORK
  // ----------------------------------------------------------

  work_kicker:
    "OUR WORK",

  work_title:
    "Our Work",

  work_intro:
    "Explore the work, projects and initiatives delivered by The Aegis Institute.",


  work_project_1_title:
    "Project One",

  work_project_1_text:
    "Add information about your first project here.",


  work_project_2_title:
    "Project Two",

  work_project_2_text:
    "Add information about your second project here.",


  work_project_3_title:
    "Project Three",

  work_project_3_text:
    "Add information about your third project here.",


  // ----------------------------------------------------------
  // CONTACT
  // ----------------------------------------------------------

  contact_kicker:
    "GET IN TOUCH",

  contact_title:
    "Contact The Aegis Institute",

  contact_intro:
    "Have a question, need professional support or want to discuss a project? Get in touch with our team.",


  contact_discord_label:
    "Discord",

  contact_discord_text:
    "Contact us through Discord for enquiries and support.",


  contact_email_label:
    "Email",

  contact_email_text:
    "Contact us by email for professional enquiries.",


  contact_form_title:
    "Send us a message",

  contact_form_text:
    "Complete the contact form and we will review your enquiry.",


  // ----------------------------------------------------------
  // ANNOUNCEMENT
  // ----------------------------------------------------------

  announcement_enabled:
    "false",

  announcement_title:
    "Announcement",

  announcement_text:
    "Add an announcement through the administrator dashboard.",

  announcement_link_text:
    "",

  announcement_link:
    "",


  // ----------------------------------------------------------
  // OTHER
  // ----------------------------------------------------------

  contact_discord_url:
    "",

  contact_email:
    ""
};


// ============================================================
// SESSION SETTINGS
// ============================================================

const SESSION_COOKIE = "aegis_session";

const SESSION_DURATION =
  8 * 60 * 60 * 1000;


// ============================================================
// MAIN REQUEST HANDLER
// ============================================================

export default {

  async fetch(request, env) {

    const url = new URL(request.url);

    try {

      // ======================================================
      // AUTHENTICATION
      // ======================================================

      if (
        url.pathname === "/api/auth/password" &&
        request.method === "POST"
      ) {
        return await loginMainAdmin(request, env);
      }


      if (
        url.pathname === "/api/auth/code" &&
        request.method === "POST"
      ) {
        return await loginStaffCode(request, env);
      }


      if (
        url.pathname === "/api/auth/me" &&
        request.method === "GET"
      ) {
        return await getCurrentUser(request, env);
      }


      if (
        url.pathname === "/api/auth/logout" &&
        request.method === "POST"
      ) {
        return logout();
      }


      // ======================================================
      // ADMIN — LOGIN CODES
      // ======================================================

      if (
        url.pathname === "/api/admin/login-codes" &&
        request.method === "GET"
      ) {
        return await adminGetLoginCodes(request, env);
      }


      if (
        url.pathname === "/api/admin/login-codes" &&
        request.method === "POST"
      ) {
        return await adminCreateLoginCode(request, env);
      }


      if (
        url.pathname === "/api/admin/login-codes" &&
        request.method === "DELETE"
      ) {
        return await adminDeleteLoginCode(request, env);
      }


      // ======================================================
      // ADMIN — DOCUMENTS
      // ======================================================

      if (
        url.pathname === "/api/admin/documents" &&
        request.method === "GET"
      ) {
        return await adminGetDocuments(request, env);
      }


      if (
        url.pathname === "/api/admin/documents" &&
        request.method === "POST"
      ) {
        return await adminCreateDocument(request, env);
      }


      if (
        url.pathname === "/api/admin/documents" &&
        request.method === "PUT"
      ) {
        return await adminUpdateDocument(request, env);
      }


      if (
        url.pathname === "/api/admin/documents" &&
        request.method === "DELETE"
      ) {
        return await adminDeleteDocument(request, env);
      }


      // ======================================================
      // STAFF — DOCUMENTS
      // ======================================================

      if (
        url.pathname === "/api/staff/documents" &&
        request.method === "GET"
      ) {
        return await staffGetDocuments(request, env);
      }


      // ======================================================
      // WEBSITE CONTENT
      // ======================================================

      if (
        url.pathname === "/api/content" &&
        request.method === "GET"
      ) {
        return await getWebsiteContent(env);
      }


      if (
        url.pathname === "/api/content" &&
        request.method === "PUT"
      ) {
        return await updateWebsiteContent(request, env);
      }


      // ======================================================
      // WEBSITE CONTENT — SINGLE KEY
      // ======================================================

      if (
        url.pathname === "/api/content/key" &&
        request.method === "GET"
      ) {
        return await getSingleContent(url, env);
      }


      // ======================================================
      // OLD DISCORD AUTH ROUTES
      // ======================================================
      //
      // These are kept so old links don't cause errors.
      // The new system does NOT use Discord OAuth for login.
      // ======================================================

      if (url.pathname === "/api/auth/discord") {

        return Response.redirect(
          new URL("/staff-login.html", request.url).toString(),
          302
        );

      }


      if (url.pathname === "/api/auth/callback") {

        return Response.redirect(
          new URL("/staff-login.html", request.url).toString(),
          302
        );

      }


      // ======================================================
      // STATIC WEBSITE
      // ======================================================

      if (env.ASSETS) {

        return await env.ASSETS.fetch(request);

      }


      return new Response(
        "Aegis Institute portal is online.",
        {
          status: 200,
          headers: {
            "content-type": "text/plain;charset=UTF-8"
          }
        }
      );

    } catch (error) {

      console.error("Worker error:", error);

      return json(
        {
          success: false,
          error: "Internal server error."
        },
        500
      );

    }

  }

};


// ============================================================
// MAIN ADMIN LOGIN
// ============================================================

async function loginMainAdmin(request, env) {

  const body = await readJson(request);

  const password =
    String(body.password || "");


  if (
    !password ||
    MAIN_PASSWORD === "PASTE_A_NEW_MAIN_PASSWORD_HERE"
  ) {

    return json(
      {
        success: false,
        error:
          "The main administrator password has not been configured."
      },
      500
    );

  }


  if (password !== MAIN_PASSWORD) {

    return json(
      {
        success: false,
        error: "Incorrect password."
      },
      401
    );

  }


  const session = {

    authenticated: true,

    authorized: true,

    role: "main_admin",

    username: "Aegis Administrator",

    userId: "main-admin",

    permissions: ALL_PERMISSIONS,

    exp:
      Date.now() +
      SESSION_DURATION

  };


  const token =
    await createSessionToken(
      session,
      env
    );


  return jsonWithCookie(
    {
      success: true,

      authenticated: true,

      authorized: true,

      role: "main_admin",

      username: session.username,

      userId: session.userId,

      permissions: session.permissions,

      redirect: "/admin.html"

    },
    token
  );

}


// ============================================================
// STAFF CODE LOGIN
// ============================================================

async function loginStaffCode(request, env) {

  const body = await readJson(request);

  // Support both "code" and "loginCode"
  const suppliedCode =
    String(
      body.code ||
      body.loginCode ||
      ""
    )
      .trim()
      .toUpperCase();


  if (!suppliedCode) {

    return json(
      {
        success: false,
        error: "Please enter your staff login code."
      },
      400
    );

  }


  const codeHash =
    await hashCode(
      suppliedCode
    );


  const result =
    await env.DB.prepare(
      `
      SELECT
        id,
        name,
        permissions,
        active,
        expires_at
      FROM login_codes
      WHERE code_hash = ?
      LIMIT 1
      `
    )
      .bind(codeHash)
      .first();


  if (!result) {

    return json(
      {
        success: false,
        error: "Invalid staff login code."
      },
      401
    );

  }


  if (!Number(result.active)) {

    return json(
      {
        success: false,
        error: "This staff login code has been disabled."
      },
      401
    );

  }


  if (
    result.expires_at &&
    new Date(result.expires_at).getTime() <= Date.now()
  ) {

    return json(
      {
        success: false,
        error: "This staff login code has expired."
      },
      401
    );

  }


  let permissions = [];

  try {

    permissions =
      JSON.parse(
        result.permissions || "[]"
      );

  } catch {

    permissions = [];

  }


  permissions =
    Array.isArray(permissions)
      ? permissions.filter(
          permission =>
            ALL_PERMISSIONS.includes(
              permission
            )
        )
      : [];


  await env.DB.prepare(
    `
    UPDATE login_codes
    SET last_used_at = ?
    WHERE id = ?
    `
  )
    .bind(
      new Date().toISOString(),
      result.id
    )
    .run();


  const session = {

    authenticated: true,

    authorized: true,

    role: "staff",

    username:
      result.name ||
      "Staff Member",

    userId:
      `staff-${result.id}`,

    staffId:
      result.id,

    permissions,

    exp:
      Date.now() +
      SESSION_DURATION

  };


  const token =
    await createSessionToken(
      session,
      env
    );


  return jsonWithCookie(
    {
      success: true,

      authenticated: true,

      authorized: true,

      role: "staff",

      username: session.username,

      userId: session.userId,

      staffId: session.staffId,

      permissions,

      redirect: "/staff.html"

    },
    token
  );

}


// ============================================================
// CURRENT USER
// ============================================================

async function getCurrentUser(request, env) {

  const session =
    await getSession(
      request,
      env
    );


  if (!session) {

    return json(
      {
        success: true,

        authenticated: false,

        authorized: false,

        role: null,

        username: null,

        userId: null,

        staffId: null,

        permissions: []

      }
    );

  }


  return json(
    {
      success: true,

      authenticated:
        !!session.authenticated,

      authorized:
        !!session.authorized,

      role:
        session.role || null,

      username:
        session.username || null,

      userId:
        session.userId || null,

      staffId:
        session.staffId || null,

      permissions:
        Array.isArray(session.permissions)
          ? session.permissions
          : []

    }
  );

}


// ============================================================
// LOGOUT
// ============================================================

function logout() {

  return new Response(
    JSON.stringify({
      success: true
    }),
    {
      status: 200,

      headers: {

        "content-type":
          "application/json;charset=UTF-8",

        "Set-Cookie":
          `${SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`

      }
    }
  );

}


// ============================================================
// ADMIN — GET LOGIN CODES
// ============================================================

async function adminGetLoginCodes(
  request,
  env
) {

  const session =
    await requireMainAdmin(
      request,
      env
    );


  if (!session) {

    return unauthorized();

  }


  const result =
    await env.DB.prepare(
      `
      SELECT
        id,
        name,
        permissions,
        active,
        expires_at,
        created_at,
        last_used_at
      FROM login_codes
      ORDER BY id DESC
      `
    )
      .all();


  const codes =
    (result.results || [])
      .map(row => {

        let permissions = [];

        try {

          permissions =
            JSON.parse(
              row.permissions || "[]"
            );

        } catch {

          permissions = [];

        }


        return {

          id: row.id,

          name: row.name,

          permissions,

          active:
            Boolean(
              Number(row.active)
            ),

          expiresAt:
            row.expires_at,

          createdAt:
            row.created_at,

          lastUsedAt:
            row.last_used_at

        };

      });


  return json(
    {
      success: true,

      codes,

      permissions: PERMISSIONS

    }
  );

}


// ============================================================
// ADMIN — CREATE LOGIN CODE
// ============================================================

async function adminCreateLoginCode(
  request,
  env
) {

  const session =
    await requireMainAdmin(
      request,
      env
    );


  if (!session) {

    return unauthorized();

  }


  const body =
    await readJson(request);


  const name =
    String(
      body.name || ""
    ).trim();


  if (!name) {

    return json(
      {
        success: false,
        error:
          "Please provide a name for this staff login."
      },
      400
    );

  }


  let permissions =
    Array.isArray(
      body.permissions
    )
      ? body.permissions
      : [];


  permissions =
    permissions.filter(
      permission =>
        ALL_PERMISSIONS.includes(
          permission
        )
    );


  let expiresAt =
    body.expiresAt
      ? String(body.expiresAt).trim()
      : null;


  if (expiresAt) {

    const parsed =
      new Date(expiresAt);


    if (
      Number.isNaN(
        parsed.getTime()
      )
    ) {

      return json(
        {
          success: false,
          error:
            "Invalid expiry date."
        },
        400
      );

    }


    expiresAt =
      parsed.toISOString();

  } else {

    expiresAt = null;

  }


  let generatedCode = null;

  let generatedHash = null;

  let inserted = false;


  // Generate a unique code.

  for (let attempt = 0; attempt < 10; attempt++) {

    const code =
      generateLoginCode();


    const hash =
      await hashCode(
        code
      );


    try {

      await env.DB.prepare(
        `
        INSERT INTO login_codes
        (
          name,
          code_hash,
          permissions,
          active,
          expires_at,
          created_at
        )
        VALUES (?, ?, ?, 1, ?, ?)
        `
      )
        .bind(
          name,
          hash,
          JSON.stringify(
            permissions
          ),
          expiresAt,
          new Date().toISOString()
        )
        .run();


      generatedCode = code;

      generatedHash = hash;

      inserted = true;

      break;

    } catch (error) {

      // A UNIQUE constraint failure means
      // the randomly generated code already exists.
      // Try again with another code.

      if (attempt === 9) {

        console.error(
          "Unable to create unique login code:",
          error
        );

      }

    }

  }


  if (
    !inserted ||
    !generatedCode ||
    !generatedHash
  ) {

    return json(
      {
        success: false,
        error:
          "Could not generate a unique login code. Please try again."
      },
      500
    );

  }


  return json(
    {
      success: true,

      code: generatedCode,

      name,

      permissions,

      expiresAt

    },
    201
  );

}


// ============================================================
// ADMIN — DELETE LOGIN CODE
// ============================================================

async function adminDeleteLoginCode(
  request,
  env
) {

  const session =
    await requireMainAdmin(
      request,
      env
    );


  if (!session) {

    return unauthorized();

  }


  const url =
    new URL(
      request.url
    );


  const id =
    Number(
      url.searchParams.get(
        "id"
      )
    );


  if (
    !Number.isInteger(id) ||
    id <= 0
  ) {

    return json(
      {
        success: false,
        error: "Invalid login code ID."
      },
      400
    );

  }


  await env.DB.prepare(
    `
    DELETE FROM login_codes
    WHERE id = ?
    `
  )
    .bind(id)
    .run();


  return json(
    {
      success: true
    }
  );

}


// ============================================================
// ADMIN — GET DOCUMENTS
// ============================================================

async function adminGetDocuments(
  request,
  env
) {

  const session =
    await requireMainAdmin(
      request,
      env
    );


  if (!session) {

    return unauthorized();

  }


  const result =
    await env.DB.prepare(
      `
      SELECT
        id,
        title,
        description,
        content,
        permission,
        created_at,
        updated_at
      FROM staff_documents
      ORDER BY id DESC
      `
    )
      .all();


  const documents =
    (result.results || [])
      .map(formatDocument);


  return json(
    {
      success: true,

      documents,

      permissions: PERMISSIONS

    }
  );

}


// ============================================================
// ADMIN — CREATE DOCUMENT
// ============================================================

async function adminCreateDocument(
  request,
  env
) {

  const session =
    await requireMainAdmin(
      request,
      env
    );


  if (!session) {

    return unauthorized();

  }


  const body =
    await readJson(request);


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
    String(
      body.permission || ""
    ).trim();


  if (!title) {

    return json(
      {
        success: false,
        error:
          "Document title is required."
      },
      400
    );

  }


  if (
    !ALL_PERMISSIONS.includes(
      permission
    )
  ) {

    return json(
      {
        success: false,
        error:
          "Please choose a valid staff permission."
      },
      400
    );

  }


  const now =
    new Date().toISOString();


  const result =
    await env.DB.prepare(
      `
      INSERT INTO staff_documents
      (
        title,
        description,
        content,
        permission,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?)
      `
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


  return json(
    {
      success: true,

      id:
        result.meta?.last_row_id || null

    },
    201
  );

}


// ============================================================
// ADMIN — UPDATE DOCUMENT
// ============================================================

async function adminUpdateDocument(
  request,
  env
) {

  const session =
    await requireMainAdmin(
      request,
      env
    );


  if (!session) {

    return unauthorized();

  }


  const url =
    new URL(
      request.url
    );


  const id =
    Number(
      url.searchParams.get(
        "id"
      )
    );


  if (
    !Number.isInteger(id) ||
    id <= 0
  ) {

    return json(
      {
        success: false,
        error:
          "Invalid document ID."
      },
      400
    );

  }


  const body =
    await readJson(request);


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
    String(
      body.permission || ""
    ).trim();


  if (!title) {

    return json(
      {
        success: false,
        error:
          "Document title is required."
      },
      400
    );

  }


  if (
    !ALL_PERMISSIONS.includes(
      permission
    )
  ) {

    return json(
      {
        success: false,
        error:
          "Please choose a valid staff permission."
      },
      400
    );

  }


  await env.DB.prepare(
    `
    UPDATE staff_documents
    SET
      title = ?,
      description = ?,
      content = ?,
      permission = ?,
      updated_at = ?
    WHERE id = ?
    `
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


  return json(
    {
      success: true
    }
  );

}


// ============================================================
// ADMIN — DELETE DOCUMENT
// ============================================================

async function adminDeleteDocument(
  request,
  env
) {

  const session =
    await requireMainAdmin(
      request,
      env
    );


  if (!session) {

    return unauthorized();

  }


  const url =
    new URL(
      request.url
    );


  const id =
    Number(
      url.searchParams.get(
        "id"
      )
    );


  if (
    !Number.isInteger(id) ||
    id <= 0
  ) {

    return json(
      {
        success: false,
        error:
          "Invalid document ID."
      },
      400
    );

  }


  await env.DB.prepare(
    `
    DELETE FROM staff_documents
    WHERE id = ?
    `
  )
    .bind(id)
    .run();


  return json(
    {
      success: true
    }
  );

}


// ============================================================
// STAFF — GET PERMITTED DOCUMENTS
// ============================================================

async function staffGetDocuments(
  request,
  env
) {

  const session =
    await getSession(
      request,
      env
    );


  if (!session) {

    return unauthorized();

  }


  if (
    session.role === "main_admin"
  ) {

    const result =
      await env.DB.prepare(
        `
        SELECT
          id,
          title,
          description,
          content,
          permission,
          created_at,
          updated_at
        FROM staff_documents
        ORDER BY id DESC
        `
      )
        .all();


    return json(
      {
        success: true,

        documents:
          (result.results || [])
            .map(formatDocument)

      }
    );

  }


  if (
    session.role !== "staff"
  ) {

    return unauthorized();

  }


  const permissions =
    Array.isArray(
      session.permissions
    )
      ? session.permissions
      : [];


  if (!permissions.length) {

    return json(
      {
        success: true,
        documents: []
      }
    );

  }


  // We deliberately retrieve the documents and
  // filter them against the session permissions.
  //
  // This means a staff member cannot simply change
  // a frontend value to access another permission.

  const result =
    await env.DB.prepare(
      `
      SELECT
        id,
        title,
        description,
        content,
        permission,
        created_at,
        updated_at
      FROM staff_documents
      ORDER BY id DESC
      `
    )
      .all();


  const documents =
    (result.results || [])
      .filter(
        document =>
          permissions.includes(
            document.permission
          )
      )
      .map(formatDocument);


  return json(
    {
      success: true,

      documents
    }
  );

}


// ============================================================
// WEBSITE CONTENT — PUBLIC GET
// ============================================================

async function getWebsiteContent(env) {

  const result =
    await env.DB.prepare(
      `
      SELECT
        id,
        value
      FROM portal_content
      `
    )
      .all();


  const content = {
    ...DEFAULT_CONTENT
  };


  for (
    const row of
    result.results || []
  ) {

    if (
      Object.prototype.hasOwnProperty.call(
        DEFAULT_CONTENT,
        row.id
      )
    ) {

      content[row.id] =
        row.value;

    } else {

      content[row.id] =
        row.value;

    }

  }


  return json(
    {
      success: true,

      content

    }
  );

}


// ============================================================
// WEBSITE CONTENT — ADMIN UPDATE
// ============================================================

async function updateWebsiteContent(
  request,
  env
) {

  const session =
    await requireMainAdmin(
      request,
      env
    );


  if (!session) {

    return unauthorized();

  }


  const body =
    await readJson(request);


  // Support either:
  //
  // {
  //   "content": {
  //      "home_hero_title": "..."
  //   }
  // }
  //
  // OR:
  //
  // {
  //   "key": "home_hero_title",
  //   "value": "..."
  // }

  let updates = {};


  if (
    body.content &&
    typeof body.content === "object" &&
    !Array.isArray(body.content)
  ) {

    updates =
      body.content;

  } else if (
    body.key
  ) {

    updates = {

      [String(body.key)]:
        body.value == null
          ? ""
          : String(body.value)

    };

  }


  const keys =
    Object.keys(
      updates
    );


  if (!keys.length) {

    return json(
      {
        success: false,
        error:
          "No content changes were provided."
      },
      400
    );

  }


  const now =
    new Date().toISOString();


  for (
    const key of keys
  ) {

    if (
      !/^[a-zA-Z0-9_-]{1,100}$/.test(
        key
      )
    ) {

      continue;

    }


    const value =
      updates[key] == null
        ? ""
        : String(
            updates[key]
          );


    await env.DB.prepare(
      `
      INSERT INTO portal_content
      (
        id,
        value,
        updated_at
      )
      VALUES (?, ?, ?)

      ON CONFLICT(id)
      DO UPDATE SET
        value = excluded.value,
        updated_at = excluded.updated_at
      `
    )
      .bind(
        key,
        value,
        now
      )
      .run();

  }


  return json(
    {
      success: true,

      message:
        "Website content saved."

    }
  );

}


// ============================================================
// GET SINGLE CONTENT VALUE
// ============================================================

async function getSingleContent(
  url,
  env
) {

  const key =
    url.searchParams.get(
      "key"
    );


  if (!key) {

    return json(
      {
        success: false,
        error:
          "Missing content key."
      },
      400
    );

  }


  const result =
    await env.DB.prepare(
      `
      SELECT value
      FROM portal_content
      WHERE id = ?
      LIMIT 1
      `
    )
      .bind(key)
      .first();


  if (result) {

    return json(
      {
        success: true,

        key,

        value:
          result.value

      }
    );

  }


  return json(
    {
      success: true,

      key,

      value:
        Object.prototype.hasOwnProperty.call(
          DEFAULT_CONTENT,
          key
        )
          ? DEFAULT_CONTENT[key]
          : ""

    }
  );

}


// ============================================================
// ADMIN AUTH CHECK
// ============================================================

async function requireMainAdmin(
  request,
  env
) {

  const session =
    await getSession(
      request,
      env
    );


  if (!session) {

    return null;

  }


  if (
    session.role !== "main_admin"
  ) {

    return null;

  }


  return session;

}


// ============================================================
// SESSION READING
// ============================================================

async function getSession(
  request,
  env
) {

  const cookies =
    parseCookies(
      request.headers.get(
        "Cookie"
      ) || ""
    );


  const token =
    cookies[
      SESSION_COOKIE
    ];


  if (!token) {

    return null;

  }


  return await verifySessionToken(
    token,
    env
  );

}


// ============================================================
// CREATE SESSION TOKEN
// ============================================================

async function createSessionToken(
  payload,
  env
) {

  const secret =
    env.SESSION_SECRET ||
    "CHANGE_THIS_SESSION_SECRET";


  const encodedPayload =
    base64urlEncode(
      JSON.stringify(
        payload
      )
    );


  const signature =
    await signHmac(
      encodedPayload,
      secret
    );


  return `${encodedPayload}.${signature}`;

}


// ============================================================
// VERIFY SESSION TOKEN
// ============================================================

async function verifySessionToken(
  token,
  env
) {

  try {

    const parts =
      token.split(".");


    if (
      parts.length !== 2
    ) {

      return null;

    }


    const payloadPart =
      parts[0];

    const signature =
      parts[1];


    const secret =
      env.SESSION_SECRET ||
      "CHANGE_THIS_SESSION_SECRET";


    const expected =
      await signHmac(
        payloadPart,
        secret
      );


    if (
      !constantTimeEqual(
        signature,
        expected
      )
    ) {

      return null;

    }


    const payload =
      JSON.parse(
        base64urlDecode(
          payloadPart
        )
      );


    if (
      !payload ||
      !payload.exp ||
      Date.now() >=
        Number(payload.exp)
    ) {

      return null;

    }


    if (
      payload.authenticated !== true
    ) {

      return null;

    }


    return payload;

  } catch {

    return null;

  }

}


// ============================================================
// HMAC SIGNING
// ============================================================

async function signHmac(
  value,
  secret
) {

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
        value
      )
    );


  return bytesToBase64Url(
    new Uint8Array(
      signature
    )
  );

}


// ============================================================
// STAFF CODE HASH
// ============================================================

async function hashCode(
  code
) {

  const data =
    new TextEncoder().encode(
      code
    );


  const hash =
    await crypto.subtle.digest(
      "SHA-256",
      data
    );


  return bytesToHex(
    new Uint8Array(
      hash
    )
  );

}


// ============================================================
// GENERATE STAFF LOGIN CODE
// ============================================================

function generateLoginCode() {

  const characters =
    "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";


  function randomPart(length) {

    let result = "";

    const values =
      new Uint32Array(
        length
      );


    crypto
      .getRandomValues(
        values
      );


    for (
      let i = 0;
      i < length;
      i++
    ) {

      result +=
        characters[
          values[i] %
          characters.length
        ];

    }


    return result;

  }


  return (
    "AEGIS-" +
    randomPart(4) +
    "-" +
    randomPart(4)
  );

}


// ============================================================
// DOCUMENT FORMATTER
// ============================================================

function formatDocument(
  row
) {

  return {

    id:
      row.id,

    title:
      row.title,

    description:
      row.description || "",

    content:
      row.content || "",

    permission:
      row.permission,

    createdAt:
      row.created_at,

    updatedAt:
      row.updated_at

  };

}


// ============================================================
// JSON RESPONSE
// ============================================================

function json(
  data,
  status = 200
) {

  return new Response(
    JSON.stringify(
      data
    ),
    {

      status,

      headers: {

        "content-type":
          "application/json;charset=UTF-8",

        "cache-control":
          "no-store"

      }

    }
  );

}


// ============================================================
// JSON RESPONSE + LOGIN COOKIE
// ============================================================

function jsonWithCookie(
  data,
  token
) {

  return new Response(
    JSON.stringify(
      data
    ),
    {

      status: 200,

      headers: {

        "content-type":
          "application/json;charset=UTF-8",

        "cache-control":
          "no-store",

        "Set-Cookie":
          `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${Math.floor(
            SESSION_DURATION / 1000
          )}`

      }

    }
  );

}


// ============================================================
// UNAUTHORIZED RESPONSE
// ============================================================

function unauthorized() {

  return json(
    {
      success: false,

      error:
        "You are not authorized to perform this action."

    },
    401
  );

}


// ============================================================
// READ JSON BODY
// ============================================================

async function readJson(
  request
) {

  try {

    return await request.json();

  } catch {

    return {};

  }

}


// ============================================================
// COOKIE PARSER
// ============================================================

function parseCookies(
  cookieHeader
) {

  const cookies = {};


  for (
    const part of
    cookieHeader.split(";")
  ) {

    const index =
      part.indexOf("=");


    if (
      index === -1
    ) {

      continue;

    }


    const name =
      part
        .slice(0, index)
        .trim();


    const value =
      part
        .slice(index + 1)
        .trim();


    if (name) {

      cookies[name] =
        value;

    }

  }


  return cookies;

}


// ============================================================
// BASE64URL
// ============================================================

function base64urlEncode(
  value
) {

  return bytesToBase64Url(
    new TextEncoder().encode(
      value
    )
  );

}


function base64urlDecode(
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
      );


  const padded =
    base64 +
    "=".repeat(
      (4 -
        (base64.length % 4)) %
        4
    );


  const binary =
    atob(
      padded
    );


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


  return new TextDecoder().decode(
    bytes
  );

}


function bytesToBase64Url(
  bytes
) {

  let binary = "";

  const chunkSize =
    0x8000;


  for (
    let i = 0;
    i < bytes.length;
    i += chunkSize
  ) {

    binary +=
      String.fromCharCode(
        ...bytes.subarray(
          i,
          Math.min(
            i + chunkSize,
            bytes.length
          )
        )
      );

  }


  return btoa(
    binary
  )
    .replace(
      /\+/g,
      "-"
    )
    .replace(
      /\//g,
      "_"
    )
    .replace(
      /=+$/,
      ""
    );

}


// ============================================================
// HEX
// ============================================================

function bytesToHex(
  bytes
) {

  return Array.from(
    bytes
  )
    .map(
      byte =>
        byte
          .toString(16)
          .padStart(
            2,
            "0"
          )
    )
    .join("");

}


// ============================================================
// CONSTANT-TIME STRING COMPARISON
// ============================================================

function constantTimeEqual(
  a,
  b
) {

  if (
    typeof a !== "string" ||
    typeof b !== "string"
  ) {

    return false;

  }


  if (
    a.length !==
    b.length
  ) {

    return false;

  }


  let result = 0;


  for (
    let i = 0;
    i < a.length;
    i++
  ) {

    result |=
      a.charCodeAt(i) ^
      b.charCodeAt(i);

  }


  return result === 0;

}
