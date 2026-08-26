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
import {TrustPoints} from '~/components/TrustPoints';
import {Faq} from '~/components/Faq';
import {Reveal} from '~/components/Reveal';
import {Watermark} from '~/components/Watermark';
import {Container} from '~/components/ui/Container';
import {Section} from '~/components/ui/Section';
import {ButtonLink} from '~/components/ui/Button';
import {ArrowIcon, CheckIcon} from '~/components/Icons';
import {returns, shipping, store} from '~/lib/store-config';

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
      <Hero collections={data.collections} />
      <PromoBand collection={data.featuredCollection} />
      <CategoryStrip collections={data.collections} />
      <TrustPoints />
      <Watermark />
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

      {/* The wordmark sits vertically centred across the seam, the way the
          reference site overlays its own logotype mid-photo rather than
          pinned to an edge. mix-blend-difference keeps it legible no matter
          which panel or product tone sits underneath it -- necessary here
          since, unlike the reference's consistently mid-tone lifestyle
          photography, plain studio product shots swing from near-black to
          near-white panel to panel. */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-4">
        <Reveal>
          <span className="display mix-blend-difference text-center text-[17vw] leading-[0.85] text-white sm:text-[11vw]">
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
 * Photo-backed promo band -- the reference site's own "10% OFF / FREE
 * EARRINGS" banner structure (full-bleed photo, translucent overlay panel,
 * bold headline, CTA pill), carrying Value Vault's real homepage copy
 * (matching valuevaultshop.net) instead of an invented discount.
 */
function PromoBand({collection}: {collection?: FeaturedCollectionFragment}) {
  const image = collection?.image;

  return (
    <section className="relative overflow-hidden">
      <div className="relative aspect-[4/5] sm:aspect-[21/9]">
        {image && (
          <Image
            data={image}
            sizes="100vw"
            alt={image.altText || collection!.title}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}

        <div className="absolute inset-0 flex items-center p-5 sm:p-12">
          <Reveal className="max-w-xl rounded-[2rem] bg-ink/85 p-8 shadow-lift backdrop-blur-sm sm:p-12">
            <p className="display text-[2rem] leading-[1.05] text-bg sm:text-5xl">
              Everyday essentials for home, kitchen, pets &amp; family
            </p>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-bg/80 sm:text-base">
              Quality picks for every room and every budget — with fast US
              shipping on our best sellers.
            </p>
            <ButtonLink
              to="/collections/all"
              size="lg"
              variant="accent"
              data-cursor="Shop"
              className="mt-7"
            >
              Shop best sellers
              <ArrowIcon className="h-[18px] w-[18px]" />
            </ButtonLink>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/**
 * Full-bleed category tile row -- matches the reference site's own
 * Earrings/Necklaces/Rings/... strip directly beneath its promo band: equal
 * tiles, edge to edge, a single name label per tile and nothing else. Driven
 * by whatever collections actually exist, so a tile can never point at an
 * empty or deleted one.
 */
function CategoryStrip({collections}: {collections: HomeCollectionFragment[]}) {
  const tiles = collections.slice(0, 5);
  if (!tiles.length) return null;

  return (
    <section className="bg-bg pt-1">
      {/* Thin gap between tiles (not flush, not a wide gutter) -- the gap
          colour is just the section's own background showing through. */}
      <div className="grid grid-cols-2 gap-1 sm:grid-cols-3 lg:grid-cols-5">
        {tiles.map((collection, i) => (
          <Reveal key={collection.id} delay={i * 60} as="div">
            <Link
              to={`/collections/${collection.handle}`}
              prefetch="intent"
              data-cursor="Shop"
              className="group relative block aspect-[4/5] overflow-hidden"
            >
              {collection.image ? (
                <Image
                  data={collection.image}
                  sizes="(min-width: 1024px) 20vw, 50vw"
                  alt={collection.image.altText || collection.title}
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
              ) : (
                <div className="h-full w-full bg-bg-deep" />
              )}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
              <span className="absolute bottom-4 left-4 text-[15px] font-semibold text-bg sm:text-base">
                {collection.title}
              </span>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
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
    collections(first: 5, sortKey: UPDATED_AT, reverse: true) {
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
