import {Await, Link} from 'react-router';
import {Suspense, useEffect, useRef, useState} from 'react';
import {Image, Money} from '@shopify/hydrogen';
import type {ProductSliderQuery} from 'storefrontapi.generated';
import {Reveal} from '~/components/Reveal';

type SliderProduct = ProductSliderQuery['products']['nodes'][number];

/**
 * The reference site's `product_slider` section.
 *
 * Geometry is a direct port of the reference site's `product_slider` section
 * (kaleidojewellery.com), read off its own stylesheet and Swiper config
 * rather than estimated from a screenshot.
 *
 * This version intentionally uses tighter vertical spacing between homepage
 * sections so each product shelf flows more naturally into the content above
 * and below it.
 *
 * Three sections on the homepage are this component with different copy and
 * a different query -- New Arrivals, Bestsellers, Featured Products -- exactly
 * as the reference reuses one section type three times.
 *
 * The track is full container width (the reference cancels the gutter with a
 * negative margin, then re-adds it as Swiper's slidesOffsetBefore/After), so
 * the card row is inset by the gutter but the next card bleeds off the right
 * edge. Slide widths reproduce Swiper's fractional `slidesPerView` in pure
 * CSS: width = (track - gap * (spv - 1)) / spv, measured in container-query
 * units so it tracks the real track width, max-width cap and scrollbar.
 */
export function ProductSlider({
  title,
  linkLabel,
  linkTo,
  products,
  showNewBadge = true,
}: {
  title: string;
  linkLabel: string;
  linkTo: string;
  products: Promise<ProductSliderQuery | null>;

  /**
   * Off for the New Arrivals row, where the heading above the cards already
   * says it and a "New" badge on every card is just the same word twice.
   */
  showNewBadge?: boolean;
}) {
  const trackRef = useRef<HTMLUListElement | null>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(true);

  const syncEdges = () => {
    const track = trackRef.current;

    if (!track) return;

    setAtStart(track.scrollLeft <= 1);

    setAtEnd(
      track.scrollLeft >=
        track.scrollWidth - track.clientWidth - 1,
    );
  };

  /**
   * Callback ref rather than an effect: the track lives inside <Await>, so it
   * only attaches once the deferred products resolve -- well after any mount
   * effect here would have run and found nothing to measure.
   */
  const attachTrack = (node: HTMLUListElement | null) => {
    trackRef.current = node;

    if (node) {
      syncEdges();
    }
  };

  useEffect(() => {
    window.addEventListener('resize', syncEdges);

    return () => {
      window.removeEventListener('resize', syncEdges);
    };
  }, []);

  const scrollByCard = (direction: 1 | -1) => {
    const track = trackRef.current;

    if (!track) return;

    const card = track.querySelector('li');

    if (!card) return;

    const gap =
      parseFloat(getComputedStyle(track).columnGap) || 0;

    const step =
      card.getBoundingClientRect().width + gap;

    track.scrollBy({
      left: step * direction,
      behavior: 'smooth',
    });
  };

  return (
    <section className="bg-surface">
      {/* .container -- max-width 1920 with the gutter carried inside, so the
          slider track can span the full width including that gutter. */}
      <div className="mx-auto w-full max-w-[1920px]">
        {/*
         * Tighter section spacing than before.
         *
         * Previous:
         * py-12
         * lg:py-[60px]
         * min-[1440px]:py-20
         * min-[1920px]:py-24
         *
         * The reduced spacing makes the homepage sections visually connect
         * instead of creating a large white interruption between them.
         */}
        <div className="py-8 lg:py-10 min-[1440px]:py-12 min-[1920px]:py-14">
          {/* .header-wrp -- stacks under 1024, then title/link on one baseline */}
          <Reveal className="flex flex-col items-start justify-start gap-y-2 px-4 min-[600px]:px-5 lg:flex-row lg:items-end lg:justify-between lg:gap-y-0 lg:px-8 min-[1200px]:px-10">
            <h2 className="font-display text-[30px] font-semibold leading-none tracking-[-0.5px] text-ink min-[600px]:text-[36px] lg:text-[42px] min-[1440px]:text-[48px] min-[1920px]:text-[56px]">
              {title}
            </h2>

            <Link
              to={linkTo}
              prefetch="intent"
              className="relative inline-block pr-4 text-[13px] font-medium leading-[1.5] text-ink no-underline transition-opacity duration-300 hover:text-ink hover:no-underline hover:opacity-50 min-[1920px]:text-[14px]"
            >
              {linkLabel}

              <LinkArrowIcon className="absolute right-1 top-1/2 mt-px h-1.5 w-1.5 -translate-y-1/2 min-[1440px]:h-2 min-[1440px]:w-2" />
            </Link>
          </Reveal>

          <Suspense fallback={<SliderSkeleton />}>
            <Await resolve={products} errorElement={null}>
              {(response) => {
                const nodes =
                  response?.products?.nodes ?? [];

                if (!nodes.length) {
                  return null;
                }

                return (
                  <div className="group/track relative @container mt-3 min-[600px]:mt-3.5 lg:mt-4 min-[1440px]:mt-5 min-[1920px]:mt-5">
                    <ul
                      ref={attachTrack}
                      onScroll={syncEdges}
                      className="flex snap-x snap-mandatory items-stretch overflow-x-auto scroll-smooth px-4 scroll-pl-4 gap-x-2 [scrollbar-width:none] min-[600px]:gap-x-3 min-[600px]:px-5 min-[600px]:scroll-pl-5 lg:gap-x-4 lg:px-8 lg:scroll-pl-8 min-[1200px]:px-10 min-[1200px]:scroll-pl-10 [&::-webkit-scrollbar]:hidden"
                    >
                      {nodes.map((product) => (
                        <li
                          key={product.id}
                          className="shrink-0 snap-start w-[calc((100cqw_-_4px)/1.5)] min-[600px]:w-[calc((100cqw_-_18px)/2.5)] lg:w-[calc((100cqw_-_51.6px)/4.225)] min-[1920px]:w-[calc((100cqw_-_59.2px)/4.7)]"
                        >
                          <SliderCard
                            product={product}
                            showNewBadge={showNewBadge}
                          />
                        </li>
                      ))}
                    </ul>

                    {/*
                     * Nudge controls. Like the reference they only surface on
                     * hover at desktop widths, and hide once the track is at
                     * that end -- the row is still scrollable by trackpad or
                     * touch, so these are an affordance, not the only way.
                     */}
                    <button
                      type="button"
                      onClick={() => scrollByCard(-1)}
                      aria-label={`Show previous ${title.toLowerCase()}`}
                      className={`absolute left-2 top-1/2 z-[1] hidden h-[42px] w-[42px] -translate-y-1/2 items-center justify-center rounded-[4px] border border-line bg-[#ffffffb3] text-ink transition-colors duration-300 hover:bg-surface min-[1440px]:h-12 min-[1440px]:w-12 ${
                        atStart
                          ? ''
                          : 'lg:group-hover/track:flex'
                      }`}
                    >
                      <NavArrowIcon className="h-3.5 w-3.5 rotate-180" />
                    </button>

                    <button
                      type="button"
                      onClick={() => scrollByCard(1)}
                      aria-label={`Show more ${title.toLowerCase()}`}
                      className={`absolute right-2 top-1/2 z-[1] hidden h-[42px] w-[42px] -translate-y-1/2 items-center justify-center rounded-[4px] border border-line bg-[#ffffffb3] text-ink transition-colors duration-300 hover:bg-surface min-[1440px]:h-12 min-[1440px]:w-12 ${
                        atEnd
                          ? ''
                          : 'lg:group-hover/track:flex'
                      }`}
                    >
                      <NavArrowIcon className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              }}
            </Await>
          </Suspense>
        </div>
      </div>
    </section>
  );
}

/**
 * The 10x11 chevron the reference hangs off its `.link3` links.
 */
function LinkArrowIcon({
  className,
}: {
  className?: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 10 11"
      fill="none"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5.22396 1.7998L9 5.7998L5.22396 9.7998M8.35014 5.79987H1"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="square"
      />
    </svg>
  );
}

/**
 * The 17x18 arrow inside the reference's slider prev/next buttons.
 */
function NavArrowIcon({
  className,
}: {
  className?: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 17 18"
      fill="none"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8.39193 16L15 9L8.39193 2M13.8627 8.99989L1 8.99989"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="square"
      />
    </svg>
  );
}

/**
 * How recently a product must have been added to still count as new.
 *
 * The badge used to be unconditional, on the reasoning that the New Arrivals
 * query sorts by CREATED_AT so everything in it must be new. That does not
 * hold: the sort orders the catalogue, it does not filter it, so on a small
 * catalogue the row runs off the end of the genuinely-new products and keeps
 * going. This storefront is mostly a single bulk import, so an unconditional
 * badge was calling two-year-old products new -- on every row, including
 * Bestsellers and Featured Products, which are not sorted by date at all.
 */
const NEW_FOR_DAYS = 30;

function isNew(createdAt: string) {
  const age =
    Date.now() -
    new Date(createdAt).getTime();

  return (
    Number.isFinite(age) &&
    age <
      NEW_FOR_DAYS *
        24 *
        60 *
        60 *
        1000
  );
}

function SliderCard({
  product,
  showNewBadge,
}: {
  product: SliderProduct;
  showNewBadge: boolean;
}) {
  const image = product.featuredImage;

  /*
   * Badges.
   *
   * "New" is earned by the product's own createdAt (see [isNew]) rather than
   * assumed from the row it happens to be in, and the New Arrivals row turns
   * it off entirely as redundant with its own heading.
   *
   * Beyond that, only tags explicitly namespaced `badge:` are shown --
   * e.g. a Shopify tag `badge:Waterproof` renders as "Waterproof". Raw tags
   * are internal taxonomy (mock.shop returns things like `key=oxygen`,
   * `accessories`, `men`) and rendering them verbatim is noise, so opting in
   * by prefix keeps the shelf clean and gives the store one obvious lever.
   */
  const badges = [
    ...(showNewBadge &&
    isNew(product.createdAt)
      ? ['New']
      : []),

    ...(product.tags ?? [])
      .filter((tag) =>
        tag
          .toLowerCase()
          .startsWith('badge:'),
      )
      .map((tag) =>
        tag
          .slice('badge:'.length)
          .trim(),
      )
      .filter(Boolean),
  ].slice(0, 2);

  /*
   * Colour swatches come from the real Color option, when the product has one.
   * The reference caps the row at four under 1024 and five above it.
   */
  const swatches = (
    product.options?.find((option) =>
      /colou?r/i.test(option.name),
    )?.optionValues ?? []
  )
    .filter(
      (value) =>
        value.swatch?.color,
    )
    .slice(0, 5);

  /*
   * `no-underline` below guards against reset.css's global `a:hover` rule:
   * the whole card is a single anchor, so without it every line of copy
   * inside the card underlines together on hover.
   */
  return (
    <Link
      to={`/products/${product.handle}`}
      prefetch="intent"
      data-cursor="View"
      className="group relative flex h-full flex-col justify-start overflow-hidden rounded-[6px] no-underline hover:no-underline lg:rounded-lg lg:bg-card"
    >
      {/* .tags-1 -- absolutely placed so the photo runs edge to edge. */}
      {badges.length > 0 && (
        <div className="absolute left-3 top-3 z-[3] flex flex-wrap items-center justify-start gap-1 lg:left-4 lg:top-4 min-[1440px]:gap-1.5 min-[1920px]:left-6 min-[1920px]:top-6">
          {badges.map((badge) => (
            <span
              key={badge}
              className="rounded-[4px] border border-line bg-surface px-1.5 py-px text-[11px] leading-[1.5] tracking-[0.1px] text-ink min-[1440px]:text-[12px] min-[1920px]:text-[13px]"
            >
              {badge}
            </span>
          ))}
        </div>
      )}

      {/*
       * The reference darkens the bottom half of the card on hover and flips
       * the copy to white. Single-image cards get exactly this treatment.
       */}
      <div className="pointer-events-none absolute inset-0 z-[2] hidden bg-[linear-gradient(to_top,#0000004d,#0000)] bg-[length:100%_50%] bg-bottom bg-no-repeat lg:group-hover:block" />

      {/*
       * One continuous card surface -- the product sits directly on it with
       * no inner panel, matching the reference. This only reads as seamless
       * because --color-card is tuned to the photography's own backdrop.
       * 4:5 is the reference's own ratio (padding-bottom: 125%).
       */}
      <div className="relative aspect-[4/5] w-full shrink-0">
        {image ? (
          <Image
            data={image}
            sizes="(min-width: 1024px) 24vw, (min-width: 600px) 40vw, 67vw"
            alt={
              image.altText ||
              product.title
            }
            className="absolute inset-0 h-full w-full object-contain"
          />
        ) : (
          <div className="h-full w-full bg-bg-deep" />
        )}
      </div>

      {/* .bottom-con */}
      <div className="relative z-[2] mt-auto flex w-full shrink-0 flex-wrap items-start justify-start gap-x-2 pt-2.5 lg:items-end lg:px-4 lg:pb-4 lg:pt-0 min-[1920px]:px-6 min-[1920px]:pb-6">
        <div className="flex-1">
          {swatches.length > 0 && (
            <div className="relative mb-2 mt-0 flex w-full items-center justify-start gap-x-1">
              <ul className="flex items-stretch justify-start [column-gap:3px]">
                {swatches.map(
                  (value, i) => (
                    <li
                      key={value.name}
                      title={value.name}
                      className={`box-border h-[22px] w-[22px] rounded-full border bg-clip-content p-0.5 lg:h-6 lg:w-6 ${
                        i === 0
                          ? 'border-ink lg:group-hover:border-white'
                          : 'border-transparent'
                      } ${
                        i > 3
                          ? 'hidden lg:block'
                          : ''
                      }`}
                      style={{
                        backgroundColor:
                          value.swatch!
                            .color!,
                      }}
                    />
                  ),
                )}
              </ul>
            </div>
          )}

          <h3 className="self-stretch font-display text-[14px] font-medium leading-[1.2] tracking-[0.1px] text-ink lg:line-clamp-1 lg:group-hover:text-white min-[1920px]:text-[15px]">
            {product.title}
          </h3>

          <div className="mt-0.5 flex flex-wrap items-start justify-start gap-1 min-[1440px]:mt-1">
            <span className="text-[13px] font-normal leading-[1.5] text-ink lg:group-hover:text-white min-[1920px]:text-[14px]">
              <Money
                data={
                  product.priceRange
                    .minVariantPrice
                }
              />
            </span>
          </div>
        </div>

        {/*
         * The reference's quick-add: a 36x36 square outlined in 50% white,
         * bottom-aligned on the right of the info row. It is deliberately
         * near-invisible at rest -- white on a pale card -- and only reads
         * once the hover gradient darkens the bottom of the card, which is
         * the same moment the copy above flips to white. Desktop only, as
         * on the reference.
         */}
        <span className="hidden shrink-0 self-end lg:block">
          <span className="flex h-9 w-9 items-center justify-center rounded-[4px] border-[1.2px] border-line-strong text-ink transition-colors lg:group-hover:border-white/50 lg:group-hover:text-white">
            <BagIcon className="h-[15px] w-[15px]" />
          </span>
        </span>
      </div>
    </Link>
  );
}

function SliderSkeleton() {
  return (
    <div className="@container mt-3 min-[600px]:mt-3.5 lg:mt-4 min-[1440px]:mt-5 min-[1920px]:mt-5">
      <ul className="flex items-stretch gap-x-2 overflow-hidden px-4 min-[600px]:gap-x-3 min-[600px]:px-5 lg:gap-x-4 lg:px-8 min-[1200px]:px-10">
        {['a', 'b', 'c', 'd', 'e'].map(
          (key) => (
            <li
              key={key}
              className="shrink-0 animate-pulse w-[calc((100cqw_-_4px)/1.5)] min-[600px]:w-[calc((100cqw_-_18px)/2.5)] lg:w-[calc((100cqw_-_51.6px)/4.225)] min-[1920px]:w-[calc((100cqw_-_59.2px)/4.7)]"
            >
              <div className="aspect-[4/5] rounded-[6px] bg-bg-deep lg:rounded-lg" />

              <div className="mt-2.5 h-[22px] w-[50px] rounded-full bg-bg-deep lg:mx-4 lg:h-6" />

              <div className="mt-2 h-4 w-4/5 rounded bg-bg-deep lg:mx-4" />

              <div className="mt-1 h-4 w-1/3 rounded bg-bg-deep lg:mx-4 lg:mb-4" />
            </li>
          ),
        )}
      </ul>
    </div>
  );
}

/**
 * The reference's quick-add glyph -- a shopping bag, drawn at its own
 * proportions (its svg is 12.25 x 15.75, i.e. noticeably taller than wide).
 */
function BagIcon({
  className,
}: {
  className?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 14 18"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M1 5h12l-.9 12H1.9L1 5Z" />

      <path d="M4.6 7.4V4.1a2.4 2.4 0 0 1 4.8 0v3.3" />
    </svg>
  );
}