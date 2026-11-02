# Production setup: Vercel, Neon, Clerk, Gmail and R2

How the app runs in production, which service does what, and how to set each one up. For what the app does for its users, see [product-guide.md](product-guide.md).

## Overview

Event RSVP is a Next.js 16 app with many hosts, each with their own events. It needs **Neon** and **Clerk** to run at all. For email you need a **Gmail** account with an app password (free, no domain); **R2** is needed for uploaded images in production, since Vercel has no disk. See "Start free, scale later" below.

| Need | Service | Required | Used for |
|---|---|---|---|
| Hosting and deploys | Vercel | yes (production) | Runs the app, deploys from GitHub |
| Database | Neon (Postgres) | **yes** | Users, events, guest replies, email templates and the email log |
| Sign-in | Clerk | **yes** | Login, sign-up, profile, passwords |
| Email | Gmail | **yes** (for email) | Invitation, confirmation and host "new reply" emails |
| Image storage | Cloudflare R2 | recommended | Images uploaded in the editor (fallback: local folder) |
| DNS (optional) | Cloudflare | no | Your domain's DNS records |

If Neon or Clerk is not configured, signed-in pages show a "one service is missing" screen instead of the app. The landing page and public event pages never need Clerk, so they stay fast and cached.

## Email: Gmail only

All email goes through one Gmail account (free, no domain, about 500 a day). Set `GMAIL_USER` and `GMAIL_APP_PASSWORD`; the Emails tab shows "Sending with Gmail" and a warning if they are missing. Without them replies are still saved, but nobody is emailed.

The whole site stops at **400 emails in 24 hours** (change it with `EMAIL_DAILY_LIMIT`), so Google never blocks the account. Guests' replies are still saved. The host's invitation limit per event (200 a day) stays as well.

Notes:
- Vercel's free Hobby plan is meant for personal, non-commercial use. Read its terms before running a business on it.
- Clerk's live keys only work on a domain you own, so a free launch on a `*.vercel.app` address uses Clerk's test keys (a "Development mode" label shows on sign-in).
- Gmail sends as your own address, may land in spam more often, and is shared by every host.

### When you outgrow Gmail

If the Emails tab warns the daily limit was reached, or hosts want mail from their own domain or it lands in spam, move to a transactional email service on a verified domain. That means replacing the sender in `src/lib/mailer.ts`; nothing else in the app needs to change.

## How it fits together

```
Guest ──► /e/<slug> (public event page, cached)
            └─ RSVP form ──► Neon (event_rsvps) ──► Gmail (confirmation email)

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
| `GMAIL_USER`, `GMAIL_APP_PASSWORD` | **yes** (for email) | Gmail sending: your address and a 16-character app password (Google account → Security → 2-Step Verification → App passwords) |
| `EMAIL_DAILY_LIMIT` | optional | Site-wide daily email cap (default 400) |
| `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET` | production | Cloudflare R2 bucket and its API token |
| `NEXT_PUBLIC_APP_URL` | optional | Public address of the site, used in event links and emails (defaults to the request's address) |
| `MAX_EVENTS_PER_HOST`, `MAX_INVITES_PER_DAY` | optional | Limits, see the product guide |

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

### 3. Gmail (email)

1. Turn on 2-Step Verification for the Google account that will send the mail.
2. Create an app password (Google account, Security, 2-Step Verification, App passwords).
3. Set `GMAIL_USER` to that address and `GMAIL_APP_PASSWORD` to the 16-character password.

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

Use a Clerk development instance and a Neon branch. Set the Gmail variables to try emails; without R2, images are saved in `data/uploads`.

## Checking that it works

After deploying, go through this list:

1. The landing page loads, and **Sign in** opens the login.
2. Sign up with the email in `SUPER_ADMIN_EMAILS`: the header shows **Super admin**. Sign up with another email: it does not.
3. As a host, **New event**, edit the design, press Save, and open the event's public link: the design is there.
4. Upload an image, save, reload: it still shows.
5. Submit a reply on the public page as a guest: it appears on the event page with the right counts, and the confirmation email arrives.
6. Submit the same email again: the form says it has already RSVP'd.
6b. The host gets a "new reply" email at their sign-in address (switch it off under Event settings, "Email me when someone replies").
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
| No emails arrive | the Emails tab shows any warning; check the log there. Check `GMAIL_USER` and `GMAIL_APP_PASSWORD`, and spam folders |
| "Gmail rejected the login" | `GMAIL_APP_PASSWORD` must be an app password (not your normal password) and 2-Step Verification must be on |
| "daily limit of 400 emails" | the site reached its cap; it resets as old sends pass 24 hours, or raise `EMAIL_DAILY_LIMIT` (staying under Gmail's own limit) |
| Signed in but redirected back to sign-in | the Clerk keys do not match the Clerk instance, or the domain is not added in Clerk |

## Where the code is

| File | Role |
|---|---|
| `src/lib/db.ts` | Neon connection and automatic table creation |
| `src/lib/data.ts` | All database queries: users, events, replies, templates, log, stats |
| `src/lib/auth.ts` | Checks the signed-in user against the database; page and API guards |
| `src/lib/email-template.ts` | The customisable email layout, used by the preview and by the sender |
| `src/lib/send-event-email.ts`, `src/lib/mailer.ts` | Render and send an event's email (Gmail) |
| `src/lib/storage.ts` | Stores and fetches images (R2 or local folder) |
| `src/proxy.ts` | Lets Clerk read the session on the signed-in routes |
| `src/app/(app)/...` | Sign-in, dashboard, event pages, editor, profile and super admin |
| `src/app/e/[slug]/` | The public event page |
| `src/app/api/...` | Events, replies, emails, invitations, upload, super admin actions |
