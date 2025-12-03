import React, { useMemo, useRef, useState } from "react";
import Deck from "@/components/present/Deck";
import { DEFAULT_SLIDES } from "@/components/present/defaultSlides";

// Discover all images under /src/assets (Vite)
const imageModules = import.meta.glob("/src/assets/*.{png,jpg,jpeg,webp,gif,svg}", { eager: true });
const ASSET_URLS = Object.values(imageModules).map((m) => m.default).filter(Boolean);

export default function App() {
  // UI mode
  const [presenting, setPresenting] = useState(false);
  // Editor state (JSON for structured slides)
  const [jsonText, setJsonText] = useState(JSON.stringify(DEFAULT_SLIDES, null, 2));
  const [jsonError, setJsonError] = useState(null);

  // Parse JSON safely
  const slides = useMemo(() => {
    try {
      const parsed = JSON.parse(jsonText);
      if (!Array.isArray(parsed)) throw new Error("Root must be an array of slide objects.");
      setJsonError(null);
      return parsed;
    } catch (e) {
      setJsonError((e && e.message) || "Invalid JSON");
      return [];
    }
  }, [jsonText]);

  // Simple header actions
  const start = () => { if (!jsonError && slides.length) setPresenting(true); };
  const stop  = () => setPresenting(false);

  if (presenting) {
    return (
      <Deck
        slides={slides}
        assets={ASSET_URLS}
        onExit={stop}
        brand="OS Assignment"
      />
    );
  }

  return (
    <div className="min-h-screen text-neutral-900 bg-[radial-gradient(1200px_600px_at_40%_-10%,#e0f2fe,transparent),radial-gradient(800px_400px_at_90%_10%,#fde68a,transparent)]">
      <div className="mx-auto max-w-6xl p-6 md:p-10">
        <header className="mb-6 flex items-end justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">OS Assignment Helper</h1>
            <p className="text-sm opacity-70">Process & Thread — presentation builder</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-black/80 text-white px-3 py-1 text-xs">Editor</span>
            <button
              className="inline-flex items-center justify-center px-3 py-2 rounded-lg border bg-neutral-900 text-white text-sm"
              onClick={start}
              disabled={!!jsonError || slides.length === 0}
              title={jsonError ? "Fix JSON first" : "Start presentation"}
            >
              Start ▶
            </button>
          </div>
        </header>

        <div className="rounded-2xl bg-white/70 backdrop-blur-xl shadow-xl border border-white/60 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Slides (JSON)</h2>
            <button
              className="text-sm underline"
              onClick={() => setJsonText(JSON.stringify(DEFAULT_SLIDES, null, 2))}
            >
              Reset to template
            </button>
          </div>

          <p className="text-sm opacity-80">
            Tips: Each slide can set <code>theme</code> (ocean|carbon|sunset|violet|forest) and
            <code>image</code> (boolean). If <code>image</code> is true, set <code>imageSide</code> to
            "left" or "right" to place the text on the opposite side. The app will auto-pick a random
            image from <code>/src/assets</code>.
          </p>

          <textarea
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            rows={22}
            className="w-full rounded-xl border bg-white p-3 outline-none focus:ring-2 focus:ring-black/20 font-mono text-sm"
            spellCheck={false}
          />

          <div className="flex items-center justify-between">
            <div className="text-sm">
              {jsonError ? (
                <span className="text-rose-600">JSON error: {jsonError}</span>
              ) : (
                <span className="opacity-70">{slides.length} slide(s) ready</span>
              )}
            </div>
            <div className="flex gap-2">
              <button
                className="inline-flex items-center justify-center px-3 py-2 rounded-lg border text-sm"
                onClick={() => navigator.clipboard.writeText(jsonText)}
              >
                Copy JSON
              </button>
              <button
                className="inline-flex items-center justify-center px-3 py-2 rounded-lg border bg-neutral-900 text-white text-sm"
                onClick={start}
                disabled={!!jsonError || slides.length === 0}
              >
                Present ▶
              </button>
            </div>
          </div>

          <div className="text-xs opacity-70">
            Place a few images in <code>src/assets/</code> (png/jpg/jpeg/webp/gif/svg). They’ll be discovered automatically.
          </div>
        </div>
      </div>
    </div>
  );
}
