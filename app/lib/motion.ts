/**
 * Shared motion constants.
 *
 * These are the JS mirrors of the easing tokens declared in
 * `app/styles/tailwind.css` (`--ease-out-quart`, `--ease-spring`). Framer
 * Motion cannot read a CSS custom property for an easing curve, so the two
 * have to be kept in step by hand -- the point is that a Framer transition
 * and a plain CSS transition sitting next to each other on the page move on
 * the same curve.
 */

/** `--ease-out-quart` -- decisive settle, used for anything entering or leaving. */
export const EASE_OUT_QUART: [number, number, number, number] = [
  0.25, 1, 0.5, 1,
];

/** `--ease-spring` -- slight overshoot, reserved for feedback on a tap. */
export const EASE_SPRING: [number, number, number, number] = [
  0.34, 1.56, 0.64, 1,
];

/**
 * Enter/exit for a single cart line.
 *
 * `layout: 'position'` deliberately animates position only. Letting Framer
 * interpolate size as well distorts the product thumbnail mid-flight and
 * fights the drawer's own scroll container.
 *
 * The exit slides right, toward the edge the drawer opens from, so removing
 * a line reads as "out of the cart" rather than as content collapsing.
 */
export const cartLineMotion = {
  layout: 'position' as const,
  initial: {opacity: 0, y: -10},
  animate: {opacity: 1, y: 0},
  exit: {opacity: 0, x: 32},
  transition: {duration: 0.22, ease: EASE_OUT_QUART},
};
