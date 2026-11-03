# Rsvibe

A multi-user app for event invitations. Hosts sign up, design an event page in a visual editor, share one public link, and see who can and can't attend. A super admin sees every user and event. Built with Next.js 16.

- **Hosts:** create events, design the page, share the link, read replies, customise the invitation and confirmation emails.
- **Guests:** open the link and reply; no account.
- **Super admin:** all users (enable or disable), all events, platform totals.

```bash
npm install
cp .env.example .env   # DATABASE_URL, Clerk keys, SUPER_ADMIN_EMAILS
npm run dev            # http://localhost:3000
```

| Service | For |
|---|---|
| Neon | database (required) |
| Clerk | sign-in (required) |
| Gmail | emails (free, app password) |
| Cloudflare R2 | image uploads (recommended; local-folder fallback) |
| Vercel | hosting and deploys |

## Documentation

- [docs/product-guide.md](docs/product-guide.md): roles, pages, the host's workflow, emails, limits.
- [docs/production-setup.md](docs/production-setup.md): setting up each service, environment variables, deploying, troubleshooting.
