import {Reveal} from '~/components/Reveal';
import {heroImage} from '~/lib/site-imagery';
import {store} from '~/lib/store-config';

/**
 * Above the fold -- one full-bleed photograph with the wordmark centred on it.
 *
 * The reference site (kaleidojewellery.com) runs a paired `banner_2_in_1` here,
 * two images meeting at a seam. This storefront deliberately does not: a single
 * uninterrupted room reads as one considered space, whereas two unrelated
 * halves read as two thumbnails pushed together.
 *
 * The photography is the storefront's own rather than the catalogue's -- see
 * [heroImage] in `~/lib/site-imagery` for why. Briefly: collection images on
 * the real store are 600-1080px square, and this section is painted at the full
 * width of the viewport, so using one here meant a four- to five-times upscale
 * and visibly soft edges.
 *
 * The wordmark is plain white over a soft scrim. It previously used
 * mix-blend-difference to invert itself against whatever sat underneath, which
 * read as a photographic negative; a flat white logotype over photography is
 * also what the reference does.
 */
export function Hero() {
  const {portrait, wide} = heroImage;

  return (
    <section className="relative">
      {/* Portrait on a phone, widescreen from 600px. The aspect ratios are the
          section's, and the image is cropped to each at source, so `object-cover`
          never has to throw much away. */}
      <div className="relative aspect-[1/1.0833] w-full overflow-hidden bg-bg-deep min-[600px]:aspect-[16/9] lg:aspect-[1.846/1]">
        <picture>
          <source media="(min-width: 600px)" srcSet={wide.src} />
          <img
            src={portrait.src}
            width={portrait.width}
            height={portrait.height}
            alt={portrait.alt}
            // The LCP element on every breakpoint, so it is eager and decoded
            // synchronously. No `fetchpriority`: react-dom 18 does not forward
            // it, and the img is the first element in the body anyway, so the
            // preload scanner reaches it immediately regardless.
            loading="eager"
            decoding="sync"
            className="h-full w-full object-cover"
          />
        </picture>

        {/* A soft radial scrim centred on the wordmark. White type has no
            automatic contrast safety net, and this room is brightest exactly
            where the letterforms sit -- the pale wall and windows behind them.
            Darkening only the middle holds the wordmark without flattening the
            corners. The stops are tuned by measurement, not by eye: they put
            the worst 5% of the backdrop above the 3:1 WCAG large-text floor. */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_65%_45%_at_50%_50%,rgba(0,0,0,0.46)_0%,rgba(0,0,0,0.30)_58%,rgba(0,0,0,0)_100%)]" />

        <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-4 lg:py-[60px]">
          <Reveal>
            <span className="display text-center text-[17vw] leading-[0.85] text-white lg:text-[11vw]">
              {store.name}
            </span>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
