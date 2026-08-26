/** Shared page gutter. Keeps every section on the same left/right rhythm. */
export function Container({
  className = '',
  children,
  width = 'default',
}: {
  className?: string;
  children: React.ReactNode;
  width?: 'default' | 'wide' | 'narrow';
}) {
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
