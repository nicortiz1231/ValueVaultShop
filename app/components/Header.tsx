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
import {AnimatePresence, motion} from 'framer-motion';
import NumberFlow from '@number-flow/react';
import {useAside} from '~/components/Aside';
import {EASE_SPRING} from '~/lib/motion';
import {MegaMenu} from '~/components/MegaMenu';
import {
  OrderLookupPanel,
  OrderTrackForm,
} from '~/components/OrderLookupMenu';
import {AccountMenu} from '~/components/AccountMenu';
import {ExpandingSearch} from '~/components/ui/ExpandingSearch';
import {navigation, shopByMenu, store} from '~/lib/store-config';
import {CartIcon, ChevronIcon, MenuIcon, SearchIcon} from './Icons';

interface HeaderProps {
  header: HeaderQuery;
  cart: Promise<CartApiQueryFragment | null>;
  isLoggedIn: Promise<boolean>;
  /** Banner images for the "Shop" dropdown. */
  megaMenu?: MegaMenuBannersQuery | null;
}

type Viewport = 'desktop' | 'mobile';

/** The two nav items that open a panel, keyed by `panel` in [navigation]. */
const SHOP_PANEL_ID = 'shop';
const ORDER_PANEL_ID = 'order';

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
  // Set while a panel holds focus. The order panel contains a text field, and
  // the pointer routinely leaves the header while someone is typing in it --
  // without this the hover close would pull the field out from under them.
  const heldOpen = useRef(false);

  const openMenu = useCallback((id: string | null) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpenMenuId(id);
  }, []);

  const holdOpen = useCallback((held: boolean) => {
    heldOpen.current = held;
  }, []);

  // Leaving a panel closes on a short grace period rather than immediately:
  // the header's 1px bottom border sits between a nav item and its panel and
  // belongs to neither, so an instant close would drop the panel on the way
  // down to it.
  const scheduleClose = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => {
      if (heldOpen.current) return;
      setOpenMenuId(null);
    }, 150);
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
      if (event.key !== 'Escape') return;
      heldOpen.current = false;
      setOpenMenuId(null);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [openMenuId]);

  return {openMenuId, openMenu, scheduleClose, holdOpen};
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
  const {openMenuId, openMenu, scheduleClose, holdOpen} = useMenuControls();

  // The expanding search field lives in the icon cluster, but its state is
  // owned here so that opening it can put an open dropdown away -- the two
  // are competing claims on the same row.
  //
  // The nav stays visible and in place the whole time. It is absolutely
  // centred, so it is also the edge the field must stop short of: this ref
  // is what the field measures itself against rather than growing to a fixed
  // width and running underneath "Order Look Up".
  const navRef = useRef<HTMLElement>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  // The search field, the account panel and the nav dropdowns are three
  // claims on the same row, so opening any one of them puts the others away.
  const onSearchOpenChange = useCallback(
    (open: boolean) => {
      setSearchOpen(open);
      if (open) {
        setAccountOpen(false);
        openMenu(null);
      }
    },
    [openMenu],
  );
  const onAccountOpenChange = useCallback(
    (open: boolean) => {
      setAccountOpen(open);
      if (open) {
        setSearchOpen(false);
        openMenu(null);
      }
    },
    [openMenu],
  );

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
              navRef={navRef}
              openMenuId={openMenuId}
              onOpenMenu={openMenu}
              onScheduleClose={scheduleClose}
              onHoldOpen={holdOpen}
            />

            <HeaderCtas
              isLoggedIn={isLoggedIn}
              cart={cart}
              searchOpen={searchOpen}
              onSearchOpenChange={onSearchOpenChange}
              searchBoundaryRef={navRef}
              accountOpen={accountOpen}
              onAccountOpenChange={onAccountOpenChange}
            />
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
          the pointer puts the menu away.

          Only the mega menu gets it. The order panel is a small form hanging
          off its own nav item, and dimming the page behind it would both
          overstate it and make the dim a trapdoor: the pointer drifting off
          the panel mid-typing would land on the dim and close the field. */}
      <div
        aria-hidden
        onMouseEnter={() => openMenu(null)}
        className={[
          'fixed inset-0 z-20 bg-black/70 transition-opacity duration-200',
          openMenuId === SHOP_PANEL_ID
            ? 'visible opacity-100'
            : 'invisible opacity-0',
        ].join(' ')}
      />
    </>
  );
}

/** The panel a nav item opens, or null if it just navigates. */
function panelOf(item: (typeof navigation)[number]) {
  return item.panel ?? null;
}

export function HeaderMenu({
  viewport,
  navRef,
  openMenuId = null,
  onOpenMenu,
  onScheduleClose,
  onHoldOpen,
}: {
  viewport: Viewport;
  /** Desktop only -- lets the header measure the nav's right edge. */
  navRef?: React.RefObject<HTMLElement>;
  /** Desktop only -- the id of the item whose dropdown is showing. */
  openMenuId?: string | null;
  onOpenMenu?: (id: string | null) => void;
  onScheduleClose?: () => void;
  /** Desktop only -- keeps a panel open while its form has focus. */
  onHoldOpen?: (held: boolean) => void;
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

            {/* The dropdowns have no room to be dropdowns here, so they
                flatten inline the way the reference's mobile submenu does. */}
            {panelOf(item) === ORDER_PANEL_ID && (
              <div className="mt-3">
                <OrderTrackForm idPrefix="mobile" onNavigate={close} />
              </div>
            )}

            {panelOf(item) === SHOP_PANEL_ID &&
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
      ref={navRef}
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
          const panel = panelOf(item);
          const id = panel ?? item.url;
          const isOpen = panel !== null && openMenuId === panel;
          // With a panel open the pointer may have moved off the nav and into
          // the panel itself -- which for the mega menu is not a descendant of
          // it -- so the open item stays highlighted once hover has gone.
          const highlighted = hoveredId ?? openMenuId;
          const enter = () => {
            setHoveredId(id);
            onOpenMenu?.(panel);
          };

          return (
            <li
              key={item.url}
              // `mb-0` is load-bearing: the bare `li { margin-bottom: 0.5rem }`
              // in reset.css would otherwise make this flex line 8px taller
              // than the links inside it, and since the nav is centred as a
              // box, that phantom margin lifts the labels 4px above the
              // header's centre -- out of line with the wordmark and search.
              className="relative mb-0"
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
                    the panel is open as the reference's does. Anything that
                    opens a panel earns one. */}
                {panel !== null && (
                  <ChevronIcon
                    className={[
                      'h-3 w-3 shrink-0 transition-transform duration-200',
                      isOpen ? 'rotate-180' : '',
                    ].join(' ')}
                  />
                )}
              </NavLink>

              {/* Unlike the mega menu this one is small enough to hang off its
                  own item, so it lives inside the nav -- which also means the
                  pointer never leaves the nav on the way into it. */}
              {panel === ORDER_PANEL_ID && (
                <OrderLookupPanel
                  open={isOpen}
                  onEnter={() => onOpenMenu?.(ORDER_PANEL_ID)}
                  onLeave={() => onScheduleClose?.()}
                  onFocusChange={(held) => onHoldOpen?.(held)}
                  onNavigate={() => {
                    onHoldOpen?.(false);
                    onOpenMenu?.(null);
                  }}
                />
              )}
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
  searchOpen,
  onSearchOpenChange,
  searchBoundaryRef,
  accountOpen,
  onAccountOpenChange,
}: Pick<HeaderProps, 'isLoggedIn' | 'cart'> & {
  searchOpen: boolean;
  onSearchOpenChange: (open: boolean) => void;
  searchBoundaryRef?: React.RefObject<HTMLElement>;
  accountOpen: boolean;
  onAccountOpenChange: (open: boolean) => void;
}) {
  const {open} = useAside();
  const iconBtn =
    'rounded-full p-1.5 text-ink transition-colors hover:bg-ink/5';

  return (
    <nav className="ml-auto flex items-center" role="navigation">
      {/* Two ways into the same search. The field can only grow where
          there is room for it to grow, and below 1024 there is none --
          the wordmark and the icons already fill the row -- so the phone
          keeps the drawer it always had. */}
      <button
        type="button"
        onClick={() => open('search')}
        className={`${iconBtn} lg:hidden`}
        aria-label="Search"
      >
        <SearchIcon className="h-6 w-6 shrink-0" />
      </button>

      <ExpandingSearch
        open={searchOpen}
        onOpenChange={onSearchOpenChange}
        boundaryRef={searchBoundaryRef}
        className="hidden lg:block"
      />

      {/* Was a link straight to /account, which for a signed-out visitor
          bounced to /account/orders and put an error page in front of them.
          It opens the sign-in panel instead -- the same prompt the live site
          gives -- and only the panel's own links reach into the account. */}
      <AccountMenu
        isLoggedIn={isLoggedIn}
        open={accountOpen}
        onOpenChange={onAccountOpenChange}
        className="hidden sm:block"
      />

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
      {/* The badge is the only confirmation a shopper gets when they add from
          a product card without opening the drawer, so it earns a real
          entrance: it pops in on the spring curve, and the digits roll rather
          than cut on every subsequent change. */}
      <AnimatePresence initial={false}>
        {count > 0 && (
          <motion.span
            key="cart-count"
            initial={{scale: 0.2, opacity: 0}}
            animate={{scale: 1, opacity: 1}}
            exit={{scale: 0.2, opacity: 0}}
            transition={{duration: 0.26, ease: EASE_SPRING}}
            className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[11px] font-bold leading-none text-bg"
          >
            <NumberFlow value={count} aria-hidden="true" />
          </motion.span>
        )}
      </AnimatePresence>
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
