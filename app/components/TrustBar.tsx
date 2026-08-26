import {returns, shipping} from '~/lib/store-config';
import {Container} from './ui/Container';

/**
 * The thin strip above the header.
 *
 * This is the first band of pixels a visitor from TikTok sees, so it carries
 * the three promises that answer "will this actually show up, and can I send it
 * back". Claims are pulled from store-config so they cannot drift from the
 * policy pages.
 */
export function TrustBar() {
  const points = [
    returns.freeReturnShipping
      ? `Free ${returns.windowDays}-day returns — we pay return shipping`
      : `${returns.windowDays}-day returns`,
    shipping.deliveryEstimate
      ? `Delivered in ${shipping.deliveryEstimate}`
      : `Ships in ${shipping.processingTime}`,
    shipping.tracking ? 'Tracking on every order' : null,
  ].filter(Boolean) as string[];

  return (
    <div className="bg-sage text-white">
      <Container>
        <div className="flex h-9 items-center justify-center gap-8 text-[13px] font-medium tracking-tight">
          {points.map((point, i) => (
            <span
              key={point}
              /* Only the first promise survives on narrow phones — three
                 truncated claims read as noise, one clear one reads as a fact. */
              className={i === 0 ? 'block' : 'hidden sm:block'}
            >
              {point}
            </span>
          ))}
        </div>
      </Container>
    </div>
  );
}
