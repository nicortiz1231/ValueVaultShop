import type {CartLineUpdateInput} from '@shopify/hydrogen/storefront-api-types';
import type {CartLayout, LineItemChildrenMap} from '~/components/CartMain';
import {CartForm, Image, type OptimisticCartLine} from '@shopify/hydrogen';
import {motion, type HTMLMotionProps} from 'framer-motion';
import NumberFlow from '@number-flow/react';
import {forwardRef} from 'react';
import {useVariantUrl} from '~/lib/variants';
import {cartLineMotion, EASE_SPRING} from '~/lib/motion';
import {displayLineTotal} from '~/lib/optimistic-pricing';
import {Link} from 'react-router';
import {AnimatedMoney} from './ui/AnimatedMoney';
import {MinusIcon, PlusIcon} from './Icons';
import {useAside} from './Aside';
import type {CartApiQueryFragment} from 'storefrontapi.generated';

export type CartLine = OptimisticCartLine<CartApiQueryFragment>;

/**
 * A single line item in the cart. It displays the product image, title, price.
 * It also provides controls to update the quantity or remove the line item.
 * If the line is a parent line that has child components (like warranties or gift wrapping), they are
 * rendered nested below the parent line.
 *
 * The line animates in and out. Exit only actually plays for top-level lines,
 * which `CartMain` wraps in an `<AnimatePresence>`; nested child lines mount
 * and unmount with their parent.
 *
 * The ref has to be forwarded: `AnimatePresence mode="popLayout"` measures a
 * departing line before pulling it out of the flow, and it can only do that
 * if it can reach the real `<li>`. Without this the measurement silently
 * fails and the surviving lines jump to the wrong offset.
 */
export const CartLineItem = forwardRef<
  HTMLLIElement,
  {
    layout: CartLayout;
    line: CartLine;
    childrenMap: LineItemChildrenMap;
    priceLocally: boolean;
  }
>(function CartLineItem({layout, line, childrenMap, priceLocally}, ref) {
  const {id, merchandise, isOptimistic} = line;
  const {product, title, image, selectedOptions} = merchandise;
  const lineItemUrl = useVariantUrl(product.handle, selectedOptions);
  const {close} = useAside();
  const lineItemChildren = childrenMap[id];
  const childrenLabelId = `cart-line-children-${id}`;

  // Meaningful options only -- Shopify reports a lone "Title: Default Title"
  // on single-variant products, which is noise in the cart.
  const options = selectedOptions.filter(
    (option) => option.value !== 'Default Title',
  );

  return (
    <motion.li
      key={id}
      ref={ref}
      {...cartLineMotion}
      // A line the server has not confirmed yet reads as provisional, which
      // is honest: the price and quantity shown are a local guess until the
      // Cart API answers.
      animate={{...cartLineMotion.animate, opacity: isOptimistic ? 0.55 : 1}}
      className="py-4"
    >
      <div className="flex gap-4">
        {image && (
          <Link
            to={lineItemUrl}
            prefetch="intent"
            onClick={() => layout === 'aside' && close()}
            className="shrink-0 overflow-hidden rounded-lg border border-line bg-surface"
          >
            <Image
              alt={title}
              aspectRatio="1/1"
              data={image}
              height={88}
              loading="lazy"
              width={88}
              className="h-22 w-22 object-cover"
            />
          </Link>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <Link
            prefetch="intent"
            to={lineItemUrl}
            onClick={() => layout === 'aside' && close()}
            className="text-[15px] font-medium leading-snug text-ink hover:text-brand"
          >
            {product.title}
          </Link>

          {options.length > 0 && (
            <ul className="mt-1 flex flex-wrap gap-x-3 text-[13px] text-ink-muted">
              {options.map((option) => (
                <li key={option.name}>
                  {option.name}: {option.value}
                </li>
              ))}
            </ul>
          )}

          <div className="mt-auto flex items-end justify-between gap-3 pt-3">
            <CartLineQuantity line={line} />
            <AnimatedMoney
              data={displayLineTotal(line, priceLocally)}
              className="text-[15px] font-semibold text-ink"
            />
          </div>
        </div>
      </div>

      {lineItemChildren ? (
        <div className="mt-3 pl-6">
          <p id={childrenLabelId} className="sr-only">
            Line items with {product.title}
          </p>
          <ul
            aria-labelledby={childrenLabelId}
            className="divide-y divide-line border-l-2 border-line pl-4"
          >
            {lineItemChildren.map((childLine) => (
              <CartLineItem
                childrenMap={childrenMap}
                key={childLine.id}
                line={childLine}
                layout={layout}
                priceLocally={priceLocally}
              />
            ))}
          </ul>
        </div>
      ) : null}
    </motion.li>
  );
});

/**
 * One end of the quantity stepper. Submits its parent `CartForm`, so it stays
 * a plain submit button -- the tap scale is the only thing added, and it is
 * what makes the control feel physical on touch where there is no hover.
 */
function StepperButton(props: HTMLMotionProps<'button'>) {
  return (
    <motion.button
      whileTap={{scale: 0.84}}
      transition={{duration: 0.14, ease: EASE_SPRING}}
      className="flex h-8 w-8 items-center justify-center text-ink-muted transition-colors hover:text-ink disabled:cursor-not-allowed disabled:opacity-35"
      {...props}
    />
  );
}

/**
 * Provides the controls to update the quantity of a line item in the cart.
 * These controls are disabled when the line item is new, and the server
 * hasn't yet responded that it was successfully added to the cart.
 */
function CartLineQuantity({line}: {line: CartLine}) {
  if (!line || typeof line?.quantity === 'undefined') return null;
  const {id: lineId, quantity, isOptimistic} = line;
  const prevQuantity = Number(Math.max(0, quantity - 1).toFixed(0));
  const nextQuantity = Number((quantity + 1).toFixed(0));

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center rounded-pill border border-line-strong bg-surface">
        <CartLineUpdateButton lines={[{id: lineId, quantity: prevQuantity}]}>
          <StepperButton
            aria-label="Decrease quantity"
            disabled={quantity <= 1 || !!isOptimistic}
            name="decrease-quantity"
            value={prevQuantity}
          >
            <MinusIcon className="h-3.5 w-3.5" />
          </StepperButton>
        </CartLineUpdateButton>

        {/* aria-hidden + a live-region-free label: the rolling digits are
            decorative, the number itself is announced by the buttons. */}
        <NumberFlow
          value={quantity}
          aria-hidden="true"
          className="min-w-6 text-center text-sm font-semibold text-ink"
        />
        <span className="sr-only">Quantity: {quantity}</span>

        <CartLineUpdateButton lines={[{id: lineId, quantity: nextQuantity}]}>
          <StepperButton
            aria-label="Increase quantity"
            name="increase-quantity"
            value={nextQuantity}
            disabled={!!isOptimistic}
          >
            <PlusIcon className="h-3.5 w-3.5" />
          </StepperButton>
        </CartLineUpdateButton>
      </div>

      <CartLineRemoveButton lineIds={[lineId]} disabled={!!isOptimistic} />
    </div>
  );
}

/**
 * A button that removes a line item from the cart. It is disabled
 * when the line item is new, and the server hasn't yet responded
 * that it was successfully added to the cart.
 */
function CartLineRemoveButton({
  lineIds,
  disabled,
}: {
  lineIds: string[];
  disabled: boolean;
}) {
  return (
    <CartForm
      fetcherKey={getUpdateKey(lineIds)}
      route="/cart"
      action={CartForm.ACTIONS.LinesRemove}
      inputs={{lineIds}}
    >
      <motion.button
        whileTap={{scale: 0.94}}
        transition={{duration: 0.14, ease: EASE_SPRING}}
        disabled={disabled}
        type="submit"
        className="text-[13px] text-ink-soft underline underline-offset-4 transition-colors hover:text-sale disabled:opacity-40"
      >
        Remove
      </motion.button>
    </CartForm>
  );
}

function CartLineUpdateButton({
  children,
  lines,
}: {
  children: React.ReactNode;
  lines: CartLineUpdateInput[];
}) {
  const lineIds = lines.map((line) => line.id);

  return (
    <CartForm
      fetcherKey={getUpdateKey(lineIds)}
      route="/cart"
      action={CartForm.ACTIONS.LinesUpdate}
      inputs={{lines}}
    >
      {children}
    </CartForm>
  );
}

/**
 * Returns a unique key for the update action. This is used to make sure actions modifying the same line
 * items are not run concurrently, but cancel each other. For example, if the user clicks "Increase quantity"
 * and "Decrease quantity" in rapid succession, the actions will cancel each other and only the last one will run.
 * @param lineIds - line ids affected by the update
 * @returns
 */
function getUpdateKey(lineIds: string[]) {
  return [CartForm.ACTIONS.LinesUpdate, ...lineIds].join('-');
}
