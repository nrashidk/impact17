// Interactive 17-segment SDG wheel hero. Inline SVG, mathematically built.
// Server component — interactivity is pure CSS (hover/focus + media queries),
// so it renders without a client boundary. SDG data (number/slug/name/color)
// is passed in by the caller; this component owns no SDG list of its own.

import type { CSSProperties } from "react";

export type WheelSdg = {
  number: number;
  slug: string;
  name: string;
  color: string;
};

const SIZE = 400;
const CENTER = SIZE / 2;
const OUTER_R = 180;
const INNER_R = 118; // ring thickness ≈ 34% of the outer radius
const NUMBER_R = 158; // number sits in the outer half of the ring
const NAME_R = 130; // name sits in the inner half of the ring
const SLIDE = 8; // user units the hovered/focused segment moves outward

function polar(r: number, angleDeg: number): [number, number] {
  const a = (angleDeg * Math.PI) / 180;
  return [CENTER + r * Math.cos(a), CENTER + r * Math.sin(a)];
}

// Donut-segment outline: outer arc (clockwise) → inner arc (back).
function segmentPath(startDeg: number, endDeg: number): string {
  const [ox1, oy1] = polar(OUTER_R, startDeg);
  const [ox2, oy2] = polar(OUTER_R, endDeg);
  const [ix2, iy2] = polar(INNER_R, endDeg);
  const [ix1, iy1] = polar(INNER_R, startDeg);
  return [
    `M ${ox1.toFixed(2)} ${oy1.toFixed(2)}`,
    `A ${OUTER_R} ${OUTER_R} 0 0 1 ${ox2.toFixed(2)} ${oy2.toFixed(2)}`,
    `L ${ix2.toFixed(2)} ${iy2.toFixed(2)}`,
    `A ${INNER_R} ${INNER_R} 0 0 0 ${ix1.toFixed(2)} ${iy1.toFixed(2)}`,
    "Z",
  ].join(" ");
}

// Tangential label orientation, flipped where it would otherwise read upside-down.
function labelRotation(midDeg: number): number {
  let rot = midDeg + 90;
  const norm = ((rot % 360) + 360) % 360;
  if (norm > 90 && norm < 270) rot += 180;
  return rot;
}

export function SdgWheel({
  sdgs,
  locale,
  title,
}: {
  sdgs: WheelSdg[];
  locale: string;
  title: string;
}) {
  const ordered = [...sdgs].sort((a, b) => a.number - b.number);
  const count = ordered.length;
  const step = count > 0 ? 360 / count : 0;
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <div className="w-full">
      <style>{`
        .sdg-wheel-seg {
          transition: transform 150ms ease-out, filter 150ms ease-out;
          pointer-events: none;
          outline: none;
        }
        @media (hover: hover) and (pointer: fine) {
          .sdg-wheel-seg { pointer-events: auto; cursor: pointer; }
          .sdg-wheel-seg:hover,
          .sdg-wheel-seg:focus-visible {
            transform: translate(var(--tx, 0), var(--ty, 0));
            filter: drop-shadow(0 3px 5px rgba(0, 0, 0, 0.35));
          }
        }
      `}</style>
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        role="group"
        aria-label="Sustainable Development Goals wheel"
        className="h-auto w-full"
      >
        {ordered.map((sdg, i) => {
          const start = -90 + i * step;
          const end = start + step;
          const mid = start + step / 2;
          const rad = (mid * Math.PI) / 180;
          const tx = (SLIDE * Math.cos(rad)).toFixed(2);
          const ty = (SLIDE * Math.sin(rad)).toFixed(2);
          const [nx, ny] = polar(NUMBER_R, mid);
          const [lx, ly] = polar(NAME_R, mid);
          const rot = labelRotation(mid).toFixed(2);
          const nameLen = Math.max(10, NAME_R * ((step * Math.PI) / 180) * 0.86);
          const style = { "--tx": `${tx}px`, "--ty": `${ty}px` } as CSSProperties;
          return (
            <a
              key={sdg.number}
              href={`/${locale}/sdgs/${sdg.slug}`}
              className="sdg-wheel-seg"
              style={style}
              aria-label={`SDG ${sdg.number}: ${sdg.name}`}
            >
              <path d={segmentPath(start, end)} fill={sdg.color} stroke="#fff" strokeWidth={1.5} />
              <text
                x={nx.toFixed(2)}
                y={ny.toFixed(2)}
                transform={`rotate(${rot} ${nx.toFixed(2)} ${ny.toFixed(2)})`}
                textAnchor="middle"
                dominantBaseline="central"
                fill="#fff"
                fontSize={15}
                fontWeight={700}
                fontFamily="ui-sans-serif, system-ui, sans-serif"
              >
                {sdg.number}
              </text>
              <text
                x={lx.toFixed(2)}
                y={ly.toFixed(2)}
                transform={`rotate(${rot} ${lx.toFixed(2)} ${ly.toFixed(2)})`}
                textAnchor="middle"
                dominantBaseline="central"
                fill="#fff"
                fontSize={8}
                fontFamily="ui-sans-serif, system-ui, sans-serif"
                textLength={nameLen.toFixed(2)}
                lengthAdjust="spacingAndGlyphs"
              >
                {sdg.name}
              </text>
            </a>
          );
        })}
        <text
          x={CENTER}
          y={CENTER}
          textAnchor="middle"
          dominantBaseline="central"
          className="fill-zinc-900 dark:fill-zinc-50"
          fontSize={40}
          fontWeight={800}
          fontFamily="ui-sans-serif, system-ui, sans-serif"
          direction={dir}
        >
          {title}
        </text>
      </svg>
    </div>
  );
}
