import {Link} from 'react-router';
import {Image} from '@shopify/hydrogen';
import type {HomeCollectionFragment} from 'storefrontapi.generated';
import {Reveal} from '~/components/Reveal';
import {collectionFallbackImage} from '~/lib/collection-images';

/**
 * The order the tiles run in, left to right.
 *
 * Merchandising order, not the admin's. The loader hands these over sorted by
 * whenever each collection was last edited, which is arbitrary from a
 * shopper's point of view -- so the row is spelled out here instead: the two
 * collections that earn the click lead, the rooms follow, and the two
 * narrowest audiences close it out.
 *
 * Gift Ideas and Kitchen Gadgets Under $20 are deliberately absent. Neither
 * has a collection image, and a tile with no photograph is a grey rectangle
 * with a word on it.
 */
const tileOrder = [
  'best-selling',
  'trending-now',
  'home-accessories',
  'kitchen-accessories',
  'kids-babies',
  'pet-accessories',
];

/**
 * The reference site's `category_blocks` section.
 *
 * Ported exactly: a 2 -> 3 -> 6 column grid with 8px gaps and an 8px outer
 * pad, 8px-rounded tiles at a 1:1.1996 ratio (its 460x552 crop), a scrim that
 * only starts at 70% height, and an `h8` white label 16px in from the corner
 * (20px from 1024 up). Hover zooms the photo to 1.1, as its `hover-zoom` does.
 */
export function CategoryBlocks({
  collections,
}: {
  collections: HomeCollectionFragment[];
}) {
  // Driven by [tileOrder] rather than by the loader's order, and flatMap
  // rather than map + filter so the tile type carries a non-null image
  // through to the render below. A handle that is missing from the store, or
  // that has no photograph to show, drops out of the row instead of leaving a
  // hole in it.
  const tiles = tileOrder.flatMap((handle) => {
    const collection = collections.find((c) => c.handle === handle);
    if (!collection) return [];
    const image = collection.image ?? collectionFallbackImage(handle);
    return image ? [{collection, image}] : [];
  });

  if (!tiles.length) return null;

  return (
    <section className="bg-bg">
      <div className="grid grid-cols-2 gap-2 p-2 min-[600px]:grid-cols-3 lg:grid-cols-6">
        {tiles.map(({collection, image}, i) => (
          <Reveal key={collection.id} delay={i * 60} as="div">
            <Link
              to={`/collections/${collection.handle}`}
              prefetch="intent"
              data-cursor="Shop"
              className="group relative block h-full overflow-hidden rounded-lg no-underline hover:no-underline"
            >
              <div className="relative aspect-[1/1.1996] w-full overflow-hidden bg-bg-deep">
                <Image
                  data={image}
                  sizes="(min-width: 1024px) 17vw, (min-width: 600px) 33vw, 50vw"
                  alt={image.altText || collection.title}
                  className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0)_70%,rgba(0,0,0,0.5)_100%)]" />
              </div>
              <h3 className="absolute bottom-4 left-4 z-[1] font-display text-[14px] font-medium leading-[1.2] tracking-[0.1px] text-white lg:bottom-5 lg:left-5 min-[1920px]:text-[15px]">
                {collection.title}
              </h3>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
