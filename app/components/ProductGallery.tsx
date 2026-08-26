import {useEffect, useState} from 'react';
import {Image} from '@shopify/hydrogen';
import type {ProductFragment} from 'storefrontapi.generated';

type ProductImages = ProductFragment['images']['nodes'];
type SelectedImage = NonNullable<
  ProductFragment['selectedOrFirstAvailableVariant']
>['image'];

/**
 * Product gallery with thumbnails.
 *
 * Shoppers judge whether a listing is real largely on its photography, so the
 * gallery shows every image the product has rather than only the variant shot.
 * Changing variant jumps the gallery to that variant's image.
 */
export function ProductGallery({
  images,
  selectedImage,
  title,
}: {
  images: ProductImages;
  selectedImage: SelectedImage;
  title: string;
}) {
  // De-duplicate: the variant image is usually also in the images list.
  const gallery = images?.length
    ? images
    : selectedImage
      ? [selectedImage]
      : [];

  const [activeId, setActiveId] = useState<string | null>(
    selectedImage?.id ?? gallery[0]?.id ?? null,
  );

  // Follow the variant selection when the shopper switches colour/size.
  useEffect(() => {
    if (selectedImage?.id) setActiveId(selectedImage.id);
  }, [selectedImage?.id]);

  const active = gallery.find((img) => img.id === activeId) ?? gallery[0];

  if (!active) {
    return (
      <div className="aspect-square w-full rounded-card border border-line bg-surface-2" />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-hidden rounded-card border border-line bg-surface">
        <Image
          alt={active.altText || title}
          aspectRatio="1/1"
          data={active}
          key={active.id}
          loading="eager"
          sizes="(min-width: 1024px) 560px, 100vw"
          className="h-full w-full object-cover"
        />
      </div>

      {gallery.length > 1 && (
        <ul className="flex gap-2.5 overflow-x-auto pb-1">
          {gallery.map((image) => {
            const isActive = image.id === active.id;
            return (
              <li key={image.id}>
                <button
                  type="button"
                  onClick={() => setActiveId(image.id ?? null)}
                  aria-label={`View image ${image.altText || title}`}
                  aria-current={isActive}
                  className={[
                    'h-18 w-18 overflow-hidden rounded-lg border-2 transition-colors',
                    isActive
                      ? 'border-lime'
                      : 'border-line hover:border-line-strong',
                  ].join(' ')}
                >
                  <Image
                    alt={image.altText || title}
                    aspectRatio="1/1"
                    data={image}
                    loading="lazy"
                    sizes="72px"
                    className="h-full w-full object-cover"
                  />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
