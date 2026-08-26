/**
 * Concentric arch motif.
 *
 * The reference site uses a nested rainbow-arch graphic behind its hero and
 * newsletter photography as a recurring signature shape. This is an
 * original SVG built the same way -- concentric half-rings in the brand's
 * own block colours -- rather than any traced or copied artwork.
 */
export function Arch({className = ''}: {className?: string}) {
  return (
    <svg
      viewBox="0 0 400 240"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M0 240a200 200 0 0 1 400 0"
        stroke="var(--color-block-sky-deep)"
        strokeWidth="40"
      />
      <path
        d="M40 240a160 160 0 0 1 320 0"
        stroke="var(--color-block-butter-deep)"
        strokeWidth="40"
      />
      <path
        d="M80 240a120 120 0 0 1 240 0"
        stroke="var(--color-brand)"
        strokeWidth="40"
      />
    </svg>
  );
}
