import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * Deck.jsx — polished presenter
 * - Input: slides (array) with fields:
 *   {
 *     title?: string,
 *     subtitle?: string,
 *     body?: string,
 *     bullets?: string[],
 *     notes?: string,
 *     theme?: "ocean"|"carbon"|"sunset"|"violet"|"forest",
 *     image?: boolean,
 *     imageSide?: "left"|"right",
 *     columns?: [{ title?: string, bullets?: string[] }]
 *   }
 * - assets: array of image URLs auto-discovered by App via import.meta.glob
 * - Random per-slide transition (fade | slideL | slideR | zoom), stable by index
 * - If slide.image === true, randomly pick an asset image and render as a large, faded panel
 *   on the side indicated by slide.imageSide. Text occupies the opposite side.
 * - Keyboard: ←/→ nav • F fullscreen • Space pause timer • T timer • B blackout • R reset • ? help • Esc exit
 */

const THEMES = {
  ocean:  "from-sky-200/40 via-cyan-200/30 to-indigo-200/30",
  carbon: "from-neutral-900/60 via-neutral-800/60 to-neutral-700/60",
  sunset: "from-rose-200/40 via-orange-200/40 to-amber-200/40",
  violet: "from-violet-200/40 via-fuchsia-200/40 to-pink-200/30",
  forest: "from-emerald-200/40 via-green-200/40 to-lime-200/30",
};

const TRANSITIONS = ["fade", "slideL", "slideR", "zoom"];

export default function Deck({ slides = [], assets = [], onExit, brand = "Deck" }) {
  const total = slides.length;
  const [idx, setIdx] = useState(0);
  const [sec, setSec] = useState(8 * 60);
  const [showTimer, setShowTimer] = useState(true);
  const [black, setBlack] = useState(false);
  const [help, setHelp] = useState(false);
  const runningRef = useRef(true);
  const rootRef = useRef(null);

  // Precompute a stable random choice per slide: transition + image index
  const plan = useMemo(() => {
    const seeded = [];
    for (let i = 0; i < total; i++) {
      // pseudo-stable picks based on index
      const tPick = TRANSITIONS[i % TRANSITIONS.length];
      const aPick = assets.length ? assets[i % assets.length] : null;
      seeded.push({ transition: tPick, asset: aPick });
    }
    return seeded;
  }, [total, assets]);

  // Countdown
  useEffect(() => {
    const id = setInterval(() => {
      if (runningRef.current) setSec((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // Keyboard
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight") setIdx((i) => Math.min(total - 1, i + 1));
      if (e.key === "ArrowLeft") setIdx((i) => Math.max(0, i - 1));
      if (e.key === "t" || e.key === "T") setShowTimer((v) => !v);
      if (e.key === "b" || e.key === "B") setBlack((v) => !v);
      if (e.key === "r" || e.key === "R") setSec(8 * 60);
      if (e.key === "f" || e.key === "F") toggleFullscreen(rootRef.current);
      if (e.key === "?") setHelp((v) => !v);
      if (e.key === " ") runningRef.current = !runningRef.current;
      if (e.key === "Escape") {
        if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
        onExit?.();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onExit, total]);

  const mm = String(Math.floor(sec / 60)).padStart(2, "0");
  const ss = String(sec % 60).padStart(2, "0");
  const s = slides[idx] || {};
  const themeKey = s.theme && THEMES[s.theme] ? s.theme : "sunset";
  const themeClass = THEMES[themeKey];

  // Transition mount effects
  const slideRef = useRef(null);
  useEffect(() => {
    const el = slideRef.current;
    if (!el) return;
    const kind = plan[idx]?.transition || "fade";
    // set initial state
    el.classList.remove("enter", "enterDone");
    el.classList.add("enter", kind);
    // Trigger transition to final state
    requestAnimationFrame(() => {
      el.classList.add("enterDone");
    });
    // Cleanup when leaving
    return () => {
      if (!el) return;
      el.classList.remove("enterDone");
    };
  }, [idx, plan]);

  return (
    <div
      className="deck-screen group/deck relative min-h-screen bg-neutral-950 text-white flex items-center justify-center px-4 py-6"
      ref={rootRef}
    >
      {/* background tint */}
      <div className="fixed inset-0 -z-10 bg-neutral-950" />

      {/* center stage */}
      <div className="relative w-full max-w-6xl xl:max-w-7xl min-h-[75vh]">
        {/* toolbar - only on hover/focus */}
        <div className="pointer-events-none absolute -top-4 left-0 right-0 z-30 flex items-center justify-between opacity-0 transition-opacity duration-200 group-hover/deck:opacity-100 group-focus-within/deck:opacity-100">
          <div className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur px-3 py-2 border border-white/10 shadow-lg">
            <span className="text-xs uppercase tracking-[0.12em] text-white/70">{brand}</span>
            <span className="pill">{idx + 1} / {total}</span>
          </div>
          <div className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur px-2 py-1 border border-white/10 shadow-lg">
            <ChromeButton onClick={() => setIdx((i) => Math.max(0, i - 1))}>← Prev</ChromeButton>
            <ChromeButton onClick={() => setIdx((i) => Math.min(total - 1, i + 1))}>Next →</ChromeButton>
            <ChromeButton onClick={() => setHelp((v) => !v)}>?</ChromeButton>
            <ChromeButton onClick={() => toggleFullscreen(rootRef.current)}>Full</ChromeButton>
            <ChromeButton onClick={() => setBlack((x) => !x)}>Black</ChromeButton>
            {typeof onExit === "function" && (
              <ChromeButton className="bg-rose-500/80 text-white border-rose-400/70 hover:shadow-rose-400/20" onClick={onExit}>Exit</ChromeButton>
            )}
          </div>
        </div>

        <div className="relative h-full rounded-[32px] overflow-hidden shadow-[0_25px_80px_-40px_rgba(0,0,0,0.8)] ring-1 ring-white/10 border border-white/10 bg-white/10 backdrop-blur-2xl">
          <div className={`absolute inset-0 bg-gradient-to-br ${themeClass}`} />
          <div className="absolute inset-0 bg-black/30" />

          {/* timer */}
          {showTimer && (
            <div className="absolute top-5 right-5 z-30 text-sm font-semibold bg-black/70 text-white px-3 py-1 rounded-full shadow-lg opacity-80 group-hover/deck:opacity-100 group-focus-within/deck:opacity-100">
              {mm}:{ss}
            </div>
          )}

          {/* slide stage */}
          <div className="relative z-10 w-full h-full">
            <div ref={slideRef} className="w-full h-full">
              <SlideCard slide={s} chosenAsset={chooseAssetForSlide(s, plan[idx]?.asset, assets)} />
            </div>
          </div>
        </div>

        {/* progress bar */}
        <div className="absolute -bottom-3 left-0 right-0 flex items-center gap-3 opacity-0 transition-opacity duration-200 group-hover/deck:opacity-100 group-focus-within/deck:opacity-100">
          <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-white/80" style={{ width: `${total ? ((idx + 1) / total) * 100 : 0}%` }} />
          </div>
          <div className="hidden md:flex items-center gap-1.5">
            {Array.from({ length: total }).map((_, i) => (
              <span
                key={i}
                className={`block rounded-full transition-all ${i === idx ? "w-2 h-2 bg-white" : "w-1.5 h-1.5 bg-white/40"}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Blackout & Help */}
      {black && <div className="fixed inset-0 bg-black z-40" onClick={() => setBlack(false)} />}
      {help && <Help onClose={() => setHelp(false)} />}
    </div>
  );
}

function ChromeButton({ children, className = "", ...rest }) {
  return (
    <button
      className={`px-3 py-1 rounded-full border border-white/20 bg-white/10 text-xs font-medium text-white/90 hover:bg-white/20 hover:border-white/30 transition ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

function SlideCard({ slide, chosenAsset }) {
  const {
    title = "",
    subtitle = "",
    body = "",
    bullets = [],
    notes = "",
    image = false,
    imageSide = "right",
    columns = [],
  } = slide || {};

  const hasCols = Array.isArray(columns) && columns.length > 0;
  const wantsImage = !!image && !!chosenAsset;

  // text block
  const TextBlock = (
    <div className="h-full p-8 md:p-12 flex flex-col justify-center gap-4 text-neutral-900">
      <div className="space-y-2">
        {title && <div className="text-4xl md:text-5xl font-extrabold tracking-tight drop-shadow-sm">{title}</div>}
        {subtitle && <div className="text-xl md:text-2xl text-neutral-700">{subtitle}</div>}
      </div>

      {body && <p className="text-lg md:text-xl leading-relaxed text-neutral-800">{body}</p>}

      {!!bullets.length && (
        <ul className="space-y-2 text-lg md:text-xl leading-relaxed list-disc pl-6 text-neutral-900">
          {bullets.map((b, i) => <li key={i}>{b}</li>)}
        </ul>
      )}

      {hasCols && (
        <div className="grid md:grid-cols-2 gap-6">
          {columns.map((col, i) => (
            <div key={i} className="rounded-2xl bg-white/70 backdrop-blur border border-black/5 p-4 shadow">
              {col.title && <div className="font-semibold mb-2 text-neutral-900">{col.title}</div>}
              {Array.isArray(col.bullets) && col.bullets.length > 0 && (
                <ul className="space-y-2 list-disc pl-5 text-neutral-900">
                  {col.bullets.map((x, j) => <li key={j}>{x}</li>)}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {notes ? <div className="mt-auto text-xs opacity-0">{notes}</div> : null}
    </div>
  );

  // image panel
  const ImagePanel = wantsImage ? (
    <div className="relative w-full h-full">
      <img
        src={chosenAsset}
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-70"
        draggable={false}
      />
      <div className="absolute inset-0 bg-white/25 backdrop-blur-sm" />
    </div>
  ) : (
    <div className="w-full h-full bg-white/20" />
  );

  const Body = wantsImage ? (
    <div className="w-full h-full grid grid-cols-1 md:grid-cols-2">
      {imageSide === "left" ? (
        <>
          <div className="h-full">{ImagePanel}</div>
          {TextBlock}
        </>
      ) : (
        <>
          {TextBlock}
          <div className="h-full">{ImagePanel}</div>
        </>
      )}
    </div>
  ) : (
    <div className="w-full h-full">{TextBlock}</div>
  );

  return (
    <div className="w-full h-full flex items-center justify-center p-6 md:p-10">
      <div className="w-full h-full max-w-6xl min-h-[80vh] rounded-[28px] bg-white/90 text-neutral-900 shadow-2xl overflow-hidden backdrop-blur-xl border border-black/5">
        {Body}
      </div>
    </div>
  );
}

function Help({ onClose }) {
  return (
    <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm grid place-items-center p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl" onClick={(e)=>e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Keyboard</h3>
          <button className="rounded px-2 py-1 border" onClick={onClose}>Close</button>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm opacity-95 mt-3">
          <div>← / → : Prev / Next</div><div>F : Fullscreen</div>
          <div>Space : Pause/Resume timer</div><div>T : Toggle timer</div>
          <div>B : Blackout</div><div>R : Reset 8:00</div>
          <div>? : Help</div><div>Esc : Exit</div>
        </div>
        <p className="text-xs opacity-70 mt-3">
          Put images in <code>src/assets</code>. Slides with <code>"image": true</code> will randomly show one.
        </p>
      </div>
    </div>
  );
}

function toggleFullscreen(el) {
  if (!el) return;
  if (!document.fullscreenElement) el.requestFullscreen?.().catch(() => {});
  else document.exitFullscreen?.().catch(() => {});
}

function chooseAssetForSlide(slide, preselected, allAssets) {
  if (!slide || !slide.image) return null;
  if (preselected) return preselected;
  if (!allAssets || !allAssets.length) return null;
  // fallback random
  const i = Math.floor(Math.random() * allAssets.length);
  return allAssets[i];
}

/* ──────────────────────────────────────────────────────────────────────────────
   Tiny CSS helpers (via utility classes)
   We simulate 4 transitions using class toggles (no Tailwind config needed).
   .enter: initial; .enterDone: final. We combine with kind classes.
────────────────────────────────────────────────────────────────────────────── */
const style = document.createElement("style");
style.innerHTML = `
.enter { opacity: 0; transform: none; }
.enter.enterDone { opacity: 1; transform: none; transition: all .45s cubic-bezier(.22,.65,.23,.99); }

.enter.fade { opacity: 0; }
.enter.fade.enterDone { opacity: 1; }

.enter.slideL { opacity: .001; transform: translateX(24px); }
.enter.slideL.enterDone { opacity: 1; transform: translateX(0); }

.enter.slideR { opacity: .001; transform: translateX(-24px); }
.enter.slideR.enterDone { opacity: 1; transform: translateX(0); }

.enter.zoom { opacity: 0; transform: scale(.985); }
.enter.zoom.enterDone { opacity: 1; transform: scale(1); }
`;
if (typeof document !== "undefined" && !document.getElementById("deck-inline-transitions")) {
  style.id = "deck-inline-transitions";
  document.head.appendChild(style);
}
