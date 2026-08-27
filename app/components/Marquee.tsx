import {useCallback, useEffect, useRef, useState} from 'react';

/**
 * Continuously scrolling band.
 *
 * The reference site runs two of these -- the announcement bar above the
 * header and the `running-text` band below the last product row -- both built
 * the same way: identical runs of content laid end to end, each sliding left
 * by its own width plus the gap, so the run behind lands exactly where the one
 * ahead started and the loop never seams. The keyframe lives in tailwind.css
 * as `.animate-marquee`.
 *
 * Two things here are ours rather than the reference's, both because it only
 * ever runs this below 1024px:
 *
 *  - The run count is measured, not fixed at two. Two runs always overflow a
 *    phone; on a wide monitor they can run out mid-screen and leave a gap.
 *  - The duration is derived from the measured run, so the scroll speed is the
 *    same whatever the copy says and whatever the window is doing. The
 *    reference hard-codes a duration, which only reads correctly at its own
 *    content length.
 */
export function Marquee({
  gap,
  speed,
  className = '',
  children,
}: {
  /** Gap between items *and* between runs, in px. */
  gap: number;
  /** Scroll speed in px/sec. */
  speed: number;
  /**
   * Positioning and colour are the caller's -- the announcement bar sticks,
   * the running-text band does not, and hard-coding `relative` here would
   * quietly win against a `sticky` passed in.
   */
  className?: string;
  children: React.ReactNode;
}) {
  const runRef = useRef<HTMLDivElement | null>(null);
  const [runs, setRuns] = useState(2);
  const [duration, setDuration] = useState(20);

  const measure = useCallback(() => {
    const run = runRef.current;
    if (!run) return;
    const cycle = run.getBoundingClientRect().width + gap;
    if (!cycle) return;
    setDuration(cycle / speed);
    // One run beyond what covers the viewport: the last is mid-flight into
    // the gap the first leaves behind.
    setRuns(Math.max(2, Math.ceil(window.innerWidth / cycle) + 1));
  }, [gap, speed]);

  useEffect(() => {
    measure();
    window.addEventListener('resize', measure);
    // Metrics shift once the webfont lands, so re-measure when it does.
    void document.fonts?.ready.then(measure);
    return () => window.removeEventListener('resize', measure);
  }, [measure]);

  return (
    <div className={`overflow-hidden ${className}`}>
      <div className="flex h-full" style={{columnGap: gap}}>
        {Array.from({length: runs}, (_, run) => (
          <div
            key={run}
            ref={run === 0 ? runRef : undefined}
            // Only the first run is real copy; the rest are visual padding and
            // would otherwise be read out once per repeat.
            aria-hidden={run > 0 || undefined}
            style={
              {
                columnGap: gap,
                '--marquee-duration': `${duration}s`,
              } as React.CSSProperties
            }
            // Reduced motion is handled globally: the stylesheet kills
            // .animate-marquee outright under prefers-reduced-motion.
            className="flex w-max shrink-0 animate-marquee items-center"
          >
            {children}
          </div>
        ))}
      </div>
    </div>
  );
}
