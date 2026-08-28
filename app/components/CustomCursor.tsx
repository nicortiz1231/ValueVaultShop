import {useEffect, useRef, useState} from 'react';

/**
 * The fraction of the remaining gap the dot closes each frame.
 *
 * Per frame, deliberately, rather than per millisecond: the trailing glide
 * is the whole character of this thing, and expressing it per frame is what
 * keeps it feeling the way it does on the display it is actually running on.
 * 0.22 was the original; this is a small nudge up from it and nothing more.
 */
const FOLLOW = 0.26;

/**
 * One frame at 60Hz. Only used to recognise a *stalled* frame -- see [tick].
 */
const FRAME_MS = 1000 / 60;

/** The most catching up one frame may do, so a long stall cannot teleport it. */
const MAX_CATCHUP_FRAMES = 4;

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
  // Mirrors `label` for the pointermove handler, which must not read state.
  const labelRef = useRef<string | null>(null);
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
    let placed = false;
    let raf = 0;
    let last = 0;
    // The label only changes when the pointer crosses into a different
    // element, so the tree walk that finds it is keyed on that rather than
    // run on every move.
    let lastTarget: Element | null = null;

    const write = () => {
      // translate3d, not translate: this element moves every frame, and the
      // 3d form is what keeps it on its own compositor layer instead of
      // repainting with the page underneath it.
      dotRef.current?.style.setProperty(
        'transform',
        `translate3d(${eased.x}px, ${eased.y}px, 0) translate(-50%, -50%)`,
      );
    };

    const tick = (now: number) => {
      const dt = now - last;
      last = now;

      // A normal frame -- 60Hz or 120Hz -- takes exactly one step, which is
      // the original glide unchanged. Only a frame the page actually stalled
      // through takes several, so heavy work elsewhere leaves the dot
      // catching up rather than trailing further and further behind. That
      // drift under load is what made it feel slower than it used to.
      const frames = Math.min(
        Math.max(Math.round(dt / FRAME_MS), 1),
        MAX_CATCHUP_FRAMES,
      );
      const alpha = 1 - (1 - FOLLOW) ** frames;
      eased.x += (pos.x - eased.x) * alpha;
      eased.y += (pos.y - eased.y) * alpha;

      // Within half a pixel there is nothing left to animate: land on the
      // pointer exactly and stop the loop. It restarts on the next move, so
      // an idle cursor costs nothing at all.
      if (Math.abs(pos.x - eased.x) + Math.abs(pos.y - eased.y) < 0.5) {
        eased.x = pos.x;
        eased.y = pos.y;
        write();
        raf = 0;
        return;
      }

      write();
      raf = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      pos.x = e.clientX;
      pos.y = e.clientY;

      // First sighting: put the dot under the pointer rather than letting it
      // fly in from the top-left corner.
      if (!placed) {
        placed = true;
        eased.x = pos.x;
        eased.y = pos.y;
        write();
        setVisible(true);
      }

      const target = e.target as Element | null;
      if (target !== lastTarget) {
        lastTarget = target;
        const holder = target?.closest?.('[data-cursor]');
        const next = holder ? holder.getAttribute('data-cursor') : null;
        // Guarded because setState with an unchanged value still costs a
        // render pass, and this runs on every pointer event.
        if (next !== labelRef.current) {
          labelRef.current = next;
          setLabel(next);
        }
      }

      if (!raf) {
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
    };

    const onLeave = () => {
      placed = false;
      setVisible(false);
    };

    window.addEventListener('pointermove', onMove, {passive: true});
    document.documentElement.addEventListener('mouseleave', onLeave);

    return () => {
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('mouseleave', onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={dotRef}
      aria-hidden="true"
      style={{willChange: 'transform'}}
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
