# Production setup: Vercel, Neon, Clerk, Resend and R2

How the app runs in production, which service does what, and how to set each one up. For what the app does for its users, see [product-guide.md](product-guide.md).

## Overview

Event RSVP is a Next.js 16 app with many hosts, each with their own events. It needs **Neon** and **Clerk** to run at all. Resend and R2 are strongly recommended in production; without them it falls back to Gmail and to local files, which do not work on Vercel.

| Need | Service | Required | Used for |
|---|---|---|---|
| Hosting and deploys | Vercel | yes (production) | Runs the app, deploys from GitHub |
| Database | Neon (Postgres) | **yes** | Users, events, guest replies, email templates and the email log |
| Sign-in | Clerk | **yes** | Login, sign-up, profile, passwords |
| Email | Resend | recommended | Invitation and confirmation emails (fallback: Gmail) |
| Image storage | Cloudflare R2 | recommended | Images uploaded in the editor (fallback: local folder) |
| DNS (optional) | Cloudflare | no | Your domain's DNS records |

If Neon or Clerk is not configured, signed-in pages show a "one service is missing" screen instead of the app. The landing page and public event pages never need Clerk, so they stay fast and cached.

## How it fits together

```
Guest ──► /e/<slug> (public event page, cached)
            └─ RSVP form ──► Neon (event_rsvps) ──► Resend (confirmation email)

Host ───► Clerk sign-in ──► /dashboard ──► events, replies, emails
            └─ /editor/<id> ──► Save ──► Neon (events.settings)
                              └─ Upload ──► R2 (served at /api/img/<name>)

Super admin ──► /super ──► users (enable / disable) and every event
```

- Our own `users` table holds the role and the enabled / disabled flag. Clerk only proves who someone is.
- Images are served through the app at `/api/img/...`, so the R2 bucket can stay private.
- The tables are created automatically the first time the app talks to Neon. There is no migration step.

## Environment variables

All variables are listed in `.env.example`. Set them in Vercel under Project, Settings, Environment Variables, and in a local `.env` for development. Never commit `.env`.

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | **yes** | Neon connection string |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` | **yes** | Clerk application keys |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` = `/sign-in`, `NEXT_PUBLIC_CLERK_SIGN_UP_URL` = `/sign-up` | yes | Where Clerk sends people to sign in or up |
| `SUPER_ADMIN_EMAILS` | **yes** | Emails that become super admins at first sign-in (comma separated) |
| `RESEND_API_KEY`, `EMAIL_FROM` | production | Resend key and sender, for example `Event RSVP <rsvp@your-domain.com>` |
| `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET` | production | Cloudflare R2 bucket and its API token |
| `NEXT_PUBLIC_APP_URL` | optional | Public address of the site, used in event links and emails (defaults to the request's address) |
| `MAX_EVENTS_PER_HOST`, `MAX_INVITES_PER_DAY` | optional | Limits, see the product guide |
| `GMAIL_USER`, `GMAIL_APP_PASSWORD` | fallback | Used for email only when `RESEND_API_KEY` is not set |

## Setting up each service

### 1. Neon (database)

1. Create a project at neon.tech.
2. Copy the connection string (it ends with `?sslmode=require`) into `DATABASE_URL`.
3. For local development, create a separate Neon **branch** so you never touch production data.

On first use the app creates these tables: `users`, `events`, `event_rsvps` (unique per event and lower-cased email), `email_templates` and `email_log`.

### 2. Clerk (sign-in)

1. Create an application in Clerk. Turn on the sign-in methods you want (email and password, Google, and so on).
2. Copy the publishable and secret keys into the two variables above.
3. Set `SUPER_ADMIN_EMAILS` to your own email, then sign up with that email: you become a super admin and see **Super admin** in the header.

Everyone else who signs up is a host. To close registration or require email verification, change it in Clerk's dashboard.

### 3. Resend (email)

1. Add and verify your domain in Resend (DNS records, which can live in Cloudflare).
2. Create an API key and set `RESEND_API_KEY`.
3. Set `EMAIL_FROM` to an address on that domain.

For a first test you can leave `EMAIL_FROM` unset: mail then goes out from `onboarding@resend.dev`, which Resend only delivers to your own account email.

### 4. Cloudflare R2 (images)

1. Create an R2 bucket and keep it private.
2. Create an R2 API token with read and write access to that bucket.
3. Set the four `R2_*` variables.

Uploads are limited to PNG, JPG, WEBP and GIF, up to 5 MB. When saving removes an image from a design, it is deleted from the bucket.

### 5. Vercel (hosting and deploy)

1. Import the GitHub repository at vercel.com/new.
2. Add every variable above to the project.
3. Deploy. Later pushes to `main` deploy automatically.
4. Add your domain under Settings, Domains. Cloudflare can be the DNS provider.
5. In Clerk, add the production domain under Domains and use the production keys.

## Running locally

```bash
npm install
cp .env.example .env   # fill in DATABASE_URL, the Clerk keys and SUPER_ADMIN_EMAILS
npm run dev            # http://localhost:3000
```

Use a Clerk development instance and a Neon branch. Without Resend, set the Gmail variables to try emails; without R2, images are saved in `data/uploads`.

## Checking that it works

After deploying, go through this list:

1. The landing page loads, and **Sign in** opens the login.
2. Sign up with the email in `SUPER_ADMIN_EMAILS`: the header shows **Super admin**. Sign up with another email: it does not.
3. As a host, **New event**, edit the design, press Save, and open the event's public link: the design is there.
4. Upload an image, save, reload: it still shows.
5. Submit a reply on the public page as a guest: it appears on the event page with the right counts, and the confirmation email arrives.
6. Submit the same email again: the form says it has already RSVP'd.
7. On the Emails tab, change the invitation, press **Send a test to me**, and check the inbox.
8. As super admin, disable the host: their public link shows "not available" and they land on the "account disabled" page. Enable them again.

## Moving data from the earlier single-event version

The earlier version kept one page in `data/settings.json` and replies in Notion. Neither is imported automatically.

- **The design:** create an event, then replace its `settings` JSON in the `events` table with the contents of `data/settings.json`, or rebuild it in the editor.
- **Images:** upload them again in the editor.
- **Replies:** export them from Notion and insert them into `event_rsvps` for the event if you want to keep them.

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| "Almost there — one service is missing" | `DATABASE_URL` or the Clerk keys are not set |
| Edits disappear after a deploy | `DATABASE_URL` is not set in Vercel |
| Uploaded images disappear | the `R2_*` variables are not set in Vercel |
| "Could not save the image" | wrong R2 keys, bucket name or account id |
| Nobody is a super admin | `SUPER_ADMIN_EMAILS` does not match the email used to sign in (it is read at sign-in) |
| Redirected to "account disabled" | a super admin disabled the account |
| Event link shows "not available" | the event is hidden, or its host is disabled |
| No emails arrive | check `RESEND_API_KEY`, that `EMAIL_FROM` is on a verified domain, and the Emails tab log |
| Signed in but redirected back to sign-in | the Clerk keys do not match the Clerk instance, or the domain is not added in Clerk |

## Where the code is

| File | Role |
|---|---|
| `src/lib/db.ts` | Neon connection and automatic table creation |
| `src/lib/data.ts` | All database queries: users, events, replies, templates, log, stats |
| `src/lib/auth.ts` | Checks the signed-in user against the database; page and API guards |
| `src/lib/email-template.ts` | The customisable email layout, used by the preview and by the sender |
| `src/lib/send-event-email.ts`, `src/lib/mailer.ts` | Render and send an event's email (Resend or Gmail) |
| `src/lib/storage.ts` | Stores and fetches images (R2 or local folder) |
| `src/proxy.ts` | Lets Clerk read the session on the signed-in routes |
| `src/app/(app)/...` | Sign-in, dashboard, event pages, editor, profile and super admin |
| `src/app/e/[slug]/` | The public event page |
| `src/app/api/...` | Events, replies, emails, invitations, upload, super admin actions |
