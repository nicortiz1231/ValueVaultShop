import {Link} from 'react-router';
import {Image} from '@shopify/hydrogen';
import type {HomeCollectionFragment} from 'storefrontapi.generated';
import {Reveal} from '~/components/Reveal';

/**
 * The reference site's `hero_banner` section -- a full-bleed photo with
 * centred white copy and one button stacked over it.
 *
 * Ported: its top-to-bottom scrim (transparent to 20% black at 57.21%), the
 * 520px fixed height between 600 and 1023 that releases to auto above, the
 * 60px/40px vertical padding, and its `h1` scale (46/60/80/120/140).
 *
 * The reference runs a second copy of this section immediately after, holding
 * an image-only promo graphic. That one is deliberately not cloned.
 */
export function PromoBanner({
  collection,
}: {
  collection?: HomeCollectionFragment;
}) {
  const image = collection?.image;

  return (
    <section className="relative grid bg-bg-deep">
      <div className="relative col-start-1 row-start-1 min-h-full w-full">
        {image ? (
          <Image
            data={image}
            sizes="100vw"
            alt=""
            className="h-full w-full object-cover"
          />
        ) : null}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.2)_57.21%)]" />
      </div>

      <div className="col-start-1 row-start-1 z-[1] mx-auto flex w-full max-w-[1920px] items-center justify-center px-4 py-[60px] min-[600px]:h-[520px] min-[600px]:px-5 lg:h-auto lg:px-8 lg:py-10 min-[1200px]:px-10">
        <Reveal className="w-full text-center text-white lg:w-8/12">
          <div className="flex flex-col gap-y-2 min-[1440px]:gap-y-4">
            <h2 className="font-display text-[46px] font-semibold leading-[0.9] tracking-[-1px] min-[600px]:text-[60px] lg:text-[80px] min-[1440px]:text-[120px] min-[1920px]:text-[140px]">
              Useful things, fair prices
            </h2>
            <p className="text-[13px] leading-[1.5] min-[1920px]:text-[14px]">
              Everything on the shelf earns its place, or it does not go on it
            </p>
          </div>
          <div className="mt-5 flex flex-wrap justify-center gap-2 lg:mt-7">
            <Link
              to="/collections/all"
              prefetch="intent"
              className="btn-solid w-full text-center no-underline hover:no-underline min-[600px]:w-auto"
            >
              Shop Everything
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
