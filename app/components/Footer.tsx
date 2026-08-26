import {Suspense} from 'react';
import {Await, Link, NavLink} from 'react-router';
import type {FooterQuery, HeaderQuery} from 'storefrontapi.generated';
import {
  categories,
  paymentMethods,
  returns,
  shipping,
  store,
  support,
} from '~/lib/store-config';
import {ShieldIcon} from './Icons';
import {Container} from './ui/Container';

interface FooterProps {
  footer: Promise<FooterQuery | null>;
  header: HeaderQuery;
  publicStoreDomain: string;
}

/** Policy links, used when the Shopify footer menu has not loaded. */
const FALLBACK_POLICY_LINKS = [
  {id: 'refund', title: 'Refund policy', url: '/policies/refund-policy'},
  {id: 'shipping', title: 'Shipping policy', url: '/policies/shipping-policy'},
  {id: 'privacy', title: 'Privacy policy', url: '/policies/privacy-policy'},
  {id: 'terms', title: 'Terms of service', url: '/policies/terms-of-service'},
];

export function Footer({
  footer: footerPromise,
  header,
  publicStoreDomain,
}: FooterProps) {
  return (
    <footer className="mt-auto border-t border-line bg-paper">
      <Container>
        <div className="grid grid-cols-2 gap-x-8 gap-y-10 py-14 sm:grid-cols-3 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:py-16">
          {/* Brand + the two facts most worth repeating at the bottom */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <div className="flex items-center gap-2.5">
              <span
                aria-hidden="true"
                className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-sage text-[15px] font-bold text-white"
              >
                V
              </span>
              <span className="text-[19px] font-bold tracking-tight text-ink">
                {store.name}
              </span>
            </div>
            <p className="mt-3.5 max-w-xs text-sm leading-relaxed text-ink-muted">
              {store.description}
            </p>
          </div>

          <FooterColumn title="Shop">
            {categories.map((category) => (
              <FooterLink
                key={category.handle}
                to={`/collections/${category.handle}`}
              >
                {category.title}
              </FooterLink>
            ))}
            <FooterLink to="/collections/all">Shop all</FooterLink>
          </FooterColumn>

          <FooterColumn title="Help">
            <FooterLink to="/pages/contact-us">Contact us</FooterLink>
            <FooterLink to="/account/orders">Order lookup</FooterLink>
            <FooterLink to="/pages/about-us">About us</FooterLink>
            <FooterLink to="/#faq">FAQ</FooterLink>
          </FooterColumn>

          <FooterColumn title="Policies">
            <Suspense
              fallback={FALLBACK_POLICY_LINKS.map((link) => (
                <FooterLink key={link.id} to={link.url}>
                  {link.title}
                </FooterLink>
              ))}
            >
              <Await resolve={footerPromise} errorElement={null}>
                {(footer) => (
                  <PolicyLinks
                    footer={footer}
                    primaryDomainUrl={header.shop.primaryDomain?.url}
                    publicStoreDomain={publicStoreDomain}
                  />
                )}
              </Await>
            </Suspense>
          </FooterColumn>
        </div>

        {/* Contact block — a real, reachable address is the strongest single
            trust signal a small store has, so it gets its own band. */}
        <div className="flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-line py-7 text-sm">
          <span className="font-semibold text-ink">Questions?</span>
          <a
            href={`mailto:${support.email}`}
            className="text-sage-deep underline underline-offset-4 hover:text-ink"
          >
            {support.email}
          </a>
          {support.phone && (
            <a
              href={`tel:${support.phone.replace(/[^\d+]/g, '')}`}
              className="text-sage-deep underline underline-offset-4 hover:text-ink"
            >
              {support.phone}
            </a>
          )}
          <span className="text-ink-muted">
            We reply {support.responseTime}.
          </span>
          {support.address && (
            <span className="text-ink-muted">{support.address}</span>
          )}
        </div>

        <div className="flex flex-col gap-5 border-t border-line py-7 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-ink-muted">
              © {new Date().getFullYear()} {store.name}. All rights reserved.
            </p>
            <p className="mt-1.5 flex items-center gap-1.5 text-[13px] text-ink-subtle">
              <ShieldIcon className="h-4 w-4" />
              Checkout secured by Shopify · {returns.windowDays}-day returns ·
              Ships in {shipping.processingTime}
            </p>
          </div>

          <ul className="flex flex-wrap items-center gap-1.5">
            {paymentMethods.map((method) => (
              <li
                key={method}
                className="rounded-md border border-line bg-cream px-2 py-1 text-[11px] font-semibold tracking-tight text-ink-muted"
              >
                {method}
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </footer>
  );
}

function PolicyLinks({
  footer,
  primaryDomainUrl,
  publicStoreDomain,
}: {
  footer: FooterQuery | null;
  primaryDomainUrl?: string;
  publicStoreDomain: string;
}) {
  const items = footer?.menu?.items?.length
    ? footer.menu.items
        .filter((item) => item.url)
        .map((item) => {
          const url = item.url!;
          const isInternal =
            url.includes('myshopify.com') ||
            url.includes(publicStoreDomain) ||
            (primaryDomainUrl ? url.includes(primaryDomainUrl) : false);
          return {
            id: item.id,
            title: item.title,
            url: isInternal ? new URL(url).pathname : url,
          };
        })
    : FALLBACK_POLICY_LINKS;

  return (
    <>
      {items.map((item) =>
        item.url.startsWith('/') ? (
          <FooterLink key={item.id} to={item.url}>
            {item.title}
          </FooterLink>
        ) : (
          <a
            key={item.id}
            href={item.url}
            rel="noopener noreferrer"
            target="_blank"
            className="text-sm text-ink-muted transition-colors hover:text-ink"
          >
            {item.title}
          </a>
        ),
      )}
    </>
  );
}

function FooterColumn({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="text-[13px] font-bold uppercase tracking-[0.08em] text-ink">
        {title}
      </h3>
      <nav className="mt-4 flex flex-col gap-2.5">{children}</nav>
    </div>
  );
}

function FooterLink({to, children}: {to: string; children: React.ReactNode}) {
  const Component = to.includes('#') ? Link : NavLink;
  return (
    <Component
      to={to}
      prefetch="intent"
      className="text-sm text-ink-muted transition-colors hover:text-ink"
    >
      {children}
    </Component>
  );
}
