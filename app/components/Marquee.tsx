import {useCallback, useEffect, useLayoutEffect, useRef, useState} from 'react';

/**
 * Continuously scrolling band.
 *
 * The reference site runs two of these -- the announcement bar above the
 * header and the `running-text` band below the last product row -- both built
 * the same way: identical runs of content laid end to end, sliding left until
 * the run behind lands exactly where the one ahead started. The keyframe lives
 * in tailwind.css as `.animate-marquee`.
 *
 * The loop is closed structurally rather than by arithmetic. The track holds
 * exactly two identical halves and travels `-50%` of its own width, so the
 * second half arrives at the first half's start position by construction --
 * there is no measured pixel value in the transform that can disagree with the
 * layout, at any gap, font, zoom level or subpixel width. Every run carries its
 * gap as a trailing margin (including the last), so the spacing across the
 * halfway seam is the same as the spacing everywhere else and the two halves
 * really are the same width.
 *
 * That replaces an earlier version that shifted by one measured run plus the
 * gap. Its arithmetic was short by exactly one gap -- the final run has no gap
 * after it, so the content ended one gap earlier than the run count assumed --
 * and any measurement taken before the webfont settled, or gone stale after a
 * resize the listener missed, widened that sliver into an empty stretch of bar
 * at the end of every cycle. Nothing here can drift that way: a stale
 * measurement now costs a slightly wrong scroll *speed*, never a hole.
 *
 * Two more things are ours rather than the reference's, both because it only
 * ever runs this below 1024px:
 *
 *  - The run count is measured, not fixed at two. Two runs always overflow a
 *    phone; on a wide monitor they can run out mid-screen and leave a gap. Each
 *    half is padded with as many runs as the band is wide.
 *  - The duration is derived from the measured run, so the scroll speed is the
 *    same whatever the copy says and whatever the window is doing. The
 *    reference hard-codes a duration, which only reads correctly at its own
 *    content length.
 *
 * One animation drives the whole track, not one per run. Animating each run
 * separately is what the reference does and it looked fine there, but here the
 * run count changes after mount -- runs added by a re-measure start their
 * animation from zero while the originals are mid-cycle, and runs that are out
 * of phase slide over each other and the copy bunches up for a frame. With a
 * single animated element there is nothing to fall out of phase with.
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
  const bandRef = useRef<HTMLDivElement | null>(null);
  const runRef = useRef<HTMLDivElement | null>(null);
  /** Runs per half. Each is one copy of `children`, gap included. */
  const [runs, setRuns] = useState(1);
  /** Seconds for the track to travel one half. 0 until measured. */
  const [duration, setDuration] = useState(0);

  const measure = useCallback(() => {
    const band = bandRef.current;
    const run = runRef.current;
    if (!band || !run) return;
    // The run's own margin is not in its box, so add it back: this is the
    // pitch from one run to the next.
    const pitch = run.getBoundingClientRect().width + gap;
    const width = band.clientWidth;
    if (!pitch || !width) return;
    // A half has to stay wider than the band, or the tail of the second half
    // clears the right edge before the first half wraps around behind it. The
    // half measures `runs * pitch`, of which the last gap is trailing air, so
    // it covers `runs * pitch - gap`.
    const perHalf = Math.max(1, Math.ceil((width + gap) / pitch));
    setRuns(perHalf);
    setDuration((perHalf * pitch) / speed);
  }, [gap, speed]);

  // Measure before the browser paints, so the first frame is already the final
  // run count rather than the one run the server rendered.
  useIsomorphicLayoutEffect(() => {
    measure();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', measure);
      return () => window.removeEventListener('resize', measure);
    }
    // Watching both boxes covers every way this can change size, including the
    // ones a resize listener misses: the band when the window or its column
    // changes, the run when the webfont lands and the metrics shift under it.
    const observer = new ResizeObserver(measure);
    observer.observe(bandRef.current!);
    observer.observe(runRef.current!);
    return () => observer.disconnect();
  }, [measure]);

  return (
    <div ref={bandRef} className={`overflow-hidden ${className}`}>
      <div
        // Remount when the measurement changes so the new duration starts a
        // clean cycle from the top, rather than the browser re-projecting the
        // elapsed time onto it and jumping the track mid-flight.
        key={`${runs}:${duration}`}
        style={{'--marquee-duration': `${duration}s`} as React.CSSProperties}
        // Nothing to animate until the run has been measured.
        // Reduced motion is handled globally: the stylesheet kills
        // .animate-marquee outright under prefers-reduced-motion.
        className={`flex h-full w-max ${duration ? 'animate-marquee' : ''}`}
      >
        {[0, 1].map((half) => (
          <div
            key={half}
            // Only the first copy of the first run is real; everything after it
            // is visual padding that would otherwise be read out once per
            // repeat.
            aria-hidden={half > 0 || undefined}
            className="flex w-max shrink-0"
          >
            {Array.from({length: runs}, (_, run) => (
              <div
                key={run}
                ref={half === 0 && run === 0 ? runRef : undefined}
                aria-hidden={run > 0 || undefined}
                // The gap rides on the run as a trailing margin rather than as
                // the track's column-gap, so the last run in a half carries one
                // too. Without it the halves are different widths and `-50%`
                // stops landing on the seam.
                style={{columnGap: gap, marginRight: gap}}
                className="flex w-max shrink-0 items-center"
              >
                {children}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * `useLayoutEffect`, minus the warning React logs for it during SSR. The
 * measurement it guards can only run in a browser, so on the server this is a
 * no-op either way.
 */
const useIsomorphicLayoutEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect;
