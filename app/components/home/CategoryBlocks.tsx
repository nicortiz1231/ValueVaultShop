import {Link} from 'react-router';
import {Image} from '@shopify/hydrogen';
import type {HomeCollectionFragment} from 'storefrontapi.generated';
import {Reveal} from '~/components/Reveal';

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
  const tiles = collections.slice(0, 6);
  if (!tiles.length) return null;

  return (
    <section className="bg-bg">
      <div className="grid grid-cols-2 gap-2 p-2 min-[600px]:grid-cols-3 lg:grid-cols-6">
        {tiles.map((collection, i) => (
          <Reveal key={collection.id} delay={i * 60} as="div">
            <Link
              to={`/collections/${collection.handle}`}
              prefetch="intent"
              data-cursor="Shop"
              className="group relative block h-full overflow-hidden rounded-lg no-underline hover:no-underline"
            >
              <div className="relative aspect-[1/1.1996] w-full overflow-hidden bg-bg-deep">
                {collection.image ? (
                  <Image
                    data={collection.image}
                    sizes="(min-width: 1024px) 17vw, (min-width: 600px) 33vw, 50vw"
                    alt={collection.image.altText || collection.title}
                    className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                  />
                ) : null}
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
