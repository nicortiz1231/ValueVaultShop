/**
 * Product description HTML arrives from Shopify exactly as the merchant -- or,
 * for this catalogue, a dropshipping import -- wrote it, and some of it points
 * at images the storefront is not allowed to load.
 *
 * `entry.server.tsx` sets no `img-src`, so images fall back to `default-src`:
 * `'self'`, `cdn.shopify.com` and `shopify.com`. An image hosted anywhere else
 * is refused by the browser and draws a broken-image icon instead. The files
 * themselves are usually fine -- the supplier images on the starry-sky
 * projection lamp return HTTP 200 -- it is this storefront's own policy that
 * will not display them, so they can never be anything but broken icons no
 * matter how many times the page is loaded.
 *
 * The other way to fix that is to widen the CSP to name the supplier's CDN.
 * Deliberately not done: it would put the dropshipping supplier's domain in
 * front of shoppers in view-source, and make product pages depend on the
 * uptime of a host nobody here controls.
 *
 * Note this drops only what could never have rendered. An image added through
 * Shopify's own editor is served from `cdn.shopify.com`, is allowed by the
 * policy, and is left alone -- so a merchant can still illustrate a
 * description, and this file needs no maintenance when they do.
 */

/** Hosts the storefront's CSP will actually load an image from. */
const ALLOWED_IMAGE_HOSTS = ['cdn.shopify.com', 'shopify.com'];

/** Whether the CSP would let the browser paint this `src`. */
function isDisplayable(src: string): boolean {
  const value = src.trim();
  if (!value) return false;

  // A relative or root-relative path resolves against this origin, which the
  // policy's `'self'` covers.
  const hasScheme = /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(value);
  if (!hasScheme && !value.startsWith('//')) return true;

  let url: URL;
  try {
    // The base only matters for `//host/path`; absolute URLs ignore it.
    url = new URL(value, 'https://storefront.invalid');
  } catch {
    return false;
  }

  // `data:` and `blob:` are not in the policy either, so they are no more
  // displayable than a foreign host.
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return false;

  return ALLOWED_IMAGE_HOSTS.some(
    (host) => url.hostname === host || url.hostname.endsWith(`.${host}`),
  );
}

/**
 * Matches a whole `<img>` tag. Shopify's description HTML quotes its
 * attributes, so the naive "no `>` until the end" rule is safe on this input.
 */
const IMG_TAG = /<img\b[^>]*>/gi;
const SRC_ATTR = /\ssrc\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i;

/**
 * Removes the images in a description that the CSP would block, along with the
 * markup left holding nothing once they are gone.
 */
export function stripBlockedDescriptionImages(html: string): string {
  if (!html) return html;

  return (
    html
      .replace(IMG_TAG, (tag) => {
        const match = SRC_ATTR.exec(tag);
        const src = match ? (match[1] ?? match[2] ?? match[3] ?? '') : '';
        return isDisplayable(src) ? tag : '';
      })
      // A run of images typically follows a <br>. With the images gone those
      // breaks are trailing whitespace holding a paragraph open.
      .replace(/(?:\s*<br\s*\/?>)+(\s*(?:<\/p>|<\/div>|$))/gi, '$1')
      // And a paragraph that held nothing but images is now empty.
      .replace(
        /<(p|div|figure)\b[^>]*>(?:\s|&nbsp;|<br\s*\/?>)*<\/\1>/gi,
        '',
      )
  );
}
