import {Link} from 'react-router';
import {Image} from '@shopify/hydrogen';
import {Container} from './ui/Container';

/**
 * The reference site's `page_title` section, ported.
 *
 * Structure, straight off kaleidojewellery.com/collections/rings:
 *
 *   - a breadcrumb pinned to the very top-left of the section, in 10px grey
 *   - a centred H3 title, capped at 480px wide (720px from 1024 up)
 *   - a centred description directly under it, same cap, 12px below (20 on
 *     desktop)
 *   - a row of circular category images, 80px across (100px from 1440 up),
 *     horizontally scrollable on a phone and centred on desktop
 *
 * The circles are the one place this diverges in content rather than form: the
 * reference fills them with sub-collections of the current collection (ring
 * shapes), and Value Vault's catalogue is flat, so they carry the sibling
 * categories instead. Same component, same job -- a one-tap sideways move for
 * a shopper who landed on the wrong shelf.
 */

export type CategoryCircle = {
  title: string;
  handle: string;
  image: {
    id?: string | null;
    url: string;
    altText?: string | null;
    width?: number | null;
    height?: number | null;
  } | null;
};

export function CollectionHeader({
  title,
  description,
  categories,
}: {
  title: string;
  description?: string | null;
  categories: CategoryCircle[];
}) {
  return (
    <section className="relative overflow-hidden pb-12 min-[1024px]:pb-15 min-[1440px]:pb-20">
      {/* Absolutely positioned so the title block below is centred in the full
          section width, not pushed down by the breadcrumb -- the reference
          does exactly this with `.breadcrumb-wrapper { position: absolute }`. */}
      <div className="absolute left-0 top-0 z-10 w-full">
        <Container width="full">
          <nav
            aria-label="Breadcrumb"
            className="type-p5 flex items-center py-3 text-ink-muted min-[1024px]:py-4"
          >
            <Link to="/" className="mr-1 hover:text-ink">
              Home
            </Link>
            <span aria-hidden className="mr-1">
              /
            </span>
            <span aria-current="page">{title}</span>
          </nav>
        </Container>
      </div>

      <Container width="full" className="relative pt-12 min-[1024px]:pt-16">
        <div className="px-3">
          <h1 className="type-h3 mx-auto max-w-[480px] text-center text-ink min-[1024px]:max-w-[720px]">
            {title}
          </h1>
          {description && (
            <p className="type-p2 mx-auto mt-3 max-w-[480px] text-center text-ink-muted min-[1024px]:mt-5 min-[1024px]:max-w-[720px]">
              {description}
            </p>
          )}
        </div>

        {categories.length > 0 && (
          <nav
            aria-label="Other categories"
            /* Bleeds to the screen edges so the row can scroll under the
               gutter on a phone, exactly as the reference's `.filter` does
               with its negative margin. */
            className="-mx-4 mt-6 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] min-[600px]:-mx-5 min-[600px]:gap-3 min-[600px]:px-5 min-[1024px]:mx-0 min-[1024px]:mt-7 min-[1024px]:justify-center min-[1024px]:px-0 min-[1440px]:gap-4 [&::-webkit-scrollbar]:hidden"
          >
            {categories.map((category) => (
              <Link
                key={category.handle}
                to={`/collections/${category.handle}`}
                prefetch="intent"
                className="group flex w-min flex-col items-center"
              >
                <div className="h-20 w-20 overflow-hidden rounded-full bg-card min-[1440px]:h-25 min-[1440px]:w-25">
                  {category.image ? (
                    <Image
                      data={category.image}
                      alt={category.image.altText || category.title}
                      aspectRatio="1/1"
                      sizes="100px"
                      className="h-full w-full object-cover transition-transform duration-500 ease-out-quart group-hover:scale-105"
                    />
                  ) : (
                    <div className="h-full w-full bg-bg-deep" />
                  )}
                </div>
                <p className="type-p1 mt-2 whitespace-nowrap text-center font-medium text-ink">
                  {category.title}
                </p>
              </Link>
            ))}
          </nav>
        )}
      </Container>
    </section>
  );
}
