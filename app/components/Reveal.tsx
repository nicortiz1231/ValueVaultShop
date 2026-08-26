import {createElement, useEffect, useRef, useState} from 'react';

/**
 * Scroll-reveal wrapper.
 *
 * Watches its own intersection with the viewport and flips `data-revealed`
 * once, the first time the element becomes visible. All the actual motion —
 * the translate, the opacity, the easing curve — lives in the `.reveal`
 * utility in tailwind.css so this component stays a pure trigger.
 *
 * Renders already-revealed when JS is unavailable or `prefers-reduced-motion`
 * is set, so content is never permanently hidden.
 */
export function Reveal({
  children,
  as = 'div',
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  as?: 'div' | 'section' | 'li' | 'span' | 'article';
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setRevealed(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      {threshold: 0.15, rootMargin: '0px 0px -8% 0px'},
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return createElement(
    as,
    {
      ref,
      'data-revealed': revealed,
      className: `reveal ${className}`,
      style: {'--reveal-delay': `${delay}ms`} as React.CSSProperties,
    },
    children,
  );
}
