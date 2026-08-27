import type {Route} from './+types/collections.all';
import {COLLECTION_PRODUCT_FRAGMENT} from '~/lib/product-card-fragment';
import {useLoaderData} from 'react-router';
import {getPaginationVariables} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {anyProductHasSwatches, ProductCard} from '~/components/ProductCard';
import {Container} from '~/components/ui/Container';
import {TrustPoints} from '~/components/TrustPoints';
import type {CollectionProductFragment} from 'storefrontapi.generated';
import {store} from '~/lib/store-config';

/**
 * The catalogue's three faces, chosen by `?sort=`.
 *
 * The header's "New In" and "Bestsellers" items point here rather than at
 * collections of their own: both are orderings of the same catalogue, and a
 * sort param keeps them true without a merchant having to hand-maintain two
 * more collections in the admin.
 */
const SORTS = {
  new: {
    sortKey: 'CREATED_AT',
    reverse: true,
    heading: 'New in',
    blurb: 'The most recent additions to the shelf, newest first.',
  },
  'best-selling': {
    sortKey: 'BEST_SELLING',
    reverse: false,
    heading: 'Bestsellers',
    blurb: 'What everyone else is buying, in order of how often it sells.',
  },
} as const;

const DEFAULT_VIEW = {
  heading: 'Everything we stock',
  blurb:
    'Every product here was picked by hand. If we would not use it ourselves, it does not make the shelf.',
};

type SortParam = keyof typeof SORTS;

function getSort(request: Request) {
  const sort = new URL(request.url).searchParams.get('sort');
  return sort && sort in SORTS ? SORTS[sort as SortParam] : null;
}

export const meta: Route.MetaFunction = ({data}) => {
  return [{title: `${data?.heading ?? DEFAULT_VIEW.heading} | ${store.name}`}];
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
async function loadCriticalData({context, request}: Route.LoaderArgs) {
  const {storefront} = context;
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 8,
  });
  const sort = getSort(request);

  const [{products}] = await Promise.all([
    storefront.query(CATALOG_QUERY, {
      variables: {
        ...paginationVariables,
        sortKey: sort?.sortKey,
        reverse: sort?.reverse,
      },
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);
  return {
    products,
    heading: sort?.heading ?? DEFAULT_VIEW.heading,
    blurb: sort?.blurb ?? DEFAULT_VIEW.blurb,
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

export default function Collection() {
  const {products, heading, blurb} = useLoaderData<typeof loader>();

  return (
    <>
      <Container className="py-10 sm:py-14">
        <header className="max-w-2xl">
          <h1 className="display text-3xl text-ink sm:text-4xl">{heading}</h1>
          <p className="mt-3.5 text-base leading-relaxed text-ink-muted">
            {blurb}
          </p>
        </header>

        <div className="mt-10">
          <PaginatedResourceSection<CollectionProductFragment>
            connection={products}
            resourcesClassName="grid grid-cols-2 gap-x-3 gap-y-8 lg:grid-cols-4 lg:gap-y-10"
          >
            {({node: product, index, nodes}) => (
              <ProductCard
                key={product.id}
                product={product}
                reserveSwatchRow={anyProductHasSwatches(nodes)}
                loading={index < 8 ? 'eager' : undefined}
              />
            )}
          </PaginatedResourceSection>
        </div>
      </Container>

      <TrustPoints />
    </>
  );
}

// NOTE: https://shopify.dev/docs/api/storefront/latest/objects/product
const CATALOG_QUERY = `#graphql
  query Catalog(
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
    $sortKey: ProductSortKeys
    $reverse: Boolean
  ) @inContext(country: $country, language: $language) {
    products(
      first: $first
      last: $last
      before: $startCursor
      after: $endCursor
      sortKey: $sortKey
      reverse: $reverse
    ) {
      nodes {
        ...CollectionProduct
      }
      pageInfo {
        hasPreviousPage
        hasNextPage
        startCursor
        endCursor
      }
    }
  }
  ${COLLECTION_PRODUCT_FRAGMENT}
` as const;
