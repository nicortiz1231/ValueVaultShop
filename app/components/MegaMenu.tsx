import {NavLink} from 'react-router';
import {Image} from '@shopify/hydrogen';
import type {MegaMenuBannersQuery} from 'storefrontapi.generated';
import {ArrowUpRightIcon} from '~/components/Icons';
import {shopByMenu} from '~/lib/store-config';

/**
 * The "Shop By" panel -- a port of the reference site's `mega-dropdown`.
 *
 * Full-bleed white sheet hanging off the bottom of the header, link groups
 * filling the left half under 11px grey labels (32px of padding, 40px on top
 * from 1440), and the two collection banners filling the right half at its
 * 430x530 crop with the same transparent-to-grey scrim and corner label.
 *
 * It sits outside the nav in the DOM -- the nav is absolutely centred on the
 * header row, so a full-width child of it would be centred too -- which is
 * why the hover handlers are passed in: leaving the nav starts a close that
 * entering this panel has to cancel.
 */
export function MegaMenu({
  open,
  banners,
  onEnter,
  onLeave,
}: {
  open: boolean;
  banners: MegaMenuBannersQuery | null | undefined;
  onEnter: () => void;
  onLeave: () => void;
}) {
  const images = [banners?.first, banners?.second];

  return (
    <div
      className="nav-mega hidden lg:block"
      data-open={open}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      <div className="flex justify-between min-[1920px]:mx-auto min-[1920px]:max-w-[1200px]">
        <div className="flex flex-1">
          {shopByMenu.groups.map((group) => (
            <div key={group.title} className="px-8 pb-8 pt-8 min-[1440px]:pt-10">
              <p className="mb-4 text-[11px] leading-[1.5] tracking-[0.1px] text-ink-soft min-[1440px]:text-[12px] min-[1920px]:text-[13px]">
                {group.title}
              </p>
              <ul>
                {group.links.map((link) => (
                  <li key={link.url} className="mb-3 last:mb-0">
                    <NavLink
                      to={link.url}
                      prefetch="intent"
                      onClick={onLeave}
                      className="text-[13px] leading-[1.5] text-ink no-underline transition-opacity hover:opacity-70 hover:no-underline min-[1920px]:text-[14px]"
                    >
                      {link.title}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex w-1/2 gap-4 pb-12 pr-8 pt-8 min-[1440px]:pt-10">
          {shopByMenu.banners.map((banner, i) => {
            const collection = images[i];

            return (
              <NavLink
                key={banner.handle}
                to={`/collections/${banner.handle}`}
                prefetch="intent"
                onClick={onLeave}
                className="group relative block w-full overflow-hidden rounded-lg no-underline hover:no-underline"
              >
                <div className="relative aspect-[430/530] w-full overflow-hidden bg-bg-deep">
                  {collection?.image ? (
                    <Image
                      data={collection.image}
                      sizes="25vw"
                      alt={collection.image.altText || banner.title}
                      className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                  ) : null}
                  {/* The reference's banner scrim: transparent down to its
                      mid-grey, so a white label reads over any photo. */}
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,#7c7c7c_100%)]" />
                </div>
                <div className="absolute bottom-0 left-0 flex w-full items-center justify-between p-4">
                  <span className="font-display text-[14px] font-medium leading-[1.2] tracking-[0.1px] text-white min-[1920px]:text-[15px]">
                    {banner.title}
                  </span>
                  <ArrowUpRightIcon className="h-4 w-4 shrink-0 text-white" />
                </div>
              </NavLink>
            );
          })}
        </div>
      </div>
    </div>
  );
}
