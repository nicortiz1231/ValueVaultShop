import {Link} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import type {
  ProductItemFragment,
  CollectionItemFragment,
} from 'storefrontapi.generated';
import {useVariantUrl} from '~/lib/variants';
import {ArrowIcon} from './Icons';

type AnyProduct = CollectionItemFragment | ProductItemFragment;

/**
 * Works out whether a product is genuinely discounted.
 *
 * Only returns a discount when Shopify actually carries a higher compare-at
 * price -- the card never manufactures a "was" price, because invented anchor
 * pricing is one of the tells shoppers use to spot a fake store.
 */
function useDiscount(product: AnyProduct) {
  const price = product.priceRange.minVariantPrice;
  const compareAt = product.compareAtPriceRange?.minVariantPrice;

  const priceAmount = Number(price.amount);
  const compareAmount = Number(compareAt?.amount ?? 0);

  if (!compareAt || !Number.isFinite(compareAmount) || compareAmount <= priceAmount) {
    return {price, compareAt: null, percentOff: 0};
  }

  return {
    price,
    compareAt,
    percentOff: Math.round(((compareAmount - priceAmount) / compareAmount) * 100),
  };
}

export function ProductItem({
  product,
  loading,
  className = '',
}: {
  product: AnyProduct;
  loading?: 'eager' | 'lazy';
  className?: string;
}) {
  const variantUrl = useVariantUrl(product.handle);
  const image = product.featuredImage;
  const {price, compareAt, percentOff} = useDiscount(product);

  return (
    <Link
      key={product.id}
      prefetch="intent"
      to={variantUrl}
      data-cursor="View"
      className={`group flex flex-col ${className}`}
    >
      <div className="bg-surface border border-line relative overflow-hidden rounded-card transition-all duration-300 group-hover:border-line-strong group-hover:shadow-card">
        {image ? (
          <Image
            alt={image.altText || product.title}
            aspectRatio="1/1"
            data={image}
            loading={loading}
            sizes="(min-width: 1024px) 300px, (min-width: 640px) 45vw, 90vw"
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
          />
        ) : (
          <div className="aspect-square w-full bg-bg-deep" />
        )}

        {percentOff > 0 && (
          <span className="absolute left-3 top-3 rounded-pill bg-sale px-2.5 py-1 text-[11px] font-bold tracking-tight text-bg">
            −{percentOff}%
          </span>
        )}

        <span className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-brand text-bg opacity-0 shadow-card transition-all duration-300 group-hover:opacity-100 group-hover:rotate-45">
          <ArrowIcon className="h-4 w-4 -rotate-45" />
        </span>
      </div>

      <div className="flex flex-1 flex-col px-0.5 pt-3.5">
        <h3 className="line-clamp-2-fixed text-[15px] font-medium leading-snug text-ink transition-colors group-hover:text-brand">
          {product.title}
        </h3>

        <div className="mt-auto flex items-baseline gap-2 pt-2">
          <span className="text-[15px] font-bold text-ink">
            <Money data={price} />
          </span>
          {compareAt && (
            <span className="text-[13px] text-ink-soft line-through">
              <Money data={compareAt} />
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
