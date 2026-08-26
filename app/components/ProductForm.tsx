import {Link, useNavigate} from 'react-router';
import {type MappedProductOptions} from '@shopify/hydrogen';
import type {
  Maybe,
  ProductOptionValueSwatch,
} from '@shopify/hydrogen/storefront-api-types';
import {AddToCartButton} from './AddToCartButton';
import {useAside} from './Aside';
import type {ProductFragment} from 'storefrontapi.generated';

/** Shared pill styling for both the anchor and button variant controls. */
function optionClasses(selected: boolean, available: boolean, exists: boolean) {
  return [
    'inline-flex min-w-11 items-center justify-center rounded-pill border px-4 py-2.5',
    'text-sm font-medium transition-colors',
    selected
      ? 'border-brand bg-brand text-bg'
      : 'border-line-strong bg-surface text-ink hover:border-dim',
    !available || !exists
      ? 'cursor-not-allowed text-ink-soft line-through opacity-50'
      : '',
  ]
    .filter(Boolean)
    .join(' ');
}

export function ProductForm({
  productOptions,
  selectedVariant,
}: {
  productOptions: MappedProductOptions[];
  selectedVariant: ProductFragment['selectedOrFirstAvailableVariant'];
}) {
  const navigate = useNavigate();
  const {open} = useAside();

  return (
    <div>
      {productOptions.map((option) => {
        // A single-value option is not a choice, so don't make the shopper look at it.
        if (option.optionValues.length === 1) return null;

        return (
          <div className="mb-6" key={option.name}>
            <h3 className="mb-2.5 text-[13px] font-bold uppercase tracking-[0.08em] text-ink-muted">
              {option.name}
            </h3>
            <div className="flex flex-wrap gap-2">
              {option.optionValues.map((value) => {
                const {
                  name,
                  handle,
                  variantUriQuery,
                  selected,
                  available,
                  exists,
                  isDifferentProduct,
                  swatch,
                } = value;

                // Combined-listing children live at their own URL, so they must
                // be real anchors for SEO.
                if (isDifferentProduct) {
                  return (
                    <Link
                      key={option.name + name}
                      prefetch="intent"
                      preventScrollReset
                      replace
                      to={`/products/${handle}?${variantUriQuery}`}
                      className={optionClasses(selected, available, exists)}
                    >
                      <ProductOptionSwatch swatch={swatch} name={name} />
                    </Link>
                  );
                }

                // Same-product variants are search-param updates. Rendering them
                // as buttons keeps bots from indexing duplicate URLs.
                return (
                  <button
                    type="button"
                    key={option.name + name}
                    disabled={!exists}
                    aria-pressed={selected}
                    className={optionClasses(selected, available, exists)}
                    onClick={() => {
                      if (!selected) {
                        void navigate(`?${variantUriQuery}`, {
                          replace: true,
                          preventScrollReset: true,
                        });
                      }
                    }}
                  >
                    <ProductOptionSwatch swatch={swatch} name={name} />
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      <AddToCartButton
        disabled={!selectedVariant || !selectedVariant.availableForSale}
        onClick={() => open('cart')}
        lines={
          selectedVariant
            ? [
                {
                  merchandiseId: selectedVariant.id,
                  quantity: 1,
                  selectedVariant,
                },
              ]
            : []
        }
      >
        {selectedVariant?.availableForSale ? 'Add to cart' : 'Sold out'}
      </AddToCartButton>
    </div>
  );
}

function ProductOptionSwatch({
  swatch,
  name,
}: {
  swatch?: Maybe<ProductOptionValueSwatch> | undefined;
  name: string;
}) {
  const image = swatch?.image?.previewImage?.url;
  const color = swatch?.color;

  if (!image && !color) return <>{name}</>;

  return (
    <span
      aria-label={name}
      title={name}
      className="block h-6 w-6 overflow-hidden rounded-full border border-line"
      style={{backgroundColor: color || 'transparent'}}
    >
      {!!image && (
        <img src={image} alt={name} className="h-full w-full object-cover" />
      )}
    </span>
  );
}
