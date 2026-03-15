# Recreate Mockup Homepage With Sanity-Editable Sections

This ExecPlan is a living document. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must be kept up to date as work proceeds.

This plan follows repository guidance in [PLANS.md](../PLANS.md) from the repository root and must be maintained in accordance with that document.

## Purpose / Big Picture

After this change, the homepage at `/` will visually match the user’s preferred mockup (typography, section order, copy tone, and layout) while every section’s content is editable in Sanity (`homepage-main`). The user will be able to open Sanity Studio, update hero/about/team/resources/footer copy, publish, and then see those updates on the deployed Vercel site without code edits.

## Progress

- [x] (2026-03-15 20:01Z) Collected and parsed the user-provided mockup HTML/CSS/JS from the authenticated preview URL and extracted section copy + style system.
- [x] (2026-03-15 20:01Z) Audited current homepage implementation and identified schema/query gaps for section-level content management.
- [x] (2026-03-15 20:07Z) Added homepage schema fields for mockup sections (hero, ticker, about stats, team CTA block, platform block, resources block, footer links/social).
- [x] (2026-03-15 20:07Z) Rebuilt `web/app/page.tsx` to render the mockup layout from Sanity fields with safe fallbacks.
- [x] (2026-03-15 20:08Z) Updated site-wide styles/navigation and added fluid page shell mode while preserving team/investments/news routes.
- [x] (2026-03-15 20:08Z) Seeded `homepage-main` in Sanity with mockup copy and links via `scripts/seed-mockup-homepage.py`.
- [x] (2026-03-15 20:12Z) Ran `npm run lint` and `npm run build` in `web/`, validated `studio` schema, then committed and pushed all changes to `origin/main`.

## Surprises & Discoveries

- Observation: The mockup preview URL is protected by GitHub Codespaces port auth and returns a tunnel auth page unless authenticated headers are used.
  Evidence: direct `curl` to preview URL returned 401/tunnel page earlier; authenticated fetch produced full HTML/CSS/JS.
- Observation: Current homepage implementation still uses the previous about-centric layout and does not expose per-section homepage fields in Sanity.
  Evidence: `web/app/page.tsx` reads only `title/subtitle/aboutPoints` and parses sectors from `about-main` portable text.
- Observation: CSS `@import url(...)` after Tailwind import triggers build warning because CSS import ordering rules are strict post-expansion.
  Evidence: first build reported `@import rules must precede all rules`; warning resolved by switching to `next/font/google` in `web/app/layout.tsx`.
- Observation: Seeding array-of-object fields in Sanity via API requires explicit `_type` and `_key` for each object item.
  Evidence: `scripts/seed-mockup-homepage.py` writes `portfolioTickerItems`, `aboutStats`, and footer link arrays as keyed objects and mutation succeeds.

## Decision Log

- Decision: Keep existing homepage fields (`title`, `subtitle`, `aboutPoints`, etc.) and add new fields instead of replacing.
  Rationale: This avoids regressions in routes/queries still relying on legacy fields while enabling the new mockup homepage structure.
  Date/Author: 2026-03-15 / Codex
- Decision: Use a dedicated homepage query for the mockup route (`homepageMockupQuery`) rather than overloading every existing query.
  Rationale: Limits coupling and keeps the new page behavior explicit.
  Date/Author: 2026-03-15 / Codex
- Decision: Use `next/font/google` for Inter/Lora/Barlow Condensed instead of CSS `@import`.
  Rationale: Keeps build output clean, avoids CSS import ordering warnings, and improves font loading behavior.
  Date/Author: 2026-03-15 / Codex
- Decision: Keep legacy homepage fields populated during seed (`title`, `subtitle`, `aboutPoints`) alongside new section fields.
  Rationale: Prevents regression for any remaining query or route that still references legacy fields.
  Date/Author: 2026-03-15 / Codex

## Outcomes & Retrospective

Implemented a mockup-faithful homepage redesign powered by Sanity section fields, including hero, ticker, about/stat block, team CTA section, platform/resources section, and footer links/social. The homepage now renders from a dedicated GROQ query with resilient fallbacks and a seeded `homepage-main` document so Studio users can edit content immediately.

Validation passed with `npm run build` and lint returned warnings only (`<img>` optimization warnings pre-existing in this codebase pattern). Studio schema validation also passed with 0 errors and 0 warnings. All code and plan changes are committed and pushed to `origin/main` under commit `58e2b73`.

## Context and Orientation

The frontend is a Next.js App Router app in `web/`. The Sanity Studio schema lives in `studio/schemaTypes/`. The homepage singleton document uses `_id == "homepage-main"` and type `homepage`. Existing routes already use `SiteShell` (`web/components/site-shell.tsx`) with global CSS in `web/app/globals.css`. Current homepage (`web/app/page.tsx`) renders an about-focused layout and does not match the user’s preferred mockup.

This change introduces a structured homepage content model inside the existing `homepage` schema file (`studio/schemaTypes/homepage.ts`), then rewires homepage rendering to those fields. The design target is the user’s previous mockup (hero statement, ticker section, about paragraph + stats, team CTA block, platform/resources sections, and footer/contact links).

## Plan of Work

First, extend `studio/schemaTypes/homepage.ts` with additive fields for each visual section. Use plain strings/URLs for simple text and arrays of objects for repeatable content (ticker items, stats, social links, footer links). Keep current fields untouched.

Second, add `homepageMockupQuery` in `web/lib/queries.ts` that fetches these new fields from `homepage-main` and fetches supplemental records needed for fallbacks (investments, latest news, team count, open jobs count).

Third, replace `web/app/page.tsx` with a Sanity-driven section renderer matching the mockup’s structure and hierarchy, including anchor IDs (`portfolio`, `team`, `resources`, `news`) for nav continuity and fallback copy when fields are not yet populated.

Fourth, update `web/components/site-shell.tsx` and `web/app/globals.css` so the nav and global typography align with the mockup style system (Inter/Lora/Barlow Condensed, sticky transparent-ish nav, large hero type, gradient background, ticker animation, section spacing).

Fifth, seed `homepage-main` using a script in `scripts/` so the exact mockup copy appears in Sanity fields immediately. The script should authenticate using existing Sanity token resolution conventions already used in repo scripts.

Finally, run lint/build validation, update this plan sections with outcomes, and commit/push the change set.

## Concrete Steps

From repository root `/workspaces/my-company-site`:

1. Edit schema and query files:
   - `studio/schemaTypes/homepage.ts`
   - `web/lib/queries.ts`
2. Rebuild homepage and shell:
   - `web/app/page.tsx`
   - `web/components/site-shell.tsx`
   - `web/app/globals.css`
3. Add/update seed script:
   - `scripts/seed-mockup-homepage.py` (new)
4. Run seed script:
   - `python3 scripts/seed-mockup-homepage.py`
5. Validate frontend:
   - `cd web && npm run lint`
   - `cd web && npm run build`
6. Save work:
   - `git add ...`
   - `git commit -m "recreate mockup homepage with sanity-driven sections"`
   - `git push`

## Validation and Acceptance

Acceptance is met when all conditions are true:

1. The homepage visual structure matches the supplied mockup: hero, ticker, about with stats, team CTA block, platform section, resources section, and footer.
2. Homepage section copy and button labels are editable from `homepage-main` in Sanity Studio.
3. Existing `team`, `investments`, and `news` routes still render and are not broken by the global style/navigation updates.
4. `npm run lint` and `npm run build` pass in `web/`.
5. Changes are committed and pushed to `origin/main`.

## Idempotence and Recovery

Schema and frontend edits are additive and safe to re-run. The seed script uses `createIfNotExists` plus `patch set` on `_id: homepage-main`, so rerunning it is idempotent and restores expected homepage defaults while keeping document identity stable. If any style change regresses another page, revert only `web/app/globals.css` and reintroduce styles section by section while keeping schema/query/data updates intact.

## Artifacts and Notes

Expected seed script success output should resemble:

    Upserted homepage-main with mockup section content.

Expected validation success should include:

    npm run lint
      -> 0 errors (warnings acceptable if pre-existing)

    npm run build
      -> compiled successfully

## Interfaces and Dependencies

Use only existing stack dependencies:

- Sanity schema helpers from `sanity` package in `studio/`.
- GROQ queries in `web/lib/queries.ts`.
- Existing Sanity fetch helper `sanityFetch` from `web/lib/sanity.ts`.
- Python standard library + `requests` for the seed script (already used in repo scripts).

Revision note (2026-03-15): Initial plan creation for mockup-driven homepage recreation with Sanity section mapping.
Revision note (2026-03-15): Updated after implementation with completed milestones, build validation, and final pending git push step.
Revision note (2026-03-15): Updated after git commit/push to reflect fully completed state.
