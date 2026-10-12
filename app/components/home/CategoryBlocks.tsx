import {Image} from '@shopify/hydrogen';
import {useEffect, useRef} from 'react';
import {Link} from 'react-router';
import {resolveCollectionImage} from '~/lib/collection-images';

type CategoryImage = {
  id?: string | null;
  url: string;
  altText?: string | null;
  width?: number | null;
  height?: number | null;
};

type CategoryCollection = {
  id: string;
  title: string;
  handle: string;
  description?: string | null;
  image?: CategoryImage | null;
};

type CategoryFeatureImages = {
  bestSelling?: CategoryImage | null;
  trendingNow?: CategoryImage | null;
};

type CategoryBlocksProps = {
  collections: CategoryCollection[];

  featureImages?: CategoryFeatureImages;
};

type CategoryTile = {
  id: string;
  label: string;
  link: string;
  image: CategoryImage | null;
};

const CATEGORY_DEFINITIONS = [
  {
    label: 'Best Selling',

    handles: [
      'best-selling',
      'best-sellers',
      'bestsellers',
    ],

    fallbackLink: '/collections/all',
  },

  {
    label: 'Trending Now',

    handles: [
      'trending-now',
      'trending',
    ],

    fallbackLink: '/collections/all',
  },

  {
    label: 'Home Accessories',

    handles: [
      'home-accessories',
      'home',
    ],

    fallbackLink: '/collections/home-accessories',
  },

  {
    label: 'Kitchen Accessories',

    handles: [
      'kitchen-accessories',
      'kitchen',
    ],

    fallbackLink: '/collections/kitchen-accessories',
  },

  {
    label: 'Kids & Babies',

    handles: [
      'kids-babies',
      'kids-and-babies',
      'kids',
    ],

    fallbackLink: '/collections/kids-babies',
  },

  {
    label: 'Pet Accessories',

    handles: [
      'pet-accessories',
      'pets',
      'pet',
    ],

    fallbackLink: '/collections/pet-accessories',
  },
];

function findCollection(
  collections: CategoryCollection[],
  handles: string[],
) {
  return collections.find((collection) =>
    handles.includes(collection.handle),
  );
}

export function CategoryBlocks({
  collections,
  featureImages,
}: CategoryBlocksProps) {
  const {viewportRef, trackRef} = useMarquee();

  if (!collections?.length) {
    return null;
  }

  const bestSellingCollection = findCollection(
    collections,
    CATEGORY_DEFINITIONS[0].handles,
  );

  const trendingCollection = findCollection(
    collections,
    CATEGORY_DEFINITIONS[1].handles,
  );

  const homeCollection = findCollection(
    collections,
    CATEGORY_DEFINITIONS[2].handles,
  );

  const kitchenCollection = findCollection(
    collections,
    CATEGORY_DEFINITIONS[3].handles,
  );

  const kidsCollection = findCollection(
    collections,
    CATEGORY_DEFINITIONS[4].handles,
  );

  const petsCollection = findCollection(
    collections,
    CATEGORY_DEFINITIONS[5].handles,
  );

  /*
   * IMPORTANT:
   *
   * Best Selling intentionally uses the FEATURED IMAGE from:
   *
   * Colorful Nordic Ceramic Flowerpot with Tray
   *
   * /products/
   * nordic-industrial-style-colorful-ceramic-flowerpot-succulent-planter-
   * green-plants-cylindrical-shape-flower-pot-with-hole-tray
   *
   *
   * Trending Now intentionally uses the FEATURED IMAGE from:
   *
   * Silicone Pot Side Drain Stopper
   *
   * /products/kitchen-gadgets-silicone-pot-side-drain-stopper
   *
   *
   * These two images are passed in from the homepage Shopify query.
   */

  const categoryTiles: CategoryTile[] = [
    {
      id: 'best-selling',

      label: 'Best Selling',

      link: bestSellingCollection
        ? `/collections/${bestSellingCollection.handle}`
        : '/collections/all',

      image:
        featureImages?.bestSelling ??
        resolveCollectionImage('best-selling', bestSellingCollection?.image),
    },

    {
      id: 'trending-now',

      label: 'Trending Now',

      link: trendingCollection
        ? `/collections/${trendingCollection.handle}`
        : '/collections/all',

      image:
        featureImages?.trendingNow ??
        resolveCollectionImage('trending-now', trendingCollection?.image),
    },

    {
      id: 'home-accessories',

      label: 'Home Accessories',

      link: homeCollection
        ? `/collections/${homeCollection.handle}`
        : '/collections/home-accessories',

      image: resolveCollectionImage('home-accessories', homeCollection?.image),
    },

    {
      id: 'kitchen-accessories',

      label: 'Kitchen Accessories',

      link: kitchenCollection
        ? `/collections/${kitchenCollection.handle}`
        : '/collections/kitchen-accessories',

      image: resolveCollectionImage('kitchen-accessories', kitchenCollection?.image),
    },

    {
      id: 'kids-babies',

      label: 'Kids & Babies',

      link: kidsCollection
        ? `/collections/${kidsCollection.handle}`
        : '/collections/kids-babies',

      image: resolveCollectionImage('kids-babies', kidsCollection?.image),
    },

    {
      id: 'pet-accessories',

      label: 'Pet Accessories',

      link: petsCollection
        ? `/collections/${petsCollection.handle}`
        : '/collections/pet-accessories',

      image: resolveCollectionImage('pet-accessories', petsCollection?.image),
    },
  ];

  /*
   * Duplicate all six cards.
   *
   * The second set follows the first set through the carousel,
   * allowing the loop to wrap continuously without displaying
   * an empty gap.
   */
  const marqueeTiles = [
    ...categoryTiles,
    ...categoryTiles,
  ];

  return (
    <section
      className="category-carousel"
      aria-label="Shop by category"
    >
      <div ref={viewportRef} className="category-carousel__viewport">
        <div ref={trackRef} className="category-carousel__track">
          {marqueeTiles.map((tile, index) => (
            <article
              key={`${tile.id}-${index}`}
              className="category-carousel__item"
              aria-hidden={
                index >= categoryTiles.length
                  ? true
                  : undefined
              }
            >
              <Link
                to={tile.link}
                prefetch="intent"
                className="category-carousel__link group"
              >
                {tile.image ? (
                  <Image
                    data={tile.image}
                    alt={
                      tile.image.altText ||
                      tile.label
                    }
                    sizes="(min-width: 1280px) 16vw, (min-width: 768px) 28vw, 72vw"
                    className="category-carousel__image"
                  />
                ) : (
                  <div className="category-carousel__placeholder">
                    <span className="category-carousel__placeholder-text">
                      {tile.label}
                    </span>
                  </div>
                )}

                <div className="category-carousel__shade" />

                <span className="category-carousel__label">
                  {tile.label}
                </span>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* Auto-scroll speed, in px per ms (~36px/s, roughly the old 60s CSS loop). */
const AUTO_SPEED = 0.036;
/*
 * How long a fling takes to glide down into the auto-scroll speed, in ms.
 * It is the time constant of an exponential decay, so the row covers about
 * (release speed - auto speed) * GLIDE_TIME px before it is back at cruise.
 */
const GLIDE_TIME = 650;
/* How tightly the row follows a trackpad swipe while one is in progress. */
const WHEEL_FOLLOW_TIME = 45;
/* Wheel events further apart than this mean the swipe has ended. */
const WHEEL_IDLE = 80;
/* Pointer history used to measure the speed at release. */
const RELEASE_WINDOW = 90;
/* Pointer travel before a press becomes a drag rather than a click. */
const DRAG_THRESHOLD = 6;

/**
 * Drives the category row: it scrolls on its own, and can be dragged,
 * swiped or trackpad-scrolled. Whichever way the user last pushed it is the
 * way it keeps going.
 *
 * There is one velocity and it is never reset. Each frame it decays
 * exponentially toward a target, so speed is continuous at every moment:
 * after a fling the row glides down until it is moving at exactly the
 * auto-scroll speed, and simply carries on from there. Nothing stops and
 * restarts, so there is no seam.
 *
 * The track holds the tile set twice, so the offset wraps at the distance
 * between the first tile and its duplicate and the seam is never visible.
 * Offset grows as the content moves left.
 */
function useMarquee() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;

    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    );

    let loopWidth = 0;
    let offset = 0;
    let velocity = AUTO_SPEED;
    let direction = 1;
    let lastFrame = performance.now();
    let frame = 0;

    // Pointer drag state.
    let pointerId: number | null = null;
    let dragging = false;
    let startX = 0;
    let startOffset = 0;
    let history: {t: number; x: number}[] = [];
    let suppressClick = false;

    // Trackpad / wheel state.
    let wheelVelocity = 0;
    let lastWheel = -Infinity;

    const cruise = () => (reducedMotion.matches ? 0 : direction * AUTO_SPEED);

    const measure = () => {
      const items = track.children;
      const half = items.length / 2;
      loopWidth =
        half >= 1
          ? (items[half] as HTMLElement).offsetLeft -
            (items[0] as HTMLElement).offsetLeft
          : 0;
    };

    const render = () => {
      if (loopWidth > 0) {
        offset = ((offset % loopWidth) + loopWidth) % loopWidth;
      }
      track.style.transform = `translate3d(${-offset}px, 0, 0)`;
    };

    /*
     * Move velocity toward `target` with time constant `tau`, and advance
     * the offset by the exact distance covered on that curve, so the motion
     * is the same at any frame rate.
     */
    const glide = (dt: number, target: number, tau: number) => {
      const decay = Math.exp(-dt / tau);
      offset += target * dt + (velocity - target) * tau * (1 - decay);
      velocity = target + (velocity - target) * decay;
    };

    const tick = (now: number) => {
      // Clamped so a backgrounded tab does not jump on return.
      const dt = Math.min(now - lastFrame, 50);
      lastFrame = now;

      if (dragging) {
        // Offset follows the finger directly; velocity is measured on release.
      } else if (now - lastWheel < WHEEL_IDLE) {
        /*
         * Follow the swipe, but never slower than cruise in its direction:
         * hypot() is ~the swipe speed when fast and eases into exactly the
         * auto speed as the trackpad's own momentum dies away, so the hand-off
         * to cruising is already done by the time the events stop.
         */
        const target =
          direction *
          Math.hypot(wheelVelocity, reducedMotion.matches ? 0 : AUTO_SPEED);
        glide(dt, target, WHEEL_FOLLOW_TIME);
      } else {
        glide(dt, cruise(), GLIDE_TIME);
      }

      render();
      frame = requestAnimationFrame(tick);
    };

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0 || pointerId !== null) return;
      pointerId = event.pointerId;
      dragging = false;
      suppressClick = false;
      startX = event.clientX;
      startOffset = offset;
      history = [{t: event.timeStamp, x: event.clientX}];
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerId !== pointerId) return;

      if (!dragging) {
        if (Math.abs(event.clientX - startX) < DRAG_THRESHOLD) return;
        // Capture only once it is a drag, so a plain tap still reaches the link.
        dragging = true;
        suppressClick = true;
        // Pick the row up from wherever it is, without a jump.
        startX = event.clientX;
        startOffset = offset;
        viewport.setPointerCapture(event.pointerId);
        viewport.classList.add('is-dragging');
      }

      history.push({t: event.timeStamp, x: event.clientX});
      if (history.length > 20) history.shift();
      offset = startOffset - (event.clientX - startX);
    };

    const onPointerUp = (event: PointerEvent) => {
      if (event.pointerId !== pointerId) return;
      pointerId = null;
      if (!dragging) return;
      dragging = false;
      viewport.classList.remove('is-dragging');

      /*
       * Release speed over the last few samples before letting go. A drag
       * that was held still before release measures ~0 and so eases up to
       * cruise rather than flinging.
       */
      const recent = history.filter(
        (sample) => event.timeStamp - sample.t <= RELEASE_WINDOW,
      );
      const first = recent[0];
      const last = recent[recent.length - 1];
      velocity =
        first && last && last.t > first.t
          ? -(last.x - first.x) / (last.t - first.t)
          : 0;

      const net = startX - event.clientX;
      const push = Math.abs(velocity) > 0.02 ? velocity : net;
      if (push !== 0) direction = Math.sign(push);
    };

    const onClick = (event: MouseEvent) => {
      if (!suppressClick) return;
      suppressClick = false;
      event.preventDefault();
      event.stopPropagation();
    };

    const onWheel = (event: WheelEvent) => {
      // Leave vertical scrolling to the page.
      if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
      event.preventDefault();

      const deltaX = event.deltaMode === 1 ? event.deltaX * 16 : event.deltaX;
      const now = performance.now();
      const gap = now - lastWheel;
      const sample = deltaX / Math.min(Math.max(gap, 8), 50);

      // A new swipe starts from the row's current speed, not from zero.
      wheelVelocity =
        gap > WHEEL_IDLE
          ? Math.abs(velocity) * 0.5 + Math.abs(sample) * 0.5
          : Math.abs(wheelVelocity) * 0.7 + Math.abs(sample) * 0.3;
      direction = Math.sign(deltaX);
      lastWheel = now;
    };

    const preventNativeDrag = (event: DragEvent) => event.preventDefault();

    measure();
    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(track);

    viewport.addEventListener('pointerdown', onPointerDown);
    viewport.addEventListener('pointermove', onPointerMove);
    viewport.addEventListener('pointerup', onPointerUp);
    viewport.addEventListener('pointercancel', onPointerUp);
    viewport.addEventListener('click', onClick, true);
    viewport.addEventListener('wheel', onWheel, {passive: false});
    viewport.addEventListener('dragstart', preventNativeDrag);
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      viewport.removeEventListener('pointerdown', onPointerDown);
      viewport.removeEventListener('pointermove', onPointerMove);
      viewport.removeEventListener('pointerup', onPointerUp);
      viewport.removeEventListener('pointercancel', onPointerUp);
      viewport.removeEventListener('click', onClick, true);
      viewport.removeEventListener('wheel', onWheel);
      viewport.removeEventListener('dragstart', preventNativeDrag);
    };
  }, []);

  return {viewportRef, trackRef};
}
