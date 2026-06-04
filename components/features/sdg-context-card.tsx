"use client";

// Toggle-button card that flips between a question (front) and an answer
// (back) via a CSS 3D rotateY transform. State is per-card React state;
// only the active face is exposed to assistive tech via aria-hidden.
// Each card has a decorative UAE-color ribbon pinned to its top, sitting
// above the flip area so it stays static when the card flips.

import { useState } from "react";
import { UaeRibbon } from "./uae-ribbon";

export function SdgContextCard({ question, answer }: { question: string; answer: string }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <>
      <style href="sdg-context-card-flip" precedence="default">{`
        .sdg-flip { display: flex; flex-direction: column; perspective: 1000px; }
        .sdg-flip-ribbon {
          flex: 0 0 auto;
          padding: 0.75rem 0.75rem 0;
          pointer-events: none;
        }
        .sdg-flip-ribbon svg { width: 100%; height: auto; display: block; }
        .sdg-flip-inner {
          flex: 1;
          position: relative;
          transform-style: preserve-3d;
          transition: transform 400ms ease;
        }
        .sdg-flip-inner.is-flipped { transform: rotateY(180deg); }
        .sdg-flip-face {
          position: absolute;
          inset: 0;
          -webkit-backface-visibility: hidden;
          backface-visibility: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem 1.25rem 1.25rem;
          text-align: center;
        }
        .sdg-flip-back { transform: rotateY(180deg); }
      `}</style>
      <button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        aria-pressed={flipped}
        className="sdg-flip group block w-full min-h-[20rem] overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-900/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <div className="sdg-flip-ribbon">
          <UaeRibbon />
        </div>
        <div className={`sdg-flip-inner ${flipped ? "is-flipped" : ""}`}>
          <div className="sdg-flip-face sdg-flip-front" aria-hidden={flipped}>
            <p className="text-base sm:text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              {question}
            </p>
          </div>
          <div className="sdg-flip-face sdg-flip-back" aria-hidden={!flipped}>
            <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">{answer}</p>
          </div>
        </div>
      </button>
    </>
  );
}
