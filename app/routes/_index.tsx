import {useLoaderData} from 'react-router';
import type {Route} from './+types/_index';
import type {ProductSortKeys} from '@shopify/hydrogen/storefront-api-types';
import {ProductSlider} from '~/components/ProductSlider';
import {RunningText} from '~/components/RunningText';
import {Hero} from '~/components/home/Hero';
import {PromoBanner} from '~/components/home/PromoBanner';
import {CategoryBlocks} from '~/components/home/CategoryBlocks';
import {SplitBanners} from '~/components/home/SplitBanners';
import {GridBanner} from '~/components/home/GridBanner';
import {Reviews} from '~/components/home/Reviews';
import {store} from '~/lib/store-config';

export const meta: Route.MetaFunction = () => {
  return [
    {title: `${store.name} — ${store.tagline}`},
    {name: 'description', content: store.description},
  ];
};

export async function loader(args: Route.LoaderArgs) {
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args);

  return {...deferredData, ...criticalData};
}

async function loadCriticalData({context}: Route.LoaderArgs) {
  const [{collections}] = await Promise.all([
    context.storefront.query(HOME_COLLECTIONS_QUERY),
  ]);

  return {
    collections: collections.nodes,
  };
}

/**
 * Three product rows, one query shape.
 *
 * The reference homepage uses its `product_slider` section three times over --
 * New Arrivals, Bestsellers, Featured Products -- so this is one parameterised
 * query run three times rather than three near-identical ones.
 */
function loadDeferredData({context}: Route.LoaderArgs) {
  const slider = (sortKey: ProductSortKeys, reverse: boolean) =>
    context.storefront
      .query(PRODUCT_SLIDER_QUERY, {variables: {sortKey, reverse}})
      .catch((error: Error) => {
        console.error(error);
        return null;
      });

  return {
    newArrivals: slider('CREATED_AT', true),
    bestsellers: slider('BEST_SELLING', false),
    // No "featured" sort key exists on the Storefront API, and inventing a
    // hand-picked list here would drift from the catalogue the moment it
    // changes. Most-recently-edited is the closest honest proxy: it surfaces
    // whatever is actively being merchandised.
    featured: slider('UPDATED_AT', true),
  };
}

/**
 * Homepage.
 *
 * Section for section, this mirrors kaleidojewellery.com's own homepage:
 *
 *   hero (paired banner) -> promo banner -> category blocks -> New Arrivals
 *   -> split banners -> Bestsellers -> grid banner -> reviews
 *   -> Featured Products -> running text -> footer
 *
 * The reference's second promo banner -- the image-only "Shop All" slot it
 * currently runs its 10%-off graphic in -- is deliberately left out.
 */
export default function Homepage() {
  const data = useLoaderData<typeof loader>();

  return (
    <>
      <Hero />
      <PromoBanner />
      <CategoryBlocks collections={data.collections} />
      <ProductSlider
        title="New Arrivals"
        linkLabel="Shop New Arrivals"
        linkTo="/collections/all"
        products={data.newArrivals}
        showNewBadge={false}
      />
      <SplitBanners collections={data.collections} />
      <ProductSlider
        title="Bestsellers"
        linkLabel="Discover Our Most Loved"
        linkTo="/collections/all"
        products={data.bestsellers}
      />
      <GridBanner />
      <Reviews collection={data.collections[1]} />
      <ProductSlider
        title="Featured Products"
        linkLabel="Shop Now"
        linkTo="/collections/all"
        products={data.featured}
      />
      <RunningText />
    </>
  );
}

const HOME_COLLECTIONS_QUERY = `#graphql
  fragment HomeCollection on Collection {
    id
    title
    handle
    description
    image {
      id
      url
      altText
      width
      height
    }
  }
  query HomeCollections($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    # 20 rather than the 8 collections the store has today: CategoryBlocks
    # picks its six tiles by handle, so a handle must not fall off the end of
    # this list as collections are added. The other sections index into it
    # positionally, and a larger page leaves those indices untouched.
    collections(first: 20, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...HomeCollection
      }
    }
  }
` as const;

const PRODUCT_SLIDER_QUERY = `#graphql
  fragment SliderProduct on Product {
    id
    title
    handle
    createdAt
    tags
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    compareAtPriceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    featuredImage {
      id
      url
      altText
      width
      height
    }
    options {
      name
      optionValues {
        name
        swatch {
          color
        }
      }
    }
  }
  query ProductSlider(
    $country: CountryCode
    $language: LanguageCode
    $sortKey: ProductSortKeys
    $reverse: Boolean
  ) @inContext(country: $country, language: $language) {
    products(first: 12, sortKey: $sortKey, reverse: $reverse) {
      nodes {
        ...SliderProduct
      }
    }
  }
` as const;
