/*
=========================================================
THE AEGIS INSTITUTE
Cloudflare Workers + Static Assets + D1

AUTHENTICATION:
- Main administrator password
- Staff login codes
- Permission-based staff access
- Signed sessions
- D1 storage for staff codes and documents
=========================================================
*/


/* =========================================================
   MAIN ADMINISTRATOR PASSWORD
=========================================================

   IMPORTANT:
   Replace the value below with your NEW main password.

   Do NOT send the password to anyone.
========================================================= */

const MAIN_PASSWORD =
  "berzelia";


/* =========================================================
   FALLBACK SESSION SECRET
=========================================================

   Cloudflare's SESSION_SECRET is preferred.

   If it isn't configured, this fallback allows the
   authentication system to continue working.

   For best security, keep a real SESSION_SECRET configured
   in Cloudflare.
========================================================= */

const FALLBACK_SESSION_SECRET =
  "aegis-institute-session-secret-2026-change-this";


/* =========================================================
   PERMISSIONS
========================================================= */

const PERMISSIONS = {

  handbook:
    "Staff Handbook",

  documents:
    "General Documents",

  training:
    "Training",

  resources:
    "Staff Resources",

  staff_directory:
    "Staff Directory",

  announcements:
    "Staff Announcements"

};

const ALL_PERMISSIONS =
  Object.keys(PERMISSIONS);


/* =========================================================
   DEFAULT WEBSITE DATA
========================================================= */

const DEFAULT_DATA = {

  hero: {

    title:
      "Training that sees the person behind every case.",

    text:
      "The Aegis Institute supports Discord communities and individuals through personalised consulting and structured education — built around your rules, your people, and your goals.",

    cardTitle:
      "Two branches. One standard of care.",

    cardText:
      "Consulting for communities that want clarity — education for staff and aspiring moderators who want to know where to start."

  },


  services: [

    {

      label:
        "SERVER OWNERS",

      title:
        "Outsourced staff training",

      description:
        "High-quality training, assessments and feedback aligned to your rules and procedures.",

      bullets: [

        "Training, assessments & educator support",

        "Structured standards",

        "Actionable feedback"

      ]

    },


    {

      label:
        "PLAYERS",

      title:
        "Moderator & Advanced Fundamentals",

      description:
        "Preparation for aspiring moderators and supervisors who want to build practical skills.",

      bullets: [

        "Moderator fundamentals",

        "Advanced fundamentals",

        "Practical scenarios"

      ]

    }

  ],


  work: [

    {

      label:
        "STAFF DEVELOPMENT",

      title:
        "Structured staff programmes",

      description:
        "Clear pathways for trainees, moderators, supervisors and leadership teams."

    },


    {

      label:
        "STANDARDS",

      title:
        "Policies that people can actually use",

      description:
        "Practical policies, procedures and expectations written around the way your community operates."

    },


    {

      label:
        "CONSULTING",

      title:
        "An external perspective",

      description:
        "Honest feedback on systems, staff structures, training and community operations."

    },


    {

      label:
        "EDUCATION",

      title:
        "Training built around scenarios",

      description:
        "Learn through examples and situations that staff can actually encounter."

    }

  ],


  contact: {

    title:
      "Let's talk about what your community needs.",

    text:
      "Have a question, project idea, or training requirement? Send a message and the Aegis team can help."

  }

};


/* =========================================================
   MAIN WORKER
========================================================= */

export default {

  async fetch(request, env) {

    const url =
      new URL(request.url);


    /* =====================================================
       AUTHENTICATION
    ===================================================== */


    /*
      MAIN ADMIN PASSWORD LOGIN
    */

    if (
      url.pathname ===
        "/api/auth/password" &&
      request.method ===
        "POST"
    ) {

      return passwordLogin(
        request,
        env
      );

    }


    /*
      STAFF LOGIN CODE
    */

    if (
      url.pathname ===
        "/api/auth/code" &&
      request.method ===
        "POST"
    ) {

      return staffCodeLogin(
        request,
        env
      );

    }


    /*
      CURRENT SESSION
    */

    if (
      url.pathname ===
        "/api/auth/me"
    ) {

      return getMe(
        request,
        env
      );

    }


    /*
      LOGOUT
    */

    if (
      url.pathname ===
        "/api/auth/logout"
    ) {

      return logout();

    }


    /*
      OLD DISCORD LOGIN

      Kept so old links don't break.
    */

    if (
      url.pathname ===
        "/api/auth/discord"
    ) {

      return Response.redirect(

        new URL(
          "/staff-login.html",
          request.url
        ).toString(),

        302

      );

    }


    /*
      OLD DISCORD CALLBACK
    */

    if (
      url.pathname ===
        "/api/auth/callback"
    ) {

      return Response.redirect(

        new URL(
          "/staff-login.html",
          request.url
        ).toString(),

        302

      );

    }


    /* =====================================================
       ADMIN - STAFF LOGIN CODES
    ===================================================== */


    if (
      url.pathname ===
        "/api/admin/login-codes"
    ) {

      const session =
        await getSession(
          request,
          env
        );


      if (
        !isMainAdmin(session)
      ) {

        return json(

          {
            error:
              "Administrator access required."
          },

          403

        );

      }


      if (
        request.method ===
          "GET"
      ) {

        return getLoginCodes(
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


      if (
        request.method ===
          "DELETE"
      ) {

        return deleteLoginCode(
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


    /* =====================================================
       ADMIN - DOCUMENTS
    ===================================================== */


    if (
      url.pathname ===
        "/api/admin/documents"
    ) {

      const session =
        await getSession(
          request,
          env
        );


      if (
        !isMainAdmin(session)
      ) {

        return json(

          {
            error:
              "Administrator access required."
          },

          403

        );

      }


      if (
        request.method ===
          "GET"
      ) {

        return getAdminDocuments(
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


      if (
        request.method ===
          "PUT"
      ) {

        return updateDocument(
          request,
          env
        );

      }


      if (
        request.method ===
          "DELETE"
      ) {

        return deleteDocument(
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


    /* =====================================================
       STAFF - PERMITTED DOCUMENTS
    ===================================================== */


    if (
      url.pathname ===
        "/api/staff/documents"
    ) {

      const session =
        await getSession(
          request,
          env
        );


      if (
        !session ||
        !session.authenticated
      ) {

        return json(

          {
            error:
              "You must be logged in."
          },

          401

        );

      }


      if (
        session.role ===
          "main_admin"
      ) {

        return getAdminDocuments(
          env
        );

      }


      if (
        session.role !==
          "staff"
      ) {

        return json(

          {
            error:
              "Staff access required."
          },

          403

        );

      }


      return getStaffDocuments(
        session,
        env
      );

    }


    /* =====================================================
       WEBSITE CONTENT
    ===================================================== */


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


    /* =====================================================
       STATIC WEBSITE
    ===================================================== */


    if (
      !env.ASSETS
    ) {

      return new Response(

        "Static assets binding is not configured.",

        {

          status:
            500,

          headers: {

            "Content-Type":
              "text/plain; charset=UTF-8"

          }

        }

      );

    }


    return env.ASSETS.fetch(
      request
    );

  }

};


/* =========================================================
   MAIN ADMIN PASSWORD LOGIN
========================================================= */

async function passwordLogin(
  request,
  env
) {

  let body;


  try {

    body =
      await request.json();

  } catch {

    return json(

      {
        success:
          false,

        error:
          "The login request was not valid JSON."

      },

      400

    );

  }


  const password =
    String(
      body?.password ||
        ""
    );


  const configuredPassword =
    String(
      MAIN_PASSWORD ||
        ""
    );


  if (
    !configuredPassword ||
    configuredPassword ===
      "PASTE_YOUR_NEW_MAIN_PASSWORD_HERE"
  ) {

    return json(

      {
        success:
          false,

        error:
          "MAIN_PASSWORD has not been configured in worker.js."

      },

      500

    );

  }


  if (
    !password
  ) {

    return json(

      {
        success:
          false,

        error:
          "Please enter the administrator password."

      },

      400

    );

  }


  if (
    password !==
      configuredPassword
  ) {

    return json(

      {
        success:
          false,

        error:
          "Incorrect password."

      },

      401

    );

  }


  const sessionSecret =
    getSessionSecret(
      env
    );


  if (
    !sessionSecret
  ) {

    return json(

      {
        success:
          false,

        error:
          "Session system is not configured."

      },

      500

    );

  }


  const session =
    await signSession(

      {

        authenticated:
          true,

        authorized:
          true,

        role:
          "main_admin",

        username:
          "Aegis Administrator",

        userId:
          "main-admin",

        permissions:
          ALL_PERMISSIONS,

        exp:
          Date.now() +
          (
            8 *
            60 *
            60 *
            1000
          )

      },

      sessionSecret

    );


  return new Response(

    JSON.stringify(

      {
        success:
          true,

        role:
          "main_admin",

        redirect:
          "/admin.html"

      }

    ),

    {

      status:
        200,

      headers: {

        "Content-Type":
          "application/json; charset=UTF-8",

        "Set-Cookie":
          makeSessionCookie(
            session
          ),

        "Cache-Control":
          "no-store"

      }

    }

  );

}


/* =========================================================
   STAFF CODE LOGIN
========================================================= */

async function staffCodeLogin(
  request,
  env
) {

  if (
    !env.DB
  ) {

    return json(

      {
        success:
          false,

        error:
          "D1 is not configured."

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
        success:
          false,

        error:
          "The login request was not valid JSON."

      },

      400

    );

  }


  const code =
    String(
      body?.code ||
        ""
    )
      .trim()
      .toUpperCase();


  if (
    !code
  ) {

    return json(

      {
        success:
          false,

        error:
          "Please enter your staff login code."

      },

      400

    );

  }


  const codeHash =
    await sha256(
      code
    );


  let row;


  try {

    row =
      await env.DB

        .prepare(

          `SELECT
            id,
            name,
            code_hash,
            permissions,
            active,
            expires_at
           FROM login_codes
           WHERE code_hash = ?`

        )

        .bind(
          codeHash
        )

        .first();

  } catch (error) {

    return json(

      {
        success:
          false,

        error:
          "Unable to check the login code: " +
          (
            error?.message ||
            "Database error."
          )

      },

      500

    );

  }


  if (
    !row
  ) {

    return json(

      {
        success:
          false,

        error:
          "Invalid staff login code."

      },

      401

    );

  }


  if (
    !Number(row.active)
  ) {

    return json(

      {
        success:
          false,

        error:
          "This staff login code has been disabled."

      },

      403

    );

  }


  if (
    row.expires_at
  ) {

    const expiry =
      new Date(
        row.expires_at
      )
        .getTime();


    if (
      Number.isFinite(expiry) &&
      expiry <= Date.now()
    ) {

      return json(

        {
          success:
            false,

          error:
            "This staff login code has expired."

        },

        403

      );

    }

  }


  let permissions;


  try {

    permissions =
      JSON.parse(
        row.permissions ||
        "[]"
      );

  } catch {

    permissions =
      [];

  }


  if (
    !Array.isArray(permissions)
  ) {

    permissions =
      [];

  }


  permissions =
    permissions.filter(
      permission =>
        ALL_PERMISSIONS.includes(
          permission
        )
    );


  const sessionSecret =
    getSessionSecret(
      env
    );


  if (
    !sessionSecret
  ) {

    return json(

      {
        success:
          false,

        error:
          "Session system is not configured."

      },

      500

    );

  }


  const session =
    await signSession(

      {

        authenticated:
          true,

        authorized:
          true,

        role:
          "staff",

        username:
          row.name,

        userId:
          "staff-" +
          String(row.id),

        staffId:
          Number(row.id),

        permissions:
          permissions,

        exp:
          Date.now() +
          (
            8 *
            60 *
            60 *
            1000
          )

      },

      sessionSecret

    );


  try {

    await env.DB

      .prepare(

        `UPDATE login_codes
         SET last_used_at = ?
         WHERE id = ?`

      )

      .bind(

        new Date()
          .toISOString(),

        Number(row.id)

      )

      .run();

  } catch {
    /*
      Don't prevent login if updating last_used_at fails.
    */
  }


  return new Response(

    JSON.stringify(

      {

        success:
          true,

        role:
          "staff",

        username:
          row.name,

        redirect:
          "/staff.html"

      }

    ),

    {

      status:
        200,

      headers: {

        "Content-Type":
          "application/json; charset=UTF-8",

        "Set-Cookie":
          makeSessionCookie(
            session
          ),

        "Cache-Control":
          "no-store"

      }

    }

  );

}


/* =========================================================
   CURRENT SESSION
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


  if (
    !session ||
    !session.authenticated
  ) {

    return json(

      {
        authenticated:
          false,

        authorized:
          false

      }

    );

  }


  return json(

    {

      authenticated:
        true,

      authorized:
        true,

      role:
        session.role ||
        "staff",

      username:
        session.username ||
        "Aegis Staff",

      userId:
        session.userId ||
        null,

      permissions:
        Array.isArray(
          session.permissions
        )
          ? session.permissions
          : []

    }

  );

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

      request.headers.get(
        "Cookie"
      ) || "",

      "aegis_session"

    );


  if (
    !token
  ) {

    return null;

  }


  const sessionSecret =
    getSessionSecret(
      env
    );


  if (
    !sessionSecret
  ) {

    return null;

  }


  return verifySession(

    token,

    sessionSecret

  );

}


/* =========================================================
   CHECK MAIN ADMIN
========================================================= */

function isMainAdmin(
  session
) {

  return !!(

    session &&
    session.authenticated &&
    session.role ===
      "main_admin"

  );

}


/* =========================================================
   LOGIN CODE LIST
========================================================= */

async function getLoginCodes(
  env
) {

  if (
    !env.DB
  ) {

    return json(

      {
        error:
          "D1 is not configured."
      },

      500

    );

  }


  try {

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


    const codes =
      (result.results || [])
        .map(row => {

          let permissions;

          try {

            permissions =
              JSON.parse(
                row.permissions ||
                "[]"
              );

          } catch {

            permissions =
              [];

          }


          return {

            id:
              Number(row.id),

            name:
              row.name,

            permissions:
              Array.isArray(
                permissions
              )
                ? permissions
                : [],

            active:
              !!Number(
                row.active
              ),

            expires_at:
              row.expires_at,

            created_at:
              row.created_at,

            last_used_at:
              row.last_used_at

          };

        });


    return json(

      {
        codes
      }

    );

  } catch (error) {

    return json(

      {
        error:
          error?.message ||
          "Unable to load login codes."
      },

      500

    );

  }

}


/* =========================================================
   CREATE LOGIN CODE
========================================================= */

async function createLoginCode(
  request,
  env
) {

  if (
    !env.DB
  ) {

    return json(

      {
        error:
          "D1 is not configured."
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
        error:
          "Invalid JSON data."
      },

      400

    );

  }


  const name =
    String(
      body?.name ||
        ""
    )
      .trim();


  if (
    !name
  ) {

    return json(

      {
        error:
          "A staff name is required."
      },

      400

    );

  }


  if (
    name.length >
      100
  ) {

    return json(

      {
        error:
          "Staff name is too long."
      },

      400

    );

  }


  let permissions =
    Array.isArray(
      body?.permissions
    )
      ? body.permissions
      : [];


  permissions =
    [
      ...new Set(
        permissions.filter(
          permission =>
            ALL_PERMISSIONS.includes(
              permission
            )
        )
      )
    ];


  let expiresAt =
    null;


  if (
    body?.expires_at
  ) {

    const date =
      new Date(
        body.expires_at
      );


    if (
      Number.isNaN(
        date.getTime()
      )
    ) {

      return json(

        {
          error:
            "The expiry date is invalid."
        },

        400

      );

    }


    if (
      date.getTime() <=
        Date.now()
    ) {

      return json(

        {
          error:
            "The expiry date must be in the future."
        },

        400

      );

    }


    expiresAt =
      date.toISOString();

  }


  const readableCode =
    generateLoginCode();


  const codeHash =
    await sha256(
      readableCode
    );


  try {

    const result =
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

          new Date()
            .toISOString()

        )

        .run();


    return json(

      {

        success:
          true,

        id:
          result.meta?.last_row_id ||
          null,

        name:
          name,

        code:
          readableCode,

        permissions:
          permissions,

        expires_at:
          expiresAt

      }

    );

  } catch (error) {

    return json(

      {
        error:
          error?.message ||
          "Unable to create login code."
      },

      500

    );

  }

}


/* =========================================================
   DELETE LOGIN CODE
========================================================= */

async function deleteLoginCode(
  request,
  env
) {

  if (
    !env.DB
  ) {

    return json(

      {
        error:
          "D1 is not configured."
      },

      500

    );

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
        error:
          "A valid login code ID is required."
      },

      400

    );

  }


  try {

    await env.DB

      .prepare(

        "DELETE FROM login_codes WHERE id = ?"

      )

      .bind(
        id
      )

      .run();


    return json(

      {
        success:
          true
      }

    );

  } catch (error) {

    return json(

      {
        error:
          error?.message ||
          "Unable to delete login code."
      },

      500

    );

  }

}


/* =========================================================
   GET ADMIN DOCUMENTS
========================================================= */

async function getAdminDocuments(
  env
) {

  if (
    !env.DB
  ) {

    return json(

      {
        error:
          "D1 is not configured."
      },

      500

    );

  }


  try {

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


    return json(

      {
        documents:
          result.results || []
      }

    );

  } catch (error) {

    return json(

      {
        error:
          error?.message ||
          "Unable to load documents."
      },

      500

    );

  }

}


/* =========================================================
   GET STAFF DOCUMENTS
========================================================= */

async function getStaffDocuments(
  session,
  env
) {

  if (
    !env.DB
  ) {

    return json(

      {
        error:
          "D1 is not configured."
      },

      500

    );

  }


  const permissions =
    Array.isArray(
      session.permissions
    )
      ? session.permissions
      : [];


  if (
    permissions.length ===
      0
  ) {

    return json(

      {
        documents:
          []
      }

    );

  }


  const placeholders =
    permissions
      .map(
        () => "?"
      )
      .join(",");


  try {

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
           WHERE permission IN (${placeholders})
           ORDER BY id DESC`

        )

        .bind(
          ...permissions
        )

        .all();


    return json(

      {
        documents:
          result.results || []
      }

    );

  } catch (error) {

    return json(

      {
        error:
          error?.message ||
          "Unable to load staff resources."
      },

      500

    );

  }

}


/* =========================================================
   CREATE DOCUMENT
========================================================= */

async function createDocument(
  request,
  env
) {

  if (
    !env.DB
  ) {

    return json(

      {
        error:
          "D1 is not configured."
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
        error:
          "Invalid JSON data."
      },

      400

    );

  }


  const title =
    String(
      body?.title ||
        ""
    )
      .trim();


  const description =
    String(
      body?.description ||
        ""
    )
      .trim();


  const content =
    String(
      body?.content ||
        ""
    );


  const permission =
    String(
      body?.permission ||
        ""
    )
      .trim();


  if (
    !title
  ) {

    return json(

      {
        error:
          "A document title is required."
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
        error:
          "A valid document permission is required."
      },

      400

    );

  }


  try {

    const now =
      new Date()
        .toISOString();


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


    return json(

      {

        success:
          true,

        id:
          result.meta?.last_row_id ||
          null

      }

    );

  } catch (error) {

    return json(

      {
        error:
          error?.message ||
          "Unable to create document."
      },

      500

    );

  }

}


/* =========================================================
   UPDATE DOCUMENT
========================================================= */

async function updateDocument(
  request,
  env
) {

  if (
    !env.DB
  ) {

    return json(

      {
        error:
          "D1 is not configured."
      },

      500

    );

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
        error:
          "A valid document ID is required."
      },

      400

    );

  }


  let body;


  try {

    body =
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


  const title =
    String(
      body?.title ||
        ""
    )
      .trim();


  const description =
    String(
      body?.description ||
        ""
    )
      .trim();


  const content =
    String(
      body?.content ||
        ""
    );


  const permission =
    String(
      body?.permission ||
        ""
    )
      .trim();


  if (
    !title
  ) {

    return json(

      {
        error:
          "A document title is required."
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
        error:
          "A valid document permission is required."
      },

      400

    );

  }


  try {

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

        new Date()
          .toISOString(),

        id

      )

      .run();


    return json(

      {
        success:
          true
      }

    );

  } catch (error) {

    return json(

      {
        error:
          error?.message ||
          "Unable to update document."
      },

      500

    );

  }

}


/* =========================================================
   DELETE DOCUMENT
========================================================= */

async function deleteDocument(
  request,
  env
) {

  if (
    !env.DB
  ) {

    return json(

      {
        error:
          "D1 is not configured."
      },

      500

    );

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
        error:
          "A valid document ID is required."
      },

      400

    );

  }


  try {

    await env.DB

      .prepare(

        "DELETE FROM staff_documents WHERE id = ?"

      )

      .bind(
        id
      )

      .run();


    return json(

      {
        success:
          true
      }

    );

  } catch (error) {

    return json(

      {
        error:
          error?.message ||
          "Unable to delete document."
      },

      500

    );

  }

}


/* =========================================================
   GET WEBSITE CONTENT
========================================================= */

async function getContent(
  env
) {

  if (
    !env.DB
  ) {

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


    if (
      !row ||
      !row.value
    ) {

      return json(
        DEFAULT_DATA
      );

    }


    try {

      return json(

        JSON.parse(
          row.value
        )

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
    !isMainAdmin(session)
  ) {

    return json(

      {
        error:
          "You must be logged in as the Aegis administrator to edit the website."
      },

      403

    );

  }


  if (
    !env.DB
  ) {

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
         (
           id,
           value,
           updated_at
         )
         VALUES ('main', ?, ?)
         ON CONFLICT(id)
         DO UPDATE SET
           value = excluded.value,
           updated_at = excluded.updated_at`

      )

      .bind(

        JSON.stringify(
          data
        ),

        new Date()
          .toISOString()

      )

      .run();


    return json(

      {
        ok:
          true
      }

    );

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
   GENERATE STAFF LOGIN CODE
========================================================= */

function generateLoginCode() {

  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";


  function segment(length) {

    let result =
      "";

    for (
      let i = 0;
      i < length;
      i++
    ) {

      result +=
        chars[
          Math.floor(
            Math.random() *
            chars.length
          )
        ];

    }

    return result;

  }


  return (
    "AEGIS-" +
    segment(4) +
    "-" +
    segment(4)
  );

}


/* =========================================================
   HASH STRING
========================================================= */

async function sha256(
  value
) {

  const data =
    new TextEncoder()
      .encode(
        value
      );


  const hash =
    await crypto.subtle.digest(
      "SHA-256",
      data
    );


  return Array
    .from(
      new Uint8Array(
        hash
      )
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


/* =========================================================
   SESSION SECRET
========================================================= */

function getSessionSecret(
  env
) {

  return String(

    env.SESSION_SECRET ||
    FALLBACK_SESSION_SECRET ||
    ""

  ).trim();

}


/* =========================================================
   CREATE SESSION
========================================================= */

async function signSession(
  payload,
  secret
) {

  if (
    !secret
  ) {

    throw new Error(
      "No session secret available."
    );

  }


  const encoded =
    base64url(

      new TextEncoder()
        .encode(

          JSON.stringify(
            payload
          )

        )

    );


  const key =
    await crypto.subtle.importKey(

      "raw",

      new TextEncoder()
        .encode(
          secret
        ),

      {

        name:
          "HMAC",

        hash:
          "SHA-256"

      },

      false,

      [
        "sign"
      ]

    );


  const signature =
    await crypto.subtle.sign(

      "HMAC",

      key,

      new TextEncoder()
        .encode(
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

    if (
      !token ||
      !secret
    ) {

      return null;

    }


    const parts =
      token.split(".");


    if (
      parts.length !==
        2
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

        new TextEncoder()
          .encode(
            secret
          ),

        {

          name:
            "HMAC",

          hash:
            "SHA-256"

        },

        false,

        [
          "verify"
        ]

      );


    const valid =
      await crypto.subtle.verify(

        "HMAC",

        key,

        fromBase64url(
          signaturePart
        ),

        new TextEncoder()
          .encode(
            payloadPart
          )

      );


    if (
      !valid
    ) {

      return null;

    }


    const payload =
      JSON.parse(

        new TextDecoder()
          .decode(

            fromBase64url(
              payloadPart
            )

          )

      );


    if (
      !payload.exp ||
      payload.exp <
        Date.now()
    ) {

      return null;

    }


    return payload;

  } catch {

    return null;

  }

}


/* =========================================================
   SESSION COOKIE
========================================================= */

function makeSessionCookie(
  session
) {

  return (

    "aegis_session=" +
    session +
    "; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=28800"

  );

}


/* =========================================================
   LOGOUT
========================================================= */

function logout() {

  return new Response(

    JSON.stringify(

      {
        ok:
          true
      }

    ),

    {

      status:
        200,

      headers: {

        "Content-Type":
          "application/json; charset=UTF-8",

        "Set-Cookie":
          "aegis_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0",

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


  if (
    !found
  ) {

    return null;

  }


  return found.slice(

    name.length +
    1

  );

}


/* =========================================================
   BASE64URL ENCODE
========================================================= */

function base64url(
  bytes
) {

  let binary =
    "";


  for (
    const byte of bytes
  ) {

    binary +=
      String.fromCharCode(
        byte
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
          value.length /
          4
        ) * 4,

        "="

      );


  const binary =
    atob(
      base64
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
      binary.charCodeAt(
        i
      );

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

    JSON.stringify(
      data
    ),

    {

      status:

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
