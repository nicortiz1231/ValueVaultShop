import {Container} from './Container';

/**
 * A titled homepage section. Centralising the heading rhythm here is what keeps
 * the page feeling composed rather than like a stack of unrelated widgets.
 */
export function Section({
  title,
  intro,
  action,
  children,
  className = '',
  id,
}: {
  title?: string;
  intro?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={`py-14 sm:py-20 ${className}`}>
      <Container>
        {(title || action) && (
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4 sm:mb-11">
            <div className="max-w-xl">
              {title && (
                <h2 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                  {title}
                </h2>
              )}
              {intro && (
                <p className="mt-2.5 text-base leading-relaxed text-ink-muted">
                  {intro}
                </p>
              )}
            </div>
            {action}
          </div>
        )}
        {children}
      </Container>
    </section>
  );
}
