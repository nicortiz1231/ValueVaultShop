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
import {Container} from '~/components/ui/Container';
import {Section} from '~/components/ui/Section';
import {ButtonLink} from '~/components/ui/Button';
import {ArrowIcon, CheckIcon, SparkleIcon} from '~/components/Icons';
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
 * A visitor arriving cold from TikTok decides in seconds whether this is a
 * real, well-made shop -- so the hero has to do two jobs at once: look like a
 * 2026 product launch, and still say plainly what the store sells and why it
 * is safe to buy from. The bloom, the huge display type and the floating
 * product frame carry the "award site" feeling; the pill of trust facts right
 * under the CTA carries the substance.
 */
function Hero({collection}: {collection?: FeaturedCollectionFragment}) {
  const image = collection?.image;

  return (
    <section className="relative overflow-hidden border-b border-line">
      <div
        className="bloom left-1/2 top-[-10%] h-[36rem] w-[36rem] -translate-x-1/2"
        aria-hidden="true"
      />
      <div
        className="bloom right-[-10%] top-[20%] h-80 w-80 opacity-60"
        aria-hidden="true"
        style={{background: 'radial-gradient(circle, oklch(0.7 0.19 40 / 20%) 0%, transparent 70%)'}}
      />

      <Container className="relative">
        <div className="grid items-center gap-14 py-20 lg:grid-cols-[1.15fr_1fr] lg:gap-10 lg:py-28">
          <div className="max-w-xl">
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-pill border border-line-strong bg-glass px-3.5 py-1.5 text-[13px] font-semibold text-ash">
                <SparkleIcon className="h-3.5 w-3.5 text-lime" />
                New drops every week
              </span>
            </Reveal>

            <Reveal delay={80}>
              <h1 className="display mt-6 text-[3rem] text-chalk sm:text-[3.75rem] lg:text-[4.5rem]">
                Stuff that
                <br />
                <span className="text-lime">actually</span> works.
              </h1>
            </Reveal>

            <Reveal delay={160}>
              <p className="mt-6 max-w-md text-lg leading-relaxed text-ash">
                {store.tagline} Curated picks for your kitchen, home, pets and
                kids — chosen because they earn their place, not because they
                were cheap to stock.
              </p>
            </Reveal>

            <Reveal delay={240} className="mt-9 flex flex-wrap gap-3">
              <ButtonLink to="/collections/all" size="lg" magnetic>
                Shop best sellers
                <ArrowIcon className="h-[18px] w-[18px]" />
              </ButtonLink>
              <ButtonLink to="/pages/about-us" size="lg" variant="secondary">
                Why shop with us
              </ButtonLink>
            </Reveal>

            <Reveal
              delay={320}
              className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2.5 border-t border-line pt-6"
            >
              {[
                returns.freeReturnShipping
                  ? `${returns.windowDays}-day free returns`
                  : `${returns.windowDays}-day returns`,
                `Ships in ${shipping.processingTime}`,
                'Secure Shopify checkout',
              ].map((item) => (
                <span
                  key={item}
                  className="flex items-center gap-1.5 text-[13px] font-medium text-dim"
                >
                  <CheckIcon className="h-3.5 w-3.5 text-lime" />
                  {item}
                </span>
              ))}
            </Reveal>
          </div>

          <Reveal delay={200} className="relative">
            <div className="animate-float">
              {image ? (
                <Link
                  to={`/collections/${collection!.handle}`}
                  className="group glass relative block overflow-hidden rounded-[2rem] shadow-card transition-transform duration-500 ease-out hover:scale-[1.015]"
                >
                  <Image
                    data={image}
                    sizes="(min-width: 1024px) 560px, 100vw"
                    alt={image.altText || collection!.title}
                    aspectRatio="4/5"
                    loading="eager"
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-canvas/70 via-transparent to-transparent" />
                  <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-lime">
                        Featured
                      </p>
                      <p className="mt-1 text-xl font-bold text-chalk">
                        {collection!.title}
                      </p>
                    </div>
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-lime text-canvas shadow-glow transition-transform duration-300 group-hover:rotate-45">
                      <ArrowIcon className="h-5 w-5 -rotate-45" />
                    </span>
                  </div>
                </Link>
              ) : (
                <div className="glass aspect-[4/5] rounded-[2rem] shadow-card" />
              )}
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}

/**
 * Category tiles, bento-style.
 *
 * Driven by whatever collections actually exist in Shopify, so a tile can
 * never point at an empty or deleted collection. The hover state -- image
 * zoom plus a rotating arrow badge -- is the single interaction most likely
 * to make the page feel "designed" rather than templated.
 */
function CategoryGrid({collections}: {collections: HomeCollectionFragment[]}) {
  const tiles = collections.slice(0, 4);
  if (!tiles.length) return null;

  const blurbFor = (handle: string) =>
    categories.find((category) => category.handle === handle)?.blurb;

  return (
    <Section
      eyebrow="Browse"
      title="Shop by room"
      intro="Four small collections rather than an endless catalogue — everything here has been picked by hand."
    >
      <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
        {tiles.map((collection, i) => (
          <Reveal key={collection.id} delay={i * 90} as="div">
            <Link
              to={`/collections/${collection.handle}`}
              prefetch="intent"
              className="group glass relative block overflow-hidden rounded-card transition-all duration-300 hover:border-line-strong hover:shadow-card"
            >
              <div className="relative overflow-hidden bg-surface-2">
                {collection.image ? (
                  <Image
                    data={collection.image}
                    sizes="(min-width: 1024px) 290px, 45vw"
                    alt={collection.image.altText || collection.title}
                    aspectRatio="4/3"
                    className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                  />
                ) : (
                  <div className="aspect-[4/3] w-full" />
                )}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-canvas/80 via-canvas/0 to-transparent" />
                <span className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-lime text-canvas opacity-0 shadow-glow transition-all duration-300 group-hover:opacity-100 group-hover:rotate-45">
                  <ArrowIcon className="h-4 w-4 -rotate-45" />
                </span>
              </div>
              <div className="p-4">
                <h3 className="text-[15px] font-bold text-chalk">
                  {collection.title}
                </h3>
                <p className="mt-1 line-clamp-2-fixed text-[13px] leading-relaxed text-dim">
                  {blurbFor(collection.handle) ??
                    collection.description ??
                    'Shop the collection'}
                </p>
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
      className="border-y border-line bg-surface/40"
      eyebrow="Popular"
      title="Trending now"
      intro="What people are actually buying this week."
      action={
        <Link
          to="/collections/all"
          prefetch="intent"
          className="inline-flex items-center gap-1.5 text-[15px] font-semibold text-lime transition-opacity hover:opacity-80"
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
          <div className="aspect-square rounded-card bg-surface-2" />
          <div className="mt-3.5 h-4 w-4/5 rounded bg-surface-2" />
          <div className="mt-2 h-4 w-1/3 rounded bg-surface-2" />
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
            <div className="glass group h-full rounded-card p-7 transition-colors duration-300 hover:border-line-strong">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-lime/15 text-lime transition-colors duration-300 group-hover:bg-lime group-hover:text-canvas">
                <CheckIcon className="h-5 w-5" />
              </span>
              <h3 className="mt-5 text-[17px] font-bold text-chalk">
                {promise.title}
              </h3>
              <p className="mt-2.5 text-[15px] leading-relaxed text-ash">
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
      className="border-t border-line"
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
