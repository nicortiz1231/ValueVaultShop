/**
 * Collection filtering and sorting, translated between the URL and Shopify.
 *
 * The reference storefront (kaleidojewellery.com) keeps its whole filter state
 * in the query string using Shopify's own native parameter names --
 * `?filter.v.availability=1&filter.v.price.lte=50&sort_by=price-ascending`.
 * This file does the same, for two reasons that matter more than fashion:
 *
 *   1. Filtered views are real URLs. They can be linked, bookmarked, shared,
 *      opened in a new tab and crawled, and the browser Back button walks back
 *      through them. None of that is true of filter state held in React state.
 *   2. The filtering happens in Shopify, not in the browser, so it is correct
 *      across pagination. Filtering an already-loaded page of products in the
 *      client silently lies whenever a collection is longer than one page.
 *
 * The available filters themselves are never hardcoded: Shopify returns them
 * on the products connection (`products.filters`), driven by whatever the
 * merchant has switched on in Search & Discovery. So the drawer shows exactly
 * the facets the real store has, and gains new ones without a code change.
 */

import type {
  ProductCollectionSortKeys,
  ProductFilter,
} from '@shopify/hydrogen/storefront-api-types';

/** The sort options, in the reference site's own order and wording. */
export const SORT_OPTIONS = [
  {value: 'best-selling', label: 'Best Selling'},
  {value: 'created-descending', label: 'Newest'},
  {value: 'price-ascending', label: 'Price: Low to High'},
  {value: 'price-descending', label: 'Price: High to Low'},
] as const;

export type SortValue = (typeof SORT_OPTIONS)[number]['value'];

/**
 * `sort_by` in the URL to the `sortKey`/`reverse` pair the Storefront API wants.
 *
 * An unrecognised or absent value falls through to COLLECTION_DEFAULT, which is
 * the merchant's own manual ordering in the Shopify admin -- the right default,
 * because a merchant who has bothered to order a collection by hand has said
 * something about it that no algorithm knows.
 */
export function getSortVariables(sort: string | null): {
  sortKey: ProductCollectionSortKeys;
  reverse: boolean;
} {
  switch (sort) {
    case 'best-selling':
      return {sortKey: 'BEST_SELLING', reverse: false};
    case 'created-descending':
      return {sortKey: 'CREATED', reverse: true};
    case 'price-ascending':
      return {sortKey: 'PRICE', reverse: false};
    case 'price-descending':
      return {sortKey: 'PRICE', reverse: true};
    default:
      return {sortKey: 'COLLECTION_DEFAULT', reverse: false};
  }
}

export const PRICE_MIN_PARAM = 'filter.v.price.gte';
export const PRICE_MAX_PARAM = 'filter.v.price.lte';

/**
 * Reads the query string into the `filters` argument of the products query.
 *
 * Only parameters this function recognises are forwarded. An unknown or
 * malformed `filter.*` param is dropped rather than guessed at, so a mangled
 * URL degrades to a less-filtered collection instead of a 500.
 */
export function getFilterVariables(searchParams: URLSearchParams): ProductFilter[] {
  const filters: ProductFilter[] = [];

  // Price is a single range filter assembled from up to two params, so it is
  // handled before the per-param loop rather than inside it.
  const min = toPositiveNumber(searchParams.get(PRICE_MIN_PARAM));
  const max = toPositiveNumber(searchParams.get(PRICE_MAX_PARAM));
  if (min !== null || max !== null) {
    filters.push({
      price: {
        ...(min !== null ? {min} : {}),
        ...(max !== null ? {max} : {}),
      },
    });
  }

  for (const [key, value] of searchParams.entries()) {
    if (!value) continue;
    const filter = paramToFilter(key, value);
    if (filter) filters.push(filter);
  }

  return filters;
}

/** One `filter.*` query param to one `ProductFilter`, or null if unrecognised. */
function paramToFilter(key: string, value: string): ProductFilter | null {
  if (key === PRICE_MIN_PARAM || key === PRICE_MAX_PARAM) return null;

  switch (key) {
    case 'filter.v.availability':
      return {available: value === '1' || value === 'true'};
    case 'filter.p.product_type':
      return {productType: value};
    case 'filter.p.vendor':
      return {productVendor: value};
    case 'filter.p.tag':
      return {tag: value};
    default:
      break;
  }

  // `filter.v.option.<name>=<value>` -- variant options (Colour, Size, ...).
  const option = key.match(/^filter\.v\.option\.(.+)$/);
  if (option) {
    return {variantOption: {name: option[1], value}};
  }

  // `filter.p.m.<namespace>.<key>` and its variant-level twin. Metafield
  // filters are how merchants add their own facets, so they are worth
  // supporting generically rather than one hardcoded namespace at a time.
  const productMeta = key.match(/^filter\.p\.m\.([^.]+)\.(.+)$/);
  if (productMeta) {
    return {
      productMetafield: {
        namespace: productMeta[1],
        key: productMeta[2],
        value,
      },
    };
  }

  const variantMeta = key.match(/^filter\.v\.m\.([^.]+)\.(.+)$/);
  if (variantMeta) {
    return {
      variantMetafield: {
        namespace: variantMeta[1],
        key: variantMeta[2],
        value,
      },
    };
  }

  return null;
}

/**
 * The reverse trip: a Shopify `FilterValue.input` back to the query param that
 * represents it.
 *
 * Shopify hands each filter value the exact `ProductFilter` JSON that selects
 * it. Deriving the checkbox's param from that -- rather than from the value's
 * label -- is what keeps the drawer correct for facets this code has never
 * seen, including ones the merchant adds after launch.
 */
export function inputToParam(
  input: string,
): {key: string; value: string} | null {
  let parsed: ProductFilter;
  try {
    parsed = JSON.parse(input) as ProductFilter;
  } catch {
    return null;
  }

  if (typeof parsed.available === 'boolean') {
    return {key: 'filter.v.availability', value: parsed.available ? '1' : '0'};
  }
  if (parsed.productType) {
    return {key: 'filter.p.product_type', value: parsed.productType};
  }
  if (parsed.productVendor) {
    return {key: 'filter.p.vendor', value: parsed.productVendor};
  }
  if (parsed.tag) {
    return {key: 'filter.p.tag', value: parsed.tag};
  }
  if (parsed.variantOption) {
    return {
      key: `filter.v.option.${parsed.variantOption.name}`,
      value: parsed.variantOption.value,
    };
  }
  if (parsed.productMetafield) {
    const {namespace, key, value} = parsed.productMetafield;
    return {key: `filter.p.m.${namespace}.${key}`, value};
  }
  if (parsed.variantMetafield) {
    const {namespace, key, value} = parsed.variantMetafield;
    return {key: `filter.v.m.${namespace}.${key}`, value};
  }

  // Price arrives as a range rather than a discrete value; the drawer renders
  // it with its own min/max inputs, so there is no checkbox to derive.
  return null;
}

function toPositiveNumber(value: string | null): number | null {
  if (value === null || value.trim() === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}
