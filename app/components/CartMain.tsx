import {useOptimisticCart} from '@shopify/hydrogen';
import {AnimatePresence, motion} from 'framer-motion';
import {Link} from 'react-router';
import type {CartApiQueryFragment} from 'storefrontapi.generated';
import {useAside} from '~/components/Aside';
import {CartLineItem, type CartLine} from '~/components/CartLineItem';
import {CartSummary} from './CartSummary';
import {CartIcon} from './Icons';
import {EASE_OUT_QUART} from '~/lib/motion';
import {canPriceLocally} from '~/lib/optimistic-pricing';
import {returns} from '~/lib/store-config';

export type CartLayout = 'page' | 'aside';

export type CartMainProps = {
  cart: CartApiQueryFragment | null;
  layout: CartLayout;
};

export type LineItemChildrenMap = {[parentId: string]: CartLine[]};
/** Returns a map of all line items and their children. */
function getLineItemChildrenMap(lines: CartLine[]): LineItemChildrenMap {
  const children: LineItemChildrenMap = {};
  for (const line of lines) {
    if ('parentRelationship' in line && line.parentRelationship?.parent) {
      const parentId = line.parentRelationship.parent.id;
      if (!children[parentId]) children[parentId] = [];
      children[parentId].push(line);
    }
    if ('lineComponents' in line) {
      const lineChildren = getLineItemChildrenMap(line.lineComponents);
      for (const [parentId, childIds] of Object.entries(lineChildren)) {
        if (!children[parentId]) children[parentId] = [];
        children[parentId].push(...childIds);
      }
    }
  }
  return children;
}
/**
 * The main cart component that displays the cart items and summary.
 * It is used by both the /cart route and the cart aside dialog.
 */
export function CartMain({layout, cart: originalCart}: CartMainProps) {
  // The useOptimisticCart hook applies pending actions to the cart
  // so the user immediately sees feedback when they modify the cart.
  const cart = useOptimisticCart(originalCart);

  const hasLines = Boolean(cart?.lines?.nodes?.length || 0);
  const cartHasItems = cart?.totalQuantity ? cart.totalQuantity > 0 : false;
  const childrenMap = getLineItemChildrenMap(cart?.lines?.nodes ?? []);
  const isAside = layout === 'aside';
  // Computed once here rather than per line: the guards it applies are
  // properties of the whole cart, not of any single line.
  const priceLocally = canPriceLocally(cart);

  if (!hasLines) {
    return <CartEmpty layout={layout} />;
  }

  return (
    <section
      aria-label={isAside ? 'Cart drawer' : 'Cart page'}
      className={
        isAside
          ? 'flex h-full flex-col'
          : 'grid gap-10 lg:grid-cols-[1fr_22rem] lg:items-start'
      }
    >
      <p id="cart-lines" className="sr-only">
        Line items
      </p>

      <ul
        aria-labelledby="cart-lines"
        className={
          isAside
            ? 'flex-1 divide-y divide-line overflow-y-auto px-5'
            : 'divide-y divide-line border-y border-line'
        }
      >
        {/* `popLayout` pulls a removed line out of the flow before it has
            finished fading, so the lines beneath it close the gap in the same
            beat instead of jumping once the exit ends. `initial={false}`
            keeps the list from animating on first paint -- a cart that
            cascades in every time the drawer opens gets old fast. */}
        <AnimatePresence initial={false} mode="popLayout">
          {(cart?.lines?.nodes ?? []).map((line) => {
            // Child lines (warranties, gift wrap) render nested under their parent.
            if (
              'parentRelationship' in line &&
              line.parentRelationship?.parent
            ) {
              return null;
            }
            return (
              <CartLineItem
                key={line.id}
                line={line}
                layout={layout}
                childrenMap={childrenMap}
                priceLocally={priceLocally}
              />
            );
          })}
        </AnimatePresence>
      </ul>

      {cartHasItems && <CartSummary cart={cart} layout={layout} />}
    </section>
  );
}

function CartEmpty({layout}: {layout?: CartMainProps['layout']}) {
  const {close} = useAside();

  return (
    <motion.div
      initial={{opacity: 0, y: 8}}
      animate={{opacity: 1, y: 0}}
      transition={{duration: 0.3, ease: EASE_OUT_QUART}}
      className="flex flex-col items-center justify-center px-6 py-16 text-center"
    >
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-bg-deep text-ink-soft">
        <CartIcon className="h-7 w-7" />
      </span>
      <h3 className="mt-5 text-lg font-bold text-ink">Your cart is empty</h3>
      <p className="mt-2 max-w-xs text-sm leading-relaxed text-ink-muted">
        Nothing in here yet. Everything ships with {returns.windowDays}-day
        returns, so there is no risk in trying something.
      </p>
      <Link
        to="/collections/all"
        onClick={() => layout === 'aside' && close()}
        prefetch="viewport"
        className="mt-6 inline-flex h-11 items-center rounded-pill bg-brand px-6 text-sm font-semibold text-bg transition-colors hover:bg-brand-deep"
      >
        Start shopping
      </Link>
    </motion.div>
  );
}
