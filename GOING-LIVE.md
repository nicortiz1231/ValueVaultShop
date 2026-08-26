# Going live

The storefront is built and runs against Shopify's `mock.shop` demo catalogue,
which is why the products currently look like apparel. Nothing below is
optional-but-nice — these are the steps between here and taking real orders.

---

## 1. Connect the real store

This is the only step that swaps the demo catalogue for Value Vault's actual
products. Everything else on this list can wait; this one cannot.

```bash
npx shopify hydrogen link      # pick the Value Vault storefront
npx shopify hydrogen env pull  # writes real tokens into .env
npm run dev
```

`hydrogen link` requires the Headless channel on the Shopify store. If it is not
installed yet: Shopify admin → Sales channels → add **Headless** → create a
storefront → it issues the Storefront API tokens that `env pull` then fetches.

`.env` is gitignored. This repository is public, so never commit it — if a token
does get pushed, rotate it in the Headless channel rather than just deleting the
commit.

## 2. Check the collection handles

`app/lib/store-config.ts` assumes these four collection handles exist:

| Expected handle | Shown as |
| --- | --- |
| `kitchen-accessories` | Kitchen |
| `home-accessories` | Home |
| `pet-accessories` | Pets |
| `kids-babies` | Kids & Baby |

The homepage tiles are driven by whatever collections Shopify actually returns,
so a mismatch will not break the page — but the hand-written blurbs only attach
when a handle lines up. Confirm them in Shopify admin → Products → Collections
and correct the file if they differ.

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

- [ ] Real products and collections appear on the homepage
- [ ] A test order completes end to end through Shopify checkout
- [ ] Cart drawer, quantity steppers and remove all behave on a phone
- [ ] Policy pages render and say the same thing as `store-config.ts`
- [ ] Support email in the footer is monitored and replies land
- [ ] `npm run build` passes
