/**
 * The one product fragment behind every card in a browse grid.
 *
 * Shared rather than copied because the card reads these fields directly: a
 * collection page and the all-products page that disagreed about which fields
 * to ask for would render visibly different cards for the same product.
 */

export const COLLECTION_PRODUCT_FRAGMENT = `#graphql
  fragment MoneyCollectionProduct on MoneyV2 {
    amount
    currencyCode
  }
  fragment CollectionProduct on Product {
    id
    handle
    title
    availableForSale
    featuredImage {
      id
      altText
      url
      width
      height
    }
    # Two images is all the card needs: the one it shows and the one it
    # cross-fades to on hover.
    images(first: 2) {
      nodes {
        id
        altText
        url
        width
        height
      }
    }
    options {
      name
      optionValues {
        name
        swatch {
          color
          image {
            previewImage {
              url
            }
          }
        }
      }
    }
    # Quick-add needs something to add. Products with real options fall back to
    # linking at the product page, so this is only ever used for single-variant
    # products, but it is cheap enough to ask for on every card.
    selectedOrFirstAvailableVariant(ignoreUnknownOptions: true, caseInsensitiveMatch: true, selectedOptions: []) {
      id
      availableForSale
    }
    priceRange {
      minVariantPrice {
        ...MoneyCollectionProduct
      }
      maxVariantPrice {
        ...MoneyCollectionProduct
      }
    }
    compareAtPriceRange {
      minVariantPrice {
        ...MoneyCollectionProduct
      }
      maxVariantPrice {
        ...MoneyCollectionProduct
      }
    }
  }
` as const;
