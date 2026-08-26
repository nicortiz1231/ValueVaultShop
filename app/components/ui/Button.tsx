import {useRef} from 'react';
import {Link} from 'react-router';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'md' | 'lg';

const variants: Record<Variant, string> = {
  primary:
    'bg-brand text-bg shadow-card hover:shadow-lift hover:bg-brand-deep disabled:bg-ink-soft disabled:shadow-none',
  secondary:
    'bg-surface border border-line text-ink hover:border-line-strong hover:bg-white/[0.06]',
  ghost: 'bg-transparent text-ink hover:bg-white/[0.06]',
};

const sizes: Record<Size, string> = {
  md: 'h-12 px-6 text-sm',
  lg: 'h-14 px-8 text-base',
};

function classes(variant: Variant, size: Size, full: boolean, extra: string) {
  return [
    'relative inline-flex items-center justify-center gap-2 rounded-pill font-semibold',
    'transition-[background-color,box-shadow,border-color,transform] duration-200',
    'active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60',
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

  const onMouseMove = (e: React.MouseEvent<T>) => {
    const node = ref.current;
    if (!node) return;
    if (window.matchMedia('(pointer: coarse)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const rect = node.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    node.style.transform = `translate(${x * 0.18}px, ${y * 0.35}px)`;
  };

  const onMouseLeave = () => {
    const node = ref.current;
    if (node) node.style.transform = '';
  };

  return {ref, onMouseMove, onMouseLeave};
}

type SharedProps = {
  variant?: Variant;
  size?: Size;
  full?: boolean;
  magnetic?: boolean;
  className?: string;
  children: React.ReactNode;
};

export function Button({
  variant = 'primary',
  size = 'md',
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
        classes(variant, size, full, className),
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
        classes(variant, size, full, className),
        magnetic ? 'transition-transform duration-200 ease-out' : '',
      ].join(' ')}
      {...props}
    >
      {children}
    </Link>
  );
}
