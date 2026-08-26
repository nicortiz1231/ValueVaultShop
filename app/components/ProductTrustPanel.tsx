import {returns, shipping, support} from '~/lib/store-config';
import {ChatIcon, ReturnIcon, ShieldIcon, TruckIcon} from './Icons';

/**
 * The reassurance block that sits directly under Add to Cart.
 *
 * Placement is the point: these are the objections a shopper raises in the
 * half-second before they commit, so they are answered where the decision
 * happens rather than three scrolls down in the footer.
 */
export function ProductTrustPanel() {
  const rows = [
    {
      icon: TruckIcon,
      text: shipping.deliveryEstimate
        ? `Delivered in ${shipping.deliveryEstimate}, tracked the whole way`
        : `Ships in ${shipping.processingTime}${
            shipping.tracking ? ', with tracking emailed to you' : ''
          }`,
    },
    {
      icon: ReturnIcon,
      text: returns.freeReturnShipping
        ? `${returns.windowDays}-day returns — we pay the return postage`
        : `${returns.windowDays}-day returns`,
    },
    {
      icon: ShieldIcon,
      text: 'Checkout secured by Shopify — we never see your card details',
    },
    {
      icon: ChatIcon,
      text: `Questions? Email us and a person replies ${support.responseTime}`,
    },
  ];

  return (
    <ul className="mt-6 divide-y divide-line overflow-hidden rounded-card border border-line bg-surface">
      {rows.map(({icon: Icon, text}) => (
        <li
          key={text}
          className="flex items-center gap-3 px-4 py-3 text-sm text-ink-muted"
        >
          <Icon className="h-[18px] w-[18px] shrink-0 text-brand" />
          <span>{text}</span>
        </li>
      ))}
    </ul>
  );
}
