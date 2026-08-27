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
