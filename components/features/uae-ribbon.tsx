// Decorative SVG ribbon in the UAE flag colors (red, green, off-white,
// black). Four parallel stroked cubic-bezier waves layered vertically.
// Server component, presentation-only, hidden from assistive tech.
// Designed to be positioned as an absolute overlay across the cards row;
// caller is responsible for pointer-events: none so clicks pass through.

export function UaeRibbon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1200 100"
      role="presentation"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M 0 30 C 200 20, 400 40, 600 30 S 1000 20, 1200 30"
        stroke="#CE1126"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M 0 45 C 200 35, 400 55, 600 45 S 1000 35, 1200 45"
        stroke="#009739"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M 0 60 C 200 50, 400 70, 600 60 S 1000 50, 1200 60"
        stroke="#FFFFFF"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M 0 75 C 200 65, 400 85, 600 75 S 1000 65, 1200 75"
        stroke="#000000"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
