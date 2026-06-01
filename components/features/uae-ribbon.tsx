// Decorative SVG ribbon in the UAE flag colors (red, green, off-white,
// black). Four parallel stroked cubic-bezier waves layered vertically.
// Server component, presentation-only, hidden from assistive tech.

export function UaeRibbon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1200 70"
      role="presentation"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M 0 15 C 200 5, 400 25, 600 15 S 1000 5, 1200 15"
        stroke="#CE1126"
        strokeWidth="8"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M 0 27 C 200 17, 400 37, 600 27 S 1000 17, 1200 27"
        stroke="#009739"
        strokeWidth="8"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M 0 39 C 200 29, 400 49, 600 39 S 1000 29, 1200 39"
        stroke="#e4e4e7"
        strokeWidth="8"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M 0 51 C 200 41, 400 61, 600 51 S 1000 41, 1200 51"
        stroke="#000000"
        strokeWidth="8"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
