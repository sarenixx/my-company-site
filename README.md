# my-company-site

This repository contains:

- `web/`: Next.js frontend deployed to Vercel
- `studio/`: Sanity Studio (local authoring app)

## Integration Status

As of March 15, 2026, Vercel and Sanity are connected and working:

- Production site: `https://my-company-site-seven.vercel.app`
- Revalidation endpoint: `POST /api/revalidate`
- Sanity webhook target: `https://my-company-site-seven.vercel.app/api/revalidate`

## What Persists Automatically

These are already saved in cloud services and remain after you log out:

- Vercel project link/config in your Vercel account
- Vercel environment variables (project settings)
- Sanity webhook configuration in your Sanity project
- Production deployment/alias on Vercel

## What Does Not Persist Automatically

These are local session details and may need to be redone in a fresh machine/session:

- `vercel login` auth on your local CLI
- Running local dev servers (`npm run dev`)
- Local `.env.local` files unless you recreate/copy them

## Local Development

Run both apps:

```bash
cd web && npm run dev
cd studio && npm run dev
```

Local URLs:

- Frontend: `http://localhost:3000`
- Studio: `http://localhost:3333`

## Quick Verification

Use the built-in verification script:

```bash
bash scripts/verify-vercel-sanity-connection.sh
```

What it checks:

- Vercel CLI auth is available
- Public revalidate endpoint rejects missing secret (`401`)
- Revalidate endpoint accepts the configured secret (`200`)
