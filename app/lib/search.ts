import type {
  PredictiveSearchQuery,
  RegularSearchQuery,
} from 'storefrontapi.generated';

/**
 * Whether search may reach into blog articles and pages, or products only.
 *
 * Shopify gates `Article` and `Page` fields behind the
 * `unauthenticated_read_content` access scope, which a storefront token does
 * not carry unless it is granted in the Shopify admin. Asking for them
 * without it does not degrade politely -- the API rejects the whole query, so
 * a request that would have returned every matching product returns nothing
 * at all, and `storefront.query` throws before this route can salvage it.
 * That is why typing in the header search used to replace the page with an
 * error screen on a store whose token was scoped to products.
 *
 * So both fields are requested through `@include(if:)` in the queries below
 * and this is the switch. Off, search covers products, collections and query
 * suggestions -- every result a catalogue storefront has to show.
 *
 * It is ON: the Headless channel storefront carries
 * `unauthenticated_read_content`, and `hydrogen env pull` on 2026-08-28
 * replaced the old theme-scraped token with one that has it. Article and page
 * hits now appear in both the header dropdown and /search. Turning this back
 * off is only correct if that scope is ever revoked -- the two go together.
 */
export const SEARCH_CONTENT = true;

type ResultWithItems<Type extends 'predictive' | 'regular', Items> = {
  type: Type;
  term: string;
  error?: string;
  result: {total: number; items: Items};
};

export type RegularSearchReturn = ResultWithItems<
  'regular',
  RegularSearchQuery
>;
export type PredictiveSearchReturn = ResultWithItems<
  'predictive',
  // `Required`, because [SEARCH_CONTENT] makes `articles` and `pages`
  // optional on the query type -- they are absent from the response when the
  // flag skips them. The loader fills both back in from
  // [getEmptyPredictiveSearchResult] before returning, so every consumer can
  // still count on all five groups being there.
  Required<NonNullable<PredictiveSearchQuery['predictiveSearch']>>
>;

/**
 * Returns the empty state of a predictive search result to reset the search state.
 */
export function getEmptyPredictiveSearchResult(): PredictiveSearchReturn['result'] {
  return {
    total: 0,
    items: {
      articles: [],
      collections: [],
      products: [],
      pages: [],
      queries: [],
    },
  };
}

interface UrlWithTrackingParams {
  /** The base URL to which the tracking parameters will be appended. */
  baseUrl: string;
  /** The trackingParams returned by the Storefront API. */
  trackingParams?: string | null;
  /** Any additional query parameters to be appended to the URL. */
  params?: Record<string, string>;
  /** The search term to be appended to the URL. */
  term: string;
}

/**
 * A utility function that appends tracking parameters to a URL. Tracking parameters are
 * used internally by Shopify to enhance search results and admin dashboards.
 * @example
 * ```ts
 * const baseUrl = 'www.example.com';
 * const trackingParams = 'utm_source=shopify&utm_medium=shopify_app&utm_campaign=storefront';
 * const params = { foo: 'bar' };
 * const term = 'search term';
 * const url = urlWithTrackingParams({ baseUrl, trackingParams, params, term });
 * console.log(url);
 * // Output: 'https://www.example.com?foo=bar&q=search%20term&utm_source=shopify&utm_medium=shopify_app&utm_campaign=storefront'
 * ```
 */
export function urlWithTrackingParams({
  baseUrl,
  trackingParams,
  params: extraParams,
  term,
}: UrlWithTrackingParams) {
  let search = new URLSearchParams({
    ...extraParams,
    q: encodeURIComponent(term),
  }).toString();

  if (trackingParams) {
    search = `${search}&${trackingParams}`;
  }

  return `${baseUrl}?${search}`;
}
