import {Await, useLoaderData, Link} from 'react-router';
import type {Route} from './+types/_index';
import {Suspense, useRef} from 'react';
import {Image, Money} from '@shopify/hydrogen';
import type {
  HomeCollectionFragment,
  NewArrivalsQuery,
} from 'storefrontapi.generated';
import {TrustPoints} from '~/components/TrustPoints';
import {Faq} from '~/components/Faq';
import {Reveal} from '~/components/Reveal';
import {Container} from '~/components/ui/Container';
import {Section} from '~/components/ui/Section';
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
  };
}

function loadDeferredData({context}: Route.LoaderArgs) {
  const newArrivals = context.storefront
    .query(NEW_ARRIVALS_QUERY)
    .catch((error: Error) => {
      console.error(error);
      return null;
    });

  return {newArrivals};
}
export default function Homepage() {
  const data = useLoaderData<typeof loader>();

  return (
    <>
      <Hero collections={data.collections} />
      <CategoryStrip collections={data.collections} />
      <NewArrivals products={data.newArrivals} />
      <TrustPoints />
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
      <div className="grid grid-cols-2 gap-2 px-2 sm:grid-cols-3 lg:grid-cols-5">
        {tiles.map((collection, i) => (
          <Reveal key={collection.id} delay={i * 60} as="div">
            <Link
              to={`/collections/${collection.handle}`}
              prefetch="intent"
              data-cursor="Shop"
              className="group relative block aspect-[4/5] overflow-hidden rounded-xl"
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

/**
 * New Arrivals carousel.
 *
 * Mirrors the reference site's own section: left-aligned title with a
 * "Shop New Arrivals" link opposite, then a horizontally scrollable row of
 * cards that deliberately lets the next card peek in at the right edge so
 * it reads as scrollable without needing an affordance to say so.
 *
 * Products are sorted by CREATED_AT descending, so "new" here is a fact
 * about the catalogue rather than a label someone has to remember to set.
 */
function NewArrivals({products}: {products: Promise<NewArrivalsQuery | null>}) {
  const trackRef = useRef<HTMLUListElement>(null);

  const scrollByCard = (direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector('li');
    const step = card ? card.getBoundingClientRect().width + 16 : 320;
    track.scrollBy({left: step * direction, behavior: 'smooth'});
  };

  return (
    <section className="bg-surface py-16 sm:py-24">
      <Container>
        <Reveal className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <h2 className="display text-[2.25rem] text-ink sm:text-5xl">
            New Arrivals
          </h2>
          <Link
            to="/collections/all"
            prefetch="intent"
            className="inline-flex items-center gap-1.5 text-[15px] font-medium text-ink transition-colors hover:text-brand"
          >
            Shop New Arrivals
            <ArrowIcon className="h-[18px] w-[18px]" />
          </Link>
        </Reveal>
      </Container>

      <Suspense fallback={<NewArrivalsSkeleton />}>
        <Await resolve={products} errorElement={null}>
          {(response) => {
            const nodes = response?.products?.nodes ?? [];
            if (!nodes.length) return null;

            return (
              <div className="relative">
                <Container>
                  <ul
                    ref={trackRef}
                    className="flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                  >
                    {nodes.map((product) => (
                      <li
                        key={product.id}
                        className="w-[72%] shrink-0 snap-start sm:w-[45%] lg:w-[23.5%]"
                      >
                        <NewArrivalCard product={product} />
                      </li>
                    ))}
                  </ul>
                </Container>

                {/* Desktop-only nudge control. The row is scrollable by
                    trackpad/touch regardless, so this is an affordance
                    rather than the only way to move it. */}
                <button
                  type="button"
                  onClick={() => scrollByCard(1)}
                  aria-label="Show more new arrivals"
                  className="absolute right-4 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-surface text-ink shadow-card transition-colors hover:bg-bg lg:flex"
                >
                  <ArrowIcon className="h-5 w-5" />
                </button>
              </div>
            );
          }}
        </Await>
      </Suspense>
    </section>
  );
}

function NewArrivalCard({
  product,
}: {
  product: NewArrivalsQuery['products']['nodes'][number];
}) {
  const image = product.featuredImage;

  // Badges.
  //
  // "New" is true by construction: this section queries CREATED_AT desc, so
  // everything in it genuinely is among the newest products in the catalogue.
  //
  // Beyond that, only tags explicitly namespaced `badge:` are shown --
  // e.g. a Shopify tag `badge:Waterproof` renders as "Waterproof". Raw tags
  // are internal taxonomy (mock.shop returns things like `key=oxygen`,
  // `accessories`, `men`) and rendering them verbatim is noise, so opting in
  // by prefix keeps the shelf clean and gives the store one obvious lever.
  const badges = [
    'New',
    ...(product.tags ?? [])
      .filter((tag) => tag.toLowerCase().startsWith('badge:'))
      .map((tag) => tag.slice('badge:'.length).trim())
      .filter(Boolean),
  ].slice(0, 2);

  // Colour swatches come from the real Color option, when the product has one.
  const swatches = (
    product.options?.find((option) => /colou?r/i.test(option.name))
      ?.optionValues ?? []
  )
    .filter((value) => value.swatch?.color)
    .slice(0, 4);

  return (
    <Link
      to={`/products/${product.handle}`}
      prefetch="intent"
      data-cursor="View"
      className="group flex h-full flex-col rounded-xl bg-bg p-4 transition-shadow duration-300 hover:shadow-card sm:p-5"
    >
      {badges.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {badges.map((badge) => (
            <span
              key={badge}
              className="rounded-md bg-surface px-2.5 py-1 text-[12px] font-medium text-ink"
            >
              {badge}
            </span>
          ))}
        </div>
      )}

      {/* The product sits in a near-white panel rather than directly on the
          cream. The reference gets a seamless single-surface card because its
          photography is exported on exactly its own card colour; ours arrives
          on #f3f3f3 studio grey, so blending it into cream (multiply) turns
          the backdrop tan. A white panel is within ~5% of that grey, which
          reads as seamless, and stays clean for any future photo background. */}
      <div className="relative my-5 aspect-square w-full overflow-hidden rounded-lg bg-surface sm:my-6">
        {image ? (
          <Image
            data={image}
            sizes="(min-width: 1024px) 25vw, 70vw"
            alt={image.altText || product.title}
            className="h-full w-full object-contain transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <div className="h-full w-full bg-bg-deep" />
        )}
      </div>

      <div className="mt-auto flex flex-col gap-2">
        {swatches.length > 0 && (
          <div className="flex items-center gap-1.5">
            {swatches.map((value) => (
              <span
                key={value.name}
                title={value.name}
                className="h-4 w-4 rounded-full border border-line-strong"
                style={{backgroundColor: value.swatch!.color!}}
              />
            ))}
          </div>
        )}

        <h3 className="text-[15px] font-medium leading-snug text-ink">
          {product.title}
        </h3>

        <span className="text-[15px] font-semibold text-ink">
          <Money data={product.priceRange.minVariantPrice} />
        </span>
      </div>
    </Link>
  );
}

function NewArrivalsSkeleton() {
  return (
    <Container>
      <ul className="flex gap-5 overflow-hidden">
        {['a', 'b', 'c', 'd'].map((key) => (
          <li
            key={key}
            className="w-[72%] shrink-0 animate-pulse sm:w-[45%] lg:w-[23.5%]"
          >
            <div className="aspect-[3/4] rounded-xl bg-bg-deep" />
            <div className="mt-3 h-4 w-4/5 rounded bg-bg-deep" />
            <div className="mt-2 h-4 w-1/3 rounded bg-bg-deep" />
          </li>
        ))}
      </ul>
    </Container>
  );
}

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
  query HomeCollections($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    collections(first: 5, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...HomeCollection
      }
    }
  }
` as const;

const NEW_ARRIVALS_QUERY = `#graphql
  fragment NewArrivalProduct on Product {
    id
    title
    handle
    tags
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
    options {
      name
      optionValues {
        name
        swatch {
          color
        }
      }
    }
  }
  query NewArrivals ($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 12, sortKey: CREATED_AT, reverse: true) {
      nodes {
        ...NewArrivalProduct
      }
    }
  }
` as const;
