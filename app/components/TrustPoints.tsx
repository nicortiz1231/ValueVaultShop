import {returns, shipping, support} from '~/lib/store-config';
import {ChatIcon, ReturnIcon, ShieldIcon, TruckIcon} from './Icons';
import {Reveal} from './Reveal';
import {Container} from './ui/Container';

type Point = {
  icon: React.ComponentType<{className?: string}>;
  title: string;
  body: string;
};

/**
 * The four-up reassurance row.
 *
 * Every line here is a claim the store can actually keep -- the return window
 * and refund timeframe mirror /policies/refund-policy, and the Shopify
 * checkout line is true of any Hydrogen storefront, since payment is handled
 * entirely by Shopify and card details never touch this app.
 */
function buildPoints(): Point[] {
  return [
    {
      icon: TruckIcon,
      title: shipping.deliveryEstimate
        ? `Delivered in ${shipping.deliveryEstimate}`
        : `Ships in ${shipping.processingTime}`,
      body: shipping.tracking
        ? 'You get a tracking link by email the moment your parcel leaves the warehouse.'
        : 'We send a confirmation email as soon as your order is on its way.',
    },
    {
      icon: ReturnIcon,
      title: `${returns.windowDays}-day returns`,
      body: returns.freeReturnShipping
        ? `Changed your mind? We email you a prepaid label and refund you within ${returns.refundTimeframe}.`
        : `Request a return within ${returns.windowDays} days and we refund you within ${returns.refundTimeframe}.`,
    },
    {
      icon: ShieldIcon,
      title: 'Secure Shopify checkout',
      body: 'Payment is handled end-to-end by Shopify. Your card details are never stored on our servers.',
    },
    {
      icon: ChatIcon,
      title: 'A person answers',
      body: `Email us and you will hear back from a real human ${support.responseTime} — not a bot.`,
    },
  ];
}

export function TrustPoints() {
  const points = buildPoints();

  return (
    <section className="border-b border-line bg-surface/40">
      <Container>
        <ul className="grid grid-cols-1 gap-x-8 gap-y-9 py-12 sm:grid-cols-2 lg:grid-cols-4 lg:py-14">
          {points.map(({icon: Icon, title, body}, i) => (
            <Reveal key={title} as="li" delay={i * 70} className="flex gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-tint text-brand">
                <Icon className="h-[22px] w-[22px]" />
              </span>
              <div>
                <h3 className="text-[15px] font-semibold text-ink">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{body}</p>
              </div>
            </Reveal>
          ))}
        </ul>
      </Container>
    </section>
  );
}
