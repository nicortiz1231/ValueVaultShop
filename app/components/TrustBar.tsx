import {useEffect, useState} from 'react';
import {returns, shipping} from '~/lib/store-config';

/**
 * The rotating announcement strip above the header.
 *
 * The reference site runs a single centred message that swaps every few
 * seconds rather than a continuous marquee -- this matches that pattern
 * exactly, crossfading between real claims instead of scrolling them.
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

  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % messages.length);
    }, 4200);
    return () => clearInterval(id);
    // messages is a fresh array each render; length is stable, so this is safe.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative flex h-announce items-center justify-center overflow-hidden bg-block-clay px-4 text-center">
      {messages.map((message, i) => (
        <span
          key={message}
          aria-hidden={i !== index}
          className={`absolute text-[12px] font-medium tracking-tight text-ink transition-opacity duration-500 ${
            i === index ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {message}
        </span>
      ))}
    </div>
  );
}
