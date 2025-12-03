import React, { useMemo, useState } from "react";
import Deck from "@/components/present/Deck";
import { DEFAULT_SLIDES } from "@/components/present/defaultSlides";

export default function App() {
  const [presenting, setPresenting] = useState(false);
  const [mode, setMode] = useState("structured"); // structured | markdown
  const [jsonText, setJsonText] = useState(() => JSON.stringify(DEFAULT_SLIDES, null, 2));
  const [mdText, setMdText] = useState("");

  const parsedState = useMemo(() => {
    if (mode !== "structured") return { ok: false, slides: [], error: null };
    try {
      const val = JSON.parse(jsonText);
      if (!Array.isArray(val)) throw new Error("Top-level JSON must be an array of slides.");
      return { ok: true, slides: val, error: null };
    } catch (e) {
      const msg = e && typeof e === "object" && "message" in e ? e.message : String(e);
      return { ok: false, slides: [], error: msg };
    }
  }, [jsonText, mode]);

  const canStart =
    (mode === "structured" && parsedState.ok && parsedState.slides.length > 0) ||
    (mode === "markdown" && mdText.trim().length > 0);

  const start = () => { if (canStart) setPresenting(true); };
  const exit = () => setPresenting(false);

  if (presenting) {
    return mode === "structured"
      ? <Deck slides={parsedState.slides} onExit={exit} />
      : <Deck slidesText={mdText} onExit={exit} />;
  }

  return (
    <div className="min-h-screen text-neutral-900">
      <div className="mx-auto max-w-6xl p-6 md:p-10 space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">OS Assignment Helper</h1>
            <p className="text-sm opacity-70">Process &amp; Thread — presentation builder</p>
          </div>

          <div className="inline-flex rounded-lg overflow-hidden border bg-white">
            <button
              className={`px-3 py-2 text-sm ${mode==="structured" ? "bg-neutral-900 text-white" : ""}`}
              onClick={() => setMode("structured")}
            >
              Structured (JSON)
            </button>
            <button
              className={`px-3 py-2 text-sm ${mode==="markdown" ? "bg-neutral-900 text-white" : ""}`}
              onClick={() => setMode("markdown")}
            >
              Markdown
            </button>
          </div>
        </header>

        {mode === "structured" ? (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm">
                {parsedState.error
                  ? <span className="text-red-600 font-medium">JSON error: {parsedState.error}</span>
                  : <span className="opacity-70">✓ {parsedState.slides.length} slides parsed</span>}
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="px-3 py-2 rounded-lg border bg-white text-sm"
                  onClick={() => setJsonText(JSON.stringify(DEFAULT_SLIDES, null, 2))}
                >
                  Load default slides
                </button>
                <button
                  className="px-3 py-2 rounded-lg border bg-white text-sm"
                  onClick={() => {
                    const blob = new Blob([jsonText], { type: "application/json" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url; a.download = `slides-${Date.now()}.json`; a.click();
                    URL.revokeObjectURL(url);
                  }}
                >
                  Export JSON
                </button>
                <label className="px-3 py-2 rounded-lg border bg-white text-sm cursor-pointer">
                  Import JSON
                  <input
                    type="file"
                    accept="application/json"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0]; if (!f) return;
                      const r = new FileReader();
                      r.onload = () => setJsonText(String(r.result || ""));
                      r.readAsText(f);
                      e.currentTarget.value = "";
                    }}
                  />
                </label>
              </div>
            </div>

            <textarea
              className="w-full h-[520px] rounded-xl border bg-white p-4 font-mono text-sm outline-none focus:ring-2 focus:ring-black/20"
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              spellCheck={false}
            />
          </section>
        ) : (
          <section className="space-y-3">
            <div className="text-sm opacity-70">
              Use <code>#</code> title, <code>##</code> subtitle, <code>-</code> bullets. Separate slides with <code>---</code>.
              Use <code>::</code> to split columns. Per-slide tags: <code>[bg=ocean]</code>, <code>[layout=split]</code>, etc.
            </div>
            <textarea
              className="w-full h-[520px] rounded-xl border bg-white p-4 font-mono text-sm outline-none focus:ring-2 focus:ring-black/20"
              value={mdText}
              onChange={(e) => setMdText(e.target.value)}
              spellCheck={false}
              placeholder={`[bg=ocean]
# Процесс ба Thread
## Гол санаа
- ...
::
- left col
::
- right col

---
# Дараагийн слайд ...
- ...`}
            />
          </section>
        )}

        <div className="flex gap-3">
          <button
            className={`px-4 py-2 rounded-lg text-white ${canStart ? "bg-neutral-900" : "bg-neutral-400 cursor-not-allowed"}`}
            onClick={start}
            disabled={!canStart}
          >
            Start presentation (F in deck)
          </button>
          <button
            className="px-4 py-2 rounded-lg border"
            onClick={() => setJsonText(JSON.stringify(DEFAULT_SLIDES, null, 2))}
          >
            Reset to default
          </button>
        </div>
      </div>
    </div>
  );
}
