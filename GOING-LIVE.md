# Going live

The storefront runs against the real Value Vault catalogue. Nothing below is
optional-but-nice — these are the steps between here and taking real orders.

---

## 1. Connect the real store — DONE 2026-08-28

The store is linked and `.env` holds real credentials. For the record, because
the two channels are easy to confuse:

- **Headless** channel — issues the Storefront API tokens. Was already
  installed, with a storefront named *Value Vault Headless* whose permissions
  already included `unauthenticated_read_content`.
- **Hydrogen** channel — Oxygen hosting, and what `hydrogen link` / `env pull` /
  `deploy` actually talk to. Installed on 2026-08-28; `link` created a Hydrogen
  storefront named *Valuevaultshop*.

```bash
npx shopify hydrogen link      # pick Valuevaultshop
npx shopify hydrogen env pull  # writes real tokens into .env
npm run dev
```

`env pull` set `PUBLIC_STOREFRONT_ID`, `PRIVATE_STOREFRONT_API_TOKEN`,
`PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID`, `PUBLIC_CUSTOMER_ACCOUNT_API_URL` and
`SHOP_ID`, and replaced the interim `PUBLIC_STOREFRONT_API_TOKEN` that had been
read out of the live Liquid theme. That old token lacked the content scope,
which is why every page load used to log twelve `Access denied for menu field`
errors from the `Header`, `Footer`, `Page` and `redirects` queries. Those are
gone.

It also overwrote `SESSION_SECRET`. Nothing depended on the old value, but note
that `env pull` does that — back `.env` up before running it again.

`.env` is gitignored. This repository is public, so never commit it — if a token
does get pushed, rotate it in the Headless channel rather than just deleting the
commit.

## 2. Collection handles — verified

`app/lib/store-config.ts` drives the Shop menu, the /collections page and every
category page from this list. All five were checked against the live Liquid
store on 2026-08-27, and re-confirmed against the linked Storefront API on
2026-08-28 — `/collections/home-accessories` returns all fourteen products:

| Handle | Shown as | Products on the live store |
| --- | --- | --- |
| `best-selling` | Best Selling | 6 |
| `kitchen-accessories` | Kitchen Accessories | 9 |
| `home-accessories` | Home Accessories | 14 |
| `pet-accessories` | Pet Accessories | 9 |
| `kids-babies` | Kids & Babies | 6 |

These are the same records the Liquid site serves — one store, two front
doors. A price changed in admin shows up on both.

## 3. Turn on filters in Search & Discovery

The category pages have a Filter & Sort drawer, and its facets come from
Shopify rather than from this codebase: whatever is enabled in Shopify admin →
Apps → **Search & Discovery** → Filters is what appears. Availability and Price
are on by default; the useful one to add for this catalogue is the **Color**
product option, since most Value Vault products carry one.

Two knock-on effects worth knowing:

- Product cards draw colour swatch dots from the option's **swatch values**. If
  the Color option's values are plain text with no swatch configured, the dots
  are omitted rather than drawn grey — set swatches in admin → Settings →
  Metafields → Product options if you want them.
- Nothing needs a code change to add a facet. A new filter switched on in
  admin appears in the drawer on the next page load.

---

## 4. Search covers products — articles and pages are opt-in

Search works against the live catalogue as-is: the header field and `/search`
both query Shopify directly, so whatever is in the store is findable the
moment it is published. Nothing is hardcoded and nothing needs a code change
when the catalogue changes.

Blog articles and pages were the one exception. Shopify puts `Article` and
`Page` behind the **`unauthenticated_read_content`** access scope, and asking
for a field the token cannot read fails the *entire* query rather than dropping
that one field — so a search that should have returned twenty products returned
an error instead.

Both fields are therefore requested conditionally, behind `SEARCH_CONTENT` in
`app/lib/search.ts`. **It is now `true`** — the Headless storefront's token
carries the scope, so article and page hits appear in the header dropdown and
on `/search`.

Only turn it back off if that scope is ever revoked. Having it on without the
scope is what breaks search, so the two go together.

---

## 5. Customer accounts — the person icon

The header's person icon drops the same card the live Liquid site does:
**Sign in with shop**, an OR divider, an email field with an arrow, the
marketing checkbox, and Orders / Profile tiles.

Where it differs is *where* the sign-in happens, and it has to. Shopify owns
customer identity on a headless storefront: the in-page Shop popup belongs to
`shop-js`, a Liquid theme embed with no way to hand a session back to a
Hydrogen route, and the Customer Account API only issues one through its OAuth
flow. So the button hands off — `/account/login` redirects into
`customerAccount.login()` and lands on Shopify's own page, which leads with
Shop and offers the emailed code beside it. A shopper still signs in with
Shop; they do it one navigation away. The email field is not decorative
either: it forwards the address as `login_hint`, which that page reads to
prefill it.

**"Email me with news and offers" is not wired to anything yet.** Shopify's
OAuth login takes no marketing-consent parameter, so the checkbox cannot ride
along with `login_hint`, and this storefront has no subscriber list of its own
— the footer's newsletter form is unwired for the same reason. Connect both to
the same destination at once rather than collecting an opt-in here and
dropping it.

**The two environment variables this needs are now set.** `env pull` wrote
`PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID` and `PUBLIC_CUSTOMER_ACCOUNT_API_URL`
into `.env` on 2026-08-28.

`/account/login` still returns 400 on localhost, and that is correct — it is
this app's own message saying OAuth needs a tunnel. See below.

**Testing it locally needs a tunnel.** Shopify's OAuth will not redirect back
to `localhost`, so:

```bash
npm run dev -- --customer-account-push
```

then open the `https://*.tryhydrogen.dev` URL the terminal prints instead of
localhost. The flag registers that URL as a callback for you. Hydrogen says as
much if you try it on localhost.

For production, the deployed domain has to be allow-listed in Shopify admin →
**Customer accounts** → Customer Account API → Application setup: callback URI
`https://<domain>/account/authorize`, plus the JavaScript origin and logout
URI for the same domain.

---

## Trust gaps worth closing

These are the things a first-time visitor from TikTok will notice. They are
listed in the order I would fix them.

### The support email is a personal Gmail

`stevenortiz90@gmail.com` is published on the About page and the refund policy.
A free mailbox is, fairly or not, one of the strongest "this is not a real
business" signals a shopper has — and it is the cheapest thing on this list to
fix. Most domain hosts include mail forwarding free: point `support@valuevaultshop.net`
at the same inbox and update `support.email` in `app/lib/store-config.ts`.

### There is no stated delivery estimate

The shipping policy gives a dispatch time (1–3 business days) but never says
when the parcel actually lands. Cold traffic assumes the worst when a store is
vague about delivery, and a specific honest window converts better than silence
— even a long one. Set `shipping.deliveryEstimate` in store-config **and** update
the policy page so the two agree.

### No phone number or business address

Both are set to `null` and render nothing, which is the correct behaviour for a
value you cannot stand behind — an unanswered number is worse than no number.
But if there is a number that gets answered, adding it is a real trust gain.

### No reviews

`reviews.enabled` is `false`, so `StarRating` renders nothing anywhere. The
component and the layout slots are already in place. Once a review app
(Judge.me, Loox, Okendo) has collected genuine reviews, wire it up and flip the
flag.

Please do not flip it early. Invented ratings are precisely the tell that shoppers
use to spot a fake store, and the whole design here is built on only claiming
things that are true.

### Confirm the payment methods

`paymentMethods` in store-config lists the Shopify Payments defaults. Check it
against Shopify admin → Settings → Payments. Advertising a method the store does
not accept is a broken promise at the checkout button.

---

## Deploying

Oxygen hosting is included with the Shopify plan:

```bash
npx shopify hydrogen deploy
```

That creates a preview URL. To move `valuevaultshop.net` across, point the
domain at the Oxygen deployment in Shopify admin → Domains. Do that last, once
the real catalogue is connected and the pages have been clicked through — the
current Liquid theme keeps serving customers until the DNS is switched, so there
is no rush and no downtime.

## Before flipping the domain

- [x] Real products and collections appear on the homepage
- [x] `/collections/home-accessories` lists all 14 products
- [ ] Filter, sort and Load More all work on a category page
- [ ] A test order completes end to end through Shopify checkout
- [ ] Cart drawer, quantity steppers and remove all behave on a phone
- [ ] Policy pages render and say the same thing as `store-config.ts`
- [ ] Support email in the footer is monitored and replies land
- [ ] Header search suggests real products, and Enter reaches `/search`
- [ ] Person icon signs in end to end, and Orders lists a real order
- [x] `npm run build` passes (2026-08-28)
- [ ] Payouts un-paused — admin flagged "payouts paused due to insufficient
      funds" on 2026-08-28; the store cannot be paid until that is resolved
