import {useEffect, useRef} from 'react';
import {Link} from 'react-router';

type Variant = 'primary' | 'secondary' | 'ghost' | 'accent';
type Size = 'md' | 'lg';

const variants: Record<Variant, string> = {
  primary:
    'bg-brand text-bg shadow-card hover:shadow-lift hover:bg-brand-deep disabled:bg-ink-soft disabled:shadow-none',
  secondary:
    'bg-surface border border-line text-ink hover:border-line-strong hover:bg-white/[0.06]',
  ghost: 'bg-transparent text-ink hover:bg-white/[0.06]',
  // For a CTA sitting on top of a photo/dark overlay, where the brand
  // terracotta doesn't have enough presence -- e.g. the homepage promo band.
  accent:
    'bg-block-butter-deep text-ink shadow-card hover:shadow-lift hover:bg-block-butter disabled:bg-ink-soft disabled:shadow-none',
};

const sizes: Record<Size, string> = {
  md: 'h-12 px-6 text-sm',
  lg: 'h-14 px-8 text-base',
};

/** Pill everywhere by default; `sharp` is the squared-off promo CTA. */
type Shape = 'pill' | 'sharp';

const shapes: Record<Shape, string> = {
  pill: 'rounded-pill',
  sharp: 'rounded-[4px]',
};

function classes(
  variant: Variant,
  size: Size,
  shape: Shape,
  full: boolean,
  extra: string,
) {
  return [
    'relative inline-flex items-center justify-center gap-2 font-semibold',
    'transition-[background-color,box-shadow,border-color,transform] duration-200',
    'active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60',
    shapes[shape],
    variants[variant],
    sizes[size],
    full ? 'w-full' : '',
    extra,
  ]
    .filter(Boolean)
    .join(' ');
}

/**
 * "Magnetic" pointer tracking — the button nudges toward the cursor within
 * its own bounds. It is a small effect but it is the single cheapest way to
 * make an interface feel hand-built rather than templated. Skipped entirely
 * for touch/coarse pointers and prefers-reduced-motion.
 */
function useMagnetic<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  // Read once on mount instead of on every mouse event. Building a
  // MediaQueryList is not free, and this ran twice per event, on an event
  // that fires as fast as the pointer moves.
  const allowed = useRef(false);
  const frame = useRef(0);
  const point = useRef({x: 0, y: 0});

  useEffect(() => {
    allowed.current =
      !window.matchMedia('(pointer: coarse)').matches &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, []);

  const onMouseMove = (e: React.MouseEvent<T>) => {
    if (!allowed.current || !ref.current) return;
    point.current.x = e.clientX;
    point.current.y = e.clientY;

    // The event can fire several times between two paints, and each pass
    // measured the button and then wrote to it -- a layout read against a
    // style write the browser had not flushed yet. Coalescing to one update
    // per frame leaves at most one measurement per painted frame, which is
    // the most that can ever be seen anyway.
    if (frame.current) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = 0;
      const node = ref.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      const x = point.current.x - rect.left - rect.width / 2;
      const y = point.current.y - rect.top - rect.height / 2;
      node.style.transform = `translate3d(${x * 0.18}px, ${y * 0.35}px, 0)`;
    });
  };

  const onMouseLeave = () => {
    if (frame.current) {
      cancelAnimationFrame(frame.current);
      frame.current = 0;
    }
    const node = ref.current;
    if (node) node.style.transform = '';
  };

  return {ref, onMouseMove, onMouseLeave};
}

type SharedProps = {
  variant?: Variant;
  size?: Size;
  shape?: Shape;
  full?: boolean;
  magnetic?: boolean;
  className?: string;
  children: React.ReactNode;
};

export function Button({
  variant = 'primary',
  size = 'md',
  shape = 'pill',
  full = false,
  magnetic = false,
  className = '',
  children,
  ...props
}: SharedProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const {ref, onMouseMove, onMouseLeave} = useMagnetic<HTMLButtonElement>();

  return (
    <button
      ref={magnetic ? ref : undefined}
      onMouseMove={magnetic ? onMouseMove : undefined}
      onMouseLeave={magnetic ? onMouseLeave : undefined}
      className={[
        classes(variant, size, shape, full, className),
        magnetic ? 'transition-transform duration-200 ease-out' : '',
      ].join(' ')}
      {...props}
    >
      {children}
    </button>
  );
}

export function ButtonLink({
  to,
  variant = 'primary',
  size = 'md',
  shape = 'pill',
  full = false,
  magnetic = false,
  className = '',
  children,
  ...props
}: SharedProps &
  {to: string} & Omit<React.ComponentProps<typeof Link>, 'to' | 'className'>) {
  const {ref, onMouseMove, onMouseLeave} = useMagnetic<HTMLAnchorElement>();

  return (
    <Link
      ref={magnetic ? ref : undefined}
      onMouseMove={magnetic ? onMouseMove : undefined}
      onMouseLeave={magnetic ? onMouseLeave : undefined}
      to={to}
      className={[
        classes(variant, size, shape, full, className),
        magnetic ? 'transition-transform duration-200 ease-out' : '',
      ].join(' ')}
      {...props}
    >
      {children}
    </Link>
  );
}
