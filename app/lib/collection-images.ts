/**
 * Stand-in photography for collections that have no image in Shopify admin.
 *
 * Several of the store's collections are curated by hand and have never had a
 * collection image uploaded, so anywhere the site draws a collection tile they
 * came out as empty rectangles. Each entry here is the lead photograph of a
 * product that collection actually contains, borrowed until someone with admin
 * access sets a real one.
 *
 * Unlike `~/lib/site-imagery`, these are catalogue images served from
 * Shopify's own CDN, not the storefront's own brand photography.
 *
 * Callers must check `collection.image` first and only fall back to this, so
 * a real collection image silently takes over the moment it exists and the
 * entry here can simply be deleted.
 */
export type CollectionImage = {
  url: string;
  altText: string;
  width: number;
  height: number;
};

const fallbacks: Record<string, CollectionImage> = {
  'trending-now': {
    // Silicone Pot Side Drain Stopper
    url: 'https://cdn.shopify.com/s/files/1/0597/8780/4751/files/0aef9f83-d674-4333-a71a-acf415d81eae.jpg?v=1719634025',
    altText: 'A silicone pot side drain stopper clipped to a saucepan',
    width: 800,
    height: 800,
  },
  'best-selling': {
    // Colorful Nordic Ceramic Flowerpot with Tray
    url: 'https://cdn.shopify.com/s/files/1/0597/8780/4751/files/1623914996785.jpg?v=1719635487',
    altText: 'Colourful Nordic ceramic flowerpots with matching trays',
    width: 750,
    height: 750,
  },
};

/** The stand-in for a collection handle, or null if it has none. */
export function collectionFallbackImage(
  handle: string,
): CollectionImage | null {
  return fallbacks[handle] ?? null;
}

/**
 * Images that REPLACE the collection image set in Shopify admin.
 *
 * The opposite of `fallbacks` above, and the opposite of that rule: an entry
 * here wins over admin, so setting a collection image in Shopify will NOT
 * change what the site shows for these handles. That is a sharp edge, so keep
 * this list short and say why each entry is here.
 *
 * The right fix for any of these is to upload the image to the collection in
 * Shopify admin and delete the entry -- then admin is the source of truth
 * again, as it is for every other collection.
 */
const overrides: Record<string, CollectionImage> = {
  'pet-accessories': {
    // Nordic Style Pet Feeding Bowl with Stand, second product image. Asked
    // for over the collection's own admin image, which is a pet hair brush.
    // Note this one carries burnt-in marketing text ("Protect your pet's
    // neck", a 15 degree callout) that the tile crop can cut through.
    url: 'https://cdn.shopify.com/s/files/1/0597/8780/4751/files/18298015-a561-4d09-a87b-57738c035719.jpg?v=1719639481',
    altText:
      'A cat eating from a raised Nordic-style pet bowl, captioned "Protect your pet\'s neck"',
    width: 800,
    height: 800,
  },
};

/**
 * The image to show for a collection, in priority order: an override here,
 * then the one set in Shopify admin, then a stand-in borrowed from a product
 * it contains, then nothing.
 *
 * Every surface that draws a collection tile should go through this, so one
 * collection never appears two different ways on two different pages.
 */
export function resolveCollectionImage<T>(
  handle: string,
  shopifyImage: T | null | undefined,
): T | CollectionImage | null {
  return overrides[handle] ?? shopifyImage ?? fallbacks[handle] ?? null;
}
