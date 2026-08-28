/**
 * Inline SVG icons.
 *
 * Deliberately hand-rolled rather than pulled from an icon package: the
 * storefront needs perhaps a dozen glyphs, and shipping a whole icon library to
 * every visitor on a mobile connection is a real cost on a store whose traffic
 * arrives from social.
 *
 * All icons inherit `currentColor` and size from `className`.
 */

type IconProps = {className?: string};

const base = 'h-5 w-5 shrink-0';

function Svg({
  className,
  children,
  filled = false,
}: IconProps & {children: React.ReactNode; filled?: boolean}) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke={filled ? 'none' : 'currentColor'}
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ?? base}
    >
      {children}
    </svg>
  );
}

export function TruckIcon({className}: IconProps) {
  return (
    <Svg className={className}>
      <path d="M3 7a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v9H3z" />
      <path d="M14 10h3.6a1 1 0 0 1 .8.4L21 14v2h-7z" />
      <circle cx="7" cy="17.5" r="1.8" />
      <circle cx="17.5" cy="17.5" r="1.8" />
    </Svg>
  );
}

export function ReturnIcon({className}: IconProps) {
  return (
    <Svg className={className}>
      <path d="M3 12a9 9 0 1 0 2.6-6.4" />
      <path d="M3 4v5h5" />
    </Svg>
  );
}

export function ShieldIcon({className}: IconProps) {
  return (
    <Svg className={className}>
      <path d="M12 3l7 3v5.5c0 4.3-2.9 7.9-7 9.5-4.1-1.6-7-5.2-7-9.5V6z" />
      <path d="M9.2 12.2l2 2 3.6-3.9" />
    </Svg>
  );
}

export function ChatIcon({className}: IconProps) {
  return (
    <Svg className={className}>
      <path d="M20 15a2 2 0 0 1-2 2H8l-4 3V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2z" />
    </Svg>
  );
}

export function SearchIcon({className}: IconProps) {
  return (
    <Svg className={className}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l4 4" />
    </Svg>
  );
}

export function CartIcon({className}: IconProps) {
  return (
    <Svg className={className}>
      <path d="M4 5h2l1.6 9.4a1.5 1.5 0 0 0 1.5 1.2h7.6a1.5 1.5 0 0 0 1.5-1.2L20 8H6.4" />
      <circle cx="9.5" cy="19" r="1.4" />
      <circle cx="17" cy="19" r="1.4" />
    </Svg>
  );
}

export function UserIcon({className}: IconProps) {
  return (
    <Svg className={className}>
      <circle cx="12" cy="8.5" r="3.5" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </Svg>
  );
}

/** The parcel on the account panel's "Orders" tile. */
export function BoxIcon({className}: IconProps) {
  return (
    <Svg className={className}>
      <path d="M4 8.5 12 5l8 3.5v7L12 19l-8-3.5z" />
      <path d="M4 8.5 12 12l8-3.5" />
      <path d="M12 12v7" />
    </Svg>
  );
}

/** The circled figure on the account panel's "Profile" tile. */
export function UserCircleIcon({className}: IconProps) {
  return (
    <Svg className={className}>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="10" r="2.6" />
      <path d="M6.8 18.2a5.6 5.6 0 0 1 10.4 0" />
    </Svg>
  );
}

export function MenuIcon({className}: IconProps) {
  return (
    <Svg className={className}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </Svg>
  );
}

export function CloseIcon({className}: IconProps) {
  return (
    <Svg className={className}>
      <path d="M6 6l12 12M18 6L6 18" />
    </Svg>
  );
}

export function ChevronIcon({className}: IconProps) {
  return (
    <Svg className={className}>
      <path d="M6 9l6 6 6-6" />
    </Svg>
  );
}

export function ArrowIcon({className}: IconProps) {
  return (
    <Svg className={className}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </Svg>
  );
}

/** The reference's diagonal banner arrow -- corner bracket plus stroke. */
export function ArrowUpRightIcon({className}: IconProps) {
  return (
    <Svg className={className}>
      <path d="M7.5 7h9.5v9.5M17 7L7 17" />
    </Svg>
  );
}

export function CheckIcon({className}: IconProps) {
  return (
    <Svg className={className}>
      <path d="M4.5 12.5l5 5 10-11" />
    </Svg>
  );
}

export function StarIcon({className, filled}: IconProps & {filled?: boolean}) {
  return (
    <Svg className={className} filled={filled}>
      <path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.5 9.7l5.9-.9z" />
    </Svg>
  );
}

export function LightningIcon({className}: IconProps) {
  return (
    <Svg className={className} filled>
      <path d="M13 2 4 13.5h6L10 22l9-11.5h-6z" />
    </Svg>
  );
}

export function SparkleIcon({className}: IconProps) {
  return (
    <Svg className={className} filled>
      <path d="M12 2l1.8 5.9L19.5 10l-5.7 2.1L12 18l-1.8-5.9L4.5 10l5.7-2.1z" />
    </Svg>
  );
}

export function LeafIcon({className}: IconProps) {
  return (
    <Svg className={className}>
      <path d="M20 4C10 4 4 9 4 16v4" />
      <path d="M20 4c0 9-5 13-12 13H4" />
    </Svg>
  );
}

export function FilterIcon({className}: IconProps) {
  return (
    <Svg className={className}>
      <path d="M4 7h16M7 12h10M10 17h4" />
    </Svg>
  );
}

export function PlusIcon({className}: IconProps) {
  return (
    <Svg className={className}>
      <path d="M12 5v14M5 12h14" />
    </Svg>
  );
}

export function MinusIcon({className}: IconProps) {
  return (
    <Svg className={className}>
      <path d="M5 12h14" />
    </Svg>
  );
}
