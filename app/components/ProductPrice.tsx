import {Money} from '@shopify/hydrogen';
import type {MoneyV2} from '@shopify/hydrogen/storefront-api-types';

/**
 * Price display.
 *
 * A compare-at price is only ever rendered when Shopify actually holds one, so
 * the savings shown to a shopper are always real.
 */
export function ProductPrice({
  price,
  compareAtPrice,
  size = 'md',
}: {
  price?: MoneyV2;
  compareAtPrice?: MoneyV2 | null;
  size?: 'md' | 'lg';
}) {
  const priceAmount = Number(price?.amount ?? 0);
  const compareAmount = Number(compareAtPrice?.amount ?? 0);
  const onSale = Boolean(compareAtPrice) && compareAmount > priceAmount;
  const percentOff = onSale
    ? Math.round(((compareAmount - priceAmount) / compareAmount) * 100)
    : 0;

  const priceClass = size === 'lg' ? 'text-[28px]' : 'text-xl';

  return (
    <div aria-label="Price" className="flex flex-wrap items-baseline gap-x-3 gap-y-1.5" role="group">
      {price ? (
        <span className={`${priceClass} font-bold tracking-tight text-chalk`}>
          <Money data={price} />
        </span>
      ) : (
        <span>&nbsp;</span>
      )}

      {onSale && compareAtPrice && (
        <>
          <s className="text-base text-dim">
            <Money data={compareAtPrice} />
          </s>
          <span className="rounded-pill bg-flare/15 px-2.5 py-1 text-[12px] font-bold text-flare">
            Save {percentOff}%
          </span>
        </>
      )}
    </div>
  );
}
