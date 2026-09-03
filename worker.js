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


    /* =====================================================
       PASSWORD LOGIN
    ===================================================== */

    if (
      url.pathname === "/api/auth/password" &&
      request.method === "POST"
    ) {
      return passwordLogin(request, env);
    }


    /* =====================================================
   OLD DISCORD LOGIN REDIRECT
===================================================== */

if (
  url.pathname === "/api/auth/discord"
) {
  return new Response(null, {
    status: 302,
    headers: {
      "Location": "/staff-login.html"
    }
  });
}

    /* =====================================================
       CURRENT SESSION
    ===================================================== */

    if (
      url.pathname === "/api/auth/me"
    ) {
      return getMe(request, env);
    }


    /* =====================================================
       LOGOUT
    ===================================================== */

    if (
      url.pathname === "/api/auth/logout"
    ) {
      return logout();
    }


    /* =====================================================
       WEBSITE CONTENT
    ===================================================== */

    if (
      url.pathname === "/api/content"
    ) {

      if (
        request.method === "GET"
      ) {
        return getContent(env);
      }


      if (
        request.method === "PUT"
      ) {
        return saveContent(request, env);
      }


      return json(
        {
          error: "Method not allowed."
        },
        405
      );
    }


    /* =====================================================
       STATIC WEBSITE
    ===================================================== */

    return env.ASSETS.fetch(request);
  }
};


/* =========================================================
   PASSWORD LOGIN
========================================================= */

async function passwordLogin(
  request,
  env
) {

  try {

    const body =
      await request.json();


    const password =
      String(
        body.password || ""
      );


    const mainPassword =
      String(
        env.MAIN_PASSWORD || ""
      );


    if (!mainPassword) {

      return json(
        {
          success: false,
          error:
            "Main password has not been configured."
        },
        500
      );

    }


    if (!password) {

      return json(
        {
          success: false,
          error:
            "Please enter the password."
        },
        400
      );

    }


    if (password !== mainPassword) {

      return json(
        {
          success: false,
          error:
            "Incorrect password."
        },
        401
      );

    }


    const sessionPayload = {

      authenticated: true,

      authorized: true,

      username:
        "Aegis Administrator",

      userId:
        "main-admin",

      exp:
        Date.now() +
        8 * 60 * 60 * 1000
    };


    const session =
      await signSession(
        sessionPayload,
        env.SESSION_SECRET
      );


    return new Response(
      JSON.stringify({
        success: true
      }),
      {

        status: 200,

        headers: {

          "Content-Type":
            "application/json",

          "Set-Cookie":
            `aegis_session=${session}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=28800`,

          "Cache-Control":
            "no-store"
        }
      }
    );


  } catch {

    return json(
      {
        success: false,
        error:
          "Invalid login request."
      },
      400
    );

  }
}


/* =========================================================
   CURRENT USER
========================================================= */

async function getMe(
  request,
  env
) {

  const sessionToken =
    getCookie(
      request.headers.get("Cookie") || "",
      "aegis_session"
    );


  if (!sessionToken) {

    return json({
      authenticated: false,
      authorized: false
    });

  }


  const session =
    await verifySession(
      sessionToken,
      env.SESSION_SECRET
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

    username:
      session.username,

    userId:
      session.userId

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
          error?.message ||
          "Unable to save content."
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
   CREATE SESSION
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

    if (
      !token ||
      !secret
    ) {
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
          "application/json",

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
        x => x.trim()
      )
      .find(
        x =>
          x.startsWith(
            name + "="
          )
      );


  return found
    ? found.slice(
        name.length + 1
      )
    : null;

}


/* =========================================================
   BASE64 URL
========================================================= */

function base64url(
  bytes
) {

  let binary = "";


  for (
    const byte of bytes
  ) {

    binary +=
      String.fromCharCode(
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
      /=+$/,
      ""
    );

}


/* =========================================================
   FROM BASE64 URL
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

    JSON.stringify(
      data
    ),

    {

      status,

      headers: {

        "Content-Type":
          "application/json",

        "Cache-Control":
          "no-store"
      }

    }
  );

}
