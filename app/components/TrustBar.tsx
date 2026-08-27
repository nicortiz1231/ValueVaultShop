import {Marquee} from '~/components/Marquee';
import {returns, shipping} from '~/lib/store-config';

/**
 * The announcement marquee above the header.
 *
 * A port of the reference site's own announcement bar -- 28px between
 * messages (its `colgap-28`), 25px tall, 30px from 1024 up, Geist 12px.
 *
 * The reference only scrolls this below 1024px and switches to a
 * one-at-a-time carousel on desktop; here it is the marquee at every width,
 * and it stays pinned above the header on scroll rather than leaving with the
 * page. The header sticks to this bar's height, not to 0 -- see Header.
 * 70px/sec is its effective speed: its three messages total ~700px and it
 * hard-codes a 10s cycle.
 */
export function TrustBar() {
  const messages = [
    returns.freeReturnShipping
      ? `Free ${returns.windowDays}-day returns — we pay the postage`
      : `${returns.windowDays}-day returns`,
    shipping.deliveryEstimate
      ? `Delivered in ${shipping.deliveryEstimate}`
      : `Ships in ${shipping.processingTime}`,
    'Secure checkout, handled entirely by Shopify',
  ];

  return (
    <Marquee
      gap={28}
      speed={70}
      className="sticky top-0 z-40 h-[25px] bg-ink lg:h-announce"
    >
      {messages.map((message) => (
        <span
          key={message}
          className="whitespace-nowrap text-[12px] font-normal leading-[1.5] text-white min-[1920px]:text-[13px]"
        >
          {message}
        </span>
      ))}
    </Marquee>
  );
}
