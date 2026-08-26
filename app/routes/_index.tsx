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
import {Reveal} from '~/components/Reveal';
import {Watermark} from '~/components/Watermark';
import {Arch} from '~/components/Arch';
import {Container} from '~/components/ui/Container';
import {Section} from '~/components/ui/Section';
import {ButtonLink} from '~/components/ui/Button';
import {ArrowIcon, CheckIcon} from '~/components/Icons';
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

      <Hero collections={data.collections} />
      <PromoBanner />
      <TrustPoints />
      <Watermark />
      <CategoryPromo collections={data.collections} />
      <TrendingProducts products={data.recommendedProducts} />
      <StorePromise />
      <FaqSection />
    </>
  );
}

/**
 * Above the fold.
 *
 * Structurally borrowed from kaleidojewellery.com: two full-bleed colour-block
 * panels side by side, each carrying a product photo, with the store's own
 * wordmark overlaid huge across the seam. Product photos are shot on
 * plain white, so `mix-blend-multiply` tints the white background to the
 * panel's own colour underneath -- the cheapest way to make a studio photo
 * feel like it belongs in a coloured block rather than sitting pasted on top.
 */
function Hero({collections}: {collections: HomeCollectionFragment[]}) {
  const [left, right] = collections;

  return (
    <section className="relative overflow-hidden">
      <div className="grid grid-cols-1 sm:grid-cols-2">
        <HeroPanel collection={left} blockBg="bg-block-clay" />
        <HeroPanel collection={right} blockBg="bg-block-sage" />
      </div>

      <Arch className="pointer-events-none absolute bottom-0 left-1/2 h-[26vw] w-[52vw] max-h-64 max-w-[42rem] -translate-x-1/2 opacity-25" />

      <div className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center px-4 sm:bottom-10">
        <Reveal>
          <span className="display text-center text-[15vw] leading-[0.85] text-ink sm:text-[9vw]">
            {store.name}
          </span>
        </Reveal>
      </div>
    </section>
  );
}

function HeroPanel({
  collection,
  blockBg,
}: {
  collection?: HomeCollectionFragment;
  blockBg: string;
}) {
  const image = collection?.image;

  return (
    <Link
      to={collection ? `/collections/${collection.handle}` : '/collections/all'}
      prefetch="intent"
      data-cursor="Shop"
      className={`group relative block aspect-[4/5] overflow-hidden sm:aspect-[3/4] ${blockBg}`}
    >
      {image ? (
        <Image
          data={image}
          sizes="(min-width: 640px) 50vw, 100vw"
          alt={image.altText || collection!.title}
          loading="eager"
          className="h-full w-full object-cover mix-blend-multiply transition-transform duration-700 ease-out group-hover:scale-105"
        />
      ) : null}
      {collection && (
        <span className="absolute bottom-6 left-6 rounded-pill bg-surface px-4 py-2 text-[12px] font-bold uppercase tracking-[0.1em] text-ink shadow-card">
          {collection.title}
        </span>
      )}
    </Link>
  );
}

/**
 * Bold colour-block claim strip -- the structural role Kaleido's "10% off /
 * free earrings" banner plays, with real facts standing in for a promo code.
 */
function PromoBanner() {
  const claims = [
    {
      big: returns.freeReturnShipping ? `${returns.windowDays}-DAY` : `${returns.windowDays}-DAY`,
      small: returns.freeReturnShipping ? 'Free returns, we pay postage' : 'Returns window',
    },
    {big: 'Fast', small: `Dispatched in ${shipping.processingTime}`},
    {big: 'Secure', small: 'Checkout handled by Shopify'},
  ];

  return (
    <section className="bg-block-butter">
      <Container>
        <div className="grid grid-cols-1 divide-y divide-ink/10 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {claims.map((claim) => (
            <div
              key={claim.small}
              className="flex flex-col items-center justify-center gap-1.5 py-9 text-center sm:py-14"
            >
              <span className="display text-4xl text-ink sm:text-5xl">
                {claim.big}
              </span>
              <span className="max-w-[16rem] text-[12px] font-bold uppercase tracking-[0.12em] text-ink-muted">
                {claim.small}
              </span>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

/**
 * Two large lifestyle-scale tiles in place of a dense category grid --
 * Kaleido's "Made To Stack" / "Gym Ready Looks" pattern. Fewer, bigger
 * choices reads as curated; a wall of small squares reads as inventory.
 */
function CategoryPromo({collections}: {collections: HomeCollectionFragment[]}) {
  const tiles = collections.slice(0, 2);
  if (tiles.length < 2) return null;

  const blocks = ['bg-block-sky', 'bg-block-clay'];
  const blurbFor = (handle: string) =>
    categories.find((category) => category.handle === handle)?.blurb;

  return (
    <Section eyebrow="Shop by room" title="Pick a starting point">
      <div className="grid gap-5 sm:grid-cols-2">
        {tiles.map((collection, i) => (
          <Reveal key={collection.id} delay={i * 100} as="div">
            <Link
              to={`/collections/${collection.handle}`}
              prefetch="intent"
              data-cursor="Shop"
              className={`group relative block aspect-[4/5] overflow-hidden rounded-card sm:aspect-[3/4] ${blocks[i]}`}
            >
              {collection.image && (
                <Image
                  data={collection.image}
                  sizes="(min-width: 1024px) 600px, 90vw"
                  alt={collection.image.altText || collection.title}
                  className="h-full w-full object-cover mix-blend-multiply transition-transform duration-700 ease-out group-hover:scale-105"
                />
              )}

              {/* Headline sits high on the tile, CTA pill spans low -- the
                  reference site's own promo-tile pattern, rather than a
                  small floating icon badge. */}
              <div className="absolute inset-x-6 top-6">
                <p className="display text-3xl leading-[0.95] text-ink sm:text-4xl">
                  {collection.title}
                </p>
                <p className="mt-2 max-w-[16rem] text-[13px] font-medium text-ink-muted">
                  {blurbFor(collection.handle) ?? 'Shop the collection'}
                </p>
              </div>

              <div className="absolute inset-x-6 bottom-6">
                <span className="flex items-center justify-center gap-2 rounded-pill bg-ink py-3.5 text-sm font-semibold text-bg transition-colors duration-300 group-hover:bg-brand">
                  Shop {collection.title}
                  <ArrowIcon className="h-4 w-4" />
                </span>
              </div>
            </Link>
          </Reveal>
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
      className="border-y border-line bg-surface"
      eyebrow="Popular"
      title="Trending now"
      intro="What people are actually buying this week."
      action={
        <Link
          to="/collections/all"
          prefetch="intent"
          className="inline-flex items-center gap-1.5 text-[15px] font-semibold text-brand hover:text-brand-deep"
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
              <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-5 lg:grid-cols-4">
                {response.products.nodes.map((product, i) => (
                  <Reveal key={product.id} delay={(i % 4) * 70} as="div">
                    <ProductItem
                      product={product}
                      loading={i < 4 ? 'eager' : 'lazy'}
                    />
                  </Reveal>
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
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-5 lg:grid-cols-4">
      {['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map((key) => (
        <div key={key} className="animate-pulse">
          <div className="aspect-square rounded-card bg-bg-deep" />
          <div className="mt-3.5 h-4 w-4/5 rounded bg-bg-deep" />
          <div className="mt-2 h-4 w-1/3 rounded bg-bg-deep" />
        </div>
      ))}
    </div>
  );
}

/**
 * The store's promise, in its own words -- taken from the About page so the
 * two never contradict each other.
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
      eyebrow="Why us"
      title="Why shop with us"
      intro="We are a small shop, so the only thing we have to trade on is being straight with you."
    >
      <div className="grid gap-4 sm:gap-5 lg:grid-cols-3">
        {promises.map((promise, i) => (
          <Reveal key={promise.title} delay={i * 90} as="div">
            <div className="group h-full rounded-card border border-line bg-surface p-7 transition-colors duration-300 hover:border-line-strong">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-tint text-brand transition-colors duration-300 group-hover:bg-brand group-hover:text-bg">
                <CheckIcon className="h-5 w-5" />
              </span>
              <h3 className="mt-5 text-[17px] font-bold text-ink">
                {promise.title}
              </h3>
              <p className="mt-2.5 text-[15px] leading-relaxed text-ink-muted">
                {promise.body}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

function FaqSection() {
  return (
    <Section
      id="faq"
      className="border-t border-line bg-block-sky/40"
      eyebrow="Questions"
      title="Before you buy"
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
