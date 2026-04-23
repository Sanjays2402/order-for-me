"use client";

import { forwardRef } from "react";

type Item = { course: string; name: string; why: string };
type Props = { restaurant: string; items: Item[]; closing: string };

export const NotepadCard = forwardRef<HTMLDivElement, Props>(function NotepadCard(
  { restaurant, items, closing },
  ref
) {
  return (
    <div
      ref={ref}
      style={{ width: 1080, height: 1350 }}
      className="relative overflow-hidden flex items-center justify-center"
    >
      {/* dark restaurant bg */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(900px 500px at 30% 0%, rgba(185,28,28,0.25), transparent 60%), radial-gradient(900px 500px at 70% 100%, rgba(120,53,15,0.30), transparent 60%), linear-gradient(180deg, #1a0f0a 0%, #2b1810 100%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.06] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.7'/></svg>\")",
        }}
      />

      {/* notepad */}
      <div
        className="relative z-10 flex flex-col"
        style={{
          width: 760,
          minHeight: 1180,
          background:
            "linear-gradient(180deg, #fdf6e3 0%, #f7ecd0 100%)",
          padding: "60px 70px",
          borderRadius: 8,
          boxShadow:
            "0 30px 60px rgba(0,0,0,0.45), inset 0 0 0 1px rgba(120,53,15,0.15)",
          backgroundImage:
            "repeating-linear-gradient(180deg, transparent 0, transparent 47px, rgba(120,53,15,0.12) 47px, rgba(120,53,15,0.12) 48px), linear-gradient(180deg, #fdf6e3 0%, #f7ecd0 100%)",
          color: "#2b1810",
        }}
      >
        {/* spiral */}
        <div className="flex justify-around mb-6 -mt-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              style={{
                width: 14,
                height: 14,
                borderRadius: "50%",
                background: "#1a0f0a",
                boxShadow: "inset 0 -2px 4px rgba(0,0,0,0.4)",
              }}
            />
          ))}
        </div>

        <div
          className="font-mono uppercase"
          style={{ fontSize: 14, letterSpacing: "0.4em", color: "#7c2d12" }}
        >
          tonight&rsquo;s order — table for one (or two)
        </div>

        <h2
          className="font-display text-accent-2 mt-2"
          style={{ fontSize: 64, lineHeight: 1.05, color: "#7c2d12" }}
        >
          {restaurant}
        </h2>

        <div className="h-px mt-3" style={{ background: "rgba(120,53,15,0.4)" }} />

        <div className="mt-6 space-y-6 flex-1">
          {items.map((it, i) => (
            <div key={i}>
              <div className="flex items-baseline gap-3">
                <span
                  className="font-mono uppercase"
                  style={{
                    fontSize: 13,
                    letterSpacing: "0.3em",
                    color: "#7c2d12",
                    minWidth: 70,
                  }}
                >
                  {it.course}
                </span>
                <span
                  className="font-display"
                  style={{ fontSize: 34, lineHeight: 1.2, color: "#1a0f0a" }}
                >
                  {it.name}
                </span>
              </div>
              <p
                className="mt-1 ml-[80px]"
                style={{ fontSize: 18, lineHeight: 1.5, color: "rgba(26,15,10,0.75)" }}
              >
                {it.why}
              </p>
            </div>
          ))}
        </div>

        <div
          className="mt-8 pt-4 border-t-2"
          style={{ borderColor: "rgba(120,53,15,0.5)" }}
        >
          <p
            className="font-display italic"
            style={{ fontSize: 32, color: "#7c2d12", lineHeight: 1.25 }}
          >
            — {closing}
          </p>
          <div
            className="mt-4 font-mono uppercase"
            style={{ fontSize: 12, letterSpacing: "0.4em", color: "rgba(26,15,10,0.5)" }}
          >
            🍷 order-for-me · the waiter has decided
          </div>
        </div>
      </div>
    </div>
  );
});
