# Value Vault

Headless storefront for [valuevaultshop.net](https://valuevaultshop.net) — everyday
essentials for home, kitchen, pets & family.

Built with **Shopify Hydrogen** (React + React Router 7) running on Oxygen. Shopify
still owns the checkout, payments, inventory and order management; this repo owns the
storefront everything before checkout.

## Stack

| Piece | Choice |
| --- | --- |
| Framework | Hydrogen 2026.4 (React Router 7, SSR + streaming) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Data | Shopify Storefront API (GraphQL) |
| Hosting | Shopify Oxygen |

## Getting started

```bash
npm install
cp .env.example .env   # then fill in real values
npm run dev            # http://localhost:3000
```

The project currently runs against [mock.shop](https://mock.shop) so the UI can be
built without live credentials. To point it at the real store:

```bash
npx shopify hydrogen link      # pick the Value Vault storefront
npx shopify hydrogen env pull  # writes real tokens into .env
```

## Scripts

| Command | Does |
| --- | --- |
| `npm run dev` | Local dev server with hot reload |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run typecheck` | TypeScript check |
| `npm run lint` | ESLint |
| `npm run codegen` | Regenerate GraphQL types from queries |

## Secrets

This repository is **public**. `.env` is gitignored and must never be committed —
`.env.example` documents the required variables with empty values. The
`PUBLIC_STOREFRONT_API_TOKEN` is safe in the browser by design; the
`PRIVATE_STOREFRONT_API_TOKEN` and `SESSION_SECRET` are not.

## Layout

```
app/
  components/   Reusable UI (header, footer, cart, product cards)
  routes/       File-based routes — product, collection, cart, account, search
  lib/          Storefront context, session, GraphQL fragments
  styles/       Tailwind entry + base CSS
```
