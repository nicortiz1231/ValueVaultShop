import {Marquee} from '~/components/Marquee';
import {returns} from '~/lib/store-config';

/**
 * The reference site's `running-text` band -- the scrolling strip of claims
 * that sits between the last product row and the footer.
 *
 * Ported values: 18px top / 16px bottom padding, a 20px icon 8px from its
 * label, 24px between items (32px from 1440), and its `h6` type scale.
 *
 * The white space above the band is ours, not the reference's. Its footer is
 * tall enough that the band clears the last product row at the bottom of the
 * scroll; ours is shorter, so without this the row above stays in frame.
 */
export function RunningText() {
  const claims = [
    'Every product earns its spot',
    'Honest prices, no fake markdowns',
    `${returns.windowDays}-day returns, postage on us`,
    'Secure checkout, handled by Shopify',
  ];

  return (
    <section className="bg-surface pt-12 lg:pt-16">
      <div className="bg-block-sky pb-4 pt-[18px]">
        <Marquee gap={24} speed={70}>
          {claims.map((claim) => (
            <span key={claim} className="flex items-center gap-2">
              <SparkIcon className="h-5 w-5 shrink-0 text-ink" />
              <span className="whitespace-nowrap font-display text-[18px] font-medium leading-[1.2] tracking-[0.1px] text-ink min-[600px]:text-[19px] lg:text-[20px] min-[1440px]:text-[22px] min-[1920px]:text-[24px]">
                {claim}
              </span>
            </span>
          ))}
        </Marquee>
      </div>
    </section>
  );
}

/** The four-point sparkle the reference uses as its running-text bullet. */
function SparkIcon({className}: {className?: string}) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 21"
      fill="none"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10 0.5C10 6.023 14.477 10.5 20 10.5C14.477 10.5 10 14.977 10 20.5C10 14.977 5.523 10.5 0 10.5C5.523 10.5 10 6.023 10 0.5Z"
        fill="currentColor"
      />
    </svg>
  );
}
