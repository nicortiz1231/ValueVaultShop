import {Link} from 'react-router';
import {Image} from '@shopify/hydrogen';
import type {HomeCollectionFragment} from 'storefrontapi.generated';
import {resolveCollectionImage} from '~/lib/collection-images';

/**
 * The reference site's `half_banner_with_sticky_text` section -- the split
 * pair that sits directly below its first product row, not in the hero.
 *
 * Ported: a 1 -> 2 column grid with an 8px gap, a 1:1.14675 crop, its flat 35%
 * black scrim, content inset 0/24/24 (0/40/40 from 1024), a 480px text column
 * (520px from 1920) that sticks below the header as the banner scrolls past,
 * its `h2` scale, and a full-width button pinned to the bottom.
 *
 * The stick offset is our own sticky chrome rather than the reference's 104px
 * -- announcement marquee plus header, so 25+53 and 30+53. Copying their
 * number would leave the text hanging below where it should catch.
 *
 * The buttons are white `.btn-pill`s rather than the butter `.btn-solid` the
 * rest of the site uses -- against these two photographs the yellow was the
 * loudest thing in the section.
 *
 * Either half can land on a collection with no image set in admin -- Trending
 * Now is one -- and with nothing behind the scrim that tile rendered as a flat
 * grey panel. It falls back to `~/lib/collection-images` for those, the same
 * stand-in the collections index and the homepage category row use, so one
 * collection never appears two different ways. Shopify's own image is always
 * preferred, so setting one in admin silently takes over here.
 */
export function SplitBanners({
  collections,
}: {
  collections: HomeCollectionFragment[];
}) {
  const [first, second] = collections.slice(2, 4);
  if (!first || !second) return null;

  const blocks = [
    {
      collection: first,
      image: resolveCollectionImage(first.handle, first.image),
      title: 'Made To Last',
      blurb: 'buy it once. use it for years. that is the whole idea.',
      cta: `Shop ${first.title}`,
    },
    {
      collection: second,
      image: resolveCollectionImage(second.handle, second.image),
      title: 'Everyday Basics',
      blurb: 'the unglamorous things you reach for without thinking.',
      cta: `Shop ${second.title}`,
    },
  ];

  return (
    <section className="bg-bg">
      <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
        {blocks.map(({collection, image, title, blurb, cta}) => (
          <Link
            key={collection.id}
            to={`/collections/${collection.handle}`}
            prefetch="intent"
            data-cursor="Shop"
            className="group relative block overflow-hidden bg-bg-deep no-underline hover:no-underline"
          >
            <div className="relative aspect-[1/1.14675] w-full overflow-hidden">
              {image ? (
                <Image
                  data={image}
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  alt={image.altText || collection.title}
                  className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                />
              ) : null}
              <div className="absolute inset-0 bg-black/35" />
            </div>

            <div className="absolute inset-0 z-[1] flex flex-col justify-between px-6 pb-6 lg:px-10 lg:pb-10">
              <div className="sticky top-[78px] mx-auto lg:top-[83px] mb-[74.4px] max-w-[480px] pt-8 text-center text-white transition-all duration-500 lg:mb-[90.4px] lg:pt-10 min-[1440px]:pt-[60px] min-[1920px]:max-w-[520px]">
                <h2 className="mb-3 font-display text-[38px] font-semibold leading-none tracking-[-0.5px] min-[600px]:text-[48px] lg:text-[60px] min-[1440px]:text-[68px] min-[1920px]:mb-5 min-[1920px]:text-[80px]">
                  {title}
                </h2>
                <p className="text-[13px] leading-[1.5] min-[1920px]:text-[14px]">
                  {blurb}
                </p>
              </div>
              <span className="btn-pill w-full text-center">{cta}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
