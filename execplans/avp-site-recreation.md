# Recreate AVP Frontend On Sanity + Vercel

This ExecPlan is a living document. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must be kept up to date as work proceeds.

This plan follows repository guidance in [PLANS.md](../PLANS.md) from the repository root and must be maintained in accordance with that document.

## Purpose / Big Picture

After this change, the frontend served from this repository should mirror the structure and feel of `https://www.avp.vc/` while keeping content managed in Sanity. The user should be able to open `/`, `/team`, `/investments`, and `/news` on Vercel and see an AVP-style presentation sourced from the Sanity documents already imported.

## Progress

- [x] (2026-03-15 19:24Z) Audited current frontend files, schema/query shape, and imported Sanity content for homepage/about/team/investments/news.
- [x] (2026-03-15 19:30Z) Implemented shared AVP-style layout/navigation and site-wide styling (`web/components/site-shell.tsx`, `web/app/globals.css`).
- [x] (2026-03-15 19:31Z) Rebuilt `/` as About-first AVP section layout using `homepage-main` and `about-main` content.
- [x] (2026-03-15 19:33Z) Rebuilt `/team`, `/investments`, added `/news`, and aligned `/about` + `/jobs` with AVP route behavior.
- [ ] Deploy updated frontend to production and verify live pages.

## Surprises & Discoveries

- Observation: Imported content includes all major AVP sections in Sanity but homepage singleton is not unique by type (`homepage` count > 1).
  Evidence: Sanity verify query returns `homepage: 3`.
- Observation: Recreated pages pass lint/build, but lint reports non-blocking `<img>` optimization warnings.
  Evidence: `npm run lint` reports 5 warnings and 0 errors.

## Decision Log

- Decision: Use deterministic singleton IDs (`homepage-main`, `about-main`) in frontend queries.
  Rationale: Guarantees recreated pages render migrated AVP content instead of legacy placeholders.
  Date/Author: 2026-03-15 / Codex
- Decision: Keep jobs out of this recreation pass.
  Rationale: User explicitly requested to defer jobs migration/work.
  Date/Author: 2026-03-15 / Codex

## Outcomes & Retrospective

Recreated the frontend information architecture and visual language around AVP’s current site structure, while keeping all primary content sourced from Sanity. The result now includes dedicated Team, Investments, and News routes with a shared top navigation and consistent AVP-like layout/styling. The old placeholder pages were replaced with content-rich templates and deterministic singleton queries are preserved.

The remaining step is production deployment verification (build already passes locally).

## Context and Orientation

The Next.js app lives in `web/`. Current pages are simple placeholders and do not match AVP’s structure. Sanity data has already been imported into `production` dataset, including team bios, investment details, and news links. Existing GROQ queries live in `web/lib/queries.ts`. Styling is currently minimal in `web/app/globals.css`.

## Plan of Work

Create shared AVP-style layout primitives (sticky top nav + constrained content width), then rebuild page routes around the imported Sanity content model:

- `/` renders about hero and callout list with sector detail sections.
- `/team` renders member grid and detailed bio blocks.
- `/investments` renders company logo grid with details and related news.
- `/news` renders reverse-chronological external news feed.

Then run lint/build and deploy so the recreated experience is live.

## Concrete Steps

From repository root:

1. Edit frontend queries and helpers:
   - `web/lib/queries.ts`
   - `web/lib/portableText.ts`
2. Add shared UI wrapper:
   - `web/components/site-shell.tsx`
3. Rebuild pages:
   - `web/app/page.tsx`
   - `web/app/team/page.tsx` (new)
   - `web/app/investments/page.tsx`
   - `web/app/news/page.tsx` (new)
   - `web/app/about/page.tsx` (redirect or mirror)
4. Rework styling:
   - `web/app/globals.css`
5. Validate and deploy:
   - `cd web && npm run lint`
   - `cd web && npm run build`
   - `npx vercel --prod --yes --scope sarah-enixs-projects`

## Validation and Acceptance

Acceptance criteria:

1. `/` presents AVP-style About section with Sanity-managed copy and callouts.
2. `/team` lists members and full bios from Sanity.
3. `/investments` shows a populated logo grid and detail sections with related news links.
4. `/news` shows populated press/news feed with source and date.
5. Build succeeds and production deployment is live.

## Idempotence and Recovery

All page/style edits are source-controlled and can be re-run/redeployed safely. If styling regressions occur, revert individual files via Git and redeploy.

## Artifacts and Notes

Validation excerpt:

    npm run lint
      -> 5 warnings, 0 errors

    npm run build
      -> compiled successfully
      -> generated static pages for /, /team, /investments, /news

## Interfaces and Dependencies

Use existing Next.js App Router components and `sanityFetch` helper. No new external dependencies are required.

Revision note (2026-03-15): Initial creation before implementing AVP-style frontend recreation.
Revision note (2026-03-15): Updated after implementation with completed milestones, lint/build evidence, and remaining deploy step.
