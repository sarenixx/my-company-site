# Sanity-To-Vercel CMS Integration Completion

This ExecPlan is a living document. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` are kept current as work proceeds.

This plan follows repository guidance in `PLANS.md` at the repository root.

## Purpose / Big Picture

After this change, the Next.js frontend can reliably fetch editable content from Sanity in production on Vercel, and content updates can appear without code edits. The integration includes safe production config, explicit caching/revalidation behavior, and documented setup for Vercel environment variables plus a Sanity webhook to invalidate cache.

## Progress

- [x] (2026-03-12 21:22Z) Audited `web/` and `studio/` for existing Sanity integration and schema/query coverage.
- [x] (2026-03-12 21:26Z) Implemented hardened Sanity client config and reusable `sanityFetch` helper with tags/revalidation options in `web/lib/sanity.ts`.
- [x] (2026-03-12 21:27Z) Added secure revalidation endpoint at `web/app/api/revalidate/route.ts`.
- [x] (2026-03-12 21:28Z) Fixed production-safe Next.js config for `/studio` rewrites and added Sanity image domain config in `web/next.config.ts`.
- [x] (2026-03-12 21:29Z) Updated docs and env templates in `web/README.md`, `web/.env.example`, `studio/.env.example`, and `studio/sanity.config.ts`.
- [x] (2026-03-12 21:30Z) Migrated page routes to shared CMS query/fetch path (`web/app/page.tsx`, `web/app/investments/page.tsx`, `web/app/mockup/page.tsx`, `web/lib/queries.ts`).
- [x] (2026-03-12 21:37Z) Added live frontend coverage for `about` and `jobPosting` schemas via `web/app/about/page.tsx`, `web/app/jobs/page.tsx`, and homepage preview sections.
- [ ] (2026-03-12 21:40Z) Validation partially complete (completed: `npm run lint`, `npx tsc --noEmit`; remaining: `npm run build` in an environment with outbound access to Google Fonts).

## Surprises & Discoveries

- Observation: Current `/studio` rewrite default points to `http://127.0.0.1:3333` for all environments.
  Evidence: `web/next.config.ts` rewrite destination fallback.
- Observation: Frontend fetches Sanity data but does not define explicit revalidation strategy for CMS updates.
  Evidence: `web/app/page.tsx` and `web/app/investments/page.tsx` call `client.fetch(...)` directly without tags or revalidation config.
- Observation: In Next.js 16.1.6, `revalidateTag` requires a second argument (cache life profile).
  Evidence: TypeScript error `TS2554: Expected 2 arguments, but got 1` in `web/app/api/revalidate/route.ts` before changing to `revalidateTag(tag, "max")`.

## Decision Log

- Decision: Implement tag-based Next.js revalidation with a Sanity webhook endpoint instead of only fixed-interval `revalidate`.
  Rationale: Webhook invalidation provides immediate updates after publish while keeping cache benefits.
  Date/Author: 2026-03-12 / Codex
- Decision: Keep Sanity Studio as a separate deploy target and make `/studio` rewrite optional/configured.
  Rationale: Always rewriting to localhost in production is unsafe; optional rewrite supports local DX without breaking Vercel.
  Date/Author: 2026-03-12 / Codex
- Decision: Use `revalidateTag(tag, "max")` and maintain periodic fallback (`revalidate: 300`) in fetches.
  Rationale: Webhook-driven invalidation is primary path; periodic revalidation keeps content fresh if webhook delivery fails.
  Date/Author: 2026-03-12 / Codex
- Decision: Add dedicated `/about` and `/jobs` routes while also surfacing both data sets on the homepage.
  Rationale: This closes schema-to-frontend gaps and keeps key content visible without requiring extra navigation.
  Date/Author: 2026-03-12 / Codex

## Outcomes & Retrospective

Implemented and wired a complete frontend-to-Sanity fetch path with explicit cache tags and webhook-triggered invalidation. The frontend now uses one helper for Sanity requests, production rewrites are safe, deployment/setup instructions are captured with concrete environment variables, and previously-unused `about` and `jobPosting` schemas are rendered by live routes.

Remaining external setup is operational rather than code-level: set Vercel env vars, configure Sanity webhook, and validate a production build in a network-enabled environment.

## Context and Orientation

The frontend lives in `web/` (Next.js App Router). Sanity Studio lives in `studio/` and defines document schemas in `studio/schemaTypes/*.ts`. The frontend currently queries Sanity in `web/app/page.tsx`, `web/app/investments/page.tsx`, and `web/app/mockup/page.tsx` via `web/lib/sanity.ts` and `web/lib/queries.ts`.

This repository uses Sanity document types `homepage`, `investment`, `newsArticle`, `teamMember`, `jobPosting`, and `about`, and all of these now have a frontend rendering path.

## Plan of Work

Update `web/lib/sanity.ts` to validate required environment variables and expose a reusable `sanityFetch` helper that sets Next.js cache tags/revalidation metadata. Update page components to use `sanityFetch` and shared query constants.

Add `web/app/api/revalidate/route.ts` to receive Sanity webhook events and call `revalidateTag` with secure secret validation.

Update `web/next.config.ts` so `/studio` rewrites only apply when `SANITY_STUDIO_ORIGIN` is explicitly configured (or in development fallback), and allow remote images from `cdn.sanity.io`.

Add setup documentation in `web/README.md` and environment template files so Vercel/frontend and Studio project values stay aligned.

## Concrete Steps

From repository root:

1. Edit frontend Sanity client and query usage:
   - `web/lib/sanity.ts`
   - `web/lib/queries.ts`
   - `web/app/page.tsx`
   - `web/app/investments/page.tsx`
   - `web/app/mockup/page.tsx`

2. Add webhook endpoint:
   - `web/app/api/revalidate/route.ts`

3. Update Next config:
   - `web/next.config.ts`

4. Update docs/env templates:
   - `web/README.md`
   - `web/.env.example`
   - `studio/sanity.config.ts`
   - `studio/.env.example`

5. Validate:
   - `cd web && npm run lint`
   - `cd web && npm run build`

## Validation and Acceptance

Acceptance criteria:

1. Frontend pages fetch Sanity content through one helper with explicit cache tags.
2. Publishing in Sanity can trigger `POST /api/revalidate` and invalidate relevant tags.
3. Production config does not rewrite `/studio` to localhost by default.
4. Environment setup is documented so Vercel deploy can be configured without code edits.

## Idempotence and Recovery

All changes are additive and idempotent. Re-running lint/build is safe. If webhook setup is misconfigured, frontend still serves cached content and can fall back to periodic revalidation.

## Artifacts and Notes

Validation evidence:

    cd web && npm run lint
    Result: pass with 3 existing warnings about <img> usage (no errors).

    cd web && npx tsc --noEmit
    Result: pass.

    cd web && npm run build
    Result: fails in this container due blocked access to https://fonts.googleapis.com for Geist fonts.

## Interfaces and Dependencies

`web/lib/sanity.ts` exports:

- `client`: configured Sanity client
- `sanityFetch<T>({query, params, tags, revalidate})`

`web/app/api/revalidate/route.ts` provides:

- `POST /api/revalidate` that validates secret and calls `revalidateTag(...)`.

Revision note (2026-03-12): Updated the plan to reflect implementation completion, recorded type/runtime discoveries, and captured validation outcomes so another contributor can resume from the current state without replaying the audit.
