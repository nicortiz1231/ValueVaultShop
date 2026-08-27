import {Image} from '@shopify/hydrogen';
import type {HomeCollectionFragment} from 'storefrontapi.generated';
import {Reveal} from '~/components/Reveal';
import {store} from '~/lib/store-config';

/**
 * Above the fold -- the reference site's `banner_2_in_1` section.
 *
 * One hero, not two. The reference pairs two images side by side at desktop
 * and stacks them below 1024, with its logotype centred across the seam, and
 * the pair is a single banner: neither half is separately clickable. Its own
 * aspect ratios are ported exactly (padding-bottom 90.68% below 600px,
 * 108.33% above).
 *
 * mix-blend-difference on the wordmark keeps it legible over whatever
 * photography lands underneath -- unlike the reference's consistently
 * mid-tone lifestyle shots, catalogue images swing from near-black to
 * near-white and a fixed colour would disappear against half of them.
 */
export function Hero({collections}: {collections: HomeCollectionFragment[]}) {
  const [left, right] = collections;

  return (
    <section className="relative">
      <div className="relative flex flex-col lg:flex-row">
        <HeroImage collection={left} priority />
        <HeroImage collection={right} />

        <div className="pointer-events-none absolute inset-0 z-[1] flex items-center justify-center px-4 lg:py-[60px]">
          <Reveal>
            <span className="display mix-blend-difference text-center text-[17vw] leading-[0.85] text-white lg:text-[11vw]">
              {store.name}
            </span>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function HeroImage({
  collection,
  priority = false,
}: {
  collection?: HomeCollectionFragment;
  priority?: boolean;
}) {
  const image = collection?.image;

  return (
    <div className="relative aspect-[1/0.9068] w-full overflow-hidden bg-bg-deep min-[600px]:aspect-[1/1.0833] lg:w-1/2">
      {image ? (
        <Image
          data={image}
          sizes="(min-width: 1024px) 50vw, 100vw"
          alt={image.altText || collection!.title}
          loading={priority ? 'eager' : 'lazy'}
          className="h-full w-full object-cover"
        />
      ) : null}
    </div>
  );
}
