import {Image} from '@shopify/hydrogen';
import type {HomeCollectionFragment} from 'storefrontapi.generated';
import {Reveal} from '~/components/Reveal';
import {reviews} from '~/lib/store-config';
import {StarRating} from '~/components/StarRating';

/**
 * The reference site's `reviews` section -- a tall image panel with a headline
 * centred on it, and a coloured well of review cards scrolling beside it.
 *
 * Ported: the near-flush 4/6/8px container gutters, the 4/8 -> 5/7 -> 4/8
 * column split, the image panel's 69.37% -> 95.66% crop, the coloured well
 * with its 48 -> 80 -> 120 -> 200px top padding, and 8px-rounded white cards
 * padded 24px (40px from 1024) holding stars, an `h7` author and clamped copy.
 *
 * IMPORTANT: this renders nothing until `reviews.enabled` is true. The
 * reference fills its cards with named customers and quotes; inventing those
 * is the single fastest way to make a storefront read as fake, and this
 * project already decided against it in store-config. Wire a review app up,
 * flip the flag, and the section appears with real testimonials in it.
 */
export function Reviews({
  collection,
  items = [],
}: {
  collection?: HomeCollectionFragment;
  items?: {author: string; rating: number; body: string}[];
}) {
  if (!reviews.enabled || !items.length) return null;

  return (
    <section className="bg-bg">
      <div className="mx-auto w-full max-w-[1920px] px-1 lg:px-1.5 min-[1440px]:px-2">
        <div className="flex flex-col lg:flex-row">
          <div className="relative w-full lg:w-4/12 min-[1440px]:w-5/12 min-[1920px]:w-4/12">
            <div className="relative aspect-[1/0.6937] h-full w-full overflow-hidden bg-bg-deep lg:aspect-[1/0.9566] min-[1024px]:h-full">
              {collection?.image ? (
                <Image
                  data={collection.image}
                  sizes="(min-width: 1024px) 34vw, 100vw"
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : null}
              <h2 className="absolute left-1/2 top-1/2 z-[1] w-full max-w-[220px] -translate-x-1/2 -translate-y-1/2 text-center font-display text-[30px] font-semibold leading-none tracking-[-0.5px] text-white min-[600px]:text-[36px] lg:max-w-[280px] lg:text-[42px] min-[1440px]:text-[48px] min-[1920px]:max-w-[340px] min-[1920px]:text-[56px]">
                What people actually say
              </h2>
            </div>
          </div>

          <div className="w-full bg-block-sky py-12 lg:w-8/12 lg:py-20 min-[1440px]:w-7/12 min-[1440px]:pb-[100px] min-[1440px]:pt-[120px] min-[1920px]:w-8/12 min-[1920px]:pb-[120px] min-[1920px]:pt-[200px]">
            <ul className="flex snap-x snap-mandatory items-stretch gap-x-2 overflow-x-auto scroll-smooth px-4 scroll-pl-4 [scrollbar-width:none] min-[600px]:gap-x-2 lg:gap-x-3 lg:pl-[60px] lg:pr-8 lg:scroll-pl-[60px] min-[1200px]:gap-x-4 min-[1200px]:pr-11 [&::-webkit-scrollbar]:hidden">
              {items.map((review, i) => (
                <Reveal
                  key={review.author}
                  delay={i * 75}
                  as="li"
                  className="w-[80%] shrink-0 snap-start min-[600px]:w-[48%] min-[1200px]:w-[38%] min-[1920px]:w-[28%]"
                >
                  <div className="h-full rounded-lg bg-surface p-6 lg:p-10">
                    <div className="mb-2">
                      <StarRating rating={review.rating} count={1} />
                    </div>
                    <p className="mb-4 font-display text-[16px] font-medium leading-[1.2] tracking-[0.1px] text-ink lg:text-[17px] min-[1920px]:text-[20px]">
                      {review.author}
                    </p>
                    <p className="line-clamp-6 text-[13px] leading-[1.5] text-ink-muted min-[1920px]:text-[14px]">
                      &ldquo;{review.body}&rdquo;
                    </p>
                  </div>
                </Reveal>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
