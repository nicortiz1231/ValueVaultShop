import {returns, shipping} from '~/lib/store-config';
import {LightningIcon, ReturnIcon, TruckIcon} from './Icons';

/**
 * Continuous marquee ticker above the header.
 *
 * A static trust strip reads as a banner people learn to ignore; a slow,
 * looping ticker reads as a live signal and holds attention for the half a
 * second it takes to register the claim. The list is duplicated once in the
 * DOM so the loop point is invisible.
 */
export function TrustBar() {
  const points = [
    {
      icon: ReturnIcon,
      text: returns.freeReturnShipping
        ? `Free ${returns.windowDays}-day returns`
        : `${returns.windowDays}-day returns`,
    },
    {
      icon: TruckIcon,
      text: shipping.deliveryEstimate
        ? `Delivered in ${shipping.deliveryEstimate}`
        : `Ships in ${shipping.processingTime}`,
    },
    {icon: LightningIcon, text: 'Secure checkout via Shopify'},
    shipping.tracking
      ? {icon: TruckIcon, text: 'Tracked on every order'}
      : null,
  ].filter(Boolean) as {icon: React.ComponentType<{className?: string}>; text: string}[];

  const loop = [...points, ...points];

  return (
    <div className="relative overflow-hidden border-b border-line bg-surface py-2">
      <div
        className="flex w-max animate-marquee gap-10"
        style={{'--marquee-duration': '32s'} as React.CSSProperties}
      >
        {loop.map(({icon: Icon, text}, i) => (
          <span
            // eslint-disable-next-line react/no-array-index-key -- duplicated loop, text alone can repeat
            key={`${text}-${i}`}
            className="flex shrink-0 items-center gap-2 text-[13px] font-semibold tracking-tight text-ash"
          >
            <Icon className="h-3.5 w-3.5 text-lime" />
            {text}
          </span>
        ))}
      </div>
      {/* Edge fades so the ticker doesn't hard-cut at the viewport edge */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-surface to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-surface to-transparent" />
    </div>
  );
}
