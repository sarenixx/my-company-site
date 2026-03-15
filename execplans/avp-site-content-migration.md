# AVP Site Content Migration Into Sanity

This ExecPlan is a living document. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must be kept up to date as work proceeds.

This plan follows repository guidance in [PLANS.md](../PLANS.md) from the repository root and must be maintained in accordance with that document.

## Purpose / Big Picture

After this change, the website content currently shown on `https://www.avp.vc/` will be represented in Sanity documents used by this repository, so non-technical edits can be made in Sanity instead of code. A contributor should be able to run one import command, then open the existing Next.js pages and see populated About, Team, Investments, and News content coming from Sanity.

## Progress

- [x] (2026-03-15 19:02Z) Reviewed current schema/query/page wiring to determine what content models already exist.
- [x] (2026-03-15 19:08Z) Confirmed AVP HTML can be fetched for `/`, `/team`, `/investments`, and `/news` with parseable content.
- [x] (2026-03-15 19:18Z) Added idempotent migration script `scripts/migrate-avp-content-to-sanity.py` with deterministic IDs and `createOrReplace` writes.
- [x] (2026-03-15 19:19Z) Ran migration against project `lv33ldxk` dataset `production` and wrote 258 docs (`homepage`, `about`, `teamMember`, `investment`, `newsArticle`).
- [x] (2026-03-15 19:20Z) Updated schema/query support for external image/profile/source fields and deterministic homepage/about query IDs.
- [x] (2026-03-15 19:22Z) Updated root README with migration runbook and verified `web` production build succeeds after changes.

## Surprises & Discoveries

- Observation: Jobs content from `https://jobs.avp.vc/jobs` is not directly scrapeable from this environment.
  Evidence: Response body is an API-sales message from Getro instead of jobs HTML.
- Observation: `sanity documents query` fails without an explicit project config in this repo.
  Evidence: CLI output includes `Missing required "api.projectId" key` and `Use project hostname for data requests`.
- Observation: Existing dataset already had multiple `homepage` documents from earlier setup work.
  Evidence: Post-migration verify count returned `homepage: 3`.

## Decision Log

- Decision: Use a custom migration script with direct Sanity HTTP API mutations (via Python `requests`) instead of relying on `sanity documents` subcommands.
  Rationale: This repository intentionally omits `sanity.cli.*` project config, and direct HTTP mutations are stable and easy to re-run from any machine.
  Date/Author: 2026-03-15 / Codex
- Decision: Keep migration idempotent by assigning deterministic document IDs (for homepage, about, team members, investments, and news articles).
  Rationale: Re-running migration should update existing records instead of creating duplicates.
  Date/Author: 2026-03-15 / Codex
- Decision: Skip jobs migration for this pass.
  Rationale: User explicitly requested to defer jobs, and the current jobs source returns a provider message instead of scrapeable jobs HTML.
  Date/Author: 2026-03-15 / Codex
- Decision: Query homepage/about by fixed IDs (`homepage-main`, `about-main`) in frontend GROQ.
  Rationale: The dataset contains legacy placeholder docs; fixed IDs guarantee frontend renders migrated content.
  Date/Author: 2026-03-15 / Codex

## Outcomes & Retrospective

Implemented an end-to-end AVP-to-Sanity migration path and executed it successfully. The production dataset now contains populated About, Team, Investments, and News content pulled from `avp.vc` and editable in Sanity. Frontend queries now use deterministic document IDs for critical singleton documents, preventing legacy placeholders from being selected.

The only intentionally deferred scope is jobs migration, which the user asked to skip. A follow-up can add jobs ingestion if a stable source feed is provided.

## Context and Orientation

The Studio schema lives in `studio/schemaTypes/*.ts` and currently defines `homepage`, `about`, `teamMember`, `investment`, `newsArticle`, and `jobPosting`. The frontend reads these types in `web/lib/queries.ts` and renders them through `web/app/page.tsx`, `web/app/about/page.tsx`, `web/app/investments/page.tsx`, and `web/app/jobs/page.tsx`.

The repository already has working Sanity-to-frontend integration and Vercel webhook revalidation. The missing piece is content migration from the legacy AVP site into these existing Sanity document types.

## Plan of Work

Implement a migration script in `scripts/migrate-avp-content-to-sanity.py` that:

1. Fetches AVP HTML for `/`, `/team`, `/investments`, and `/news`.
2. Parses content sections into plain data structures:
   - Homepage hero/about bullets and section modal text.
   - About long-form content derived from homepage callouts plus sector modal copy.
   - Team member name, role, and biography paragraphs.
   - Investment company metadata (name, website, status, description).
   - News headline, publication date, excerpt source, and external URL.
3. Upserts documents into Sanity using deterministic IDs and Sanity mutation API `createOrReplace` operations.

Then run the script, verify migrated document counts with read queries, run frontend lint/build sanity checks, and update docs with rerun instructions.

## Concrete Steps

From repository root:

1. Create migration script:
   - `scripts/migrate-avp-content-to-sanity.py`
2. Execute migration:
   - `python3 scripts/migrate-avp-content-to-sanity.py`
3. Validate content in Sanity via query script and frontend:
   - `python3 scripts/migrate-avp-content-to-sanity.py --verify-only`
   - `cd web && npm run lint`
4. Update docs:
   - `README.md` (how to rerun migration)

## Validation and Acceptance

Acceptance criteria:

1. Running the migration script succeeds without manual edits and reports counts for homepage/about/team/investments/news upserts.
2. Sanity dataset contains populated docs for:
   - a deterministic `homepage-main` document
   - one `about`
   - many `teamMember`
   - many `investment`
   - many `newsArticle`
3. Frontend pages render migrated content without code changes:
   - `/` has AVP hero + bullets + populated sections.
   - Team content appears on homepage team section.
   - `/investments` shows non-empty list.
   - News appears in homepage latest news section.
4. Re-running the migration is safe and does not create duplicates.

## Idempotence and Recovery

The migration uses deterministic IDs and `createOrReplace`, so reruns update in place. If source parsing changes unexpectedly, rerun with the previous script revision from Git and redeploy/revalidate.

## Artifacts and Notes

Migration transcript excerpt:

    Parsed content summary:
      homepage docs: 1
      about docs: 1
      team docs: 12
      investment docs: 52
      news docs: 192
      total docs: 258
    Upserting documents to Sanity project=lv33ldxk dataset=production ...
    Wrote 258 documents.

Verification excerpt:

    Current Sanity counts:
      homepage: 3
      about: 1
      teamMember: 12
      investment: 52
      newsArticle: 192

## Interfaces and Dependencies

Use Python 3 with `requests` and `bs4` (`BeautifulSoup`) for scraping/parsing and direct HTTP calls to Sanity query/mutate endpoints. Authentication can come from environment token variables or the existing local Sanity CLI session token (resolved through `sanity debug --secrets` in the script).

Revision note (2026-03-15): Updated after implementation to reflect actual script path, completed migration results, jobs deferral decision, and deterministic singleton-query strategy.
