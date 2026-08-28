import {useState, type FormEvent} from 'react';
import {support} from '~/lib/store-config';

/**
 * How many characters a tracking number has to reach before the button reads
 * as ready -- black on white rather than muted.
 *
 * A floor, not an exact length: carrier formats run from about 10 to 35
 * characters and nothing in this storefront knows which carrier a given order
 * shipped with, so anything stricter would refuse numbers that are perfectly
 * valid. Below it the button still submits; it just does not claim the number
 * looks finished.
 */
const TRACKING_READY_LENGTH = 8;

/**
 * The tracking form that "Order Look Up" drops from the header, and the same
 * form flattened into the mobile menu.
 *
 * It does exactly what the /apps/trackingmore page's form does, because that
 * is all the storefront can honestly do: the live site tracks through a
 * TrackingMore Shopify app proxy, Hydrogen has no proxy routes, and nothing
 * here is wired to a carrier. So a submission does not return a shipment
 * status -- it points at the tracking link in the shipping confirmation
 * email and offers support with the number filled in. Keep the two in step;
 * if a real lookup is ever wired up, both should call it.
 *
 * Deliberately just a field and a button. The nav item already says what this
 * is, and the full page is one click away on the item itself, so a heading
 * and a link back to it were repeating what the header had already said.
 */
export function OrderTrackForm({
  idPrefix,
  onNavigate,
}: {
  /** Ids must be unique per instance -- the panel and the mobile menu can both be mounted. */
  idPrefix: string;
  /** Called when the support link is followed, so the menu can close. */
  onNavigate?: () => void;
}) {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  const inputId = `${idPrefix}-tracking-number`;
  const entered = trackingNumber.trim();
  const ready = entered.length >= TRACKING_READY_LENGTH;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!trackingNumber.trim()) return;
    setShowHelp(true);
  }

  return (
    <div>
      <form onSubmit={handleSubmit} noValidate className="flex gap-1.5">
        {/* No visible label -- the placeholder carries it, and the nav item
            above already names the panel. The field still needs an accessible
            name, so it takes one directly. */}
        <input
          id={inputId}
          name="trackingNumber"
          type="text"
          autoComplete="off"
          aria-label="Tracking number"
          value={trackingNumber}
          onChange={(event) => {
            setTrackingNumber(event.target.value);
            // A new number invalidates the answer shown for the old one.
            setShowHelp(false);
          }}
          placeholder="Tracking number"
          // 16px below `lg`, 13px from there up. Not a size preference: iOS
          // Safari zooms the whole page in when a field smaller than 16px
          // takes focus, and it does not zoom back out afterwards -- the
          // shopper is left on a magnified page they now have to pan
          // sideways. This form renders twice, in the desktop dropdown and
          // again inside the mobile menu drawer, and `lg` is exactly where
          // the drawer hands over, so the desktop instance keeps its 13px.
          className="my-0 h-9 min-w-0 flex-1 rounded-pill border border-line-strong bg-white px-3.5 text-[16px] text-ink outline-none transition-colors placeholder:text-ink-soft focus:border-ink lg:text-[13px]"
        />

        {/* Matches the field exactly -- same 36px height, same pill radius --
            so the two read as one control. It fills in black once the number
            is long enough to look complete, but stays clickable before then:
            the length is a hint about carrier formats, not a rule this
            storefront is in any position to enforce. */}
        <button
          type="submit"
          disabled={!entered}
          className={[
            'h-9 shrink-0 rounded-pill px-3.5 text-[11px] font-semibold uppercase tracking-[0.08em] transition-colors duration-200 disabled:cursor-not-allowed',
            ready
              ? 'bg-black text-white hover:bg-ink'
              : 'bg-bg-deep text-ink-soft',
          ].join(' ')}
        >
          Track
        </button>
      </form>

      {/* aria-live so a keyboard or screen-reader user hears the answer land;
          the panel stays open and focus stays in the field. */}
      <div aria-live="polite">
        {showHelp && (
          <p className="mt-3 text-[12px] leading-5 text-ink-muted">
            Open the tracking link in your shipping confirmation email for{' '}
            <strong className="font-medium text-ink">{trackingNumber}</strong>,
            or{' '}
            <a
              href={`mailto:${support.email}?subject=${encodeURIComponent(
                `Tracking help - ${trackingNumber}`,
              )}`}
              onClick={onNavigate}
              className="text-ink underline underline-offset-4"
            >
              ask support
            </a>
            .
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * The desktop panel wrapper -- the reference's `simple-dropdown`, which is
 * what `.nav-dropdown` ports. Hangs from the left edge of its own nav item,
 * so it reads as belonging to "Order Look Up" rather than to whichever item
 * happens to sit to its left. The nav is centred and this is its last item,
 * so even at 1024 a 300px panel has room to the right.
 */
export function OrderLookupPanel({
  open,
  onEnter,
  onLeave,
  onFocusChange,
  onNavigate,
}: {
  open: boolean;
  onEnter: () => void;
  onLeave: () => void;
  /** Held open while the form has focus, so it cannot close mid-typing. */
  onFocusChange: (held: boolean) => void;
  onNavigate?: () => void;
}) {
  return (
    <div
      data-open={open ? 'true' : 'false'}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onFocusCapture={() => onFocusChange(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          onFocusChange(false);
        }
      }}
      className="nav-dropdown w-[262px] shadow-card"
    >
      <div className="p-2.5">
        <OrderTrackForm idPrefix="nav" onNavigate={onNavigate} />
      </div>
    </div>
  );
}
