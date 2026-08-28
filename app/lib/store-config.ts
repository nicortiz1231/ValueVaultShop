/**
 * Every factual claim the storefront makes about Value Vault lives here.
 *
 * Rule of thumb: if it is a promise to a customer, it belongs in this file and
 * nowhere else. That keeps the marketing copy and the policy pages from
 * drifting apart, which is one of the fastest ways for a store to look
 * untrustworthy.
 *
 * Anything set to `null` is deliberately not rendered. Do not replace a `null`
 * with a plausible-sounding guess — an unanswered phone number or an address
 * that does not exist does more damage than an omission.
 */

export const store = {
  name: 'Value Vault',
  tagline: 'Useful things, fair prices, no fuss.',
  description:
    'Everyday essentials for home, kitchen, pets and family — curated, honestly priced, and backed by a 30-day return policy.',
  domain: 'valuevaultshop.net',
} as const;

/**
 * Support details.
 *
 * TODO(steven): `email` is currently a personal Gmail address, which is the
 * single weakest trust signal on the site — cold visitors read a free mailbox
 * as "this is not a real business". Setting up support@valuevaultshop.net
 * costs nothing on most domain hosts and is the highest-value fix available.
 *
 * TODO(steven): add `phone` and `address` once there is a number that gets
 * answered and an address you are willing to publish. Both render only when
 * set, so leaving them null is safe.
 */
export const support = {
  email: 'stevenortiz90@gmail.com',
  phone: null as string | null,
  address: null as string | null,
  /** Stated response time. Keep this one conservative and beatable. */
  responseTime: 'within 24 hours',
} as const;

/**
 * Shipping facts, mirrored from /policies/shipping-policy.
 *
 * TODO(steven): `deliveryEstimate` is the one number the policy page does not
 * currently state. Cold traffic assumes the worst when a store is vague about
 * delivery. A specific honest window — even a long one — converts better than
 * silence, so fill this in and update the policy page to match.
 */
export const shipping = {
  processingTime: '1–3 business days',
  deliveryEstimate: null as string | null,
  tracking: true,
  /** Set to a number (in USD) once free shipping is actually offered. */
  freeShippingThreshold: null as number | null,
} as const;

/** Returns, mirrored from /policies/refund-policy. */
export const returns = {
  windowDays: 30,
  /** Value Vault pays return postage — a genuinely strong signal, so say it. */
  freeReturnShipping: true,
  refundTimeframe: '10 business days',
} as const;

/**
 * Reviews are intentionally switched off.
 *
 * The review UI is built and ready, but rendering invented ratings is exactly
 * what makes a store read as a scam. Install a review app (Judge.me, Loox,
 * Okendo), wire `app/lib/reviews.ts` to it, and flip this to `true` once real
 * customer reviews exist.
 */
export const reviews = {
  enabled: false,
} as const;

/**
 * Social profiles, shown in the footer's "Follow us" block.
 *
 * Empty on purpose, and the whole block is hidden while it stays empty. A
 * footer icon pointing at a profile that does not exist is a dead end, and an
 * obvious one -- add entries here only once the accounts are real.
 */
export const social: {name: 'Instagram' | 'Facebook'; url: string}[] = [];

/**
 * Payment methods shown in the footer.
 *
 * TODO(steven): confirm this list against Shopify admin → Settings → Payments
 * before launch. These are the defaults that ship with Shopify Payments, but
 * advertising a method you do not actually accept is a broken promise at the
 * worst possible moment — the checkout button.
 */
export const paymentMethods = [
  'Visa',
  'Mastercard',
  'Amex',
  'Discover',
  'Shop Pay',
  'Apple Pay',
  'Google Pay',
] as const;

type NavLink = {title: string; url: string};

/**
 * The header navigation, top level.
 *
 * This is the live valuevaultshop.net header, verbatim -- the Shopify menu
 * is not consulted for it, so what a visitor sees does not depend on which
 * storefront this build happens to be linked to. `panel` names the dropdown
 * an item opens: 'shop' is the full-width mega menu (see [shopByMenu] for
 * what is in it), 'order' the small tracking form.
 */
export const navigation: (NavLink & {panel?: 'shop' | 'order'})[] = [
  {title: 'Home', url: '/'},
  // The real site's "Shop" is a disclosure with no destination of its own.
  // Ours points somewhere so that following it by keyboard, or tapping it on
  // a phone, is not a dead end.
  {title: 'Shop', url: '/collections', panel: 'shop'},
  {title: 'About Us', url: '/pages/about-us'},
  {title: 'Contact Us', url: '/pages/contact'},
  // A Shopify app proxy on the live site. Hydrogen has no proxy routes, so
  // this needs a real destination before launch -- which is also why its
  // panel cannot return a real shipment status. See OrderLookupMenu.
  {title: 'Order Look Up', url: '/apps/trackingmore', panel: 'order'},
];

/**
 * The store's categories -- the live valuevaultshop.net "Shop" menu, in its
 * own order.
 *
 * One list feeds the Shop dropdown, the /collections page and the footer, so
 * there is a single place to edit when the real store's categories change.
 * `handle` must match a real Shopify collection handle.
 */
export const categories = [
  {
    title: 'Best Selling',
    handle: 'best-selling',
    blurb: 'What everyone else is buying',
  },
  {
    title: 'Trending Now',
    handle: 'trending-now',
    blurb: 'Picking up speed right now',
  },
  {
    title: 'Kitchen Accessories',
    handle: 'kitchen-accessories',
    blurb: 'Tools that earn their drawer space',
  },
  {
    title: 'Home Accessories',
    handle: 'home-accessories',
    blurb: 'Small upgrades for everyday rooms',
  },
  {
    title: 'Pet Accessories',
    handle: 'pet-accessories',
    blurb: 'For the other members of the household',
  },
  {
    title: 'Kids & Babies',
    handle: 'kids-babies',
    blurb: 'Practical things for busy parents',
  },
] as const;

/**
 * The "Shop" dropdown -- the panel behind the one nav item that has one.
 *
 * A port of the reference site's own `mega-dropdown`: link groups on the
 * left under small grey labels, and image banners filling the right half.
 *
 * Its links are [categories], so the dropdown and the rest of the site can
 * never drift apart. Those handles are the real store's, not the demo
 * catalogue the dev storefront is currently linked to, so they 404 locally
 * until this project points at the real store. `banners` name collection
 * handles and the header query pulls their Shopify collection images.
 */
export const shopByMenu = {
  groups: [
    {
      title: 'Category',
      links: categories.map((category) => ({
        title: category.title,
        url: `/collections/${category.handle}`,
      })),
    },
  ],
  /** Two, to match the reference's `banner-small` pair. */
  banners: [
    {title: 'Kitchen Accessories', handle: 'kitchen-accessories'},
    {title: 'Home Accessories', handle: 'home-accessories'},
  ],
};

/**
 * Homepage FAQ. These answer the questions a first-time visitor from social
 * actually has — "is this real, when does it arrive, can I send it back".
 * Every answer here must stay true to the policy pages.
 */
export const faqs = [
  {
    question: 'Is Value Vault a real store?',
    answer:
      'Yes. Value Vault is a small independent shop run by a real team. Checkout is handled by Shopify, so your card details go straight to Shopify’s payment processor and are never stored by us. Every order gets a confirmation email and a tracking number.',
  },
  {
    question: 'When will my order arrive?',
    answer:
      'Orders are processed and shipped within 1–3 business days. You will get a tracking link by email as soon as your parcel leaves the warehouse, so you can follow it the whole way.',
  },
  {
    question: 'What if I do not like it?',
    answer:
      'You have 30 days from delivery to request a return, and we pay the return postage — we send you a prepaid label. Once your return arrives, your refund goes back to your original payment method within 10 business days.',
  },
  {
    question: 'How do I get help with an order?',
    answer: `Email us and a person will get back to you ${support.responseTime}. If something has gone wrong with your order, tell us the order number and we will sort it out.`,
  },
] as const;
