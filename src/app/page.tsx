"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, RefreshCw, Share2, Wine } from "lucide-react";
import { toPng } from "html-to-image";
import { NotepadCard } from "@/components/notepad-card";

type Item = { course: string; name: string; why: string };
type Order = { restaurant: string; items: Item[]; closing: string };

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

  const reset = () => {
    setOrder(null);
    setError(null);
  };

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
      try {
        await navigator.share({ title: order.restaurant, text });
        return;
      } catch {
        /* fall through */
      }
    }
    await navigator.clipboard.writeText(text);
    alert("Order copied");
  };

  return (
    <main className="flex-1 flex flex-col">
      <header className="px-6 pt-12 sm:pt-20 pb-2 text-center">
        <div className="inline-flex items-center gap-2 mb-6 text-xs font-mono text-accent-2 uppercase tracking-[0.4em]">
          <Wine className="h-3 w-3" /> the waiter
        </div>
        <h1 className="text-4xl sm:text-6xl tracking-tight text-ink">
          Let me{" "}
          <span className="font-display text-accent-2 italic font-medium">order</span>{" "}
          for you.
        </h1>
        <p className="mt-4 text-ink-dim max-w-md mx-auto">
          Cuisine and mood. We&rsquo;ll handle the rest of the night.
        </p>
      </header>

      <section className="flex-1 px-6 py-12">
        <AnimatePresence mode="wait">
          {!order ? (
            <motion.form
              key="input"
              onSubmit={submit}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-xl mx-auto space-y-4"
            >
              <div>
                <label className="block text-xs font-mono uppercase tracking-[0.3em] text-ink-dim mb-2">
                  cuisine or restaurant
                </label>
                <input
                  type="text"
                  value={cuisine}
                  maxLength={80}
                  onChange={(e) => setCuisine(e.target.value)}
                  placeholder="Italian · Sushi · Roberta's · Thai…"
                  className="w-full bg-bg-2/60 border border-ink-dim/20 rounded-xl px-4 py-3 text-ink placeholder-ink-dim focus:border-accent-2 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase tracking-[0.3em] text-ink-dim mb-2">
                  mood / situation
                </label>
                <input
                  type="text"
                  value={mood}
                  maxLength={120}
                  onChange={(e) => setMood(e.target.value)}
                  placeholder="feeling reckless · first date · alone, on the road…"
                  className="w-full bg-bg-2/60 border border-ink-dim/20 rounded-xl px-4 py-3 text-ink placeholder-ink-dim focus:border-accent-2 focus:outline-none"
                />
              </div>
              <div className="pt-4 flex justify-center">
                <button
                  type="submit"
                  disabled={!cuisine.trim() || !mood.trim() || loading}
                  className="px-8 py-3 rounded-xl bg-accent text-cream font-semibold hover:bg-accent-2 transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {loading ? "Walking to the kitchen…" : "Order for me"}
                </button>
              </div>
              {error && <p className="mt-4 text-center text-sm text-rust">{error}</p>}
            </motion.form>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-xl mx-auto"
            >
              <div
                className="rounded-lg p-8"
                style={{
                  background: "linear-gradient(180deg, #fdf6e3 0%, #f7ecd0 100%)",
                  color: "#2b1810",
                  boxShadow: "0 14px 40px rgba(0,0,0,0.4)",
                }}
              >
                <div className="font-mono uppercase text-xs tracking-[0.4em]" style={{ color: "#7c2d12" }}>
                  tonight&rsquo;s order
                </div>
                <h2 className="mt-1 font-display text-4xl" style={{ color: "#7c2d12" }}>
                  {order.restaurant}
                </h2>
                <div className="h-px mt-3" style={{ background: "rgba(120,53,15,0.4)" }} />
                <div className="mt-4 space-y-4">
                  {order.items.map((it, i) => (
                    <div key={i}>
                      <div className="flex items-baseline gap-3">
                        <span className="font-mono uppercase text-[10px] tracking-[0.3em] min-w-[60px]" style={{ color: "#7c2d12" }}>
                          {it.course}
                        </span>
                        <span className="font-display text-xl">{it.name}</span>
                      </div>
                      <p className="ml-[72px] text-sm opacity-75 leading-snug mt-0.5">{it.why}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-4 border-t-2" style={{ borderColor: "rgba(120,53,15,0.4)" }}>
                  <p className="font-display italic text-xl" style={{ color: "#7c2d12" }}>
                    — {order.closing}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <button onClick={download} className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-cream font-semibold hover:bg-accent-2 transition">
                  <Download className="h-4 w-4" /> Download
                </button>
                <button onClick={share} className="inline-flex items-center gap-2 rounded-xl border border-ink-dim/30 px-5 py-3 text-ink hover:border-accent-2 hover:text-accent-2 transition">
                  <Share2 className="h-4 w-4" /> Share
                </button>
                <button onClick={reset} className="inline-flex items-center gap-2 rounded-xl border border-ink-dim/30 px-5 py-3 text-ink hover:border-accent-2 hover:text-accent-2 transition">
                  <RefreshCw className="h-4 w-4" /> Order again
                </button>
              </div>

              <div aria-hidden style={{ position: "fixed", left: "-99999px", top: 0, pointerEvents: "none" }}>
                <NotepadCard ref={cardRef} {...order} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <footer className="px-6 py-8 text-center text-xs text-ink-dim">
        🍷 order-for-me · the waiter has decided
      </footer>
    </main>
  );
}
