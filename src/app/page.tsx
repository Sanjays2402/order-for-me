"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, RefreshCw, Share2, Wine } from "lucide-react";
import { toPng } from "html-to-image";
import { NotepadCard } from "@/components/notepad-card";

type Item = { course: string; name: string; why: string };
type Order = { restaurant: string; items: Item[]; closing: string };

const COURSE_ORDER = ["drink", "starter", "main", "side", "dessert"];

export default function Home() {
  const [cuisine, setCuisine] = useState("");
  const [mood, setMood] = useState("");
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!cuisine.trim() || !mood.trim() || loading) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ cuisine, mood }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error ?? "Kitchen is closed.");
      else setOrder(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => { setOrder(null); setError(null); };

  const download = async () => {
    if (!cardRef.current) return;
    const png = await toPng(cardRef.current, { pixelRatio: 1, cacheBust: true });
    const a = document.createElement("a");
    a.href = png;
    a.download = `order-${Date.now()}.png`;
    a.click();
  };

  const share = async () => {
    if (!order) return;
    const text = `${order.restaurant}\n\n${order.items.map((it) => `${it.course.toUpperCase()}: ${it.name} — ${it.why}`).join("\n")}\n\n— ${order.closing}`;
    if (navigator.share) {
      try { await navigator.share({ title: order.restaurant, text }); return; } catch {}
    }
    await navigator.clipboard.writeText(text);
    alert("Order copied");
  };

  // sort items by course order
  const sortedItems = order
    ? [...order.items].sort(
        (a, b) =>
          COURSE_ORDER.indexOf(a.course.toLowerCase()) -
          COURSE_ORDER.indexOf(b.course.toLowerCase())
      )
    : [];

  return (
    <main className="flex-1 flex flex-col">
      {/* RESTAURANT HEADER — looks like a leather-bound menu cover */}
      <header
        className="border-b border-accent-2/30 px-6 py-10 sm:py-14 text-center"
        style={{
          background:
            "linear-gradient(180deg, rgba(185,28,28,0.10) 0%, transparent 100%)",
        }}
      >
        <div className="inline-flex items-center gap-3 mb-4 text-xs font-mono text-accent-2 uppercase tracking-[0.5em]">
          <span className="h-px w-8 bg-accent-2/40" />
          <Wine className="h-3 w-3" />
          maître d&rsquo;
          <Wine className="h-3 w-3" />
          <span className="h-px w-8 bg-accent-2/40" />
        </div>
        <h1 className="text-4xl sm:text-6xl tracking-tight text-ink leading-tight">
          Let me{" "}
          <span className="font-display text-accent-2 italic font-medium">order</span>{" "}
          for you.
        </h1>
        <p className="mt-3 text-ink-dim max-w-md mx-auto">
          Cuisine and mood. We&rsquo;ll handle the rest of the night.
        </p>
      </header>

      <section className="flex-1 px-6 py-12">
        <AnimatePresence mode="wait">
          {!order ? (
            // INPUT — looks like a reservation card laid on a table
            <motion.form
              key="input"
              onSubmit={submit}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-md mx-auto"
            >
              <div
                className="rounded-sm p-8 shadow-2xl"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(43,24,16,0.85) 0%, rgba(26,15,10,0.85) 100%)",
                  border: "1px solid rgba(245,231,211,0.15)",
                  boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
                }}
              >
                <div className="text-center font-mono uppercase text-[10px] tracking-[0.5em] text-accent-2 pb-4 border-b border-accent-2/30">
                  reservation card
                </div>

                <div className="mt-6 space-y-5">
                  <div>
                    <label className="block font-mono uppercase text-[10px] tracking-[0.4em] text-ink-dim mb-2">
                      cuisine
                    </label>
                    <input
                      type="text"
                      value={cuisine}
                      maxLength={80}
                      onChange={(e) => setCuisine(e.target.value)}
                      placeholder="Italian · Sushi · Thai…"
                      className="w-full bg-transparent border-b border-accent-2/40 px-0 py-2 text-ink font-display text-2xl placeholder-ink-dim/50 focus:border-accent-2 focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block font-mono uppercase text-[10px] tracking-[0.4em] text-ink-dim mb-2">
                      mood
                    </label>
                    <input
                      type="text"
                      value={mood}
                      maxLength={120}
                      onChange={(e) => setMood(e.target.value)}
                      placeholder="feeling reckless · first date…"
                      className="w-full bg-transparent border-b border-accent-2/40 px-0 py-2 text-ink font-display text-2xl placeholder-ink-dim/50 focus:border-accent-2 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!cuisine.trim() || !mood.trim() || loading}
                  className="mt-8 w-full px-6 py-4 bg-accent text-cream font-mono uppercase tracking-[0.4em] text-sm hover:bg-accent-2 transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {loading ? "Walking to the kitchen…" : "Order for me"}
                </button>
                {error && <p className="mt-3 text-center text-xs text-rust">{error}</p>}
              </div>

              <p className="mt-6 text-center font-display italic text-ink-dim text-sm">
                — chef&rsquo;s choice. always.
              </p>
            </motion.form>
          ) : (
            // RESULT — vertical wine-list / prix fixe menu
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-2xl mx-auto"
            >
              <div
                className="px-8 sm:px-14 py-12"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(43,24,16,0.6) 0%, rgba(26,15,10,0.6) 100%)",
                  border: "1px solid rgba(245,231,211,0.18)",
                  boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
                }}
              >
                {/* header */}
                <div className="text-center pb-6 border-b border-accent-2/40">
                  <div className="font-mono uppercase text-[10px] tracking-[0.5em] text-accent-2">
                    tonight&rsquo;s prix fixe
                  </div>
                  <h2 className="mt-2 font-display italic text-4xl sm:text-5xl text-ink leading-tight">
                    {order.restaurant}
                  </h2>
                </div>

                {/* courses — vertical list, each course is a "row" with leader dots */}
                <div className="mt-8 space-y-7">
                  {sortedItems.map((it, i) => (
                    <div key={i}>
                      <div className="flex items-baseline gap-3">
                        <span className="font-mono uppercase text-[10px] tracking-[0.4em] text-accent-2 min-w-[60px]">
                          {it.course}
                        </span>
                        <span
                          className="flex-1 font-display text-2xl text-ink leading-tight"
                        >
                          {it.name}
                        </span>
                      </div>
                      <p className="mt-2 ml-[72px] text-ink-dim italic font-display leading-snug">
                        {it.why}
                      </p>
                    </div>
                  ))}
                </div>

                {/* closing */}
                <div className="mt-10 pt-6 border-t border-accent-2/40 text-center">
                  <p className="font-display italic text-xl text-accent-2">
                    — {order.closing}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                <button onClick={download} className="inline-flex items-center gap-2 bg-accent px-5 py-3 text-cream font-mono uppercase text-xs tracking-[0.3em] hover:bg-accent-2 transition">
                  <Download className="h-3.5 w-3.5" /> Download
                </button>
                <button onClick={share} className="inline-flex items-center gap-2 border border-ink-dim/40 px-5 py-3 text-ink font-mono uppercase text-xs tracking-[0.3em] hover:border-accent-2 hover:text-accent-2 transition">
                  <Share2 className="h-3.5 w-3.5" /> Share
                </button>
                <button onClick={reset} className="inline-flex items-center gap-2 border border-ink-dim/40 px-5 py-3 text-ink font-mono uppercase text-xs tracking-[0.3em] hover:border-accent-2 hover:text-accent-2 transition">
                  <RefreshCw className="h-3.5 w-3.5" /> New table
                </button>
              </div>

              <div aria-hidden style={{ position: "fixed", left: "-99999px", top: 0, pointerEvents: "none" }}>
                <NotepadCard ref={cardRef} {...order} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <footer className="px-6 py-6 text-center text-[11px] font-mono uppercase tracking-[0.5em] text-ink-dim border-t border-accent-2/15">
        🍷 order-for-me · the waiter has decided
      </footer>
    </main>
  );
}
