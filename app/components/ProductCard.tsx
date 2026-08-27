import {useState} from 'react';
import {Link, type FetcherWithComponents} from 'react-router';
import {CartForm, Image, Money} from '@shopify/hydrogen';
import type {CollectionProductFragment} from 'storefrontapi.generated';
import {PlusIcon} from './Icons';

/**
 * The collection grid's product card.
 *
 * A direct port of kaleidojewellery.com's `.product-card`, with the numbers
 * read off its stylesheet rather than eyeballed:
 *
 *   - 4:5 portrait image (its `padding-bottom: 125%`)
 *   - 6px corner radius, squared off on mobile (`.no-rounded-on-mobile`)
 *   - the second product photo cross-fades in on hover, .3s with a .1s delay
 *   - status labels top-left at 12px, 16px from 1024, 24px from 1920
 *   - `.bottom-con`: 10px above, 12px either side, 8px between the text
 *     column and the button, top-aligned on mobile and bottom-aligned on
 *     desktop
 *   - title in `.h8` (Outfit 500 / 14px), prices in `.p2` (Geist 400 / 13px),
 *     labels in `.p4` (11px) at `padding: 1px 6px; border-radius: 4px`
 *
 * Two deliberate departures from the reference:
 *
 *   - No wishlist heart. There is no wishlist behind it on this store, and a
 *     heart that silently does nothing is worse than no heart. (The reference
 *     hides its own desktop one anyway -- `.wishlist-btn-desktop-wrp` is
 *     `display: none` -- so the desktop layout is unaffected.)
 *   - Labels are derived from Shopify's own data (a real compare-at price, a
 *     sold-out variant) rather than from hand-typed tags, so the card can
 *     never advertise a discount the checkout will not honour.
 */

/**
 * Works out whether a product is genuinely discounted.
 *
 * Only returns a discount when Shopify actually carries a higher compare-at
 * price -- the card never manufactures a "was" price, because invented anchor
 * pricing is one of the tells shoppers use to spot a fake store.
 */
function getDiscount(product: CollectionProductFragment) {
  const price = product.priceRange.minVariantPrice;
  const compareAt = product.compareAtPriceRange?.minVariantPrice;

  const priceAmount = Number(price.amount);
  const compareAmount = Number(compareAt?.amount ?? 0);

  if (
    !compareAt ||
    !Number.isFinite(compareAmount) ||
    compareAmount <= priceAmount
  ) {
    return {price, compareAt: null, percentOff: 0};
  }

  return {
    price,
    compareAt,
    percentOff: Math.round(
      ((compareAmount - priceAmount) / compareAmount) * 100,
    ),
  };
}

/**
 * True when the collection's cheapest and dearest variants differ, which is
 * what earns the "From" prefix. Shown only when it is true: prefixing a
 * single-price product with "From" implies options that do not exist.
 */
function hasPriceRange(product: CollectionProductFragment) {
  return (
    product.priceRange.minVariantPrice.amount !==
    product.priceRange.maxVariantPrice.amount
  );
}

/** The colour option's swatches, or null when the product has no colour axis. */
function getSwatches(product: CollectionProductFragment) {
  const option = product.options?.find((entry) =>
    /^colou?r$/i.test(entry.name),
  );
  if (!option) return null;

  const swatches = option.optionValues
    .map((value) => ({
      name: value.name,
      color: value.swatch?.color ?? null,
      image: value.swatch?.image?.previewImage?.url ?? null,
    }))
    // A value with neither a colour nor an image has nothing to draw, and an
    // empty grey circle reads as a broken image rather than a colour choice.
    .filter((value) => value.color || value.image);

  return swatches.length > 1 ? swatches : null;
}

/**
 * Whether any product in a grid carries colour swatches.
 *
 * The swatch strip sits above the title, so a grid where only some cards have
 * one gets ragged title baselines across the row. Rather than reserving the
 * strip unconditionally -- dead space on a catalogue with no colour options at
 * all -- the grid asks this once and reserves it for every card or none.
 */
export function anyProductHasSwatches(products: CollectionProductFragment[]) {
  return products.some((product) => getSwatches(product) !== null);
}

export function ProductCard({
  product,
  loading,
  reserveSwatchRow = false,
}: {
  product: CollectionProductFragment;
  loading?: 'eager' | 'lazy';
  reserveSwatchRow?: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  const {price, compareAt, percentOff} = getDiscount(product);
  const swatches = getSwatches(product);
  const images = product.images?.nodes ?? [];
  const primary = images[0] ?? product.featuredImage;
  const secondary = images[1] ?? null;
  const soldOut = !product.availableForSale;

  // Quick-add can only add a line when there is exactly one thing to add.
  // Anything with options has to go through the product page, so the button
  // becomes a link rather than pretending to make the choice for the shopper.
  const singleVariant =
    product.options?.every((option) => option.optionValues.length <= 1) ?? false;
  const variantId = product.selectedOrFirstAvailableVariant?.id;
  const canQuickAdd = singleVariant && !soldOut && Boolean(variantId);

  const imageClass =
    'absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ease-out';

  return (
    <div
      className="group relative flex h-full flex-col"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link
        prefetch="intent"
        to={`/products/${product.handle}`}
        data-cursor="View"
        className="block"
      >
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-card min-[600px]:rounded-[6px]">
          {primary ? (
            <Image
              alt={primary.altText || product.title}
              data={primary}
              loading={loading}
              sizes="(min-width: 1024px) 25vw, 50vw"
              className={`${imageClass} ${
                secondary && hovered ? 'opacity-0' : 'opacity-100'
              }`}
            />
          ) : (
            <div className="absolute inset-0 bg-bg-deep" />
          )}

          {/* The hover image is mounted from the start rather than swapped in
              on hover, so the browser has already decoded it by the time the
              pointer arrives and the cross-fade does not flash white. The
              100ms delay is the reference's own `transition-delay: .1s`. */}
          {secondary && (
            <Image
              alt={secondary.altText || product.title}
              data={secondary}
              loading="lazy"
              sizes="(min-width: 1024px) 25vw, 50vw"
              className={`${imageClass} ${
                hovered ? 'opacity-100 delay-100' : 'opacity-0'
              }`}
            />
          )}

          <div className="pointer-events-none absolute left-3 top-3 flex flex-col items-start gap-1 min-[1024px]:left-4 min-[1024px]:top-4 min-[1920px]:left-6 min-[1920px]:top-6">
            {soldOut && <ProductLabel>Sold out</ProductLabel>}
          </div>
        </div>
      </Link>

      <div className="flex h-full flex-wrap items-start gap-x-2 px-3 pt-2.5 min-[1024px]:items-end">
        <div className="min-w-0 flex-1">
          {(swatches || reserveSwatchRow) && (
            <ul className="mb-1 flex h-3 items-center gap-1">
              {swatches?.slice(0, 5).map((swatch) => (
                <li
                  key={swatch.name}
                  title={swatch.name}
                  className="h-3 w-3 rounded-full border border-line-strong bg-cover bg-center"
                  style={{
                    backgroundColor: swatch.color ?? undefined,
                    backgroundImage: swatch.image
                      ? `url(${swatch.image})`
                      : undefined,
                  }}
                />
              ))}
              {swatches && swatches.length > 5 && (
                <li className="type-p4 pl-0.5 text-ink-soft">
                  +{swatches.length - 5}
                </li>
              )}
            </ul>
          )}

          <Link
            prefetch="intent"
            to={`/products/${product.handle}`}
            className="type-h8 line-clamp-2-fixed block text-ink transition-colors hover:text-brand"
          >
            {product.title}
          </Link>

          <div className="mt-0.5 flex flex-wrap items-center gap-x-1 gap-y-1">
            {hasPriceRange(product) && (
              <span className="type-p2 hidden text-ink-muted min-[1024px]:inline">
                From
              </span>
            )}
            <span className="type-p2 text-ink">
              <Money data={price} />
            </span>
            {compareAt && (
              <span className="type-p2 hidden text-ink line-through opacity-30 min-[1024px]:inline">
                <Money data={compareAt} />
              </span>
            )}
            {percentOff > 0 && (
              <span className="type-p4 hidden rounded-[4px] bg-brand-tint px-1.5 py-px text-ink min-[1024px]:inline">
                {percentOff}% off
              </span>
            )}
          </div>
        </div>

        <QuickAdd
          product={product}
          variantId={variantId}
          canQuickAdd={canQuickAdd}
        />
      </div>
    </div>
  );
}

/**
 * The reference's `.product-label`: 1px 6px, 4px radius, 11px type.
 *
 * The hairline is ours, not the reference's. Its label is a white pill on a
 * cream card, which separates on its own; our card matches our photography and
 * is therefore white, so an unbordered white pill would vanish on the many
 * products shot on a white sweep.
 */
function ProductLabel({children}: {children: React.ReactNode}) {
  return (
    <span className="type-p4 rounded-[4px] border border-line bg-surface px-1.5 py-px text-ink">
      {children}
    </span>
  );
}

const quickAddStyle =
  'ml-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-[4px] border border-line-strong bg-surface text-ink transition-colors hover:border-ink hover:bg-ink hover:text-bg disabled:opacity-50';

/**
 * The reference's quick-add button, pinned to the bottom-right of the info row.
 *
 * Uses CartForm directly rather than the site's AddToCartButton, which is
 * sized and worded for a product page's full-width primary action -- a small
 * icon button cannot show its "Adding..." label.
 */
function QuickAdd({
  product,
  variantId,
  canQuickAdd,
}: {
  product: CollectionProductFragment;
  variantId?: string;
  canQuickAdd: boolean;
}) {
  if (!canQuickAdd || !variantId) {
    return (
      <Link
        to={`/products/${product.handle}`}
        prefetch="intent"
        aria-label={`Choose options for ${product.title}`}
        className={quickAddStyle}
      >
        <PlusIcon className="h-4 w-4" />
      </Link>
    );
  }

  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.LinesAdd}
      inputs={{lines: [{merchandiseId: variantId, quantity: 1}]}}
    >
      {(fetcher: FetcherWithComponents<unknown>) => (
        <button
          type="submit"
          disabled={fetcher.state !== 'idle'}
          aria-label={`Add ${product.title} to cart`}
          className={quickAddStyle}
        >
          {fetcher.state === 'idle' ? (
            <PlusIcon className="h-4 w-4" />
          ) : (
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
          )}
        </button>
      )}
    </CartForm>
  );
}
