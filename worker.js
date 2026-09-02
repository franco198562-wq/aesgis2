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


/* ==================================
   MAIN WORKER
================================== */

export default {

  async fetch(request, env) {

    const url = new URL(request.url);


    /* ------------------------------
       AUTH
    ------------------------------ */

    if (
      url.pathname === "/api/auth/discord"
    ) {

      return startDiscordLogin(env);

    }


    if (
      url.pathname === "/api/auth/callback"
    ) {

      return discordCallback(
        request,
        env
      );

    }


    if (
      url.pathname === "/api/auth/me"
    ) {

      return getMe(
        request,
        env
      );

    }


    if (
      url.pathname === "/api/auth/logout"
    ) {

      return logout();

    }


    /* ------------------------------
       CONTENT
    ------------------------------ */

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

        return saveContent(
          request,
          env
        );

      }

    }


    /* ------------------------------
       STATIC WEBSITE
    ------------------------------ */

    return env.ASSETS.fetch(
      request
    );

  }

};


/* ==================================
   DISCORD LOGIN
================================== */

function startDiscordLogin(env) {

  /*
    Check that the important Discord
    environment variables exist before
    sending the user to Discord.
  */

  if (!env.DISCORD_CLIENT_ID) {

    return new Response(
      "Cloudflare is missing DISCORD_CLIENT_ID.",
      {
        status: 500,
        headers: {
          "Content-Type": "text/plain; charset=UTF-8"
        }
      }
    );

  }


  if (!env.DISCORD_REDIRECT_URI) {

    return new Response(
      "Cloudflare is missing DISCORD_REDIRECT_URI.",
      {
        status: 500,
        headers: {
          "Content-Type": "text/plain; charset=UTF-8"
        }
      }
    );

  }


  const state =
    crypto.randomUUID();


  const params =
    new URLSearchParams({

      client_id:
        env.DISCORD_CLIENT_ID,

      response_type:
        "code",

      redirect_uri:
        env.DISCORD_REDIRECT_URI,

      scope:
        "identify guilds.members.read",

      state:
        state

    });


  const discordURL =
    "https://discord.com/oauth2/authorize?" +
    params.toString();


  return new Response(
    null,
    {

      status: 302,

      headers: {

        "Location":
          discordURL,

        "Set-Cookie":
          `aegis_oauth_state=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`

      }

    }
  );

}


/* ==================================
   DISCORD CALLBACK
================================== */

async function discordCallback(
  request,
  env
) {

  const url =
    new URL(request.url);


  const code =
    url.searchParams.get(
      "code"
    );


  const returnedState =
    url.searchParams.get(
      "state"
    );


  const discordError =
    url.searchParams.get(
      "error"
    );


  const discordErrorDescription =
    url.searchParams.get(
      "error_description"
    );


  /*
    If Discord sends an OAuth error,
    show the actual reason.
  */

  if (discordError) {

    return new Response(
      "Discord OAuth error: " +
      discordError +
      (
        discordErrorDescription
          ? "\n\n" + discordErrorDescription
          : ""
      ),
      {
        status: 400,
        headers: {
          "Content-Type":
            "text/plain; charset=UTF-8"
        }
      }
    );

  }


  const cookies =
    request.headers.get(
      "Cookie"
    ) || "";


  const stateCookie =
    getCookie(
      cookies,
      "aegis_oauth_state"
    );


  /*
    Verify OAuth state.
  */

  if (
    !code ||
    !returnedState ||
    !stateCookie ||
    returnedState !== stateCookie
  ) {

    return new Response(
      "Invalid OAuth state.",
      {
        status: 400,
        headers: {
          "Content-Type":
            "text/plain; charset=UTF-8"
        }
      }
    );

  }


  try {

    /*
      Exchange the Discord authorization
      code for an access token.
    */

    const accessToken =
      await exchangeCode(
        code,
        env
      );


    /*
      Get the current Discord user.
    */

    const user =
      await discordGet(
        "https://discord.com/api/users/@me",
        accessToken
      );


    /*
      Get the current user's membership
      in the configured Discord server.

      This is the correct OAuth endpoint
      for guilds.members.read.
    */

    if (!env.DISCORD_GUILD_ID) {

      throw new Error(
        "DISCORD_GUILD_ID is missing from Cloudflare."
      );

    }


    const member =
      await discordGet(
        `https://discord.com/api/users/@me/guilds/${env.DISCORD_GUILD_ID}/member`,
        accessToken
      );


    /*
      Get the user's Discord roles.
    */

    const roles =
      member.roles || [];


    /*
      Get the authorized role IDs from
      Cloudflare environment variables.

      Example:

      123456789012345678,987654321098765432
    */

    const allowedRoles =
      String(
        env.AUTHORIZED_ROLE_IDS || ""
      )
        .split(",")
        .map(
          x => x.trim()
        )
        .filter(Boolean);


    /*
      Check whether the user has at least
      one authorized role.
    */

    const authorized =
      roles.some(
        role =>
          allowedRoles.includes(
            role
          )
      );


    /*
      Create the website session.
    */

    const payload = {

      userId:
        user.id,

      username:
        user.global_name ||
        user.username,

      authorized:

        authorized,

      exp:
        Date.now() +
        8 * 60 * 60 * 1000

    };


    const session =
      await signSession(
        payload,
        env.SESSION_SECRET
      );


    /*
      Authorized users go to the editor.

      Unauthorized users go back to
      the public website.
    */

    const destination =
      authorized
        ? "/admin.html"
        : "/";


    return new Response(
      null,
      {

        status: 302,

        headers: {

          "Location":
            destination,

          "Set-Cookie": [

            `aegis_session=${session}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=28800`,

            "aegis_oauth_state=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0"

          ]

        }

      }
    );


  } catch (error) {

    /*
      Give a useful error instead of hiding
      the actual Discord/Cloudflare problem.
    */

    return new Response(
      "Discord login failed:\n\n" +
      (
        error?.message ||
        String(error)
      ),
      {
        status: 500,
        headers: {
          "Content-Type":
            "text/plain; charset=UTF-8"
        }
      }
    );

  }

}


/* ==================================
   TOKEN EXCHANGE
================================== */

async function exchangeCode(
  code,
  env
) {

  if (!env.DISCORD_CLIENT_ID) {

    throw new Error(
      "DISCORD_CLIENT_ID is missing."
    );

  }


  if (!env.DISCORD_CLIENT_SECRET) {

    throw new Error(
      "DISCORD_CLIENT_SECRET is missing."
    );

  }


  if (!env.DISCORD_REDIRECT_URI) {

    throw new Error(
      "DISCORD_REDIRECT_URI is missing."
    );

  }


  /*
    Discord requires this request to use
    application/x-www-form-urlencoded.
  */

  const body =
    new URLSearchParams({

      client_id:
        env.DISCORD_CLIENT_ID,

      client_secret:
        env.DISCORD_CLIENT_SECRET,

      grant_type:
        "authorization_code",

      code:
        code,

      redirect_uri:
        env.DISCORD_REDIRECT_URI

    });


  const response =
    await fetch(
      "https://discord.com/api/oauth2/token",
      {

        method: "POST",

        headers: {

          "Content-Type":
            "application/x-www-form-urlencoded"

        },

        body:
          body

      }
    );


  if (!response.ok) {

    const errorText =
      await response.text();


    throw new Error(
      "Discord token exchange failed.\n\n" +
      errorText
    );

  }


  const data =
    await response.json();


  if (!data.access_token) {

    throw new Error(
      "Discord did not return an access token."
    );

  }


  return data.access_token;

}


/* ==================================
   DISCORD API
================================== */

async function discordGet(
  url,
  token
) {

  const response =
    await fetch(
      url,
      {

        headers: {

          Authorization:
            `Bearer ${token}`,

          Accept:
            "application/json"

        }

      }
    );


  if (!response.ok) {

    const errorText =
      await response.text();


    throw new Error(
      "Discord API request failed.\n\n" +
      "URL: " +
      url +
      "\n\nDiscord response:\n" +
      errorText
    );

  }


  return response.json();

}


/* ==================================
   ME
================================== */

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


  if (!token) {

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
      env.SESSION_SECRET
    );


  if (!payload) {

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
      payload.username,

    userId:
      payload.userId

  });

}


/* ==================================
   CONTENT GET
================================== */

async function getContent(
  env
) {

  /*
    If D1 isn't configured yet,
    the website still works using
    the default content.
  */

  if (!env.DB) {

    return json(
      DEFAULT_DATA
    );

  }


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

}


/* ==================================
   CONTENT SAVE
================================== */

async function saveContent(
  request,
  env
) {

  /*
    Make sure the user is logged in
    and has an authorized Discord role.
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
          "You are not authorised to edit this website."
      },
      403
    );

  }


  /*
    Make sure D1 exists.
  */

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
          "Invalid JSON content."
      },
      400
    );

  }


  /*
    Save the content into D1.
  */

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

    ok:
      true

  });

}


/* ==================================
   SESSION
================================== */

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


  if (!token) {

    return null;

  }


  if (!env.SESSION_SECRET) {

    return null;

  }


  return verifySession(
    token,
    env.SESSION_SECRET
  );

}


/* ==================================
   SIGN SESSION
================================== */

async function signSession(
  payload,
  secret
) {

  if (!secret) {

    throw new Error(
      "SESSION_SECRET is missing."
    );

  }


  const encoded =
    base64url(
      new TextEncoder().encode(
        JSON.stringify(
          payload
        )
      )
    );


  const key =
    await crypto.subtle.importKey(
      "raw",

      new TextEncoder().encode(
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


/* ==================================
   VERIFY SESSION
================================== */

async function verifySession(
  token,
  secret
) {

  try {

    if (!secret) {

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


    /*
      Check session expiration.
    */

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


/* ==================================
   LOGOUT
================================== */

function logout() {

  return new Response(
    JSON.stringify({
      ok:
        true
    }),
    {

      status:
        200,

      headers: {

        "Content-Type":
          "application/json",

        "Set-Cookie":
          "aegis_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0"

      }

    }
  );

}


/* ==================================
   HELPERS
================================== */

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


/* ==================================
   BASE64URL ENCODE
================================== */

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


/* ==================================
   BASE64URL DECODE
================================== */

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


/* ==================================
   JSON RESPONSE
================================== */

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
          "application/json; charset=UTF-8"

      }

    }
  );

}
