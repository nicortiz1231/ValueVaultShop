import {faqs} from '~/lib/store-config';
import {ChevronIcon} from './Icons';
import {Reveal} from './Reveal';

/**
 * Homepage FAQ.
 *
 * Built on native <details>/<summary> so it works with zero JavaScript, stays
 * keyboard accessible for free, and remains expandable to search engines --
 * which matters because these questions are exactly what people search before
 * buying from a store they have not heard of.
 */
export function Faq() {
  return (
    <div className="mx-auto max-w-3xl divide-y divide-line overflow-hidden rounded-card border border-line bg-surface/60">
      {faqs.map((faq, i) => (
        <Reveal key={faq.question} as="div" delay={i * 60}>
          <details className="group">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-5 text-[15px] font-semibold text-ink transition-colors hover:bg-white/[0.03] sm:px-6">
              {faq.question}
              <ChevronIcon className="h-5 w-5 shrink-0 text-brand transition-transform duration-200 group-open:-rotate-180" />
            </summary>
            <p className="px-5 pb-5 text-[15px] leading-relaxed text-ink-muted sm:px-6">
              {faq.answer}
            </p>
          </details>
        </Reveal>
      ))}
    </div>
  );
}
