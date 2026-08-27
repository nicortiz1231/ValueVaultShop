import {Link, redirect, useLoaderData} from 'react-router';
import type {Route} from './+types/collections.$handle';
import type {SiblingCollectionsQuery} from 'storefrontapi.generated';
import {getPaginationVariables, Analytics, Pagination} from '@shopify/hydrogen';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {anyProductHasSwatches, ProductCard} from '~/components/ProductCard';
import {
  CollectionControls,
  type FilterGroup,
} from '~/components/CollectionControls';
import {Container} from '~/components/ui/Container';
import {
  CollectionHeader,
  type CategoryCircle,
} from '~/components/CollectionHeader';
import {TrustPoints} from '~/components/TrustPoints';
import {categories, store} from '~/lib/store-config';
import {
  getFilterVariables,
  getSortVariables,
} from '~/lib/collection-filters';
import {COLLECTION_PRODUCT_FRAGMENT} from '~/lib/product-card-fragment';

export const meta: Route.MetaFunction = ({data}) => {
  const collection = data?.collection;
  return [
    {title: collection ? `${collection.title} | ${store.name}` : store.name},
    {
      name: 'description',
      content: collection?.description?.slice(0, 155) ?? store.description,
    },
  ];
};

export async function loader(args: Route.LoaderArgs) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return {...deferredData, ...criticalData};
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({context, params, request}: Route.LoaderArgs) {
  const {handle} = params;
  const {storefront} = context;

  if (!handle) {
    throw redirect('/collections');
  }

  const searchParams = new URL(request.url).searchParams;
  const filters = getFilterVariables(searchParams);
  const {sortKey, reverse} = getSortVariables(searchParams.get('sort_by'));

  // 24 fills six rows of the four-column desktop grid before the shopper has
  // to ask for more, which is roughly where the reference site's own first
  // page ends.
  const paginationVariables = getPaginationVariables(request, {pageBy: 24});

  const [{collection}, countResult, siblingResult] = await Promise.all([
    storefront.query(COLLECTION_QUERY, {
      variables: {handle, filters, sortKey, reverse, ...paginationVariables},
    }),
    // The Storefront API exposes no total on a collection's products
    // connection, and the reference bar shows "N Products" -- so the count
    // comes from a second, deliberately skinny query that asks only for ids
    // under the same filters. It runs in parallel, so it costs no wall time.
    storefront
      .query(COLLECTION_COUNT_QUERY, {variables: {handle, filters}})
      .catch(() => null),
    // Images for the circular category row. Failing this must not take the
    // page down -- the row simply falls back to plain circles.
    storefront.query(SIBLING_COLLECTIONS_QUERY).catch(() => null),
  ]);

  if (!collection) {
    throw new Response(`Collection ${handle} not found`, {
      status: 404,
    });
  }

  // The API handle might be localized, so redirect to the localized handle
  redirectIfHandleIsLocalized(request, {handle, data: collection});

  const countNodes = countResult?.collection?.products.nodes;

  return {
    collection,
    filters: normalizeFilters(collection.products.filters),
    // Deliberately null rather than 0 when the count query failed: the bar
    // hides the number entirely rather than claiming an empty collection.
    productCount: countNodes ? countNodes.length : null,
    // Siblings, for the circular category row under the title. Built from the
    // store's own category list rather than from Shopify, so its order is
    // stable; Shopify is consulted only for each one's image.
    siblings: buildSiblings(handle, siblingResult),
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context}: Route.LoaderArgs) {
  return {};
}

/** The store's categories minus the current one, each with its image. */
function buildSiblings(
  handle: string,
  result: SiblingCollectionsQuery | null,
): CategoryCircle[] {
  const images = new Map(
    (result?.collections.nodes ?? []).map((node) => [
      node.handle,
      node.image ?? node.products.nodes[0]?.featuredImage ?? null,
    ]),
  );

  return categories
    .filter((category) => category.handle !== handle)
    .map((category) => ({
      title: category.title,
      handle: category.handle,
      image: images.get(category.handle) ?? null,
    }));
}

/**
 * Trims Shopify's filter payload to what the drawer draws.
 *
 * Filter values with a zero count are kept -- the drawer dims them -- but a
 * whole group in which nothing is available is dropped, since an accordion
 * that can only ever return no results is just an extra tap.
 */
function normalizeFilters(
  filters: {
    id: string;
    label: string;
    type: string;
    values: {id: string; label: string; count: number; input: unknown}[];
  }[],
): FilterGroup[] {
  return filters
    .map((filter) => ({
      id: filter.id,
      label: filter.label,
      type: filter.type,
      values: filter.values.map((value) => ({
        id: value.id,
        label: value.label,
        count: value.count,
        input: String(value.input),
      })),
    }))
    .filter(
      (filter) =>
        filter.values.length > 0 &&
        (filter.type === 'PRICE_RANGE' ||
          filter.values.some((value) => value.count > 0)),
    );
}

export default function Collection() {
  const {collection, filters, productCount, siblings} =
    useLoaderData<typeof loader>();

  return (
    <>
      <CollectionHeader
        title={collection.title}
        description={collection.description}
        categories={siblings}
      />

      {/* `sp-sm spt-no` on the reference: no padding above (the title section
          has already provided it), 36px below, growing to 48/60 on wider
          screens. */}
      <Container width="full" className="pb-9 min-[1024px]:pb-12 min-[1440px]:pb-15">
        <CollectionControls filters={filters} productCount={productCount} />

        {collection.products.nodes.length === 0 ? (
          <EmptyState hasFilters={filters.length > 0} />
        ) : (
          <Pagination connection={collection.products}>
            {({nodes, isLoading, hasNextPage, NextLink, PreviousLink}) => {
              const reserveSwatchRow = anyProductHasSwatches(nodes);

              return (
                <div className="pt-5">
                  <div className="flex justify-center empty:hidden">
                    <PreviousLink className={pagerLink}>
                      {isLoading ? 'Loading…' : 'Load previous'}
                    </PreviousLink>
                  </div>

                  {/* The reference's grid, exactly: two up on a phone and
                      four from 1024, with an 8px column gutter (its `.row`
                      -4px margin against `.col-*` 4px padding) and a row gap
                      that steps 20 -> 12 -> 20 -> 24 across its breakpoints. */}
                  <div className="grid grid-cols-2 gap-x-2 gap-y-5 min-[1024px]:grid-cols-4 min-[1024px]:gap-y-3 min-[1440px]:gap-y-5 min-[1920px]:gap-y-6">
                    {nodes.map((product, index) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        reserveSwatchRow={reserveSwatchRow}
                        loading={index < 8 ? 'eager' : undefined}
                      />
                    ))}
                  </div>

                  {hasNextPage && (
                    <div className="mt-10 flex justify-center">
                      <NextLink className={pagerLink}>
                        {isLoading ? 'Loading…' : 'Load More'}
                      </NextLink>
                    </div>
                  )}
                </div>
              );
            }}
          </Pagination>
        )}
      </Container>

      {/* Repeat the guarantees at the bottom of a browse session, where the
          shopper is deciding whether to commit to an unfamiliar store. */}
      <TrustPoints />
      <Analytics.CollectionView
        data={{
          collection: {
            id: collection.id,
            handle: collection.handle,
          },
        }}
      />
    </>
  );
}

const pagerLink =
  'type-p2 inline-flex h-11 items-center justify-center rounded-[4px] border border-ink px-8 font-medium text-ink transition-colors hover:bg-ink hover:text-bg';

function EmptyState({hasFilters}: {hasFilters: boolean}) {
  return (
    <div className="py-20 text-center">
      <p className="type-p2 text-ink-muted">
        {hasFilters
          ? 'No products match these filters.'
          : 'There is nothing in this collection just yet.'}
      </p>
      <Link
        to="/collections/all"
        className="type-p2 mt-4 inline-block font-medium text-brand underline underline-offset-4"
      >
        Browse everything instead
      </Link>
    </div>
  );
}

// NOTE: https://shopify.dev/docs/api/storefront/latest/objects/collection
const COLLECTION_QUERY = `#graphql
  ${COLLECTION_PRODUCT_FRAGMENT}
  query Collection(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
    $filters: [ProductFilter!]
    $sortKey: ProductCollectionSortKeys
    $reverse: Boolean
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      image {
        id
        url
        altText
        width
        height
      }
      products(
        first: $first,
        last: $last,
        before: $startCursor,
        after: $endCursor,
        filters: $filters,
        sortKey: $sortKey,
        reverse: $reverse
      ) {
        nodes {
          ...CollectionProduct
        }
        # The facets the merchant has switched on in Search & Discovery. Asking
        # Shopify for them is what keeps the filter drawer honest about this
        # collection rather than showing a hardcoded guess.
        filters {
          id
          label
          type
          values {
            id
            label
            count
            input
          }
        }
        pageInfo {
          hasPreviousPage
          hasNextPage
          endCursor
          startCursor
        }
      }
    }
  }
` as const;

/** Collection images for the circular category row under the title. */
const SIBLING_COLLECTIONS_QUERY = `#graphql
  query SiblingCollections($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    collections(first: 100) {
      nodes {
        id
        handle
        image {
          id
          url
          altText
          width
          height
        }
        # Fallback for a collection the merchant never gave an image. An empty
        # circle in the category row reads as a broken image, so borrow the
        # first product's photo rather than render a blank.
        products(first: 1) {
          nodes {
            id
            featuredImage {
              id
              url
              altText
              width
              height
            }
          }
        }
      }
    }
  }
` as const;

/**
 * Ids only, purely to count the filtered result set for the "N Products"
 * readout. 250 is the Storefront API's per-page ceiling; a category larger
 * than that would under-report, which is a problem worth having.
 */
const COLLECTION_COUNT_QUERY = `#graphql
  query CollectionCount(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
    $filters: [ProductFilter!]
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      products(first: 250, filters: $filters) {
        nodes {
          id
        }
      }
    }
  }
` as const;
