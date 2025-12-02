import React, { useMemo, useState } from "react";
import Deck from "@/components/present/Deck";
import { DEFAULT_SLIDES } from "@/components/present/defaultSlides";

/**
 * App.jsx — stable editor → presenter flow
 * - Starts in EDITOR mode (never auto-presents)
 * - Two editors: "Structured (JSON)" and "Markdown"
 * - Only enters presentation when user clicks Start
 * - Import/Export for JSON slides
 */
export default function App() {
    // --- view state ---
    const [presenting, setPresenting] = useState(false);
    const [mode, setMode] = useState<"structured" | "markdown">("structured");

    // --- editors state ---
    const [jsonText, setJsonText] = useState(() =>
        JSON.stringify(DEFAULT_SLIDES, null, 2)
    );
    const [mdText, setMdText] = useState("");

    // --- parse JSON safely for structured mode ---
    const { parsedSlides, jsonError, slideCount } = useMemo(() => {
        if (mode !== "structured") {
            return { parsedSlides: [], jsonError: null, slideCount: 0 };
        }
        try {
            const arr = JSON.parse(jsonText);
            if (!Array.isArray(arr)) throw new Error("Top-level value must be an array.");
            return { parsedSlides: arr, jsonError: null, slideCount: arr.length };
        } catch (e) {
            return { parsedSlides: [], jsonError: (e as Error).message, slideCount: 0 };
        }
    }, [jsonText, mode]);

    // Only allow starting when input looks valid
    const canStart =
        (mode === "structured" && !jsonError && parsedSlides.length > 0) ||
        (mode === "markdown" && mdText.trim().length > 0);

    // --- actions ---
    const handleStart = () => {
        if (canStart) setPresenting(true);
    };

    const handleExit = () => {
        // Always return to EDITOR; do not keep fullscreen, etc. (Deck handles Esc)
        setPresenting(false);
    };

    // --- render ---
    if (presenting) {
        return mode === "structured" ? (
            <Deck slides={parsedSlides} onExit={handleExit} />
        ) : (
            <Deck slidesText={mdText} onExit={handleExit} />
        );
    }

    return (
        <div className="min-h-screen bg-neutral-50 text-neutral-900">
            <div className="mx-auto max-w-6xl p-6 md:p-10 space-y-8">
                <header className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">OS Assignment Helper</h1>
                        <p className="text-sm opacity-70">Process &amp; Thread — presentation builder</p>
                    </div>

                    <div className="inline-flex rounded-lg overflow-hidden border bg-white">
                        <button
                            className={`px-3 py-2 text-sm ${mode === "structured" ? "bg-neutral-900 text-white" : ""}`}
                            onClick={() => setMode("structured")}
                        >
                            Structured (JSON)
                        </button>
                        <button
                            className={`px-3 py-2 text-sm ${mode === "markdown" ? "bg-neutral-900 text-white" : ""}`}
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
                                {jsonError ? (
                                    <span className="text-red-600 font-medium">JSON error: {jsonError}</span>
                                ) : (
                                    <span className="opacity-70">✓ {slideCount} slides parsed</span>
                                )}
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
                                        a.href = url;
                                        a.download = `slides-${Date.now()}.json`;
                                        a.click();
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
                                            const f = e.target.files?.[0];
                                            if (!f) return;
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
                            Use <code>#</code> title, <code>##</code> subtitle, <code>-</code> bullets. Separate slides with
                            <code> --- </code>. Use <code>::</code> to split columns. Per-slide tags: <code>[bg=ocean]</code>,{" "}
                            <code>[layout=split]</code>.
                        </div>
                        <textarea
                            className="w-full h-[520px] rounded-xl border bg-white p-4 font-mono text-sm outline-none focus:ring-2 focus:ring-black/20"
                            value={mdText}
                            onChange={(e) => setMdText(e.target.value)}
                            spellCheck={false}
                            placeholder={`[bg=ocean]\n# Процесс ба Thread\n## Товчоор\n- ...\n::\n- left column\n::\n- right column\n\n---\n# Дараагийн слайд ...`}
                        />
                    </section>
                )}

                <div className="flex gap-3">
                    <button
                        className={`px-4 py-2 rounded-lg text-white ${canStart ? "bg-neutral-900" : "bg-neutral-400 cursor-not-allowed"}`}
                        onClick={handleStart}
                    >
                        Start presentation (F for fullscreen)
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
