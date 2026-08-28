import {useLoaderData, Link} from 'react-router';
import type {Route} from './+types/collections._index';
import {Image} from '@shopify/hydrogen';
import type {CollectionFragment} from 'storefrontapi.generated';
import {Container} from '~/components/ui/Container';
import {ArrowIcon} from '~/components/Icons';
import {categories, store} from '~/lib/store-config';
import {
  resolveCollectionImage,
  type CollectionImage,
} from '~/lib/collection-images';

export const meta: Route.MetaFunction = () => {
  return [
    {title: `Collections | ${store.name}`},
    {name: 'description', content: store.description},
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
async function loadCriticalData({context}: Route.LoaderArgs) {
  const [{collections}] = await Promise.all([
    context.storefront.query(COLLECTIONS_QUERY),
    // Add other queries here, so that they are loaded in parallel
  ]);

  // The page shows the store's own categories, in store-config's order, not
  // whatever the storefront happens to return -- so the catalogue is only
  // consulted for each one's image. Anything the store has not created yet
  // still gets a card, just without a photo.
  const images = Object.fromEntries(
    collections.nodes.map((collection) => [collection.handle, collection]),
  ) as Record<string, CollectionFragment | undefined>;

  return {
    // Collections with no image set in admin borrow one from a product they
    // contain, the same stand-in the homepage category row uses, so the two
    // pages never show the same collection differently. Shopify's own image
    // is always preferred over it.
    tiles: categories.map((category) => ({
      ...category,
      image: resolveCollectionImage(
        category.handle,
        images[category.handle]?.image,
      ),
    })),
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

export default function Collections() {
  const {tiles} = useLoaderData<typeof loader>();

  return (
    <Container className="py-10 sm:py-14">
      <header className="max-w-2xl">
        <h1 className="display text-3xl text-ink sm:text-4xl">Collections</h1>
        <p className="mt-3.5 text-base leading-relaxed text-ink-muted">
          Browse by category, or see everything at once.
        </p>
      </header>

      <div className="mt-10 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3">
        {tiles.map((tile, index) => (
          <CollectionItem key={tile.handle} tile={tile} index={index} />
        ))}
      </div>
    </Container>
  );
}

function CollectionItem({
  tile,
  index,
}: {
  tile: {
    title: string;
    handle: string;
    blurb: string;
    image: CollectionFragment['image'] | CollectionImage;
  };
  index: number;
}) {
  return (
    <Link
      to={`/collections/${tile.handle}`}
      prefetch="intent"
      className="group overflow-hidden rounded-card border border-line bg-surface transition-shadow hover:shadow-card"
    >
      <div className="overflow-hidden bg-bg-deep">
        {tile.image ? (
          <Image
            alt={tile.image.altText || tile.title}
            aspectRatio="4/3"
            data={tile.image}
            loading={index < 3 ? 'eager' : undefined}
            sizes="(min-width: 1024px) 390px, 45vw"
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05]"
          />
        ) : (
          <div className="aspect-[4/3] w-full" />
        )}
      </div>
      <div className="p-4">
        <h2 className="flex items-center gap-1.5 text-[15px] font-semibold text-ink">
          {tile.title}
          <ArrowIcon className="h-4 w-4 text-brand opacity-0 transition-opacity group-hover:opacity-100" />
        </h2>
        <p className="mt-1 text-[13px] leading-[1.5] text-ink-muted">
          {tile.blurb}
        </p>
      </div>
    </Link>
  );
}

const COLLECTIONS_QUERY = `#graphql
  fragment Collection on Collection {
    id
    title
    handle
    image {
      id
      url
      altText
      width
      height
    }
  }
  query StoreCollections($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    collections(first: 100) {
      nodes {
        ...Collection
      }
    }
  }
` as const;
