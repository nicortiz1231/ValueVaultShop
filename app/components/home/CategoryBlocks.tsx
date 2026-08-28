import {Image} from '@shopify/hydrogen';
import {Link} from 'react-router';
import {resolveCollectionImage} from '~/lib/collection-images';

type CategoryImage = {
  id?: string | null;
  url: string;
  altText?: string | null;
  width?: number | null;
  height?: number | null;
};

type CategoryCollection = {
  id: string;
  title: string;
  handle: string;
  description?: string | null;
  image?: CategoryImage | null;
};

type CategoryFeatureImages = {
  bestSelling?: CategoryImage | null;
  trendingNow?: CategoryImage | null;
};

type CategoryBlocksProps = {
  collections: CategoryCollection[];

  featureImages?: CategoryFeatureImages;
};

type CategoryTile = {
  id: string;
  label: string;
  link: string;
  image: CategoryImage | null;
};

const CATEGORY_DEFINITIONS = [
  {
    label: 'Best Selling',

    handles: [
      'best-selling',
      'best-sellers',
      'bestsellers',
    ],

    fallbackLink: '/collections/all',
  },

  {
    label: 'Trending Now',

    handles: [
      'trending-now',
      'trending',
    ],

    fallbackLink: '/collections/all',
  },

  {
    label: 'Home Accessories',

    handles: [
      'home-accessories',
      'home',
    ],

    fallbackLink: '/collections/home-accessories',
  },

  {
    label: 'Kitchen Accessories',

    handles: [
      'kitchen-accessories',
      'kitchen',
    ],

    fallbackLink: '/collections/kitchen-accessories',
  },

  {
    label: 'Kids & Babies',

    handles: [
      'kids-babies',
      'kids-and-babies',
      'kids',
    ],

    fallbackLink: '/collections/kids-babies',
  },

  {
    label: 'Pet Accessories',

    handles: [
      'pet-accessories',
      'pets',
      'pet',
    ],

    fallbackLink: '/collections/pet-accessories',
  },
];

function findCollection(
  collections: CategoryCollection[],
  handles: string[],
) {
  return collections.find((collection) =>
    handles.includes(collection.handle),
  );
}

export function CategoryBlocks({
  collections,
  featureImages,
}: CategoryBlocksProps) {
  if (!collections?.length) {
    return null;
  }

  const bestSellingCollection = findCollection(
    collections,
    CATEGORY_DEFINITIONS[0].handles,
  );

  const trendingCollection = findCollection(
    collections,
    CATEGORY_DEFINITIONS[1].handles,
  );

  const homeCollection = findCollection(
    collections,
    CATEGORY_DEFINITIONS[2].handles,
  );

  const kitchenCollection = findCollection(
    collections,
    CATEGORY_DEFINITIONS[3].handles,
  );

  const kidsCollection = findCollection(
    collections,
    CATEGORY_DEFINITIONS[4].handles,
  );

  const petsCollection = findCollection(
    collections,
    CATEGORY_DEFINITIONS[5].handles,
  );

  /*
   * IMPORTANT:
   *
   * Best Selling intentionally uses the FEATURED IMAGE from:
   *
   * Colorful Nordic Ceramic Flowerpot with Tray
   *
   * /products/
   * nordic-industrial-style-colorful-ceramic-flowerpot-succulent-planter-
   * green-plants-cylindrical-shape-flower-pot-with-hole-tray
   *
   *
   * Trending Now intentionally uses the FEATURED IMAGE from:
   *
   * Silicone Pot Side Drain Stopper
   *
   * /products/kitchen-gadgets-silicone-pot-side-drain-stopper
   *
   *
   * These two images are passed in from the homepage Shopify query.
   */

  const categoryTiles: CategoryTile[] = [
    {
      id: 'best-selling',

      label: 'Best Selling',

      link: bestSellingCollection
        ? `/collections/${bestSellingCollection.handle}`
        : '/collections/all',

      image:
        featureImages?.bestSelling ??
        resolveCollectionImage('best-selling', bestSellingCollection?.image),
    },

    {
      id: 'trending-now',

      label: 'Trending Now',

      link: trendingCollection
        ? `/collections/${trendingCollection.handle}`
        : '/collections/all',

      image:
        featureImages?.trendingNow ??
        resolveCollectionImage('trending-now', trendingCollection?.image),
    },

    {
      id: 'home-accessories',

      label: 'Home Accessories',

      link: homeCollection
        ? `/collections/${homeCollection.handle}`
        : '/collections/home-accessories',

      image: resolveCollectionImage('home-accessories', homeCollection?.image),
    },

    {
      id: 'kitchen-accessories',

      label: 'Kitchen Accessories',

      link: kitchenCollection
        ? `/collections/${kitchenCollection.handle}`
        : '/collections/kitchen-accessories',

      image: resolveCollectionImage('kitchen-accessories', kitchenCollection?.image),
    },

    {
      id: 'kids-babies',

      label: 'Kids & Babies',

      link: kidsCollection
        ? `/collections/${kidsCollection.handle}`
        : '/collections/kids-babies',

      image: resolveCollectionImage('kids-babies', kidsCollection?.image),
    },

    {
      id: 'pet-accessories',

      label: 'Pet Accessories',

      link: petsCollection
        ? `/collections/${petsCollection.handle}`
        : '/collections/pet-accessories',

      image: resolveCollectionImage('pet-accessories', petsCollection?.image),
    },
  ];

  /*
   * Duplicate all six cards.
   *
   * The second set follows the first set through the carousel,
   * allowing the CSS animation to loop continuously without
   * displaying an empty gap.
   */
  const marqueeTiles = [
    ...categoryTiles,
    ...categoryTiles,
  ];

  return (
    <section
      className="category-carousel"
      aria-label="Shop by category"
    >
      <div className="category-carousel__viewport">
        <div className="category-carousel__track">
          {marqueeTiles.map((tile, index) => (
            <article
              key={`${tile.id}-${index}`}
              className="category-carousel__item"
              aria-hidden={
                index >= categoryTiles.length
                  ? true
                  : undefined
              }
            >
              <Link
                to={tile.link}
                prefetch="intent"
                className="category-carousel__link group"
              >
                {tile.image ? (
                  <Image
                    data={tile.image}
                    alt={
                      tile.image.altText ||
                      tile.label
                    }
                    sizes="(min-width: 1280px) 16vw, (min-width: 768px) 28vw, 72vw"
                    className="category-carousel__image"
                  />
                ) : (
                  <div className="category-carousel__placeholder">
                    <span className="category-carousel__placeholder-text">
                      {tile.label}
                    </span>
                  </div>
                )}

                <div className="category-carousel__shade" />

                <span className="category-carousel__label">
                  {tile.label}
                </span>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}