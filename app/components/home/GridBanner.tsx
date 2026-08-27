import {Link} from 'react-router';
import {Reveal} from '~/components/Reveal';
import {gridImages} from '~/lib/site-imagery';
import {returns, store} from '~/lib/store-config';

/**
 * The reference site's `grid_banner` section -- its logotype set large and
 * pale across the top, then three editorial cards tucked under it.
 *
 * Two details do most of the work here, and both were wrong at first pass:
 *
 *  - The logotype is a flat #F3F3F3 wordmark, not dark type. It reads as a
 *    watermark the cards sit on top of, so it has to be barely there.
 *  - The three cards are NOT the same shape. Square, then 1:1.168, then
 *    1:0.809 (its own `padding-bottom` values, which kick in at 600px; all
 *    three are square below that). They top-align, so each caption lands at a
 *    different height and the row reads as staggered rather than as a grid.
 *
 * The three photographs are the storefront's own rather than collection
 * images -- see [gridImages] in `~/lib/site-imagery` for why.
 *
 * Also ported: the logotype's overhang (-10px, -20px at 600, -30px at 1024,
 * -40px at 1440), its 10/12 column width (9/12 from 1440), 6px-rounded card
 * images (8px from 1024), 12px between image and copy, 4px between title and
 * body, its `h7` scale, and its Splide behaviour -- 230px fixed-width cards on
 * a scroll rail below 1024, a three-up grid with a 16px gap above it.
 */
export function GridBanner() {
  const cards = [
    {
      title: 'Browse every category',
      body: 'The full range, sorted so you can actually find things.',
      to: '/collections',
      image: gridImages.shelf,
      // 100% at every width.
      aspect: 'aspect-square',
    },
    {
      title: 'Returns without a fight',
      body: `${returns.windowDays} days to change your mind, and we pay the postage.`,
      to: '/policies',
      image: gridImages.parcel,
      // 100% -> 116.835%.
      aspect: 'aspect-square min-[600px]:aspect-[1/1.16835]',
    },
    {
      title: 'From the journal',
      body: 'Guides, updates and the occasional opinion from the shop.',
      to: '/blogs/news',
      image: gridImages.journal,
      // 100% -> 80.92%.
      aspect: 'aspect-square min-[600px]:aspect-[1/0.8092]',
    },
  ];

  return (
    <section className="bg-surface">
      <div className="mx-auto w-full max-w-[1920px]">
        <div className="py-12 lg:py-[60px] min-[1440px]:py-20 min-[1920px]:py-24">
          {/* The wordmark overhangs the row below it, the way the reference
              lets its logotype sit down into the cards. Sized in container
              units off its own column so it fills the column the way that
              logotype does, and stays put above 1920 where the container
              stops growing and vw units would not. */}
          <div className="relative bottom-[-10px] px-4 min-[600px]:bottom-[-20px] min-[600px]:px-5 lg:bottom-[-30px] lg:px-8 min-[1200px]:px-10 min-[1440px]:bottom-[-40px]">
            <Reveal className="@container w-full lg:w-10/12 min-[1440px]:w-9/12">
              <span className="wordmark-bg block text-[20cqw]">
                {store.name}
              </span>
            </Reveal>
          </div>

          <ul className="flex snap-x snap-mandatory items-start gap-x-3 overflow-x-auto scroll-smooth px-4 scroll-pl-4 [scrollbar-width:none] min-[600px]:px-5 min-[600px]:scroll-pl-5 lg:grid lg:grid-cols-3 lg:gap-4 lg:overflow-visible lg:px-8 min-[1200px]:px-10 [&::-webkit-scrollbar]:hidden">
            {cards.map(({title, body, to, image, aspect}, i) => (
              <Reveal
                key={title}
                delay={i * 75}
                as="li"
                className="w-[230px] shrink-0 snap-start lg:w-auto"
              >
                <Link
                  to={to}
                  prefetch="intent"
                  className="group block no-underline hover:no-underline"
                >
                  <div className="mb-3 overflow-hidden rounded-[6px] bg-bg-deep lg:rounded-lg">
                    <div className={`relative w-full ${aspect}`}>
                      <img
                        src={image.src}
                        width={image.width}
                        height={image.height}
                        alt={image.alt}
                        loading="lazy"
                        decoding="async"
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                      />
                    </div>
                  </div>
                  <h3 className="mb-1 font-display text-[16px] font-medium leading-[1.2] tracking-[0.1px] text-ink lg:text-[17px] min-[1920px]:text-[20px]">
                    {title}
                  </h3>
                  <p className="text-[13px] leading-[1.5] text-ink-muted min-[1920px]:text-[14px]">
                    {body}
                  </p>
                </Link>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
