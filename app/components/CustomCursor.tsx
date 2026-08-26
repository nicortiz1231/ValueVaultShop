import {useEffect, useRef, useState} from 'react';

/**
 * A small circular cursor-follower that expands into a label when hovering
 * an element carrying `data-cursor="..."` -- e.g. `data-cursor="View"` on a
 * product card, `data-cursor="Drag"` on a gallery. This one interaction is
 * doing more to signal "hand-built" than almost anything else on the page.
 *
 * Disabled entirely on coarse (touch) pointers and prefers-reduced-motion,
 * where it would be either meaningless or actively unwanted.
 */
export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState<string | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const shouldEnable = fine && !reduced;
    setEnabled(shouldEnable);
    // Only this class -- not a bare media query -- ever hides the native
    // cursor (see the .has-custom-cursor rule in tailwind.css), so a JS
    // failure can never leave the page with no cursor at all.
    document.documentElement.classList.toggle('has-custom-cursor', shouldEnable);
    return () => document.documentElement.classList.remove('has-custom-cursor');
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const pos = {x: 0, y: 0};
    const eased = {x: 0, y: 0};
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      setVisible(true);

      const target = (e.target as HTMLElement)?.closest?.('[data-cursor]');
      setLabel(target ? target.getAttribute('data-cursor') : null);
    };

    const onLeave = () => setVisible(false);

    const tick = () => {
      eased.x += (pos.x - eased.x) * 0.22;
      eased.y += (pos.y - eased.y) * 0.22;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${eased.x}px, ${eased.y}px) translate(-50%, -50%)`;
      }
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener('pointermove', onMove);
    document.documentElement.addEventListener('mouseleave', onLeave);
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('mouseleave', onLeave);
      cancelAnimationFrame(raf);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={dotRef}
      aria-hidden="true"
      className={[
        'pointer-events-none fixed left-0 top-0 z-[999] flex items-center justify-center',
        'rounded-full bg-ink text-bg transition-[width,height,opacity] duration-200 ease-out',
        visible ? 'opacity-100' : 'opacity-0',
        label ? 'h-16 w-16 text-[11px] font-semibold uppercase tracking-wide' : 'h-3 w-3',
      ].join(' ')}
    >
      {label}
    </div>
  );
}
