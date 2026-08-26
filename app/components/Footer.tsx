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
    <footer className="relative mt-auto overflow-hidden border-t border-line bg-void">
      <div
        className="bloom bottom-[-20%] left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 opacity-40"
        aria-hidden="true"
      />
      <Container className="relative">
        <div className="grid grid-cols-2 gap-x-8 gap-y-10 py-14 sm:grid-cols-3 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:py-16">
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <div className="flex items-center gap-2.5">
              <span
                aria-hidden="true"
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-lime text-[15px] font-black text-canvas shadow-glow"
              >
                V
              </span>
              <span className="display text-[19px] text-chalk">{store.name}</span>
            </div>
            <p className="mt-3.5 max-w-xs text-sm leading-relaxed text-ash">
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

        <div className="flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-line py-7 text-sm">
          <span className="font-semibold text-chalk">Questions?</span>
          <a
            href={`mailto:${support.email}`}
            className="text-lime underline underline-offset-4 hover:text-chalk"
          >
            {support.email}
          </a>
          {support.phone && (
            <a
              href={`tel:${support.phone.replace(/[^\d+]/g, '')}`}
              className="text-lime underline underline-offset-4 hover:text-chalk"
            >
              {support.phone}
            </a>
          )}
          <span className="text-dim">We reply {support.responseTime}.</span>
          {support.address && (
            <span className="text-dim">{support.address}</span>
          )}
        </div>

        <div className="flex flex-col gap-5 border-t border-line py-7 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-dim">
              © {new Date().getFullYear()} {store.name}. All rights reserved.
            </p>
            <p className="mt-1.5 flex items-center gap-1.5 text-[13px] text-dim">
              <ShieldIcon className="h-4 w-4" />
              Checkout secured by Shopify · {returns.windowDays}-day returns ·
              Ships in {shipping.processingTime}
            </p>
          </div>

          <ul className="flex flex-wrap items-center gap-1.5">
            {paymentMethods.map((method) => (
              <li
                key={method}
                className="rounded-md border border-line bg-surface px-2 py-1 text-[11px] font-semibold tracking-tight text-dim"
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
            className="text-sm text-ash transition-colors hover:text-chalk"
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
      <h3 className="text-[13px] font-bold uppercase tracking-[0.08em] text-dim">
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
      className="text-sm text-ash transition-colors hover:text-chalk"
    >
      {children}
    </Component>
  );
}
