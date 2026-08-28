import {Suspense, useEffect, useRef, useState} from 'react';
import {Await, Form, Link} from 'react-router';
import {AnimatePresence, motion} from 'framer-motion';
import {EASE_OUT_QUART} from '~/lib/motion';
import {
  ArrowIcon,
  BoxIcon,
  CloseIcon,
  UserCircleIcon,
  UserIcon,
} from './Icons';

/**
 * The header's account control: the person icon, and the panel it drops.
 *
 * Where the sign-in itself happens is not a choice this storefront gets to
 * make. Shopify owns customer identity -- the "Sign in with Shop" button and
 * the email code the live site shows are served from Shopify's own login
 * page, and the Customer Account API only hands back a session through its
 * OAuth flow. A form here that took a password would have nothing to submit
 * it to.
 *
 * So the panel is the doorway rather than the door: it offers the same two
 * routes in, and both land on Shopify's page. `/account/login` is the
 * scaffold's route, which redirects into `customerAccount.login()`.
 *
 * The email field is not decoration. It forwards what was typed as
 * `login_hint`, which Shopify's login page reads to prefill the address --
 * so typing an email here and pressing the arrow is the same journey the
 * reference site's field starts, minus the round trip of typing it twice.
 */
export function AccountMenu({
  isLoggedIn,
  open,
  onOpenChange,
  className = '',
}: {
  isLoggedIn: Promise<boolean>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  className?: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const close = () => onOpenChange(false);

  // Same dismissal rules as the search field: Escape from anywhere, and a
  // click that lands outside. Escape puts focus back on the icon, so a
  // keyboard user who opened the panel is not dropped at the top of the page.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      onOpenChange(false);
      triggerRef.current?.focus();
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) onOpenChange(false);
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [open, onOpenChange]);

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => onOpenChange(!open)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label="Account"
        className="grid h-9 w-9 place-items-center rounded-full text-ink transition-colors hover:bg-ink/5"
      >
        <UserIcon className="h-6 w-6 shrink-0" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label="Account"
            initial={{opacity: 0, y: -8}}
            animate={{opacity: 1, y: 0}}
            exit={{opacity: 0, y: -8}}
            transition={{duration: 0.2, ease: EASE_OUT_QUART}}
            className="absolute right-0 top-[calc(100%+0.75rem)] w-[21rem] rounded-card border border-line bg-surface p-5 shadow-card"
          >
            {/* Logged out is the state that has to render instantly: it is
                what a first-time visitor sees, and it is also the honest
                fallback while the session check is still in flight -- it
                offers a way in either way, and resolves to the account links
                a moment later for someone already signed in. */}
            <Suspense fallback={<SignedOut onNavigate={close} onClose={close} />}>
              <Await
                resolve={isLoggedIn}
                errorElement={<SignedOut onNavigate={close} onClose={close} />}
              >
                {(loggedIn) =>
                  loggedIn ? (
                    <SignedIn onNavigate={close} onClose={close} />
                  ) : (
                    <SignedOut onNavigate={close} onClose={close} />
                  )
                }
              </Await>
            </Suspense>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * The two tiles along the bottom. Squared-off rather than pilled, which is
 * the one place this storefront's pill radius gives way -- the panel is a
 * copy of Shopify's own account card, and its controls are 10px boxes.
 */
const tile =
  'flex flex-1 items-center justify-center gap-2 rounded-[10px] border border-line-strong px-4 py-3 text-center text-[14px] font-medium text-ink no-underline transition-colors hover:bg-bg-deep hover:no-underline';

function PanelHeader({onClose}: {onClose: () => void}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <h2 className="type-h6 text-ink">Sign in or create account</h2>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="-mr-1 -mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-[10px] text-ink-muted transition-colors hover:bg-bg-deep hover:text-ink"
      >
        <CloseIcon className="h-5 w-5 shrink-0" />
      </button>
    </div>
  );
}

function SignedOut({
  onNavigate,
  onClose,
}: {
  onNavigate: () => void;
  onClose: () => void;
}) {
  const [email, setEmail] = useState('');

  return (
    <>
      <PanelHeader onClose={onClose} />

      {/* Shopify's button, in Shopify's colour, doing what Shopify's button
          does: it hands off to the Customer Account API's login, whose page
          leads with Shop. The one thing it is not is the in-page Shop popup
          -- that belongs to shop-js, which is a Liquid theme embed with no
          way to return a session to a Hydrogen route. A visitor who taps it
          still signs in with Shop; they do it on Shopify's page.

          A plain link rather than a fetcher: the route answers with a
          redirect off this domain, so a full navigation is what carries them
          there, and it works with no JavaScript. */}
      <Link
        to="/account/login"
        onClick={onNavigate}
        className="mt-4 block rounded-[10px] bg-shop py-3.5 text-center text-[16px] text-white no-underline transition-colors hover:bg-shop-deep hover:no-underline"
      >
        Sign in with <span className="font-bold tracking-[-0.01em]">shop</span>
      </Link>

      <div className="my-4 flex items-center gap-3">
        <span className="h-px flex-1 bg-line" />
        <span className="text-[12px] uppercase tracking-[0.04em] text-ink-soft">
          or
        </span>
        <span className="h-px flex-1 bg-line" />
      </div>

      {/* method="get" on purpose -- this is not a credential, it is the
          address to carry over to Shopify's page, which reads `login_hint`
          to prefill it. The login route already forwards the parameter. */}
      <form method="get" action="/account/login">
        {/* The field and its arrow are their own positioning context. Anchored
            to the form instead, the arrow centres against the checkbox row
            below as well and sits low in the field. */}
        <div className="relative">
          <input
            type="email"
            name="login_hint"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email"
            aria-label="Email"
            autoComplete="email"
            className="m-0 h-14 w-full rounded-[10px] border border-line-strong bg-white px-4 pr-12 text-[16px] text-ink outline-none transition-colors placeholder:text-ink-soft focus:border-ink"
          />
          <button
            type="submit"
            aria-label="Continue with email"
            className="absolute right-1.5 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-[8px] text-ink transition-colors hover:bg-bg-deep"
          >
            <ArrowIcon className="h-5 w-5 shrink-0" />
          </button>
        </div>

        {/* TODO(steven): this consent has nowhere to go yet. Shopify's OAuth
            login takes no marketing-consent parameter, so it cannot ride
            along with `login_hint`, and this storefront has no subscriber
            list of its own -- the footer's newsletter form is unwired for
            the same reason. Wire both to the same place at once (Shopify
            customer marketing consent, or Klaviyo/Mailchimp) rather than
            collecting an opt-in here and discarding it. */}
        <label className="mt-3 flex items-center gap-2.5 text-[14px] text-ink">
          <input
            type="checkbox"
            name="accepts_marketing"
            className="m-0 h-5 w-5 shrink-0 rounded-[4px] border border-line-strong accent-shop"
          />
          Email me with news and offers
        </label>
      </form>

      <div className="mt-5 flex gap-2.5">
        <Link to="/account/orders" onClick={onNavigate} className={tile}>
          <BoxIcon className="h-5 w-5 shrink-0" />
          Orders
        </Link>
        <Link to="/account/profile" onClick={onNavigate} className={tile}>
          <UserCircleIcon className="h-5 w-5 shrink-0" />
          Profile
        </Link>
      </div>
    </>
  );
}

function SignedIn({
  onNavigate,
  onClose,
}: {
  onNavigate: () => void;
  onClose: () => void;
}) {
  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <h2 className="type-h6 text-ink">Your account</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="-mr-1 -mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-[10px] text-ink-muted transition-colors hover:bg-bg-deep hover:text-ink"
        >
          <CloseIcon className="h-5 w-5 shrink-0" />
        </button>
      </div>

      <div className="mt-4 flex flex-col">
        {[
          {to: '/account/orders', label: 'Orders'},
          {to: '/account/profile', label: 'Profile'},
          {to: '/account/addresses', label: 'Addresses'},
        ].map((item) => (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className="-mx-2 rounded-2xl px-2 py-2.5 text-[15px] text-ink no-underline transition-colors hover:bg-bg-deep hover:no-underline"
          >
            {item.label}
          </Link>
        ))}
      </div>

      {/* Signing out is a state change, so it posts. The logout route clears
          the customer session and Shopify's with it. */}
      <Form method="post" action="/account/logout" className="mt-4">
        <button
          type="submit"
          className="w-full rounded-[10px] border border-line-strong py-3 text-[14px] font-medium text-ink transition-colors hover:bg-bg-deep"
        >
          Log out
        </button>
      </Form>
    </>
  );
}
