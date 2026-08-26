import {Reveal} from '~/components/Reveal';
import {Container} from './Container';

/**
 * A titled homepage section, with its heading wired into the scroll-reveal
 * system so sections animate in as the shopper scrolls rather than all
 * existing statically on load.
 */
export function Section({
  eyebrow,
  title,
  intro,
  action,
  children,
  className = '',
  id,
}: {
  eyebrow?: string;
  title?: string;
  intro?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={`py-20 sm:py-28 ${className}`}>
      <Container>
        {(title || action) && (
          <Reveal
            as="div"
            className="mb-10 flex flex-wrap items-end justify-between gap-6 sm:mb-14"
          >
            <div className="max-w-xl">
              {eyebrow && (
                <span className="mb-3 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-lime">
                  {eyebrow}
                </span>
              )}
              {title && (
                <h2 className="display text-3xl text-chalk sm:text-4xl lg:text-[2.75rem]">
                  {title}
                </h2>
              )}
              {intro && (
                <p className="mt-3.5 text-base leading-relaxed text-ash">
                  {intro}
                </p>
              )}
            </div>
            {action}
          </Reveal>
        )}
        {children}
      </Container>
    </section>
  );
}
