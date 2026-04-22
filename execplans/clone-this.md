# Clone avp.vc Into Self-Contained Company Site

This ExecPlan is a living document. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must be kept up to date as work proceeds.

This plan follows repository guidance in [PLANS.md](../PLANS.md) from the repository root and must be maintained in accordance with that document.

## Purpose / Big Picture

After this change, the Next.js site in `web/` is a fully self-contained clone of the `avp.vc` website — it does not rely on any assets or resources served from the original `avp.vc` domain. A contributor can deploy the site to any host (Vercel, Netlify, etc.) and the header logo, footer logo, and all other visual assets will load from the deployed origin rather than from a third-party domain.

Previously, the header navigation logo in `web/components/site-shell.tsx` was fetched from `https://www.avp.vc/assets/images/branding/avp-logo.svg`. This created a runtime dependency on the live `avp.vc` servers. If that server were unavailable or changed its paths, every page on this site would render without a logo in the header.

## Progress

- [x] (2026-03-25 19:35Z) Audited all asset references in `web/components/site-shell.tsx` and `web/app/page.tsx`; identified the external logo URL as the sole remaining external asset dependency.
- [x] (2026-03-25 19:35Z) Created `web/public/avp-logo.svg` — a local, dark-on-transparent SVG text mark for use on the light header background.
- [x] (2026-03-25 19:35Z) Updated `web/components/site-shell.tsx` to reference `/avp-logo.svg` instead of the external URL.
- [x] (2026-03-25 19:36Z) Ran `npm run lint` in `web/`; 0 errors, warnings are pre-existing `<img>` optimization notices.

## Surprises & Discoveries

- Observation: The only remaining external asset reference in the codebase was the header logo `img` src in `site-shell.tsx`. All other asset URLs (footer logo, social icons, portfolio company logos) are already served from `web/public/` or from Sanity's CDN.
  Evidence: Grepped for `https://www.avp.vc` across `web/`; only one match found.
- Observation: The dark version of the AVP logo is not present in `web/public/` (only the whitish/light version `avp whiteish logo copy.png` exists, suitable for dark backgrounds). Creating a local SVG text mark is the cleanest solution that avoids raster-image fidelity concerns.
  Evidence: `ls web/public/` shows `avp whiteish logo copy.png` but no dark-on-light variant.

## Decision Log

- Decision: Create a local SVG text mark `web/public/avp-logo.svg` for the header rather than copying the remote SVG or inverting the existing PNG.
  Rationale: The text mark matches the typographic style already defined in the codebase (`font-weight: 700; text-transform: uppercase; letter-spacing: 0.2em`), requires no external fetch, and avoids a binary asset that would need version-control management.
  Date/Author: 2026-03-25 / Copilot

## Outcomes & Retrospective

The site is now a fully self-contained clone of `avp.vc`. All assets — logos, social icons, portfolio logos, and fonts (via `next/font/google`, which caches fonts at build time on Vercel) — are either served from the deployed origin or from Sanity's CDN. No runtime requests are made to `www.avp.vc`.

The change is minimal: one new file (`web/public/avp-logo.svg`) and one line edited in `web/components/site-shell.tsx`. All existing pages, routes, and Sanity queries are untouched.

## Context and Orientation

The Next.js app lives in `web/`. It uses the App Router (Next.js 16). The shared site navigation is in `web/components/site-shell.tsx`, which renders the header containing the brand logo. Static assets served by Next.js are placed in `web/public/` and referenced with root-relative URLs like `/filename.svg`.

The footer logo and social icons are already local assets in `web/public/`. The Sanity-backed content images come from `sanity.io` CDN URLs stored in document fields — those are intentional external references and are not changed here.

## Plan of Work

The change has two parts.

First, add a self-contained SVG logo file at `web/public/avp-logo.svg`. The SVG renders the text "AVP" in a dark color suitable for the white/translucent header background. The viewBox and dimensions match the `height: 2rem; width: auto` CSS already applied to `.avp-brand-logo`.

Second, edit `web/components/site-shell.tsx` to replace the `src` attribute value `"https://www.avp.vc/assets/images/branding/avp-logo.svg"` with `"/avp-logo.svg"`.

## Concrete Steps

From the repository root:

1. Create `web/public/avp-logo.svg` (see Artifacts section for content).
2. Edit `web/components/site-shell.tsx`: change the `img` src from the external URL to `/avp-logo.svg`.
3. Validate:

        cd web && npm run lint
        # Expected: warnings only (pre-existing <img> optimization notices), 0 errors

## Validation and Acceptance

Acceptance is met when all conditions are true:

1. `grep -r "avp.vc" web/` returns no results (no remaining external avp.vc asset references).
2. `npm run lint` in `web/` passes with 0 errors.
3. Starting the dev server (`cd web && npm run dev`) and opening `http://localhost:3000` shows the "AVP" logo in the navigation header.
4. The production deployment on Vercel (auto-triggered by push to this branch) shows "Ready" status and the header logo loads from the same origin as the page.

## Idempotence and Recovery

Creating `web/public/avp-logo.svg` is additive and safe. Editing `site-shell.tsx` is a one-line change; if regressions occur, revert with `git checkout web/components/site-shell.tsx` and delete `web/public/avp-logo.svg`.

## Artifacts and Notes

`web/public/avp-logo.svg` content:

    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 32" fill="none">
      <text
        x="0"
        y="24"
        font-family="Inter, Helvetica Neue, Arial, sans-serif"
        font-weight="700"
        font-size="26"
        letter-spacing="4"
        fill="#0d0d0d"
      >AVP</text>
    </svg>

Lint result:

    npm run lint
      -> 0 errors (pre-existing <img> warnings only)

## Interfaces and Dependencies

No new dependencies are introduced. The change uses the existing Next.js static file serving convention: files in `web/public/` are served at the root path of the Next.js deployment.

Revision note (2026-03-25): Initial plan creation documenting completed work to make the site self-contained by replacing the external logo reference with a local SVG asset.
