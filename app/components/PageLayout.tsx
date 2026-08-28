import {Await, Link} from 'react-router';
import {MotionConfig} from 'framer-motion';
import {Suspense, useId} from 'react';
import type {
  CartApiQueryFragment,
  FooterQuery,
  HeaderQuery,
  MegaMenuBannersQuery,
} from 'storefrontapi.generated';
import {Aside} from '~/components/Aside';
import {Footer} from '~/components/Footer';
import {Header, HeaderMenu} from '~/components/Header';
import {CartMain} from '~/components/CartMain';
import {
  SEARCH_ENDPOINT,
  SearchFormPredictive,
} from '~/components/SearchFormPredictive';
import {SearchResultsPredictive} from '~/components/SearchResultsPredictive';
import {TrustBar} from '~/components/TrustBar';

interface PageLayoutProps {
  cart: Promise<CartApiQueryFragment | null>;
  footer: Promise<FooterQuery | null>;
  header: HeaderQuery;
  isLoggedIn: Promise<boolean>;
  megaMenu?: MegaMenuBannersQuery | null;
  publicStoreDomain: string;
  children?: React.ReactNode;
}

export function PageLayout({
  cart,
  children = null,
  footer,
  header,
  isLoggedIn,
  megaMenu,
  publicStoreDomain,
}: PageLayoutProps) {
  return (
    // `reducedMotion="user"` makes every Framer transition below honour the
    // OS setting without each component having to ask. Transforms and
    // opacity are dropped; layout still settles instantly, so nothing
    // disappears for a visitor who has asked for less movement.
    <MotionConfig reducedMotion="user">
      <Aside.Provider>
        <CartAside cart={cart} />
        <SearchAside />
        <MobileMenuAside />
        <TrustBar />
        {header && (
          <Header
            header={header}
            cart={cart}
            isLoggedIn={isLoggedIn}
            megaMenu={megaMenu}
          />
        )}
        <main className="flex min-h-[50vh] flex-col">{children}</main>
        <Footer
          footer={footer}
          header={header}
          publicStoreDomain={publicStoreDomain}
        />
      </Aside.Provider>
    </MotionConfig>
  );
}

function CartAside({cart}: {cart: PageLayoutProps['cart']}) {
  return (
    <Aside type="cart" heading="Your cart">
      <Suspense
        fallback={
          <p className="px-5 py-8 text-sm text-ink-muted">Loading cart…</p>
        }
      >
        <Await resolve={cart}>
          {(cart) => {
            return <CartMain cart={cart} layout="aside" />;
          }}
        </Await>
      </Suspense>
    </Aside>
  );
}

function SearchAside() {
  const queriesDatalistId = useId();
  return (
    <Aside type="search" heading="Search">
      <div className="px-5 py-5">
        <SearchFormPredictive>
          {({fetchResults, goToSearch, inputRef}) => (
            <div className="flex gap-2">
              <input
                name="q"
                onChange={fetchResults}
                onFocus={fetchResults}
                placeholder="Search products…"
                ref={inputRef}
                type="search"
                list={queriesDatalistId}
                // 16px minimum, or iOS Safari zooms the page in on focus and
                // leaves it there. This drawer is the phone's only search, so
                // the 15px only ever needs to apply from `lg` up.
                className="h-11 min-w-0 flex-1 rounded-pill border border-line-strong bg-surface px-4 text-[16px] text-ink placeholder:text-ink-soft lg:text-[15px]"
              />
              <button
                onClick={goToSearch}
                className="h-11 shrink-0 rounded-pill bg-brand px-5 text-sm font-semibold text-bg transition-colors hover:bg-brand-deep"
              >
                Search
              </button>
            </div>
          )}
        </SearchFormPredictive>

        <SearchResultsPredictive>
          {({items, total, term, state, closeSearch}) => {
            const {articles, collections, pages, products, queries} = items;

            if (state === 'loading' && term.current) {
              return (
                <p className="py-8 text-center text-sm text-ink-muted">
                  Searching…
                </p>
              );
            }

            if (!total) {
              return <SearchResultsPredictive.Empty term={term} />;
            }

            return (
              <>
                <SearchResultsPredictive.Queries
                  queries={queries}
                  queriesDatalistId={queriesDatalistId}
                />
                <SearchResultsPredictive.Products
                  products={products}
                  closeSearch={closeSearch}
                  term={term}
                />
                <SearchResultsPredictive.Collections
                  collections={collections}
                  closeSearch={closeSearch}
                  term={term}
                />
                <SearchResultsPredictive.Pages
                  pages={pages}
                  closeSearch={closeSearch}
                  term={term}
                />
                <SearchResultsPredictive.Articles
                  articles={articles}
                  closeSearch={closeSearch}
                  term={term}
                />
                {term.current && total ? (
                  <Link
                    onClick={closeSearch}
                    to={`${SEARCH_ENDPOINT}?q=${term.current}`}
                    className="mt-5 block rounded-pill border border-line-strong bg-surface py-3 text-center text-sm font-semibold text-ink transition-colors hover:bg-bg-deep"
                  >
                    View all results for &ldquo;{term.current}&rdquo;
                  </Link>
                ) : null}
              </>
            );
          }}
        </SearchResultsPredictive>
      </div>
    </Aside>
  );
}

/** The nav is config-driven, so this needs nothing from the Shopify menu. */
function MobileMenuAside() {
  return (
    // Anchored left, unlike the cart and search: the hamburger that opens it
    // is the leftmost thing in the header, so the panel should come out from
    // under the thumb that tapped it.
    <Aside type="mobile" heading="Menu" side="left">
      <div className="px-5">
        <HeaderMenu viewport="mobile" />
      </div>
    </Aside>
  );
}
