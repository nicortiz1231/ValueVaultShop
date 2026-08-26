import {Link} from 'react-router';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'md' | 'lg';

const variants: Record<Variant, string> = {
  primary:
    'bg-sage text-white hover:bg-sage-deep active:bg-sage-deep disabled:bg-ink-subtle',
  secondary:
    'bg-paper text-ink border border-line-strong hover:border-ink-muted hover:bg-cream-deep',
  ghost: 'bg-transparent text-ink hover:bg-cream-deep',
};

const sizes: Record<Size, string> = {
  md: 'h-11 px-5 text-sm',
  lg: 'h-13 px-7 text-base',
};

function classes(variant: Variant, size: Size, full: boolean, extra: string) {
  return [
    'inline-flex items-center justify-center gap-2 rounded-pill font-semibold',
    'transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-60',
    variants[variant],
    sizes[size],
    full ? 'w-full' : '',
    extra,
  ]
    .filter(Boolean)
    .join(' ');
}

type SharedProps = {
  variant?: Variant;
  size?: Size;
  full?: boolean;
  className?: string;
  children: React.ReactNode;
};

export function Button({
  variant = 'primary',
  size = 'md',
  full = false,
  className = '',
  children,
  ...props
}: SharedProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={classes(variant, size, full, className)} {...props}>
      {children}
    </button>
  );
}

export function ButtonLink({
  to,
  variant = 'primary',
  size = 'md',
  full = false,
  className = '',
  children,
  ...props
}: SharedProps &
  {to: string} & Omit<React.ComponentProps<typeof Link>, 'to' | 'className'>) {
  return (
    <Link to={to} className={classes(variant, size, full, className)} {...props}>
      {children}
    </Link>
  );
}
