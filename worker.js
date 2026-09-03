/*
=========================================================
THE AEGIS INSTITUTE
Cloudflare Workers + Static Assets + D1

AUTHENTICATION:
- Main password stored directly in this Worker
- No Discord OAuth required

IMPORTANT:
Replace the value of MAIN_PASSWORD below with your
staff password.
=========================================================
*/


/* =========================================================
   MAIN PASSWORD
========================================================= */

const MAIN_PASSWORD =
  "berzelia";


/* =========================================================
   FALLBACK SESSION SECRET
=========================================================

   The Worker will use Cloudflare's SESSION_SECRET if it
   exists.

   If it doesn't exist, this fallback keeps the login
   system working.

   You can replace this with your own random string if
   you want.
========================================================= */

const FALLBACK_SESSION_SECRET =
  "aegis-institute-session-secret-2026-change-this";


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
       PASSWORD LOGIN
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
       OLD DISCORD LOGIN

       Any old Discord login buttons/links now go directly
       to the password login page.
    ===================================================== */

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


    /* =====================================================
       OLD DISCORD CALLBACK

       No longer used.
    ===================================================== */

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
       CURRENT SESSION
    ===================================================== */

    if (
      url.pathname ===
        "/api/auth/me"
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
   PASSWORD LOGIN
========================================================= */

async function passwordLogin(
  request,
  env
) {

  /*
    Read the request body.
  */

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


  /*
    Get submitted password.
  */

  const password =
    String(
      body?.password ||
        ""
    );


  /*
    Password stored directly in Worker.
  */

  const configuredPassword =
    String(
      MAIN_PASSWORD ||
        ""
    );


  /*
    Check configuration.
  */

  if (
    !configuredPassword ||
    configuredPassword ===
      "PASTE_YOUR_MAIN_PASSWORD_HERE"
  ) {

    return json(
      {
        success:
          false,

        error:
          "MAIN_PASSWORD has not been entered in worker.js."

      },
      500
    );

  }


  /*
    Check that something was entered.
  */

  if (
    !password
  ) {

    return json(
      {
        success:
          false,

        error:
          "Please enter the staff password."

      },
      400
    );

  }


  /*
    Check password.
  */

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


  /*
    Get session secret.

    Cloudflare SESSION_SECRET is preferred.
    The fallback exists so the login doesn't completely
    fail if the Cloudflare secret isn't available.
  */

  const sessionSecret =
    String(
      env.SESSION_SECRET ||
        FALLBACK_SESSION_SECRET
    ).trim();


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


  /*
    Create authenticated session.
  */

  let session;


  try {

    session =
      await signSession(

        {

          authenticated:
            true,

          authorized:
            true,

          username:
            "Aegis Administrator",

          userId:
            "main-admin",

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

  } catch (error) {

    return json(
      {
        success:
          false,

        error:
          "Unable to create login session: " +
          (
            error?.message ||
            "Unknown session error."
          )
      },
      500
    );

  }


  /*
    Send the session cookie to the browser.
  */

  return new Response(

    JSON.stringify(
      {
        success:
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
          [
            "aegis_session=" +
            session +
            "; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=28800"
          ].join(","),

        "Cache-Control":
          "no-store"

      }

    }

  );

}


/* =========================================================
   CURRENT USER / SESSION
========================================================= */

async function getMe(
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

    return json({

      authenticated:
        false,

      authorized:
        false

    });

  }


  const sessionSecret =
    String(

      env.SESSION_SECRET ||
        FALLBACK_SESSION_SECRET

    ).trim();


  if (
    !sessionSecret
  ) {

    return json({

      authenticated:
        false,

      authorized:
        false

    });

  }


  const payload =
    await verifySession(

      token,

      sessionSecret

    );


  if (
    !payload
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
      !!payload.authorized,

    username:
      payload.username ||
      "Aegis Administrator",

    userId:
      payload.userId ||
      "main-admin"

  });

}


/* =========================================================
   GET WEBSITE CONTENT
========================================================= */

async function getContent(
  env
) {

  /*
    If D1 isn't connected, return default content.
  */

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


    /*
      No saved content.
    */

    if (
      !row ||
      !row.value
    ) {

      return json(
        DEFAULT_DATA
      );

    }


    /*
      Convert JSON from D1.
    */

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

    /*
      Don't break the public website if D1
      has a temporary problem.
    */

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

  /*
    Check current login.
  */

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
          "You must be logged in as an Aegis administrator to edit the website."
      },
      403
    );

  }


  /*
    D1 required.
  */

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


  /*
    Read JSON.
  */

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


  /*
    Save to D1.
  */

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

        JSON.stringify(
          data
        ),

        new Date()
          .toISOString()

      )

      .run();


    return json({

      ok:
        true

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
    String(

      env.SESSION_SECRET ||
        FALLBACK_SESSION_SECRET

    ).trim();


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
   CREATE SESSION SIGNATURE
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


  /*
    Convert payload to Base64URL.
  */

  const encoded =
    base64url(

      new TextEncoder()
        .encode(

          JSON.stringify(
            payload
          )

        )

    );


  /*
    Create HMAC key.
  */

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


  /*
    Sign payload.
  */

  const signature =
    await crypto.subtle.sign(

      "HMAC",

      key,

      new TextEncoder()
        .encode(
          encoded
        )

    );


  /*
    Return:

    payload.signature
  */

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


    /*
      Import HMAC key.
    */

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


    /*
      Verify signature.
    */

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


    /*
      Decode payload.
    */

    const payload =
      JSON.parse(

        new TextDecoder()
          .decode(

            fromBase64url(
              payloadPart
            )

          )

      );


    /*
      Check expiry.
    */

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
    i <
      binary.length;
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
