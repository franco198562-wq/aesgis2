const MAIN_PASSWORD = "PiZza@Cvc123";

const PERMISSIONS = {
    handbook: "Staff Handbook",
    documents: "General Documents",
    training: "Training",
    resources: "Staff Resources",
    staff_directory: "Staff Directory",
    announcements: "Staff Announcements"
};

const ALL_PERMISSIONS = Object.keys(PERMISSIONS);


const DEFAULT_CONTENT = {

    site_name:
        "THE AEGIS INSTITUTE",

    site_tagline:
        "Professional education, consulting and support.",

    footer_text:
        "Professional education, consulting and support.",


    /* =========================
       HOME
    ========================== */

    home_hero_kicker:
        "PROFESSIONAL EDUCATION & CONSULTING",

    home_hero_title:
        "Building capability. Creating confidence. Delivering better outcomes.",

    home_hero_text:
        "The Aegis Institute provides practical education, consulting and professional support designed to help people and organisations perform at their best.",

    home_hero_primary_button:
        "Explore our services",

    home_hero_primary_link:
        "/services.html",

    home_hero_secondary_button:
        "Contact us",

    home_hero_secondary_link:
        "/contact.html",

    home_approach_title:
        "Practical knowledge. Real-world results.",

    home_approach_text:
        "We focus on useful, practical solutions that can be understood, implemented and applied in the real world.",

    home_education_title:
        "Education",

    home_education_text:
        "Develop knowledge, confidence and practical capability through structured learning and professional development.",

    home_consulting_title:
        "Consulting",

    home_consulting_text:
        "Gain practical guidance and tailored support to help solve problems and improve performance.",

    home_cta_title:
        "Ready to build what comes next?",

    home_cta_text:
        "Talk to The Aegis Institute about how we can support your organisation, team or next project.",

    home_cta_button:
        "Contact The Aegis Institute",

    home_cta_link:
        "/contact.html",


    /* =========================
       SERVICES
    ========================== */

    services_kicker:
        "WHAT WE DO",

    services_title:
        "Services designed around real-world outcomes.",

    services_intro:
        "The Aegis Institute provides practical education, consulting and professional support tailored to the needs of people and organisations.",

    services_education_title:
        "Education",

    services_education_text:
        "Develop knowledge, confidence and practical capability through structured learning and professional development.",

    services_consulting_title:
        "Consulting",

    services_consulting_text:
        "Gain practical guidance and tailored support to help solve problems, improve processes and strengthen performance.",

    services_support_title:
        "Professional Support",

    services_support_text:
        "Reliable professional support designed around your requirements, priorities and objectives.",


    /* =========================
       OUR WORK
    ========================== */

    work_kicker:
        "OUR WORK",

    work_title:
        "Practical work. Meaningful outcomes.",

    work_intro:
        "Explore examples of the projects, initiatives and professional work delivered through The Aegis Institute.",

    work_project_1_title:
        "Professional Development",

    work_project_1_text:
        "Developing structured learning and professional development opportunities focused on practical capability.",

    work_project_2_title:
        "Organisational Consulting",

    work_project_2_text:
        "Providing practical guidance and consulting support to help organisations identify opportunities and improve performance.",

    work_project_3_title:
        "Professional Support",

    work_project_3_text:
        "Supporting people and teams with clear, reliable and practical professional assistance.",


    /* =========================
       CONTACT
    ========================== */

    contact_kicker:
        "GET IN TOUCH",

    contact_title:
        "Let's start a conversation.",

    contact_intro:
        "Whether you have a question, a project in mind or simply want to find out more, we'd be happy to hear from you.",

    contact_discord_label:
        "DISCORD",

    contact_discord_text:
        "Send us a message through Discord for a quick response.",

    contact_email_label:
        "EMAIL",

    contact_email_text:
        "Send us an email for enquiries, projects and general information.",

    contact_discord_url:
        "#",

    contact_email:
        "",

    contact_form_title:
        "Tell us what you need.",

    contact_form_text:
        "Give us a little information about your enquiry and we'll get back to you.",


    /* =========================
       ANNOUNCEMENT
    ========================== */

    announcement_enabled:
        "false",

    announcement_title:
        "Announcement",

    announcement_text:
        "",

    announcement_link_text:
        "Learn more",

    announcement_link:
        "#"
};


function json(data, status = 200) {

    return new Response(
        JSON.stringify(data),
        {
            status,
            headers: {
                "Content-Type": "application/json",
                "Cache-Control": "no-store"
            }
        }
    );

}


function htmlRedirect(location) {

    return new Response(
        null,
        {
            status: 302,
            headers: {
                Location: location
            }
        }
    );

}


function base64urlEncode(bytes) {

    let binary = "";

    for (const byte of bytes) {
        binary += String.fromCharCode(byte);
    }

    return btoa(binary)
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/g, "");

}


function base64urlDecode(value) {

    value = value
        .replace(/-/g, "+")
        .replace(/_/g, "/");

    while (value.length % 4) {
        value += "=";
    }

    const binary = atob(value);

    const bytes = new Uint8Array(
        binary.length
    );

    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }

    return bytes;

}


async function sha256(text) {

    const data =
        new TextEncoder().encode(text);

    const hash =
        await crypto.subtle.digest(
            "SHA-256",
            data
        );

    return base64urlEncode(
        new Uint8Array(hash)
    );

}


function constantTimeEqual(a, b) {

    if (
        typeof a !== "string" ||
        typeof b !== "string"
    ) {
        return false;
    }

    if (a.length !== b.length) {
        return false;
    }

    let result = 0;

    for (let i = 0; i < a.length; i++) {
        result |=
            a.charCodeAt(i) ^
            b.charCodeAt(i);
    }

    return result === 0;

}


async function signSession(payload, secret) {

    const encodedPayload =
        base64urlEncode(
            new TextEncoder().encode(
                JSON.stringify(payload)
            )
        );

    const key =
        await crypto.subtle.importKey(
            "raw",
            new TextEncoder().encode(secret),
            {
                name: "HMAC",
                hash: "SHA-256"
            },
            false,
            ["sign", "verify"]
        );

    const signature =
        await crypto.subtle.sign(
            "HMAC",
            key,
            new TextEncoder().encode(
                encodedPayload
            )
        );

    return (
        encodedPayload +
        "." +
        base64urlEncode(
            new Uint8Array(signature)
        )
    );

}


async function verifySession(token, secret) {

    try {

        if (!token) {
            return null;
        }

        const parts =
            token.split(".");

        if (parts.length !== 2) {
            return null;
        }

        const encodedPayload =
            parts[0];

        const signature =
            parts[1];

        const key =
            await crypto.subtle.importKey(
                "raw",
                new TextEncoder().encode(secret),
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
                base64urlDecode(signature),
                new TextEncoder().encode(
                    encodedPayload
                )
            );

        if (!valid) {
            return null;
        }

        const payload =
            JSON.parse(
                new TextDecoder().decode(
                    base64urlDecode(
                        encodedPayload
                    )
                )
            );

        if (
            payload.exp &&
            Date.now() > payload.exp
        ) {
            return null;
        }

        return payload;

    } catch {

        return null;

    }

}


function getCookie(request, name) {

    const cookieHeader =
        request.headers.get("Cookie");

    if (!cookieHeader) {
        return null;
    }

    const cookies =
        cookieHeader.split(";");

    for (const cookie of cookies) {

        const index =
            cookie.indexOf("=");

        if (index === -1) {
            continue;
        }

        const key =
            cookie
                .slice(0, index)
                .trim();

        if (key !== name) {
            continue;
        }

        return decodeURIComponent(
            cookie
                .slice(index + 1)
                .trim()
        );

    }

    return null;

}


function sessionCookie(token) {

    return [
        "aegis_session=" +
        encodeURIComponent(token),

        "Path=/",

        "HttpOnly",

        "Secure",

        "SameSite=Lax",

        "Max-Age=86400"
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

    const token =
        getCookie(
            request,
            "aegis_session"
        );

    if (!token) {
        return null;
    }

    const secret =
        env.SESSION_SECRET ||
        "CHANGE_THIS_SESSION_SECRET";

    return await verifySession(
        token,
        secret
    );

}


function requireAdmin(session) {

    return (
        session &&
        session.role === "main_admin"
    );

}


function requireStaff(session) {

    return (
        session &&
        (
            session.role === "staff" ||
            session.role === "main_admin"
        )
    );

}


function hasPermission(session, permission) {

    if (!session) {
        return false;
    }

    if (session.role === "main_admin") {
        return true;
    }

    return (
        Array.isArray(session.permissions) &&
        session.permissions.includes(permission)
    );

}


function cleanPermissions(permissions) {

    if (!Array.isArray(permissions)) {
        return [];
    }

    return [
        ...new Set(
            permissions.filter(
                permission =>
                    ALL_PERMISSIONS.includes(
                        permission
                    )
            )
        )
    ];

}


function generateCode() {

    const chars =
        "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    const randomPart = () => {

        let result = "";

        for (let i = 0; i < 4; i++) {

            result +=
                chars[
                    Math.floor(
                        Math.random() *
                        chars.length
                    )
                ];

        }

        return result;

    };

    return (
        "AEGIS-" +
        randomPart() +
        "-" +
        randomPart()
    );

}


function normalizeCode(code) {

    return String(code || "")
        .trim()
        .toUpperCase();

}


function isValidExpiration(expiresAt) {

    if (!expiresAt) {
        return true;
    }

    const date =
        new Date(expiresAt);

    return !Number.isNaN(
        date.getTime()
    );

}


async function createSession(
    response,
    payload,
    env
) {

    const secret =
        env.SESSION_SECRET ||
        "CHANGE_THIS_SESSION_SECRET";

    const token =
        await signSession(
            {
                ...payload,

                iat: Date.now(),

                exp:
                    Date.now() +
                    24 * 60 * 60 * 1000
            },
            secret
        );

    response.headers.append(
        "Set-Cookie",
        sessionCookie(token)
    );

    return response;

}


async function handlePasswordLogin(
    request,
    env
) {

    if (
        MAIN_PASSWORD ===
        "PASTE_A_NEW_MAIN_PASSWORD_HERE"
    ) {

        return json(
            {
                error:
                    "Administrator password has not been configured."
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
                    "Invalid request."
            },
            400
        );

    }


    const password =
        String(
            body.password || ""
        );


    if (
        !constantTimeEqual(
            password,
            MAIN_PASSWORD
        )
    ) {

        return json(
            {
                error:
                    "Incorrect administrator password."
            },
            401
        );

    }


    const response =
        json({
            success: true,
            role: "main_admin",
            redirect: "/admin.html"
        });


    return await createSession(
        response,
        {
            role: "main_admin",
            permissions: ALL_PERMISSIONS
        },
        env
    );

}


async function handleCodeLogin(
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
                    "Invalid request."
            },
            400
        );

    }


    const code =
        normalizeCode(
            body.code
        );


    if (!code) {

        return json(
            {
                error:
                    "Enter your staff login code."
            },
            400
        );

    }


    const hash =
        await sha256(code);


    const row =
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
        .bind(hash)
        .first();


    if (!row) {

        return json(
            {
                error:
                    "Invalid staff login code."
            },
            401
        );

    }


    if (!row.active) {

        return json(
            {
                error:
                    "This staff login code has been disabled."
            },
            403
        );

    }


    if (
        row.expires_at &&
        new Date(row.expires_at).getTime() <=
        Date.now()
    ) {

        return json(
            {
                error:
                    "This staff login code has expired."
            },
            403
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
        cleanPermissions(
            permissions
        );


    await env.DB.prepare(
        `
        UPDATE login_codes
        SET last_used_at = ?
        WHERE id = ?
        `
    )
    .bind(
        new Date().toISOString(),
        row.id
    )
    .run();


    const response =
        json({
            success: true,
            role: "staff",
            name: row.name,
            permissions,
            redirect: "/staff.html"
        });


    return await createSession(
        response,
        {
            role: "staff",
            code_id: row.id,
            name: row.name,
            permissions
        },
        env
    );

}


async function handleMe(
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
                authenticated: false
            },
            401
        );

    }


    return json(
        {
            authenticated: true,
            role: session.role,
            name:
                session.name ||
                "Administrator",
            permissions:
                session.permissions || []
        }
    );

}


async function handleLogout() {

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
                    clearSessionCookie()
            }
        }
    );

}


/* ============================================================
   ADMIN — LOGIN CODES
============================================================ */

async function handleGetLoginCodes(
    env
) {

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
                    permissions:
                        cleanPermissions(
                            permissions
                        ),
                    active:
                        Boolean(
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
        permissions: PERMISSIONS
    });

}


async function handleCreateLoginCode(
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
                    "Invalid request."
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


    const permissions =
        cleanPermissions(
            body.permissions
        );


    const expiresAt =
        body.expires_at
            ? String(
                body.expires_at
            )
            : null;


    if (
        !isValidExpiration(
            expiresAt
        )
    ) {

        return json(
            {
                error:
                    "Invalid expiration date."
            },
            400
        );

    }


    let code = "";
    let hash = "";
    let existing = null;


    for (let attempt = 0; attempt < 10; attempt++) {

        code =
            generateCode();

        hash =
            await sha256(code);


        existing =
            await env.DB.prepare(
                `
                SELECT id
                FROM login_codes
                WHERE code_hash = ?
                LIMIT 1
                `
            )
            .bind(hash)
            .first();


        if (!existing) {
            break;
        }

    }


    if (existing) {

        return json(
            {
                error:
                    "Could not generate a unique login code."
            },
            500
        );

    }


    const now =
        new Date().toISOString();


    const result =
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
            now
        )
        .run();


    return json(
        {
            success: true,

            code,

            id:
                result.meta.last_row_id,

            name,

            permissions,

            active: true,

            expires_at:
                expiresAt,

            created_at:
                now
        },
        201
    );

}


async function handleUpdateLoginCode(
    request,
    env
) {

    const url =
        new URL(
            request.url
        );


    const id =
        Number(
            url.searchParams.get("id")
        );


    if (!Number.isInteger(id) || id <= 0) {

        return json(
            {
                error:
                    "Invalid login code ID."
            },
            400
        );

    }


    const existing =
        await env.DB.prepare(
            `
            SELECT *
            FROM login_codes
            WHERE id = ?
            LIMIT 1
            `
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


    let body;

    try {

        body =
            await request.json();

    } catch {

        return json(
            {
                error:
                    "Invalid request."
            },
            400
        );

    }


    const updates = [];


    if (
        body.name !== undefined
    ) {

        const name =
            String(
                body.name || ""
            ).trim();


        if (!name) {

            return json(
                {
                    error:
                        "Staff member name cannot be empty."
                },
                400
            );

        }


        updates.push({
            sql: "name = ?",
            value: name
        });

    }


    if (
        body.permissions !== undefined
    ) {

        const permissions =
            cleanPermissions(
                body.permissions
            );


        updates.push({
            sql:
                "permissions = ?",
            value:
                JSON.stringify(
                    permissions
                )
        });

    }


    if (
        body.active !== undefined
    ) {

        updates.push({
            sql:
                "active = ?",
            value:
                body.active ? 1 : 0
        });

    }


    if (
        body.expires_at !== undefined
    ) {

        const expiresAt =
            body.expires_at
                ? String(
                    body.expires_at
                )
                : null;


        if (
            !isValidExpiration(
                expiresAt
            )
        ) {

            return json(
                {
                    error:
                        "Invalid expiration date."
                },
                400
            );

        }


        updates.push({
            sql:
                "expires_at = ?",
            value:
                expiresAt
        });

    }


    if (
        body.generate_code === true
    ) {

        let newCode = "";
        let newHash = "";
        let duplicate = null;


        for (
            let attempt = 0;
            attempt < 10;
            attempt++
        ) {

            newCode =
                generateCode();

            newHash =
                await sha256(
                    newCode
                );


            duplicate =
                await env.DB.prepare(
                    `
                    SELECT id
                    FROM login_codes
                    WHERE code_hash = ?
                    LIMIT 1
                    `
                )
                .bind(newHash)
                .first();


            if (!duplicate) {
                break;
            }

        }


        if (duplicate) {

            return json(
                {
                    error:
                        "Could not generate a new code."
                },
                500
            );

        }


        updates.push({
            sql:
                "code_hash = ?",
            value:
                newHash
        });


        if (updates.length === 0) {

            return json(
                {
                    error:
                        "No changes supplied."
                },
                400
            );

        }


        const query =
            `
            UPDATE login_codes
            SET ${updates
                .map(
                    update =>
                        update.sql
                )
                .join(", ")}
            WHERE id = ?
            `;


        await env.DB.prepare(
            query
        )
        .bind(
            ...updates.map(
                update =>
                    update.value
            ),
            id
        )
        .run();


        const updated =
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
                WHERE id = ?
                LIMIT 1
                `
            )
            .bind(id)
            .first();


        let permissions = [];

        try {

            permissions =
                JSON.parse(
                    updated.permissions ||
                    "[]"
                );

        } catch {

            permissions = [];

        }


        return json({
            success: true,

            code:
                newCode,

            login_code: {
                id: updated.id,
                name: updated.name,
                permissions:
                    cleanPermissions(
                        permissions
                    ),
                active:
                    Boolean(
                        updated.active
                    ),
                expires_at:
                    updated.expires_at,
                created_at:
                    updated.created_at,
                last_used_at:
                    updated.last_used_at
            }
        });

    }


    if (updates.length === 0) {

        return json(
            {
                error:
                    "No changes supplied."
            },
            400
        );

    }


    const query =
        `
        UPDATE login_codes
        SET ${updates
            .map(
                update =>
                    update.sql
            )
            .join(", ")}
        WHERE id = ?
        `;


    await env.DB.prepare(
        query
    )
    .bind(
        ...updates.map(
            update =>
                update.value
        ),
        id
    )
    .run();


    const updated =
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
            WHERE id = ?
            LIMIT 1
            `
        )
        .bind(id)
        .first();


    let permissions = [];

    try {

        permissions =
            JSON.parse(
                updated.permissions ||
                "[]"
            );

    } catch {

        permissions = [];

    }


    return json({
        success: true,

        login_code: {
            id: updated.id,
            name: updated.name,
            permissions:
                cleanPermissions(
                    permissions
                ),
            active:
                Boolean(
                    updated.active
                ),
            expires_at:
                updated.expires_at,
            created_at:
                updated.created_at,
            last_used_at:
                updated.last_used_at
        }
    });

}


async function handleDeleteLoginCode(
    request,
    env
) {

    const url =
        new URL(
            request.url
        );


    const id =
        Number(
            url.searchParams.get("id")
        );


    if (!Number.isInteger(id) || id <= 0) {

        return json(
            {
                error:
                    "Invalid login code ID."
            },
            400
        );

    }


    const result =
        await env.DB.prepare(
            `
            DELETE FROM login_codes
            WHERE id = ?
            `
        )
        .bind(id)
        .run();


    if (
        !result.meta.changes
    ) {

        return json(
            {
                error:
                    "Login code not found."
            },
            404
        );

    }


    return json({
        success: true
    });

}


/* ============================================================
   ADMIN — DOCUMENTS
============================================================ */

async function handleGetDocuments(
    env
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


    return json({
        documents:
            result.results || [],
        permissions:
            PERMISSIONS
    });

}


async function handleCreateDocument(
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
                    "Invalid request."
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
        String(
            body.permission || ""
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
        !ALL_PERMISSIONS.includes(
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

            document: {
                id:
                    result.meta.last_row_id,

                title,

                description,

                content,

                permission,

                created_at:
                    now,

                updated_at:
                    now
            }
        },
        201
    );

}


async function handleUpdateDocument(
    request,
    env
) {

    const url =
        new URL(
            request.url
        );


    const id =
        Number(
            url.searchParams.get("id")
        );


    if (!Number.isInteger(id) || id <= 0) {

        return json(
            {
                error:
                    "Invalid document ID."
            },
            400
        );

    }


    const existing =
        await env.DB.prepare(
            `
            SELECT id
            FROM staff_documents
            WHERE id = ?
            LIMIT 1
            `
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


    let body;

    try {

        body =
            await request.json();

    } catch {

        return json(
            {
                error:
                    "Invalid request."
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
        String(
            body.permission || ""
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
        !ALL_PERMISSIONS.includes(
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


    const now =
        new Date().toISOString();


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
        now,
        id
    )
    .run();


    return json({
        success: true
    });

}


async function handleDeleteDocument(
    request,
    env
) {

    const url =
        new URL(
            request.url
        );


    const id =
        Number(
            url.searchParams.get("id")
        );


    if (!Number.isInteger(id) || id <= 0) {

        return json(
            {
                error:
                    "Invalid document ID."
            },
            400
        );

    }


    const result =
        await env.DB.prepare(
            `
            DELETE FROM staff_documents
            WHERE id = ?
            `
        )
        .bind(id)
        .run();


    if (
        !result.meta.changes
    ) {

        return json(
            {
                error:
                    "Document not found."
            },
            404
        );

    }


    return json({
        success: true
    });

}


/* ============================================================
   WEBSITE CONTENT
============================================================ */

async function ensureDefaultContent(
    env
) {

    const now =
        new Date().toISOString();


    for (
        const [key, value]
        of Object.entries(
            DEFAULT_CONTENT
        )
    ) {

        const existing =
            await env.DB.prepare(
                `
                SELECT id
                FROM portal_content
                WHERE id = ?
                LIMIT 1
                `
            )
            .bind(key)
            .first();


        if (!existing) {

            await env.DB.prepare(
                `
                INSERT INTO portal_content
                (
                    id,
                    value,
                    updated_at
                )
                VALUES (?, ?, ?)
                `
            )
            .bind(
                key,
                String(value),
                now
            )
            .run();

        }

    }

}


async function handleGetContent(
    env
) {

    await ensureDefaultContent(
        env
    );


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


    const content = {};


    for (
        const row
        of result.results || []
    ) {

        content[row.id] =
            row.value;

    }


    return json(content);

}


async function handleUpdateContent(
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
                    "Invalid request."
            },
            400
        );

    }


    const entries =
        Object.entries(
            body || {}
        );


    if (!entries.length) {

        return json(
            {
                error:
                    "No content supplied."
            },
            400
        );

    }


    const now =
        new Date().toISOString();


    for (
        const [key, value]
        of entries
    ) {

        if (
            typeof key !== "string" ||
            !key.trim()
        ) {
            continue;
        }


        const safeValue =
            value === null ||
            value === undefined
                ? ""
                : String(value);


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
            safeValue,
            now
        )
        .run();

    }


    return json({
        success: true
    });

}


/* ============================================================
   STAFF DOCUMENT ACCESS
============================================================ */

async function handleStaffDocuments(
    session,
    env
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


    const documents =
        (result.results || [])
            .filter(
                document =>
                    hasPermission(
                        session,
                        document.permission
                    )
            );


    return json({
        documents
    });

}


/* ============================================================
   MAIN ROUTER
============================================================ */

async function handleApi(
    request,
    env
) {

    const url =
        new URL(
            request.url
        );


    const path =
        url.pathname;


    /* =========================
       AUTH
    ========================== */

    if (
        path === "/api/auth/password" &&
        request.method === "POST"
    ) {

        return await handlePasswordLogin(
            request,
            env
        );

    }


    if (
        path === "/api/auth/code" &&
        request.method === "POST"
    ) {

        return await handleCodeLogin(
            request,
            env
        );

    }


    if (
        path === "/api/auth/me" &&
        request.method === "GET"
    ) {

        return await handleMe(
            request,
            env
        );

    }


    if (
        path === "/api/auth/logout" &&
        request.method === "POST"
    ) {

        return await handleLogout();

    }


    /* =========================
       PUBLIC CONTENT
    ========================== */

    if (
        path === "/api/content" &&
        request.method === "GET"
    ) {

        return await handleGetContent(
            env
        );

    }


    /* =========================
       AUTHENTICATED ROUTES
    ========================== */

    const session =
        await getSession(
            request,
            env
        );


    /* =========================
       ADMIN — LOGIN CODES
    ========================== */

    if (
        path === "/api/admin/login-codes"
    ) {

        if (
            !requireAdmin(
                session
            )
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
            request.method === "GET"
        ) {

            return await handleGetLoginCodes(
                env
            );

        }


        if (
            request.method === "POST"
        ) {

            return await handleCreateLoginCode(
                request,
                env
            );

        }


        if (
            request.method === "PUT"
        ) {

            return await handleUpdateLoginCode(
                request,
                env
            );

        }


        if (
            request.method === "DELETE"
        ) {

            return await handleDeleteLoginCode(
                request,
                env
            );

        }

    }


    /* =========================
       ADMIN — DOCUMENTS
    ========================== */

    if (
        path === "/api/admin/documents"
    ) {

        if (
            !requireAdmin(
                session
            )
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
            request.method === "GET"
        ) {

            return await handleGetDocuments(
                env
            );

        }


        if (
            request.method === "POST"
        ) {

            return await handleCreateDocument(
                request,
                env
            );

        }


        if (
            request.method === "PUT"
        ) {

            return await handleUpdateDocument(
                request,
                env
            );

        }


        if (
            request.method === "DELETE"
        ) {

            return await handleDeleteDocument(
                request,
                env
            );

        }

    }


    /* =========================
       ADMIN — CONTENT
    ========================== */

    if (
        path === "/api/content" &&
        request.method === "PUT"
    ) {

        if (
            !requireAdmin(
                session
            )
        ) {

            return json(
                {
                    error:
                        "Administrator access required."
                },
                403
            );

        }


        return await handleUpdateContent(
            request,
            env
        );

    }


    /* =========================
       STAFF — DOCUMENTS
    ========================== */

    if (
        path === "/api/staff/documents" &&
        request.method === "GET"
    ) {

        if (
            !requireStaff(
                session
            )
        ) {

            return json(
                {
                    error:
                        "Staff access required."
                },
                403
            );

        }


        return await handleStaffDocuments(
            session,
            env
        );

    }


    /* =========================
       OLD DISCORD ROUTES
    ========================== */

    if (
        path.startsWith(
            "/api/auth/discord"
        )
    ) {

        return htmlRedirect(
            "/staff-login.html"
        );

    }


    return json(
        {
            error:
                "API endpoint not found."
        },
        404
    );

}


/* ============================================================
   WORKER ENTRY
============================================================ */

export default {

    async fetch(
        request,
        env
    ) {

        const url =
            new URL(
                request.url
            );


        /* API */

        if (
            url.pathname.startsWith(
                "/api/"
            )
        ) {

            try {

                return await handleApi(
                    request,
                    env
                );

            } catch (error) {

                console.error(
                    error
                );

                return json(
                    {
                        error:
                            "Internal server error."
                    },
                    500
                );

            }

        }


        /* STATIC WEBSITE */

        return env.ASSETS.fetch(
            request
        );

    }

};
