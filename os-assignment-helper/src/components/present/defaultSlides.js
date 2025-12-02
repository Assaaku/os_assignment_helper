import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * Deck.jsx
 * - Renders slides from either a structured array or markdown text
 * - Fully supports:
 *   title • subtitle • body • bullets • columns (N columns) • notes • tags.bg • tags.layout
 * - Controls: ←/→ (nav), Space (pause timer), T (toggle timer), F (fullscreen), B (blackout),
 *             R (reset timer), ? (help), N (notes), Esc (exit)
 */

export default function Deck({ slides, slidesText, onExit, brand = "OS Assignment" }) {
    const [idx, setIdx] = useState(0);
    const [timerSec, setTimerSec] = useState(8 * 60);
    const [timerOn, setTimerOn] = useState(true);
    const [showTimer, setShowTimer] = useState(true);
    const [showHelp, setShowHelp] = useState(false);
    const [showNotes, setShowNotes] = useState(false);
    const [black, setBlack] = useState(false);
    const rootRef = useRef(null);
    const runningRef = useRef(true);
    runningRef.current = timerOn;

    const parsedSlides = useMemo(() => {
        if (Array.isArray(slides)) return normalizeSlides(slides);
        return normalizeSlides(parseMarkdown(slidesText || ""));
    }, [slides, slidesText]);

    const total = parsedSlides.length;
    const s = parsedSlides[idx] ?? emptySlide();

    // hash navigation
    useEffect(() => {
        const n = Number(String(location.hash).replace("#", ""));
        if (!Number.isNaN(n) && n > 0 && n <= total) setIdx(n - 1);
    }, [total]);
    useEffect(() => { location.hash = String(idx + 1); }, [idx]);

    // timer
    useEffect(() => {
        const id = setInterval(() => {
            if (runningRef.current) setTimerSec((t) => Math.max(0, t - 1));
        }, 1000);
        return () => clearInterval(id);
    }, []);

    // keys
    useEffect(() => {
        const onKey = (e) => {
            if (e.key === "ArrowRight" || e.key === "PageDown") setIdx((i) => Math.min(total - 1, i + 1));
            if (e.key === "ArrowLeft" || e.key === "PageUp") setIdx((i) => Math.max(0, i - 1));
            if (e.key === " ") setTimerOn((v) => !v);
            if (e.key === "t" || e.key === "T") setShowTimer((v) => !v);
            if (e.key === "b" || e.key === "B") setBlack((v) => !v);
            if (e.key === "r" || e.key === "R") setTimerSec(8 * 60);
            if (e.key === "n" || e.key === "N") setShowNotes((v) => !v);
            if (e.key === "?") setShowHelp((v) => !v);
            if (e.key === "f" || e.key === "F") toggleFullscreen(rootRef.current);
            if (e.key === "Escape") {
                if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
                onExit?.();
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onExit, total]);

    const mm = String(Math.floor(timerSec / 60)).padStart(2, "0");
    const ss = String(timerSec % 60).padStart(2, "0");
    const progress = total ? ((idx + 1) / total) * 100 : 0;

    const themeClass = pickThemeClass(s.tags?.bg);

    return (
        <div className="min-h-screen bg-neutral-100" ref={rootRef}>
            {/* progress */}
            <div className="fixed top-0 left-0 right-0 h-1 bg-neutral-200">
                <div className="h-1 bg-neutral-900" style={{ width: `${progress}%` }} />
            </div>

            {/* top bar */}
            <div className="fixed top-2 left-2 right-2 z-20 flex items-center justify-between">
                <div className="text-xs px-2 py-1 rounded bg-white/80 backdrop-blur border">
                    {brand}
                </div>
                <div className="flex items-center gap-2">
                    <NavBtn onClick={() => setIdx((i) => Math.max(0, i - 1))}>← Prev</NavBtn>
                    <NavBtn onClick={() => setIdx((i) => Math.min(total - 1, i + 1))}>Next →</NavBtn>
                    <NavBtn onClick={() => setShowNotes((v) => !v)}>Notes</NavBtn>
                    <NavBtn onClick={() => setShowHelp((v) => !v)}>?</NavBtn>
                    <NavBtn onClick={() => toggleFullscreen(rootRef.current)}>Fullscreen</NavBtn>
                    <NavBtn onClick={() => setBlack((v) => !v)}>Blackout</NavBtn>
                    <span className="text-xs px-2 py-1 rounded bg-white/80 backdrop-blur border">
            {idx + 1} / {total}
          </span>
                    <button
                        className="px-3 py-1 rounded bg-rose-600 text-white text-sm"
                        onClick={() => onExit?.()}
                    >
                        Exit
                    </button>
                </div>
            </div>

            {/* slide stage */}
            <div className="pt-12 pb-6 px-6">
                <div className="w-full grid place-items-center">
                    <div className="w-full max-w-6xl aspect-[16/9] rounded-2xl shadow-2xl overflow-hidden">
                        <div className={`w-full h-full text-white ${themeClass}`}>
                            <SlideContent slide={s} />
                        </div>
                    </div>
                </div>
            </div>

            {/* timer */}
            {showTimer && (
                <div className="fixed bottom-4 right-4 px-3 py-2 rounded-xl bg-black/80 text-white font-bold text-lg">
                    {mm}:{ss}
                </div>
            )}

            {/* overlays */}
            {black && <div className="fixed inset-0 bg-black z-30" onClick={() => setBlack(false)} />}

            {showHelp && (
                <Overlay title="Keyboard" onClose={() => setShowHelp(false)}>
                    <ul className="grid grid-cols-2 gap-2 text-sm">
                        <li><b>← / →</b> : Prev / Next</li>
                        <li><b>F</b> : Fullscreen</li>
                        <li><b>Space</b> : Pause/Resume timer</li>
                        <li><b>T</b> : Toggle timer</li>
                        <li><b>B</b> : Blackout</li>
                        <li><b>R</b> : Reset 8:00</li>
                        <li><b>N</b> : Notes</li>
                        <li><b>?</b> : Help</li>
                        <li><b>Esc</b> : Exit</li>
                    </ul>
                </Overlay>
            )}

            <NotesDrawer open={showNotes} onClose={() => setShowNotes(false)} notes={s.notes} />
        </div>
    );
}

/* ───────────────────────────────────────── helpers & rendering ───────────── */

function SlideContent({ slide }) {
    const { title, subtitle, body, bullets = [], columns = [], tags = {} } = slide || {};
    const layout = tags.layout || (columns.length ? "split" : "default");

    const cardPad = "p-10 md:p-12";
    const titleEl = title ? <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">{title}</h1> : null;
    const subtitleEl = subtitle ? <h2 className="text-xl md:text-2xl opacity-90 mt-1">{subtitle}</h2> : null;
    const bodyEl = body ? <p className="text-lg md:text-xl leading-relaxed mt-4 opacity-95">{body}</p> : null;
    const bulletsEl =
        bullets.length > 0 ? (
            <ul className="list-disc ml-6 mt-6 space-y-2 text-lg md:text-xl leading-relaxed">
                {bullets.map((b, i) => <li key={i}>{b}</li>)}
            </ul>
        ) : null;

    if (layout === "split") {
        // N-column grid (2 or 3+ supported)
        const cols = Math.max(2, columns.length || 2);
        return (
            <div className={`w-full h-full ${cardPad} flex flex-col`}>
                <div>
                    {titleEl}
                    {subtitleEl}
                    {bodyEl}
                </div>

                <div className="flex-1 mt-6">
                    <div
                        className="grid gap-6 md:gap-8"
                        style={{
                            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                        }}
                    >
                        {columns.map((col, idx) => (
                            <div key={idx} className="rounded-xl bg-white/10 backdrop-blur-sm p-4 border border-white/15">
                                {col.title && <div className="font-semibold mb-2">{col.title}</div>}
                                <ul className="list-disc ml-5 space-y-2 text-base md:text-lg">
                                    {(col.bullets || []).map((t, i) => <li key={i}>{t}</li>)}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                {bulletsEl}
            </div>
        );
    }

    return (
        <div className={`w-full h-full ${cardPad} flex flex-col`}>
            {titleEl}
            {subtitleEl}
            {bodyEl}
            <div className="flex-1">{bulletsEl}</div>
            <div className="mt-6 h-[2px] w-full bg-white/20" />
        </div>
    );
}

function NavBtn({ children, onClick }) {
    return (
        <button
            className="px-3 py-1 rounded border bg-white/80 backdrop-blur text-sm"
            onClick={onClick}
        >
            {children}
        </button>
    );
}

function Overlay({ title, children, onClose }) {
    return (
        <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm grid place-items-center p-4" onClick={onClose}>
            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">{title}</h3>
                    <button className="rounded px-2 py-1 border" onClick={onClose}>Close</button>
                </div>
                <div className="mt-4">{children}</div>
            </div>
        </div>
    );
}

function NotesDrawer({ open, onClose, notes }) {
    return (
        <div
            className={`fixed bottom-0 left-0 right-0 z-30 transition-transform duration-300 ${
                open ? "translate-y-0" : "translate-y-full"
            }`}
        >
            <div className="mx-auto max-w-5xl rounded-t-2xl bg-white border-t shadow-xl">
                <div className="flex items-center justify-between px-4 py-2">
                    <div className="text-sm font-medium">Speaker notes</div>
                    <button className="rounded px-2 py-1 border" onClick={onClose}>Close</button>
                </div>
                <div className="px-4 pb-4">
                    {notes ? (
                        <pre className="whitespace-pre-wrap text-sm leading-relaxed">{notes}</pre>
                    ) : (
                        <div className="text-sm opacity-70">No notes</div>
                    )}
                </div>
            </div>
        </div>
    );
}

/* parsing & utilities */

function emptySlide() {
    return { title: "", subtitle: "", body: "", bullets: [], columns: [], notes: "", tags: {} };
}

function normalizeSlides(arr) {
    return arr.map((s) => ({
        title: s.title || "",
        subtitle: s.subtitle || "",
        body: s.body || "",
        bullets: Array.isArray(s.bullets) ? s.bullets : [],
        columns: Array.isArray(s.columns) ? s.columns : [],
        notes: s.notes || "",
        tags: s.tags || {},
    }));
}

/** Minimal markdown → structured converter */
function parseMarkdown(text) {
    if (!text) return [];
    const pages = text.split(/\n\s*---\s*\n/);
    return pages.map((p) => {
        const lines = p.split(/\r?\n/);
        const tags = {};

        // [bg=ocean][layout=split]
        if (lines[0]?.trim().startsWith("[") && lines[0]?.trim().endsWith("]")) {
            for (const chunk of lines.shift().trim().slice(1, -1).split(/\]\s*\[/)) {
                const [k, v] = chunk.split("=");
                if (k && v) tags[k.trim()] = v.trim();
            }
        }

        let title = "", subtitle = "", body = "";
        const bullets = [];
        const cols = [];
        let curCol = null;

        if (lines[0]?.startsWith("# "))  title = lines.shift().replace(/^#\s*/, "");
        if (lines[0]?.startsWith("## ")) subtitle = lines.shift().replace(/^##\s*/, "");

        for (const raw of lines) {
            const ln = raw.replace(/\t/g, "    ");

            // new column marker
            if (/^\s*::\s*$/.test(ln)) {
                if (!curCol) { curCol = { title: "", bullets: [] }; cols.push(curCol); }
                else { curCol = { title: "", bullets: [] }; cols.push(curCol); }
                continue;
            }

            // column title like "### Title" inside split
            if (curCol && /^\s*###\s+/.test(ln)) {
                curCol.title = ln.replace(/^\s*###\s+/, "");
                continue;
            }

            if (/^\s*-\s+/.test(ln)) {
                const item = ln.replace(/^\s*-\s+/, "");
                if (curCol) curCol.bullets.push(item);
                else bullets.push(item);
                continue;
            }

            if (ln.trim()) body += (body ? "\n" : "") + ln.trim();
        }

        const columns = cols.length ? cols : [];
        return { title, subtitle, body, bullets, columns, tags, notes: "" };
    });
}

function pickThemeClass(bg) {
    switch (bg) {
        case "ocean":
            return "bg-gradient-to-b from-slate-900/90 via-slate-900/70 to-cyan-500/40";
        case "carbon":
            return "bg-gradient-to-b from-neutral-900 via-neutral-800 to-neutral-700";
        case "sunset":
        default:
            return "bg-gradient-to-b from-neutral-800/90 via-neutral-800/70 to-rose-500/35";
    }
}

function toggleFullscreen(el) {
    if (!el) return;
    if (!document.fullscreenElement) el.requestFullscreen?.().catch(() => {});
    else document.exitFullscreen?.().catch(() => {});
}
