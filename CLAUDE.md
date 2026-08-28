# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev        # dev server on :3000 (runs codegen in watch mode)
npm run build      # production build into dist/ (runs codegen)
npm run preview    # serve the production build via mini-oxygen
npm run typecheck  # react-router typegen && tsc --noEmit
npm run lint       # eslint
npm run codegen    # regenerate storefrontapi.generated.d.ts + route types
```

There is no test suite. `typecheck` is the closest thing to one — GraphQL queries are
type-checked against the live schema through the generated types, so a query that asks
for a field the API does not have fails there, not at runtime. Run it after touching any
query or loader.

After adding or renaming a route file, run `npm run codegen` (or restart `dev`) before
`./+types/<route>` will resolve.

## Storefront connection

The app runs against `mock.shop` demo data unless `.env` holds real credentials — that is
why the catalogue looks like apparel and why real collection handles 404 locally. To point
at the real store: `npx shopify hydrogen link` then `npx shopify hydrogen env pull`.
`.env` is gitignored and this repo is public. See GOING-LIVE.md for the full checklist.

## Architecture

Shopify Hydrogen 2026.4 on React Router 7, SSR on Oxygen (Workers runtime — no Node APIs).

- `server.ts` — worker fetch handler. Builds the Hydrogen context, delegates to React
  Router, commits the session cookie, and falls through to `storefrontRedirect` on 404 so
  Shopify admin URL redirects still work.
- `app/lib/context.ts` — the single place clients are constructed. Anything shared
  (a CMS client, a reviews SDK) goes in `additionalContext` and becomes available on
  `context` in every loader/action.
- `app/routes.ts` — file-based `flatRoutes()` wrapped in `hydrogenRoutes()`. Route files
  live in `app/routes/` using flat dot-notation (`collections.$handle.tsx`).
- `app/lib/session.ts` — cookie session; requires `SESSION_SECRET`.

### Route conventions

Routes follow the Hydrogen split: `loader` calls `loadCriticalData` (awaited — above-the-fold,
failure should error the page) and `loadDeferredData` (not awaited — streamed, resolved with
`<Await>`/`<Suspense>`). Keep new routes in that shape rather than awaiting everything.

Types come from `./+types/<route>` (`Route.LoaderArgs`, `Route.MetaFunction`), GraphQL result
types from `storefrontapi.generated`. Queries are inline `` `#graphql` ``-tagged template
strings at the bottom of the route file; codegen picks them up from anywhere under `app/`
except `app/graphql/customer-account/`, which is a separate codegen project against the
Customer Account API schema.

### Imports

**Never import from `@remix-run/*` or `react-router-dom`** — everything routing-related comes
from `react-router`. See `.cursor/rules/hydrogen-react-router.mdc`. `~/` aliases `app/`.

### `app/lib/store-config.ts` is the source of truth for claims

Every factual statement the storefront makes about the business — support email, shipping and
return terms, payment methods, nav, categories, FAQs — lives there and is consumed by ~30
components and routes. Fields set to `null` are deliberately not rendered; do not fill one in
with a plausible-sounding guess, and do not hardcode a claim into a component. `reviews.enabled`
is `false` on purpose: the review UI is built but must not render invented ratings.

Related content files: `app/lib/site-imagery.ts` (the storefront's own Unsplash-licensed brand
photography in `public/images/`, sized for hero/banner slots) and `app/lib/collection-images.ts`
(fallback tiles for collections with no image in Shopify admin — callers must check
`collection.image` first so a real one silently takes over).

### Collection filtering

`app/lib/collection-filters.ts` translates the URL query string to and from Storefront API
variables using Shopify's own parameter names (`filter.v.availability`, `sort_by=price-ascending`).
Filtering happens server-side in Shopify, and the available facets come back on
`products.filters` — driven by what the merchant enabled in Search & Discovery, never
hardcoded. Filter state belongs in the URL, not in React state.

### Styling

Tailwind v4, configured CSS-first in `app/styles/tailwind.css` — the `@theme` block holds the
whole design system (palette, fonts, radii, shadows, header spacing) with the reasoning for each
token in comments. Use those tokens (`bg-brand`, `text-ink-muted`, `rounded-card`) rather than
raw hex or arbitrary values.

`app/styles/app.css` is legacy scaffold CSS kept only for the not-yet-redesigned surfaces
(search, blog, account). It is wrapped in `@layer base` so it cannot outrank Tailwind
utilities — keep any addition inside that layer, and delete a block when its section gets a
Tailwind pass. The goal is an empty file.

Shared primitives in `app/components/ui/`: `Container` (page gutter; `width="full"` is the
wide browse-grid variant), `Section` (titled homepage section wired to scroll reveal), `Button`.
Homepage-only sections live in `app/components/home/`.
