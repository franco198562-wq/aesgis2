/*
=========================================================
THE AEGIS INSTITUTE
Cloudflare Worker
=========================================================

SYSTEM:

MAIN ADMIN
    ↓
ADMIN DASHBOARD
    ├── Staff Login Codes
    ├── Permissions
    ├── Documents
    └── Website Content

STAFF
    ↓
STAFF PORTAL
    └── Only resources allowed by their code
=========================================================
*/


/* =========================================================
   MAIN ADMIN PASSWORD
========================================================= */

const MAIN_PASSWORD =
  "berzelia";


/* =========================================================
   SESSION SECRET
========================================================= */

const FALLBACK_SESSION_SECRET =
  "aegis-institute-session-secret-change-this";


/* =========================================================
   PERMISSIONS
========================================================= */

const PERMISSIONS = {

  handbook: "Staff Handbook",

  documents: "General Documents",

  training: "Training",

  resources: "Staff Resources",

  staff_directory: "Staff Directory",

  announcements: "Staff Announcements"

};

const ALL_PERMISSIONS =
  Object.keys(PERMISSIONS);


/* =========================================================
   DEFAULT PUBLIC WEBSITE CONTENT
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
   WORKER
========================================================= */

export default {

  async fetch(request, env) {

    const url =
      new URL(request.url);


    /* =====================================================
       MAIN PASSWORD LOGIN
    ===================================================== */

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


    /* =====================================================
       STAFF CODE LOGIN
    ===================================================== */

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


    /* =====================================================
       CURRENT USER
    ===================================================== */

    if (
      url.pathname ===
        "/api/auth/me" &&
      request.method ===
        "GET"
    ) {

      return getMe(
        request,
        env
      );

    }


    /* =====================================================
       LOGOUT
    ===================================================== */

    if (
      url.pathname ===
        "/api/auth/logout"
    ) {

      return logout();

    }


    /* =====================================================
       OLD DISCORD ROUTES
    ===================================================== */

    if (
      url.pathname ===
        "/api/auth/discord" ||
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
       ADMIN LOGIN CODES
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
       ADMIN DOCUMENTS
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
       STAFF DOCUMENTS
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
       STATIC FILES
    ===================================================== */

    if (
      !env.ASSETS
    ) {

      return new Response(

        "Static assets binding is not configured.",

        {
          status: 500,

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
   MAIN ADMIN LOGIN
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
          "Invalid login request."

      },

      400

    );

  }


  const password =
    String(
      body?.password ||
      ""
    );


  if (
    MAIN_PASSWORD ===
      "PASTE_YOUR_NEW_MAIN_PASSWORD_HERE"
  ) {

    return json(

      {
        success:
          false,

        error:
          "The main password has not been configured."

      },

      500

    );

  }


  if (
    password !==
      MAIN_PASSWORD
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


  const secret =
    getSessionSecret(
      env
    );


  const token =
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
          8 * 60 * 60 * 1000

      },

      secret

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

      status: 200,

      headers: {

        "Content-Type":
          "application/json; charset=UTF-8",

        "Set-Cookie":
          makeSessionCookie(
            token
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
          "Invalid login request."

      },

      400

    );

  }


  const code =
    String(

      body?.code ||
      body?.loginCode ||
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


  const row =
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
          "This login code has been disabled."

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
      ).getTime();


    if (
      Number.isFinite(expiry) &&
      expiry <= Date.now()
    ) {

      return json(

        {
          success:
            false,

          error:
            "This login code has expired."

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
    !Array.isArray(
      permissions
    )
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


  const secret =
    getSessionSecret(
      env
    );


  const token =
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
          row.id,

        staffId:
          Number(row.id),

        permissions:
          permissions,

        exp:
          Date.now() +
          8 * 60 * 60 * 1000

      },

      secret

    );


  await env.DB

    .prepare(

      `UPDATE login_codes
       SET last_used_at = ?
       WHERE id = ?`

    )

    .bind(

      new Date()
        .toISOString(),

      row.id

    )

    .run();


  return new Response(

    JSON.stringify(

      {

        success:
          true,

        role:
          "staff",

        username:
          row.name,

        permissions:
          permissions,

        redirect:
          "/staff.html"

      }

    ),

    {

      status: 200,

      headers: {

        "Content-Type":
          "application/json; charset=UTF-8",

        "Set-Cookie":
          makeSessionCookie(
            token
          ),

        "Cache-Control":
          "no-store"

      }

    }

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


  if (
    !session ||
    !session.authenticated
  ) {

    return json({

      authenticated:
        false,

      authorized:
        false

    });

  }


  return json({

    authenticated:
      true,

    authorized:
      true,

    role:
      session.role,

    username:
      session.username,

    userId:
      session.userId,

    staffId:
      session.staffId ||
      null,

    permissions:
      session.permissions ||
      []

  });

}


/* =========================================================
   LOGIN CODE LIST
========================================================= */

async function getLoginCodes(
  env
) {

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
            permissions,

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


  return json({

    codes,

    permissions:
      PERMISSIONS

  });

}


/* =========================================================
   CREATE LOGIN CODE
========================================================= */

async function createLoginCode(
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
        error:
          "Invalid JSON."
      },

      400

    );

  }


  const name =
    String(
      body?.name ||
      ""
    ).trim();


  if (
    !name
  ) {

    return json(

      {
        error:
          "Staff member name is required."
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
            "Invalid expiry date."
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
            "Expiry date must be in the future."
        },

        400

      );

    }


    expiresAt =
      date.toISOString();

  }


  let code;


  let hash;


  let inserted =
    false;


  for (
    let attempt = 0;
    attempt < 5;
    attempt++
  ) {

    code =
      generateLoginCode();


    hash =
      await sha256(
        code
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

            hash,

            JSON.stringify(
              permissions
            ),

            expiresAt,

            new Date()
              .toISOString()

          )

          .run();


      if (
        result.success !==
          false
      ) {

        inserted =
          true;

        break;

      }

    } catch {

      /*
        Try another generated code.
      */

    }

  }


  if (
    !inserted
  ) {

    return json(

      {
        error:
          "Unable to generate a unique login code."
      },

      500

    );

  }


  return json({

    success:
      true,

    code:
      code,

    name:
      name,

    permissions:
      permissions,

    expires_at:
      expiresAt

  });

}


/* =========================================================
   DELETE LOGIN CODE
========================================================= */

async function deleteLoginCode(
  request,
  env
) {

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
          "Invalid login code ID."
      },

      400

    );

  }


  await env.DB

    .prepare(

      "DELETE FROM login_codes WHERE id = ?"

    )

    .bind(
      id
    )

    .run();


  return json({

    success:
      true

  });

}


/* =========================================================
   ADMIN DOCUMENTS
========================================================= */

async function getAdminDocuments(
  env
) {

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


  return json({

    documents:
      result.results || []

  });

}


/* =========================================================
   STAFF DOCUMENTS
========================================================= */

async function getStaffDocuments(
  session,
  env
) {

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

    return json({

      documents:
        []

    });

  }


  const placeholders =
    permissions
      .map(
        () => "?"
      )
      .join(",");


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


  return json({

    documents:
      result.results || []

  });

}


/* =========================================================
   CREATE DOCUMENT
========================================================= */

async function createDocument(
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
        error:
          "Invalid JSON."
      },

      400

    );

  }


  const title =
    String(
      body?.title ||
      ""
    ).trim();


  const description =
    String(
      body?.description ||
      ""
    ).trim();


  const content =
    String(
      body?.content ||
      ""
    );


  const permission =
    String(
      body?.permission ||
      ""
    ).trim();


  if (
    !title
  ) {

    return json(

      {
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
        error:
          "Please select a valid permission."
      },

      400

    );

  }


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


  return json({

    success:
      true,

    id:
      result.meta?.last_row_id ||
      null

  });

}


/* =========================================================
   UPDATE DOCUMENT
========================================================= */

async function updateDocument(
  request,
  env
) {

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
          "Invalid document ID."
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
          "Invalid JSON."
      },

      400

    );

  }


  const title =
    String(
      body?.title ||
      ""
    ).trim();


  const description =
    String(
      body?.description ||
      ""
    ).trim();


  const content =
    String(
      body?.content ||
      ""
    );


  const permission =
    String(
      body?.permission ||
      ""
    ).trim();


  if (
    !title
  ) {

    return json(

      {
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
        error:
          "Invalid permission."
      },

      400

    );

  }


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


  return json({

    success:
      true

  });

}


/* =========================================================
   DELETE DOCUMENT
========================================================= */

async function deleteDocument(
  request,
  env
) {

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
          "Invalid document ID."
      },

      400

    );

  }


  await env.DB

    .prepare(

      "DELETE FROM staff_documents WHERE id = ?"

    )

    .bind(
      id
    )

    .run();


  return json({

    success:
      true

  });

}


/* =========================================================
   PUBLIC WEBSITE CONTENT
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

          `SELECT value
           FROM portal_content
           WHERE id = 'main'`

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
   SAVE PUBLIC WEBSITE CONTENT
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
          "Administrator access required."
      },

      403

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
          "Invalid JSON."
      },

      400

    );

  }


  const now =
    new Date()
      .toISOString();


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

      now

    )

    .run();


  return json({

    success:
      true

  });

}


/* =========================================================
   GENERATE LOGIN CODE
========================================================= */

function generateLoginCode() {

  const characters =
    "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";


  function part(length) {

    let output =
      "";


    for (
      let i = 0;
      i < length;
      i++
    ) {

      output +=
        characters[
          Math.floor(
            Math.random() *
            characters.length
          )
        ];

    }


    return output;

  }


  return (
    "AEGIS-" +
    part(4) +
    "-" +
    part(4)
  );

}


/* =========================================================
   SHA256
========================================================= */

async function sha256(
  value
) {

  const bytes =
    new TextEncoder()
      .encode(
        value
      );


  const hash =
    await crypto.subtle.digest(

      "SHA-256",

      bytes

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
    FALLBACK_SESSION_SECRET

  ).trim();

}


/* =========================================================
   SIGN SESSION
========================================================= */

async function signSession(
  payload,
  secret
) {

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
      payload.exp <=
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
   GET SESSION
========================================================= */

async function getSession(
  request,
  env
) {

  const cookieHeader =
    request.headers.get(
      "Cookie"
    ) || "";


  const token =
    getCookie(

      cookieHeader,

      "aegis_session"

    );


  if (
    !token
  ) {

    return null;

  }


  return verifySession(

    token,

    getSessionSecret(
      env
    )

  );

}


/* =========================================================
   ADMIN CHECK
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
   COOKIE
========================================================= */

function makeSessionCookie(
  token
) {

  return (

    "aegis_session=" +
    token +
    "; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=28800"

  );

}


/* =========================================================
   LOGOUT
========================================================= */

function logout() {

  return new Response(

    JSON.stringify({

      success:
        true

    }),

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
   COOKIE READER
========================================================= */

function getCookie(
  cookieString,
  name
) {

  const cookies =
    cookieString
      .split(";");


  for (
    const cookie of cookies
  ) {

    const trimmed =
      cookie.trim();


    if (
      trimmed.startsWith(
        name + "="
      )
    ) {

      return trimmed.slice(
        name.length + 1
      );

    }

  }


  return null;

}


/* =========================================================
   BASE64URL
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
      /=+$/,
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
      );


  const padded =
    base64 +
    "=".repeat(
      (
        4 -
        base64.length % 4
      ) % 4
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
