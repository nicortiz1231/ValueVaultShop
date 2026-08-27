import {Suspense, useCallback, useEffect, useRef, useState} from 'react';
import {Await, Link, NavLink, useAsyncValue, useLocation} from 'react-router';
import {
  type CartViewPayload,
  useAnalytics,
  useOptimisticCart,
} from '@shopify/hydrogen';
import type {
  HeaderQuery,
  CartApiQueryFragment,
  MegaMenuBannersQuery,
} from 'storefrontapi.generated';
import {useAside} from '~/components/Aside';
import {MegaMenu} from '~/components/MegaMenu';
import {navigation, shopByMenu, store} from '~/lib/store-config';
import {
  CartIcon,
  ChevronIcon,
  MenuIcon,
  SearchIcon,
  UserIcon,
} from './Icons';

interface HeaderProps {
  header: HeaderQuery;
  cart: Promise<CartApiQueryFragment | null>;
  isLoggedIn: Promise<boolean>;
  /** Banner images for the "Shop" dropdown. */
  megaMenu?: MegaMenuBannersQuery | null;
}

type Viewport = 'desktop' | 'mobile';

/** Identifies the one nav item that opens a panel. */
const SHOP_PANEL_ID = 'shop';

/**
 * The wordmark. Set in the display serif rather than a boxed icon +
 * name lockup -- the closest thing this store has to Kaleido's script
 * logotype, and it doubles as the source for the oversized watermark motif
 * reused through the page (see components/Watermark.tsx).
 */
export function Logo({
  className = '',
  onMouseEnter,
}: {
  className?: string;
  onMouseEnter?: () => void;
}) {
  return (
    <Link
      to="/"
      prefetch="intent"
      onMouseEnter={onMouseEnter}
      className={`display text-[26px] text-ink no-underline hover:no-underline ${className}`}
      aria-label={`${store.name} — home`}
    >
      {store.name}
    </Link>
  );
}

/**
 * Open/close state for the header's dropdowns.
 *
 * Both panels open on hover, but neither renders inside the nav, so a single
 * owner up here is what lets the pointer travel from a nav item into either
 * panel without the menu closing underneath it.
 */
function useMenuControls() {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openMenu = useCallback((id: string | null) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpenMenuId(id);
  }, []);

  // Leaving a panel closes on a short grace period rather than immediately:
  // the header's 1px bottom border sits between a nav item and its panel and
  // belongs to neither, so an instant close would drop the panel on the way
  // down to it.
  const scheduleClose = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpenMenuId(null), 150);
  }, []);

  useEffect(
    () => () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    },
    [],
  );

  // Escape closes from wherever focus happens to be, so a keyboard user who
  // opened a panel by tabbing into it is never trapped behind the dim.
  useEffect(() => {
    if (!openMenuId) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenMenuId(null);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [openMenuId]);

  return {openMenuId, openMenu, scheduleClose};
}

export function Header({
  header,
  isLoggedIn,
  cart,
  megaMenu,
}: HeaderProps) {
  const {open} = useAside();

  // Owned here rather than in HeaderMenu because neither panel can live
  // inside the nav: the dimming overlay has to sit outside the header
  // entirely (the header is a z-30 sticky, so it is its own stacking context
  // and nothing inside it can paint behind it), and the mega menu outside the
  // absolutely centred nav so it can run the full width of the page.
  const {openMenuId, openMenu, scheduleClose} = useMenuControls();

  // Pinned beneath the announcement marquee, which sticks at 0 and is 25px
  // tall (30px from 1024). Two stacked sticky elements only stay stacked if
  // the second offsets by the first's height.
  return (
    <>
      <header className="sticky top-[25px] z-30 border-b border-line bg-white lg:top-announce">
        {/* The reference header is full-bleed -- no max-width, just gutters of
            16 / 20 / 32 / 40, so the wordmark and the icons sit near the edges
            rather than inside a centred 1240px column the way the shared
            Container would put them. */}
        <div className="w-full px-4 min-[600px]:px-5 lg:px-8 min-[1440px]:px-10">
          {/* `relative` is what the centred nav positions against. */}
          <div className="relative flex h-header items-center gap-4">
            <button
              type="button"
              className="-ml-1.5 rounded-full p-1.5 text-ink transition-colors hover:bg-ink/5 lg:hidden"
              onClick={() => open('mobile')}
              aria-label="Open menu"
            >
              <MenuIcon className="h-6 w-6 shrink-0" />
            </button>

            <Logo onMouseEnter={() => openMenu(null)} />

            <HeaderMenu
              viewport="desktop"
              openMenuId={openMenuId}
              onOpenMenu={openMenu}
              onScheduleClose={scheduleClose}
            />

            <HeaderCtas isLoggedIn={isLoggedIn} cart={cart} />
          </div>
        </div>

        <MegaMenu
          open={openMenuId === SHOP_PANEL_ID}
          banners={megaMenu}
          onEnter={() => openMenu(SHOP_PANEL_ID)}
          onLeave={scheduleClose}
        />
      </header>

      {/* The reference dims the whole page behind an open dropdown (black at
          70%) and treats the dim as the close affordance -- reaching it with
          the pointer puts the menu away. */}
      <div
        aria-hidden
        onMouseEnter={() => openMenu(null)}
        className={[
          'fixed inset-0 z-20 bg-black/70 transition-opacity duration-200',
          openMenuId ? 'visible opacity-100' : 'invisible opacity-0',
        ].join(' ')}
      />
    </>
  );
}

/** The one nav item that opens a panel. */
function isPanelItem(item: (typeof navigation)[number]) {
  return item.panel === true;
}

export function HeaderMenu({
  viewport,
  openMenuId = null,
  onOpenMenu,
  onScheduleClose,
}: {
  viewport: Viewport;
  /** Desktop only -- the id of the item whose dropdown is showing. */
  openMenuId?: string | null;
  onOpenMenu?: (id: string | null) => void;
  onScheduleClose?: () => void;
}) {
  const {close} = useAside();

  // Which item the pointer is on. Separate from the panel state Header owns:
  // every item highlights on hover, but only "Shop" opens anything.
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  if (viewport === 'mobile') {
    return (
      <nav className="flex flex-col" role="navigation">
        {navigation.map((item) => (
          <div key={item.url} className="border-b border-line py-4">
            <NavLink
              to={item.url}
              prefetch="intent"
              onClick={close}
              className="block text-xl font-medium text-ink no-underline hover:no-underline"
            >
              {item.title}
            </NavLink>

            {/* The dropdown has no room to be a dropdown here, so it flattens
                into its groups the way the reference's mobile submenu does. */}
            {isPanelItem(item) &&
              shopByMenu.groups.map((group) => (
                <div key={group.title} className="mt-3">
                  <p className="text-[11px] leading-[1.5] tracking-[0.1px] text-ink-soft">
                    {group.title}
                  </p>
                  <div className="flex flex-col">
                    {group.links.map((link) => (
                      <NavLink
                        key={link.url}
                        to={link.url}
                        prefetch="intent"
                        onClick={close}
                        className="py-1.5 text-[15px] text-ink-muted no-underline hover:no-underline"
                      >
                        {link.title}
                      </NavLink>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        ))}
      </nav>
    );
  }

  // The reference centres its nav on the header by taking it out of flow --
  // absolutely centred, so the row stays symmetrical whatever the wordmark
  // and the icon cluster on either side happen to measure.
  return (
    <nav
      className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 lg:block"
      role="navigation"
      aria-label="Main"
      onMouseLeave={() => {
        setHoveredId(null);
        onScheduleClose?.();
      }}
      onBlur={(event) => {
        // Tabbing out of the nav entirely puts the panel away.
        if (!event.currentTarget.contains(event.relatedTarget)) onOpenMenu?.(null);
      }}
    >
      {/* 24px between items, 28px from 1440 -- the reference's colgap-24 /
          hd-colgap-28. */}
      <ul className="flex items-center justify-center gap-6 min-[1440px]:gap-7">
        {navigation.map((item) => {
          const hasPanel = isPanelItem(item);
          const id = hasPanel ? SHOP_PANEL_ID : item.url;
          const isOpen = hasPanel && openMenuId === SHOP_PANEL_ID;
          // With the panel open the pointer may have moved off the nav and
          // into the panel itself, which is not a descendant of it -- so the
          // open item stays highlighted once hover has gone.
          const highlighted = hoveredId ?? (openMenuId ? SHOP_PANEL_ID : null);
          const enter = () => {
            setHoveredId(id);
            onOpenMenu?.(hasPanel ? SHOP_PANEL_ID : null);
          };

          return (
            <li
              key={item.url}
              className="relative"
              onMouseEnter={enter}
              onFocus={enter}
            >
              <NavLink
                to={item.url}
                // Without this "Home" would match every route beneath it.
                end={item.url === '/'}
                prefetch="intent"
                onClick={() => onOpenMenu?.(null)}
                // The current page gets no marker of its own -- the
                // reference underlines it, but a bar that stays put after a
                // click is not wanted here. `end` still matters: it is what
                // keeps aria-current off "Home" on every other route.
                className={[
                  // 18px above and below is what makes the link box exactly
                  // as tall as the 53px header row, so the panel below it
                  // starts flush with the header's bottom edge.
                  'relative flex items-center justify-center gap-1 py-[18px] font-display text-[14px] font-medium leading-[1.2] tracking-[0.1px] text-ink no-underline transition-opacity duration-200 hover:no-underline min-[1920px]:text-[15px]',
                  // Hovering any item fades the rest back, so the one under
                  // the pointer is the one that reads.
                  highlighted && highlighted !== id
                    ? 'opacity-30'
                    : 'opacity-100',
                ].join(' ')}
              >
                {item.title}
                {/* The caret the live site puts beside "Shop", flipping when
                    the panel is open as the reference's does. */}
                {hasPanel && (
                  <ChevronIcon
                    className={[
                      'h-3 w-3 shrink-0 transition-transform duration-200',
                      isOpen ? 'rotate-180' : '',
                    ].join(' ')}
                  />
                )}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function HeaderCtas({
  isLoggedIn,
  cart,
}: Pick<HeaderProps, 'isLoggedIn' | 'cart'>) {
  const {open} = useAside();
  const iconBtn =
    'rounded-full p-1.5 text-ink transition-colors hover:bg-ink/5';

  return (
    <nav className="ml-auto flex items-center" role="navigation">
      <button
        type="button"
        onClick={() => open('search')}
        className={iconBtn}
        aria-label="Search"
      >
        <SearchIcon className="h-6 w-6 shrink-0" />
      </button>

      <NavLink
        to="/account"
        prefetch="intent"
        className={`hidden sm:block ${iconBtn}`}
      >
        <Suspense fallback={<UserIcon className="h-6 w-6 shrink-0" />}>
          <Await
            resolve={isLoggedIn}
            errorElement={<UserIcon className="h-6 w-6 shrink-0" />}
          >
            {(loggedIn) => (
              <>
                <UserIcon className="h-6 w-6 shrink-0" />
                <span className="sr-only">
                  {loggedIn ? 'Account' : 'Sign in'}
                </span>
              </>
            )}
          </Await>
        </Suspense>
      </NavLink>

      <CartToggle cart={cart} />
    </nav>
  );
}

function CartBadge({count}: {count: number}) {
  const {open} = useAside();
  const {publish, shop, cart, prevCart} = useAnalytics();

  return (
    <button
      type="button"
      className="relative rounded-full p-1.5 text-ink transition-colors hover:bg-ink/5"
      onClick={() => {
        open('cart');
        publish('cart_viewed', {
          cart,
          prevCart,
          shop,
          url: window.location.href || '',
        } as CartViewPayload);
      }}
      aria-label={`Cart, ${count} ${count === 1 ? 'item' : 'items'}`}
    >
      <CartIcon className="h-6 w-6 shrink-0" />
      {count > 0 && (
        <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[11px] font-bold leading-none text-bg">
          {count}
        </span>
      )}
    </button>
  );
}

function CartToggle({cart}: Pick<HeaderProps, 'cart'>) {
  return (
    <Suspense fallback={<CartBadge count={0} />}>
      <Await resolve={cart}>
        <CartBanner />
      </Await>
    </Suspense>
  );
}

function CartBanner() {
  const originalCart = useAsyncValue() as CartApiQueryFragment | null;
  const cart = useOptimisticCart(originalCart);
  return <CartBadge count={cart?.totalQuantity ?? 0} />;
}
