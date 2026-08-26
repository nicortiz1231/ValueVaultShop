import {Suspense} from 'react';
import {Await, Link, NavLink, useAsyncValue} from 'react-router';
import {
  type CartViewPayload,
  useAnalytics,
  useOptimisticCart,
} from '@shopify/hydrogen';
import type {HeaderQuery, CartApiQueryFragment} from 'storefrontapi.generated';
import {useAside} from '~/components/Aside';
import {navigation, store} from '~/lib/store-config';
import {CartIcon, MenuIcon, SearchIcon, UserIcon} from './Icons';
import {Container} from './ui/Container';

interface HeaderProps {
  header: HeaderQuery;
  cart: Promise<CartApiQueryFragment | null>;
  isLoggedIn: Promise<boolean>;
  publicStoreDomain: string;
}

type Viewport = 'desktop' | 'mobile';

/** Shopify menu URLs are absolute; strip the domain so routing stays internal. */
function toInternalUrl(
  url: string,
  publicStoreDomain: string,
  primaryDomainUrl: string,
) {
  const isInternal =
    url.includes('myshopify.com') ||
    url.includes(publicStoreDomain) ||
    url.includes(primaryDomainUrl);
  return isInternal ? new URL(url).pathname : url;
}

/**
 * The wordmark. Set in the display serif rather than a boxed icon +
 * name lockup -- the closest thing this store has to Kaleido's script
 * logotype, and it doubles as the source for the oversized watermark motif
 * reused through the page (see components/Watermark.tsx).
 */
export function Logo({className = ''}: {className?: string}) {
  return (
    <Link
      to="/"
      prefetch="intent"
      className={`display text-[26px] text-ink ${className}`}
      aria-label={`${store.name} — home`}
    >
      {store.name}
    </Link>
  );
}

export function Header({
  header,
  isLoggedIn,
  cart,
  publicStoreDomain,
}: HeaderProps) {
  const {open} = useAside();

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg/95 backdrop-blur-sm">
      <Container>
        <div className="flex h-header items-center gap-4">
          <button
            type="button"
            className="-ml-2 rounded-full p-2 text-ink transition-colors hover:bg-ink/5 lg:hidden"
            onClick={() => open('mobile')}
            aria-label="Open menu"
          >
            <MenuIcon />
          </button>

          <Logo />

          <HeaderMenu
            menu={header.menu}
            viewport="desktop"
            primaryDomainUrl={header.shop.primaryDomain.url}
            publicStoreDomain={publicStoreDomain}
          />

          <HeaderCtas isLoggedIn={isLoggedIn} cart={cart} />
        </div>
      </Container>
    </header>
  );
}

export function HeaderMenu({
  menu,
  primaryDomainUrl,
  viewport,
  publicStoreDomain,
}: {
  menu: HeaderProps['header']['menu'];
  primaryDomainUrl: HeaderProps['header']['shop']['primaryDomain']['url'];
  viewport: Viewport;
  publicStoreDomain: HeaderProps['publicStoreDomain'];
}) {
  const {close} = useAside();

  const items = menu?.items?.length
    ? menu.items
        .filter((item) => item.url)
        .map((item) => ({
          id: item.id,
          title: item.title,
          url: toInternalUrl(item.url!, publicStoreDomain, primaryDomainUrl),
        }))
    : navigation.map((item) => ({
        id: item.url,
        title: item.title,
        url: item.url,
      }));

  if (viewport === 'mobile') {
    return (
      <nav className="flex flex-col" role="navigation">
        <NavLink
          to="/"
          end
          prefetch="intent"
          onClick={close}
          className="border-b border-line py-4 text-xl font-medium text-ink"
        >
          Home
        </NavLink>
        {items.map((item) => (
          <NavLink
            key={item.id}
            to={item.url}
            prefetch="intent"
            onClick={close}
            className="border-b border-line py-4 text-xl font-medium text-ink"
          >
            {item.title}
          </NavLink>
        ))}
      </nav>
    );
  }

  return (
    <nav
      className="ml-8 hidden items-center gap-7 lg:flex"
      role="navigation"
      aria-label="Main"
    >
      {items.map((item) => (
        <NavLink
          key={item.id}
          to={item.url}
          prefetch="intent"
          className={({isActive}) =>
            [
              'text-[15px] font-medium transition-colors',
              isActive ? 'text-brand' : 'text-ink-muted hover:text-ink',
            ].join(' ')
          }
        >
          {item.title}
        </NavLink>
      ))}
    </nav>
  );
}

function HeaderCtas({
  isLoggedIn,
  cart,
}: Pick<HeaderProps, 'isLoggedIn' | 'cart'>) {
  const {open} = useAside();
  const iconBtn = 'rounded-full p-2.5 text-ink transition-colors hover:bg-ink/5';

  return (
    <nav className="ml-auto flex items-center gap-1" role="navigation">
      <button
        type="button"
        onClick={() => open('search')}
        className={iconBtn}
        aria-label="Search"
      >
        <SearchIcon />
      </button>

      <NavLink to="/account" prefetch="intent" className={`hidden sm:block ${iconBtn}`}>
        <Suspense fallback={<UserIcon />}>
          <Await resolve={isLoggedIn} errorElement={<UserIcon />}>
            {(loggedIn) => (
              <>
                <UserIcon />
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
      className="relative rounded-full p-2.5 text-ink transition-colors hover:bg-ink/5"
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
      <CartIcon />
      {count > 0 && (
        <span className="absolute right-0.5 top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-brand px-1 text-[11px] font-bold leading-none text-bg">
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
