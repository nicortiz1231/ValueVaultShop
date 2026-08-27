import {Suspense} from 'react';
import {Await, Link, NavLink} from 'react-router';
import {Image} from '@shopify/hydrogen';
import type {FooterQuery, HeaderQuery} from 'storefrontapi.generated';
import {categories, social, store, support} from '~/lib/store-config';

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

/**
 * Site footer -- a port of the reference site's own.
 *
 * Its shape, read off its stylesheet rather than guessed at:
 *
 *   top row     headline at 6/12 (5/12 from 1440), then a right column
 *               pushed one column over, capped at 450 / 520 / 640px and
 *               pinned right, holding the signup, socials and (on mobile
 *               only) the photo pair. 36px of padding, 48 / 60 / 72 up.
 *   bottom row  link columns at 50% width (40% from 1440) in a 3-up grid --
 *               which is why a fourth column wraps under the first -- with
 *               the photo pair beside them and the wordmark washed pale
 *               behind, hung off the bottom-left corner.
 *   bottom bar  hairline, 16px, copyright and two policy links.
 *
 * Below 1024 the link columns collapse into accordions and go full-bleed so
 * their hairlines run edge to edge, exactly as the reference does it.
 */
export function Footer({
  footer: footerPromise,
  header,
  publicStoreDomain,
}: FooterProps) {
  return (
    <footer className="relative mt-auto overflow-hidden bg-surface">
      <div className="mx-auto w-full max-w-[1920px] px-4 min-[600px]:px-5 lg:px-8 min-[1200px]:px-10">
        {/* .row.top-content */}
        <div className="relative -mx-1 flex flex-wrap py-9 min-[600px]:-mx-1.5 lg:py-12 min-[1440px]:-mx-2 min-[1440px]:py-[60px] min-[1920px]:py-[72px]">
          <div className="mb-4 w-full px-1 min-[600px]:px-1.5 lg:mb-0 lg:w-6/12 min-[1440px]:w-5/12 min-[1440px]:px-2">
            <p className="font-display text-[30px] font-semibold leading-none tracking-[-0.5px] text-ink min-[600px]:text-[36px] lg:text-[42px] min-[1440px]:text-[48px] min-[1920px]:text-[56px]">
              First look at new arrivals and real discounts, straight to your
              inbox.
            </p>
          </div>

          <div className="w-full px-1 min-[600px]:px-1.5 lg:ml-[8.3333%] lg:w-5/12 min-[1440px]:w-6/12 min-[1440px]:px-2">
            <div className="lg:ml-auto lg:max-w-[450px] min-[1440px]:max-w-[520px] min-[1920px]:max-w-[640px]">
              <NewsletterForm />

              {social.length > 0 && (
                <div className="mt-5">
                  <p className="text-[14px] font-medium leading-[1.5] text-ink">
                    Follow us
                  </p>
                  <div className="mt-2 flex gap-x-3 lg:mt-3">
                    {social.map(({name, url}) => (
                      <a
                        key={name}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={name}
                        className="flex h-6 w-6 items-center justify-center text-ink transition-opacity duration-300 hover:opacity-50"
                      >
                        <SocialIcon name={name} />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Mobile placement of the photo pair; above 1024 the same two
                  images move down beside the link columns. */}
              <div className="mt-6 grid grid-cols-2 gap-x-2 lg:hidden">
                <Suspense fallback={null}>
                  <Await resolve={footerPromise} errorElement={null}>
                    {(footer) => <FooterPhotos footer={footer} />}
                  </Await>
                </Suspense>
              </div>
            </div>
          </div>
        </div>

        {/* .bottom-content -- full-bleed below 1024 so the accordion
            hairlines run to the edges. */}
        <div className="relative -mx-4 min-[600px]:-mx-5 lg:mx-0 lg:flex lg:justify-between lg:border-t lg:border-line lg:py-12 min-[1440px]:py-[60px] min-[1920px]:py-[72px]">
          <div className="lg:z-[2] lg:grid lg:w-1/2 lg:grid-cols-3 lg:gap-x-4 min-[1440px]:w-[40%]">
            <FooterColumn title="About">
              <FooterLink to="/pages/about-us">Our story</FooterLink>
              <FooterLink to="/pages/contact-us">Contact us</FooterLink>
            </FooterColumn>

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

            <FooterColumn title="Support">
              <FooterLink to="/account/orders">Order lookup</FooterLink>
              <a
                href={`mailto:${support.email}`}
                className="text-[13px] leading-[1.5] text-ink no-underline transition-opacity duration-300 hover:text-ink hover:no-underline lg:hover:opacity-50"
              >
                Email us
              </a>
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

            {/* The reference's fourth column carries a heading and no links,
                which is what pushes it onto a second row of the 3-up grid. */}
            <FooterColumn title="Your Privacy Choices" />
          </div>

          <div className="hidden lg:flex lg:w-[41.6667%] lg:max-w-[450px] lg:justify-start lg:gap-x-3 min-[1440px]:max-w-[520px] min-[1920px]:max-w-[640px]">
            <Suspense fallback={null}>
              <Await resolve={footerPromise} errorElement={null}>
                {(footer) => <FooterPhotos footer={footer} desktop />}
              </Await>
            </Suspense>
          </div>

          {/* Wordmark washed pale behind the columns, hung off the bottom-left
              corner. The reference fills its own logotype with its background
              tone rather than dropping the opacity of dark type. */}
          <div className="pointer-events-none relative z-[1] -ml-1 mt-6 w-[calc(100%+8px)] px-4 [container-type:inline-size] min-[600px]:px-5 lg:absolute lg:bottom-0 lg:left-[-4px] lg:ml-0 lg:mt-0 lg:w-[450px] lg:px-0 min-[1440px]:mb-[21px] min-[1440px]:w-[565px]">
            <span className="wordmark-bg block text-[20cqw] text-bg opacity-100">
              {store.name}
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[1920px] px-4 min-[600px]:px-5 lg:px-8 min-[1200px]:px-10">
        <div className="flex flex-wrap gap-x-3 gap-y-1 border-t border-line py-4">
          <p className="text-[11px] leading-[1.5] tracking-[0.1px] text-ink-soft min-[1440px]:text-[12px] min-[1920px]:text-[13px]">
            ©{new Date().getFullYear()} {store.name}. All Rights Reserved.
          </p>
          <div className="flex">
            <BottomLink to="/policies/privacy-policy">Privacy Policy</BottomLink>
            <BottomLink to="/policies/terms-of-service" last>
              Terms &amp; Conditions
            </BottomLink>
          </div>
        </div>
      </div>
    </footer>
  );
}

/**
 * TODO(steven): wire this to a real subscriber list (Shopify's customer
 * newsletter opt-in, or Klaviyo/Mailchimp) before launch. It currently only
 * prevents the page reload -- collecting an email and silently discarding it
 * is worse than not asking, so this must be connected before it goes live.
 */
function NewsletterForm() {
  return (
    <form onSubmit={(e) => e.preventDefault()} className="flex gap-x-2">
      <label htmlFor="footer-email" className="sr-only">
        Email address
      </label>
      <div className="flex w-full items-center rounded-[4px] border border-line bg-surface">
        <input
          id="footer-email"
          type="email"
          required
          placeholder="Enter your email"
          className="w-full flex-auto bg-transparent px-4 py-[11.756px] text-[13px] leading-[1.5] text-ink placeholder:text-ink-soft focus:outline-none"
        />
      </div>
      <button
        type="submit"
        className="shrink-0 rounded-[4px] bg-block-butter px-9 py-3.5 font-display text-[14px] font-medium leading-[1.2] tracking-[0.1px] text-ink transition-colors duration-300 hover:bg-block-butter-deep"
      >
        Submit
      </button>
    </form>
  );
}

/** The photo pair, 8px-rounded, that the reference runs beside its columns. */
function FooterPhotos({
  footer,
  desktop = false,
}: {
  footer: FooterQuery | null;
  desktop?: boolean;
}) {
  const nodes = (footer?.collections?.nodes ?? []).filter((node) => node.image);
  if (!nodes.length) return null;

  return (
    <>
      {nodes.slice(0, 2).map((node) => (
        <div
          key={node.id}
          className={
            desktop ? 'lg:w-[215px] min-[1440px]:w-1/2' : 'w-full'
          }
        >
          <div className="aspect-square w-full overflow-hidden rounded-lg bg-bg-deep">
            <Image
              data={node.image!}
              sizes="(min-width: 1024px) 215px, 45vw"
              alt=""
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      ))}
    </>
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
            className="text-[13px] leading-[1.5] text-ink no-underline transition-opacity duration-300 hover:text-ink hover:no-underline lg:hover:opacity-50"
          >
            {item.title}
          </a>
        ),
      )}
    </>
  );
}

/**
 * One link column.
 *
 * `<details open>` rather than hand-rolled state: below 1024 the reference
 * collapses these, above it they are always open with the toggle icon hidden.
 * A details element gets that, plus keyboard and screen-reader handling, for
 * free -- and it still renders open with JS switched off.
 */
function FooterColumn({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <details
      open
      className="group border-t border-line pb-1 lg:border-t-0 lg:pb-0"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between px-4 pb-2 pt-4 min-[600px]:px-5 lg:px-0 lg:pb-0 lg:pt-0 [&::-webkit-details-marker]:hidden">
        <span className="text-[14px] font-medium leading-[1.5] text-ink">
          {title}
        </span>
        <span className="flex h-5 w-5 items-center justify-center text-ink lg:hidden">
          <PlusMinusIcon />
        </span>
      </summary>
      {children ? (
        <nav className="flex flex-col gap-y-2 px-4 pb-3 min-[600px]:px-5 lg:px-0 lg:pb-0 lg:pt-3 min-[1440px]:gap-y-2.5">
          {children}
        </nav>
      ) : null}
    </details>
  );
}

function FooterLink({to, children}: {to: string; children: React.ReactNode}) {
  const Component = to.includes('#') ? Link : NavLink;
  return (
    <Component
      to={to}
      prefetch="intent"
      className="text-[13px] leading-[1.5] text-ink no-underline transition-opacity duration-300 hover:text-ink hover:no-underline lg:hover:opacity-50"
    >
      {children}
    </Component>
  );
}

/** Bottom-bar link. The reference separates these with a literal pipe. */
function BottomLink({
  to,
  last = false,
  children,
}: {
  to: string;
  last?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      prefetch="intent"
      className={`relative px-2 text-[11px] leading-[1.5] tracking-[0.1px] text-ink-soft no-underline transition-opacity duration-300 first:pl-0 hover:text-ink-soft hover:no-underline lg:hover:opacity-50 min-[1440px]:text-[12px] min-[1920px]:text-[13px] ${
        last
          ? ''
          : 'after:absolute after:right-[-2px] after:top-1/2 after:-translate-y-1/2 after:content-["|"]'
      }`}
    >
      {children}
    </Link>
  );
}

/** Plus when the column is shut, minus when it is open. */
function PlusMinusIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className="h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1 8H15"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="square"
      />
      <path
        d="M8 1V15"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="square"
        className="group-open:hidden"
      />
    </svg>
  );
}

function SocialIcon({name}: {name: 'Instagram' | 'Facebook'}) {
  if (name === 'Facebook') {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-6 w-6">
        <path d="M14.5 8.5h2.2V5.6c-.4-.05-1.7-.17-3.2-.17-3.2 0-5.3 1.9-5.3 5.4V13H5.6v3.3h2.6V24h3.4v-7.7h2.6l.4-3.3h-3v-1.85c0-.95.26-1.65 1.9-1.65Z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-6 w-6">
      <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.8 3.8 0 0 1-1.38-.9 3.8 3.8 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16Zm0 5.9a3.94 3.94 0 1 0 0 7.88 3.94 3.94 0 0 0 0-7.88Zm0 6.5a2.56 2.56 0 1 1 0-5.12 2.56 2.56 0 0 1 0 5.12Zm5.02-6.66a.92.92 0 1 1-1.84 0 .92.92 0 0 1 1.84 0Z" />
    </svg>
  );
}
