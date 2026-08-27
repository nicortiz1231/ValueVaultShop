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
 *
 * Vertical padding runs one step past the reference's (60/72/88 against its
 * 48/60/72). Its footer stands ~80px taller than a like-for-like port of ours
 * would, because it carries a "Follow us" block we have no accounts for. Left
 * at its own numbers, the bottom of our page lands inside the product row
 * above -- so the height comes back as padding instead.
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
        <div className="relative -mx-1 flex flex-wrap py-9 min-[600px]:-mx-1.5 lg:py-[60px] min-[1440px]:-mx-2 min-[1440px]:py-[72px] min-[1920px]:py-[88px]">
          <div className="mb-4 w-full px-1 min-[600px]:px-1.5 lg:mb-0 lg:w-6/12 min-[1440px]:w-5/12 min-[1440px]:px-2">
            <p className="font-display text-[30px] font-semibold leading-none tracking-[-0.5px] text-ink min-[600px]:text-[36px] lg:text-[42px] min-[1440px]:text-[48px] min-[1920px]:text-[56px]">
              First look at new arrivals, real discounts, and the things worth
              knowing about, straight to your inbox.
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
        <div className="relative -mx-4 min-[600px]:-mx-5 lg:mx-0 lg:flex lg:justify-between lg:border-t lg:border-line lg:py-[60px] min-[1440px]:py-[72px] min-[1920px]:py-[88px]">
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
    // `max-w-none` and the reset overrides on the input are load-bearing:
    // reset.css caps every bare form at 400px above 768px and gives every
    // bare input a 999px radius, its own border and vertical margins. Left
    // alone they turn this into a pill inside a square, in a column narrower
    // than the one it is meant to fill.
    <form
      onSubmit={(e) => e.preventDefault()}
      className="flex w-full max-w-none items-stretch gap-x-2"
    >
      <label htmlFor="footer-email" className="sr-only">
        Email address
      </label>
      <input
        id="footer-email"
        type="email"
        required
        placeholder="Enter your email"
        className="m-0 w-full flex-auto rounded-[4px] border border-line bg-surface px-4 py-[11.756px] text-[13px] leading-[1.5] text-ink placeholder:text-ink-soft focus:outline-none"
      />
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

/**
 * Social glyphs, lifted verbatim from the reference site's own footer SVGs --
 * both 24x24, both solid fills, the Instagram mark drawn as three paths
 * (frame, lens, dot) rather than an outline stroke.
 */
function SocialIcon({name}: {name: 'Instagram' | 'Facebook'}) {
  const paths = name === 'Facebook' ? FACEBOOK_PATHS : INSTAGRAM_PATHS;

  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      {paths.map((d) => (
        <path key={d.slice(0, 24)} d={d} />
      ))}
    </svg>
  );
}

const FACEBOOK_PATHS = [
  'M13.574 21V13.1299H16.1936L16.6883 9.86946H13.5628V7.75578C13.5628 6.86758 14.0012 6.00187 15.3954 6.00187H16.812V3.22486C16.812 3.22486 15.519 3 14.2935 3C11.7189 3 10.0437 4.56277 10.0437 7.38476V9.86946H7.18799V13.1299H10.0437V21H13.5628H13.574Z',
];

const INSTAGRAM_PATHS = [
  'M12 5.03066C14.2711 5.03066 14.54 5.04062 15.4332 5.08047C16.2633 5.11699 16.7115 5.25645 17.0104 5.37266C17.4055 5.52539 17.691 5.71133 17.9865 6.00684C18.2854 6.30566 18.468 6.58789 18.6207 6.98301C18.7369 7.28184 18.8764 7.7334 18.9129 8.56016C18.9527 9.45664 18.9627 9.72559 18.9627 11.9934C18.9627 14.2645 18.9527 14.5334 18.9129 15.4266C18.8764 16.2566 18.7369 16.7049 18.6207 17.0037C18.468 17.3988 18.282 17.6844 17.9865 17.9799C17.6877 18.2787 17.4055 18.4613 17.0104 18.6141C16.7115 18.7303 16.26 18.8697 15.4332 18.9062C14.5367 18.9461 14.2678 18.9561 12 18.9561C9.72891 18.9561 9.45996 18.9461 8.5668 18.9062C7.73672 18.8697 7.28848 18.7303 6.98965 18.6141C6.59453 18.4613 6.30898 18.2754 6.01348 17.9799C5.71465 17.6811 5.53203 17.3988 5.3793 17.0037C5.26309 16.7049 5.12363 16.2533 5.08711 15.4266C5.04727 14.5301 5.0373 14.2611 5.0373 11.9934C5.0373 9.72227 5.04727 9.45332 5.08711 8.56016C5.12363 7.73008 5.26309 7.28184 5.3793 6.98301C5.53203 6.58789 5.71797 6.30234 6.01348 6.00684C6.3123 5.70801 6.59453 5.52539 6.98965 5.37266C7.28848 5.25645 7.74004 5.11699 8.5668 5.08047C9.45996 5.04062 9.72891 5.03066 12 5.03066ZM12 3.5C9.69238 3.5 9.40352 3.50996 8.49707 3.5498C7.59395 3.58965 6.97305 3.73574 6.43516 3.94492C5.87402 4.16406 5.39922 4.45293 4.92773 4.92773C4.45293 5.39922 4.16406 5.87402 3.94492 6.43184C3.73574 6.97305 3.58965 7.59062 3.5498 8.49375C3.50996 9.40352 3.5 9.69238 3.5 12C3.5 14.3076 3.50996 14.5965 3.5498 15.5029C3.58965 16.4061 3.73574 17.027 3.94492 17.5648C4.16406 18.126 4.45293 18.6008 4.92773 19.0723C5.39922 19.5437 5.87402 19.8359 6.43184 20.0518C6.97305 20.2609 7.59062 20.407 8.49375 20.4469C9.4002 20.4867 9.68906 20.4967 11.9967 20.4967C14.3043 20.4967 14.5932 20.4867 15.4996 20.4469C16.4027 20.407 17.0236 20.2609 17.5615 20.0518C18.1193 19.8359 18.5941 19.5437 19.0656 19.0723C19.5371 18.6008 19.8293 18.126 20.0451 17.5682C20.2543 17.027 20.4004 16.4094 20.4402 15.5063C20.4801 14.5998 20.49 14.3109 20.49 12.0033C20.49 9.6957 20.4801 9.40684 20.4402 8.50039C20.4004 7.59727 20.2543 6.97637 20.0451 6.43848C19.8359 5.87402 19.5471 5.39922 19.0723 4.92773C18.6008 4.45625 18.126 4.16406 17.5682 3.94824C17.027 3.73906 16.4094 3.59297 15.5063 3.55313C14.5965 3.50996 14.3076 3.5 12 3.5Z',
  'M12 7.63379C9.58945 7.63379 7.63379 9.58945 7.63379 12C7.63379 14.4105 9.58945 16.3662 12 16.3662C14.4105 16.3662 16.3662 14.4105 16.3662 12C16.3662 9.58945 14.4105 7.63379 12 7.63379ZM12 14.8322C10.4361 14.8322 9.16777 13.5639 9.16777 12C9.16777 10.4361 10.4361 9.16777 12 9.16777C13.5639 9.16777 14.8322 10.4361 14.8322 12C14.8322 13.5639 13.5639 14.8322 12 14.8322Z',
  'M17.5582 7.46111C17.5582 8.02556 17.1 8.48045 16.5389 8.48045C15.9744 8.48045 15.5195 8.02224 15.5195 7.46111C15.5195 6.89666 15.9777 6.44177 16.5389 6.44177C17.1 6.44177 17.5582 6.89998 17.5582 7.46111Z',
];
