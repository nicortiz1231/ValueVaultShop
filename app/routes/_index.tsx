import {Await, useLoaderData, Link} from 'react-router';
import type {Route} from './+types/_index';
import {Suspense} from 'react';
import {Image} from '@shopify/hydrogen';
import type {
  FeaturedCollectionFragment,
  HomeCollectionFragment,
  RecommendedProductsQuery,
} from 'storefrontapi.generated';
import {ProductItem} from '~/components/ProductItem';
import {MockShopNotice} from '~/components/MockShopNotice';
import {TrustPoints} from '~/components/TrustPoints';
import {Faq} from '~/components/Faq';
import {Container} from '~/components/ui/Container';
import {Section} from '~/components/ui/Section';
import {ButtonLink} from '~/components/ui/Button';
import {ArrowIcon, CheckIcon, LeafIcon} from '~/components/Icons';
import {categories, returns, shipping, store} from '~/lib/store-config';

export const meta: Route.MetaFunction = () => {
  return [
    {title: `${store.name} — ${store.tagline}`},
    {name: 'description', content: store.description},
  ];
};

export async function loader(args: Route.LoaderArgs) {
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args);

  return {...deferredData, ...criticalData};
}

async function loadCriticalData({context}: Route.LoaderArgs) {
  const [{collections}] = await Promise.all([
    context.storefront.query(HOME_COLLECTIONS_QUERY),
  ]);

  return {
    isShopLinked: Boolean(context.env.PUBLIC_STORE_DOMAIN),
    collections: collections.nodes,
    featuredCollection: collections.nodes[0],
  };
}

function loadDeferredData({context}: Route.LoaderArgs) {
  const recommendedProducts = context.storefront
    .query(RECOMMENDED_PRODUCTS_QUERY)
    .catch((error: Error) => {
      console.error(error);
      return null;
    });

  return {recommendedProducts};
}

export default function Homepage() {
  const data = useLoaderData<typeof loader>();

  return (
    <>
      {data.isShopLinked ? null : (
        <Container>
          <MockShopNotice />
        </Container>
      )}

      <Hero collection={data.featuredCollection} />
      <TrustPoints />
      <CategoryGrid collections={data.collections} />
      <TrendingProducts products={data.recommendedProducts} />
      <StorePromise />
      <FaqSection />
    </>
  );
}

/**
 * Above the fold.
 *
 * A visitor arriving cold from TikTok decides in a couple of seconds whether
 * this is a real shop. So the hero leads with what the store sells in plain
 * language, and puts the return policy directly under the buy button rather
 * than burying it in the footer.
 */
function Hero({collection}: {collection?: FeaturedCollectionFragment}) {
  const image = collection?.image;

  return (
    <section className="border-b border-line bg-gradient-to-b from-cream-deep to-cream">
      <Container>
        <div className="grid items-center gap-10 py-14 lg:grid-cols-2 lg:gap-16 lg:py-20">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-1.5 rounded-pill border border-line-strong bg-paper px-3 py-1.5 text-[13px] font-semibold text-ink-muted">
              <LeafIcon className="h-4 w-4 text-sage" />
              Small independent shop
            </span>

            <h1 className="mt-5 text-[2.15rem] font-bold leading-[1.1] tracking-tight text-ink sm:text-5xl">
              Everyday essentials for the home you actually live in.
            </h1>

            <p className="mt-5 text-lg leading-relaxed text-ink-muted">
              {store.tagline} Curated picks for your kitchen, home, pets and
              kids — chosen because they earn their place, not because they were
              cheap to stock.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink to="/collections/all" size="lg">
                Shop best sellers
                <ArrowIcon className="h-[18px] w-[18px]" />
              </ButtonLink>
              <ButtonLink to="/pages/about-us" size="lg" variant="secondary">
                Why shop with us
              </ButtonLink>
            </div>

            <ul className="mt-7 flex flex-wrap gap-x-6 gap-y-2.5">
              {[
                returns.freeReturnShipping
                  ? `${returns.windowDays}-day free returns`
                  : `${returns.windowDays}-day returns`,
                `Ships in ${shipping.processingTime}`,
                'Secure Shopify checkout',
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-1.5 text-sm font-medium text-ink-muted"
                >
                  <CheckIcon className="h-4 w-4 text-sage" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative">
            {image ? (
              <Link
                to={`/collections/${collection!.handle}`}
                className="group block overflow-hidden rounded-[1.25rem] border border-line bg-paper shadow-soft"
              >
                <Image
                  data={image}
                  sizes="(min-width: 1024px) 560px, 100vw"
                  alt={image.altText || collection!.title}
                  aspectRatio="4/3"
                  loading="eager"
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                />
              </Link>
            ) : (
              <div className="aspect-[4/3] rounded-[1.25rem] border border-line bg-paper shadow-soft" />
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}

/**
 * Category tiles.
 *
 * Driven by the collections that actually exist in Shopify rather than a
 * hardcoded list, so a tile can never link to an empty or deleted collection.
 * Copy from store-config is layered on where the handles line up.
 */
function CategoryGrid({collections}: {collections: HomeCollectionFragment[]}) {
  const tiles = collections.slice(0, 4);
  if (!tiles.length) return null;

  const blurbFor = (handle: string) =>
    categories.find((category) => category.handle === handle)?.blurb;

  return (
    <Section
      title="Shop by room"
      intro="Four small collections rather than an endless catalogue — everything here has been picked by hand."
    >
      <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
        {tiles.map((collection) => (
          <Link
            key={collection.id}
            to={`/collections/${collection.handle}`}
            prefetch="intent"
            className="group overflow-hidden rounded-card border border-line bg-paper transition-shadow hover:shadow-lift"
          >
            <div className="overflow-hidden bg-cream-deep">
              {collection.image ? (
                <Image
                  data={collection.image}
                  sizes="(min-width: 1024px) 290px, 45vw"
                  alt={collection.image.altText || collection.title}
                  aspectRatio="4/3"
                  className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05]"
                />
              ) : (
                <div className="aspect-[4/3] w-full" />
              )}
            </div>
            <div className="p-4">
              <h3 className="flex items-center gap-1.5 text-[15px] font-semibold text-ink">
                {collection.title}
                <ArrowIcon className="h-4 w-4 text-sage opacity-0 transition-opacity group-hover:opacity-100" />
              </h3>
              <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">
                {blurbFor(collection.handle) ??
                  collection.description ??
                  'Shop the collection'}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </Section>
  );
}

function TrendingProducts({
  products,
}: {
  products: Promise<RecommendedProductsQuery | null>;
}) {
  return (
    <Section
      className="bg-paper border-y border-line"
      title="Trending now"
      intro="What people are actually buying this week."
      action={
        <Link
          to="/collections/all"
          prefetch="intent"
          className="inline-flex items-center gap-1.5 text-[15px] font-semibold text-sage-deep hover:text-ink"
        >
          Shop all
          <ArrowIcon className="h-[18px] w-[18px]" />
        </Link>
      }
    >
      <Suspense fallback={<ProductGridSkeleton />}>
        <Await resolve={products} errorElement={null}>
          {(response) =>
            response?.products?.nodes?.length ? (
              <div className="grid grid-cols-2 gap-x-4 gap-y-9 sm:gap-x-5 lg:grid-cols-4">
                {response.products.nodes.map((product, i) => (
                  <ProductItem
                    key={product.id}
                    product={product}
                    loading={i < 4 ? 'eager' : 'lazy'}
                  />
                ))}
              </div>
            ) : null
          }
        </Await>
      </Suspense>
    </Section>
  );
}

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-9 sm:gap-x-5 lg:grid-cols-4">
      {['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map((key) => (
        <div key={key} className="animate-pulse">
          <div className="aspect-square rounded-card bg-cream-deep" />
          <div className="mt-3.5 h-4 w-4/5 rounded bg-cream-deep" />
          <div className="mt-2 h-4 w-1/3 rounded bg-cream-deep" />
        </div>
      ))}
    </div>
  );
}

/**
 * The store's promise, in its own words. Taken from the existing About page so
 * the two never contradict each other.
 */
function StorePromise() {
  const promises = [
    {
      title: 'Every product earns its spot',
      body: 'If we would not use it ourselves, it does not make the shelf. That is the whole buying policy.',
    },
    {
      title: 'Honest prices, no fake markdowns',
      body: 'A price is crossed out here only when Shopify is carrying a genuine higher price. No invented "was" numbers.',
    },
    {
      title: 'Returns that are not a fight',
      body: `${returns.windowDays} days to change your mind, we pay the return postage, and your refund lands within ${returns.refundTimeframe}.`,
    },
  ];

  return (
    <Section
      title="Why shop with us"
      intro="We are a small shop, so the only thing we have to trade on is being straight with you."
    >
      <div className="grid gap-4 sm:gap-5 lg:grid-cols-3">
        {promises.map((promise) => (
          <div
            key={promise.title}
            className="rounded-card border border-line bg-paper p-6"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sage-tint text-sage-deep">
              <CheckIcon className="h-5 w-5" />
            </span>
            <h3 className="mt-4 text-[16px] font-semibold text-ink">
              {promise.title}
            </h3>
            <p className="mt-2 text-[15px] leading-relaxed text-ink-muted">
              {promise.body}
            </p>
          </div>
        ))}
      </div>
    </Section>
  );
}

function FaqSection() {
  return (
    <Section
      id="faq"
      className="border-t border-line bg-paper"
      title="Questions people ask before buying"
      intro="If yours is not here, email us — a person will answer."
    >
      <Faq />
    </Section>
  );
}

const HOME_COLLECTIONS_QUERY = `#graphql
  fragment HomeCollection on Collection {
    id
    title
    handle
    description
    image {
      id
      url
      altText
      width
      height
    }
  }
  fragment FeaturedCollection on Collection {
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
  query HomeCollections($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    collections(first: 4, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...HomeCollection
        ...FeaturedCollection
      }
    }
  }
` as const;

const RECOMMENDED_PRODUCTS_QUERY = `#graphql
  fragment RecommendedProduct on Product {
    id
    title
    handle
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    compareAtPriceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    featuredImage {
      id
      url
      altText
      width
      height
    }
  }
  query RecommendedProducts ($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 8, sortKey: BEST_SELLING) {
      nodes {
        ...RecommendedProduct
      }
    }
  }
` as const;
