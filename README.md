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

## AVP Content Migration

To sync About, Team, Investments, and News content from `https://www.avp.vc/` into Sanity:

```bash
python3 scripts/migrate-avp-content-to-sanity.py
```

Dry run (parse only, no writes):

```bash
python3 scripts/migrate-avp-content-to-sanity.py --dry-run
```

Verify-only (print current Sanity counts):

```bash
python3 scripts/migrate-avp-content-to-sanity.py --verify-only
```

Notes:

- The script is idempotent (`createOrReplace` with deterministic IDs).
- It resolves Sanity auth from `SANITY_AUTH_TOKEN` / `SANITY_API_WRITE_TOKEN`, or your current local Sanity CLI session.
- Jobs migration is intentionally excluded in this pass.
