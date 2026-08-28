import type {MoneyV2} from '@shopify/hydrogen/storefront-api-types';

/**
 * Optimistic cart pricing.
 *
 * `useOptimisticCart` applies a pending quantity change to `line.quantity`
 * straight away, but it deliberately does not touch `line.cost` or
 * `cart.cost` -- those only move once the Cart API answers. Measured against
 * the Storefront API that is roughly a second, during which the stepper
 * shows the new quantity while the money beside it sits on the old figure.
 * That does not read as "pending", it reads as broken.
 *
 * Nothing here is invented. The figures are arithmetic on
 * `cost.amountPerQuantity` -- the per-unit price Shopify itself returned for
 * that line -- and the server's own value replaces them the moment it lands.
 * A line with a change in flight already renders at reduced opacity, so the
 * number is visibly provisional while it is a local guess.
 *
 * Every case this cannot model honestly falls back to the server value and
 * simply waits: see the guards below.
 */

/** Matches `AnimatedMoney`'s prop type -- optimistic costs are all partial. */
type PartialMoney = Partial<Pick<MoneyV2, 'amount' | 'currencyCode'>>;

type PricedLine = {
  quantity?: number;
  isOptimistic?: boolean;
  cost?: {
    totalAmount?: PartialMoney | null;
    amountPerQuantity?: PartialMoney | null;
  } | null;
  parentRelationship?: unknown;
  lineComponents?: unknown;
};

type PricedCart = {
  isOptimistic?: boolean;
  discountCodes?: Array<{applicable?: boolean}> | null;
  cost?: {subtotalAmount?: PartialMoney | null} | null;
  lines?: {nodes?: PricedLine[]} | null;
} | null;

/**
 * A bundle's child lines can carry their price on the parent or on
 * themselves depending on how the merchant configured the bundle, so a
 * cart containing one is left to the server rather than guessed at.
 */
function hasBundledLines(lines: PricedLine[]) {
  return lines.some((line) => line.parentRelationship || line.lineComponents);
}

/**
 * Whether local arithmetic may stand in for the server's figures right now.
 *
 * Note this is the CART's optimistic flag, not the line's. `useOptimisticCart`
 * only marks an individual line `isOptimistic` when it was just added -- a
 * quantity update bumps `line.quantity` and sets the flag on the cart alone.
 * Keying off the line would therefore leave exactly the case this exists for
 * (tapping + or -) still waiting on the network.
 */
export function canPriceLocally(cart: PricedCart): boolean {
  if (!cart?.isOptimistic) return false;

  // A cart-level discount is not something that can be recomputed here, so a
  // discounted cart keeps waiting rather than flashing a figure that ignores
  // the discount -- showing a shopper too low a number, even for a moment, is
  // worse than showing them a stale one.
  if (cart.discountCodes?.some((discount) => discount.applicable)) return false;

  const lines = cart.lines?.nodes ?? [];
  return lines.length > 0 && !hasBundledLines(lines);
}

/** The line total to display: locally computed only while a change is pending. */
export function displayLineTotal(
  line: PricedLine | undefined,
  priceLocally: boolean,
): PartialMoney | undefined {
  const cost = line?.cost;
  const perUnit = cost?.amountPerQuantity;

  if (!priceLocally || !perUnit?.amount || typeof line?.quantity !== 'number') {
    return cost?.totalAmount ?? undefined;
  }

  return {
    amount: String(Number(perUnit.amount) * line.quantity),
    currencyCode: perUnit.currencyCode,
  };
}

/** The subtotal to display: locally computed only while a change is pending. */
export function displaySubtotal(cart: PricedCart): PartialMoney | undefined {
  const server = cart?.cost?.subtotalAmount ?? undefined;
  if (!canPriceLocally(cart)) return server;

  const lines = cart?.lines?.nodes ?? [];
  let sum = 0;
  let currencyCode: PartialMoney['currencyCode'];

  for (const line of lines) {
    const perUnit = line?.cost?.amountPerQuantity;
    // Any line this cannot price means the whole sum would be wrong.
    if (!perUnit?.amount || typeof line.quantity !== 'number') return server;
    sum += Number(perUnit.amount) * line.quantity;
    currencyCode ??= perUnit.currencyCode;
  }

  if (!currencyCode) return server;
  return {amount: String(sum), currencyCode};
}
