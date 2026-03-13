# Web Frontend (Next.js + Sanity)

This app reads site content from Sanity and is intended to deploy on Vercel.

## What Is CMS-Driven Today

The following sections render from Sanity data:

- Homepage hero and about copy (`homepage` document)
- Portfolio cards (`investment` documents)
- Latest news links (`newsArticle` documents)
- Team section (`teamMember` documents)
- Homepage about-story preview (`about` document)
- Homepage open roles preview (`jobPosting` documents)
- Investments page (`investment` documents)
- About page (`about` document)
- Jobs page (`jobPosting` documents)

## Local Development

1. Start Sanity Studio:

   ```bash
   cd studio
   cp .env.example .env.local
   npm run dev
   ```

2. Start Next.js frontend:

   ```bash
   cd web
   cp .env.example .env.local
   npm run dev
   ```

3. Open:
   - Frontend: `http://localhost:3000`
   - Studio: `http://localhost:3333`

## Frontend Environment Variables

Set these in `web/.env.local` locally and in Vercel Project Settings for production:

- `NEXT_PUBLIC_SANITY_PROJECT_ID` (required)
- `NEXT_PUBLIC_SANITY_DATASET` (required)
- `NEXT_PUBLIC_SANITY_API_VERSION` (optional, defaults to `2025-03-06`)
- `SANITY_API_READ_TOKEN` (optional; required only if dataset is private)
- `SANITY_STUDIO_ORIGIN` (optional; used for `/studio` rewrite and Studio CTA link)
- `SANITY_REVALIDATE_SECRET` (required for webhook revalidation)

## Vercel Setup Checklist

1. Ensure the Vercel project deploys the `web/` directory.
2. Add the environment variables listed above.
3. Redeploy after changing env vars.

## Sanity Webhook For Immediate Updates

The frontend caches Sanity queries and tags responses. Configure a webhook in Sanity so publishes clear cache immediately.

1. In Sanity Manage, create a webhook pointing to:

   `https://<your-vercel-domain>/api/revalidate?secret=<SANITY_REVALIDATE_SECRET>`

2. Configure trigger events for create/update/delete and publish/unpublish.
3. Include payload with `_type` (optional but recommended).
4. Publish a document in Studio and verify the frontend updates without redeploy.

## Notes About `/studio` Route

- In development, `/studio` rewrites to `http://127.0.0.1:3333` by default.
- In production, `/studio` rewrites only if `SANITY_STUDIO_ORIGIN` is explicitly set.
- If you host Studio separately, set `SANITY_STUDIO_ORIGIN` to that URL.
