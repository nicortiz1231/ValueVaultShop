/**
 * Brand photography -- the images that are the storefront's own, not the
 * catalogue's.
 *
 * Why this file exists: the hero and the full-bleed promo banner were being
 * fed Shopify *collection* images, and those are small. The real store's
 * collection images run 600x600 to 1080x1080, while the hero paints each half
 * at roughly 720 CSS px wide (about 1440 device px on a retina screen) and the
 * promo banner spans the full viewport. A 600px source stretched across 1440px
 * at 2x is close to a five-times upscale, which is exactly why those sections
 * looked soft and blocky while the product grid -- where the same photos are
 * shown small -- looked fine.
 *
 * So the big editorial slots get proper wide-format photography, sized for the
 * job, and product photography stays where it belongs: on product cards.
 *
 * ---------------------------------------------------------------------------
 * Licence
 * ---------------------------------------------------------------------------
 * Every photograph here is from Unsplash and is used under the Unsplash
 * Licence, which permits commercial use with no attribution required and no
 * fee:
 * https://unsplash.com/license
 *
 * The `source` on each entry is the original photo, kept so the provenance is
 * checkable rather than a mystery JPEG in a folder. The files are downloaded
 * into `public/images/` rather than hotlinked, so the storefront does not
 * depend on a third party's CDN staying up or its URLs staying stable.
 *
 * Two caveats worth knowing before launch:
 *
 *   1. The Unsplash Licence does not permit selling an unmodified copy of the
 *      photo itself, and it does not grant trademark or model releases. These
 *      are interior scenes with no identifiable people, which is the safe end
 *      of that, but a lawyer's read beats mine.
 *   2. Stock photography is a stand-in. Genuine photographs of the real
 *      products in a real room outperform stock on a store whose main job is
 *      convincing a stranger it is a real business -- replace these when there
 *      is budget for a shoot.
 */

export type SiteImage = {
  /** Path under `public/`, served from the site root. */
  src: string;
  width: number;
  height: number;
  alt: string;
  /** Original photo page, for licence provenance. */
  source: string;
};

/**
 * The hero: one full-bleed photograph, not a pair.
 *
 * The reference site splits its hero into two images either side of a seam.
 * This storefront deliberately does not -- a single uninterrupted room reads
 * as one considered space, where two unrelated halves read as two thumbnails
 * pushed together.
 *
 * Two crops of the same photograph rather than one stretched file: a phone
 * showing the wide crop would either letterbox it or crop the sides away, and
 * would download 2880px of image to paint about 390. The <picture> element in
 * Hero.tsx picks between them at 600px.
 */
export const heroImage: {portrait: SiteImage; wide: SiteImage} = {
  portrait: {
    src: '/images/hero-living.jpg',
    width: 1600,
    height: 1733,
    alt: 'A warm living room with a linen sofa, wooden table and tall windows',
    source:
      'https://unsplash.com/photos/white-and-brown-living-room-set-dd6b41faaea6',
  },
  wide: {
    src: '/images/hero-living-wide.jpg',
    width: 2880,
    height: 1560,
    alt: 'A warm living room with a linen sofa, wooden table and tall windows',
    source:
      'https://unsplash.com/photos/white-and-brown-living-room-set-dd6b41faaea6',
  },
};

/** The full-bleed "Useful things, fair prices" banner. */
export const promoImage: SiteImage = {
  src: '/images/promo-kitchen.jpg',
  width: 2880,
  height: 1350,
  // Decorative: the headline stacked over it already carries the meaning, so
  // announcing the scenery to a screen reader would only add noise.
  alt: '',
  source:
    'https://unsplash.com/photos/peppermill-beside-cooking-pots-d5b604d0c90d',
};

/**
 * The grid banner's three editorial cards.
 *
 * These cards link to /collections, /policies and /blogs/news -- they are
 * signposts, not collection tiles. They were being fed `collections[4]`,
 * `[5]` and `[6]` from the homepage query, which is how they ended up blank:
 * in the store's UPDATED_AT order those three positions are Best Selling,
 * Gift Ideas and Kitchen Gadgets Under $20, and none of the three has a
 * collection image. Even with images they would have been wrong -- a photo of
 * whichever collection happened to sort fifth says nothing about "returns".
 *
 * Each is cropped to its card's own aspect ratio (the section deliberately
 * runs three different ones) at roughly 2x the widest rendered size, so the
 * browser is not downscaling a 7680px original into a 600px card.
 */
export const gridImages: {
  shelf: SiteImage;
  parcel: SiteImage;
  journal: SiteImage;
} = {
  // "Browse every category" -- 1:1.
  shelf: {
    src: '/images/grid-shelf.jpg',
    width: 1200,
    height: 1200,
    // Decorative on all three: each card's own title and line of copy carry
    // the meaning, so describing the scenery would only add noise.
    alt: '',
    source:
      'https://unsplash.com/photos/white-wooden-shelf-with-assorted-items-TbWzzDaqgRE',
  },
  // "Returns without a fight" -- 1:1.16835.
  parcel: {
    src: '/images/grid-parcel.jpg',
    width: 1200,
    height: 1402,
    alt: '',
    source:
      'https://unsplash.com/photos/a-pile-of-brown-paper-packages-WYJrRinnABY',
  },
  // "From the journal" -- 1:0.8092.
  journal: {
    src: '/images/grid-journal.jpg',
    width: 1200,
    height: 971,
    alt: '',
    source:
      'https://unsplash.com/photos/notebook-and-coffee-on-a-wooden-table-S2frPlgkA5M',
  },
};
