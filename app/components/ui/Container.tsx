/** Shared page gutter. Keeps every section on the same left/right rhythm. */
export function Container({
  className = '',
  children,
  width = 'default',
}: {
  className?: string;
  children: React.ReactNode;
  width?: 'default' | 'wide' | 'narrow' | 'full';
}) {
  // `full` is the reference site's own container: max-width 1920 with a gutter
  // that steps 16 -> 20 -> 32 -> 40 at its breakpoints (600/1024/1440). Browse
  // grids use it so four cards fill the screen the way they do on the
  // reference, rather than sitting in a narrow centred column.
  if (width === 'full') {
    return (
      <div
        className={`mx-auto w-full max-w-[1920px] px-4 min-[600px]:px-5 min-[1024px]:px-8 min-[1440px]:px-10 ${className}`}
      >
        {children}
      </div>
    );
  }

  const max = {
    narrow: 'max-w-3xl',
    default: 'max-w-[1240px]',
    wide: 'max-w-[1440px]',
  }[width];

  return (
    <div className={`mx-auto w-full ${max} px-5 sm:px-8 ${className}`}>
      {children}
    </div>
  );
}
