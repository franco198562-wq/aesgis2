# Aegis Portal — Cloudflare + Discord

## What this gives you
- Everyone can view the portal without logging in.
- Discord OAuth2 login.
- Server-side check of Discord roles in your guild.
- Only users with an authorised Discord role can open the editor.
- Editors can add/edit/delete departments and edit tags.
- Content is stored in Cloudflare D1.
- Session is an HttpOnly, signed cookie. The Discord client secret never goes to the browser.

## 1. Create a Discord OAuth application
In the Discord Developer Portal, create/select your application and add an OAuth2 redirect URL:

https://YOUR-DOMAIN.com/api/auth/callback

Use your application's Client ID as DISCORD_CLIENT_ID and Client Secret as DISCORD_CLIENT_SECRET.

Your bot can remain in the server; OAuth2 is what lets the website identify the person and check their server roles.

## 2. Create the D1 database
Create a Cloudflare D1 database named `aegis-portal`.
Run `schema.sql` against it.

Put its database ID in `wrangler.toml`.

## 3. Set Cloudflare variables
Set these as Worker/Pages environment variables. Keep the secret values private.

DISCORD_CLIENT_ID = your Discord application client ID
DISCORD_CLIENT_SECRET = your Discord application client secret
DISCORD_GUILD_ID = your Discord server ID
DISCORD_REDIRECT_URI = https://YOUR-DOMAIN.com/api/auth/callback
AUTHORIZED_ROLE_IDS = roleID1,roleID2,roleID3
SESSION_SECRET = a long random secret

Bind your D1 database as `DB`.

## 4. Deploy
Deploy the project as a Cloudflare Pages project. The `functions` directory is part of the Pages Functions deployment.

## 5. Important
Do NOT put DISCORD_CLIENT_SECRET or SESSION_SECRET in `app.js`, HTML, or CSS.

If you change the domain, also change DISCORD_REDIRECT_URI in Cloudflare and the Discord OAuth2 redirect URL.

The default content is built into `functions/api/pages.js`, so the public site will still render before D1 is configured, but editing requires D1.

## Security note
This starter checks Discord guild membership/roles on the server. For a production portal, you can add CSRF/state validation, rate limiting, audit logs, per-department permissions, and stronger session handling.
