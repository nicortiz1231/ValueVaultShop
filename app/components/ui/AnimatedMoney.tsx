import NumberFlow from '@number-flow/react';
import type {MoneyV2} from '@shopify/hydrogen/storefront-api-types';

/**
 * The storefront's formatting locale.
 *
 * Pinned rather than inferred: the server and the browser must format the
 * same amount into the exact same string or React reports a hydration
 * mismatch, and `Intl`'s default locale differs between the Workers runtime
 * and the visitor's browser. This mirrors the `i18n` passed to
 * `createHydrogenContext` in `app/lib/context.ts` -- if that ever becomes
 * request-derived, this has to follow it.
 */
const STOREFRONT_LOCALE = 'en-US';

/**
 * A money amount whose digits roll when the value changes.
 *
 * Hydrogen's `<Money>` replaces the whole string at once, so an optimistic
 * cart update reads as a flicker -- the subtotal blinks and you cannot tell
 * which way it moved. This keeps the currency symbol still and animates only
 * the digits that actually changed, which is the whole point: the shopper
 * sees the number climb, so the cart feels like it responded to them.
 *
 * Respects `prefers-reduced-motion` (NumberFlow's own default), rendering the
 * final value with no transition.
 */
export function AnimatedMoney({
  data,
  className,
}: {
  // Deliberately looser than `MoneyV2`: an optimistic cart line carries a
  // locally-built cost whose fields are all optional until the Cart API
  // confirms it, so this has to accept a partial amount.
  data?: Partial<Pick<MoneyV2, 'amount' | 'currencyCode'>> | null;
  className?: string;
}) {
  // Without a currency `Intl.NumberFormat` throws on `style: 'currency'`,
  // so an incomplete amount renders nothing rather than a bare number that
  // could be read as the wrong currency.
  if (!data?.amount || !data.currencyCode) return null;

  return (
    <NumberFlow
      value={Number(data.amount)}
      locales={STOREFRONT_LOCALE}
      format={{
        style: 'currency',
        currency: data.currencyCode,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }}
      className={className}
    />
  );
}
