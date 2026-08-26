import {returns, shipping} from '~/lib/store-config';
import {LightningIcon, ReturnIcon, TruckIcon} from './Icons';

/**
 * The colour-block announcement strip above the header -- the terracotta
 * band doing the same job Kaleido's yellow bar does: one confident claim,
 * always visible, set apart from the rest of the page by its own solid
 * colour rather than blending into a neutral nav.
 *
 * Runs as a slow marquee so the strip reads as a live signal rather than a
 * banner people learn to ignore. Duplicated once in the DOM so the loop is
 * seamless.
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
    shipping.tracking ? {icon: TruckIcon, text: 'Tracked on every order'} : null,
  ].filter(Boolean) as {icon: React.ComponentType<{className?: string}>; text: string}[];

  const loop = [...points, ...points];

  return (
    <div className="relative h-announce overflow-hidden bg-brand text-bg">
      <div
        className="flex h-full w-max animate-marquee items-center gap-10"
        style={{'--marquee-duration': '28s'} as React.CSSProperties}
      >
        {loop.map(({icon: Icon, text}, i) => (
          <span
            // eslint-disable-next-line react/no-array-index-key -- duplicated loop, text alone can repeat
            key={`${text}-${i}`}
            className="flex shrink-0 items-center gap-2 text-[12px] font-bold uppercase tracking-[0.08em]"
          >
            <Icon className="h-3.5 w-3.5" />
            {text}
          </span>
        ))}
      </div>
    </div>
  );
}
