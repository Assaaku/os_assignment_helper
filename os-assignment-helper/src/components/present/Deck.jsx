import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

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
  ocean:  "from-sky-50 via-cyan-50 to-indigo-50 text-neutral-900",
  carbon: "from-neutral-900 via-neutral-800 to-neutral-700 text-white",
  sunset: "from-rose-50 via-orange-50 to-amber-50 text-neutral-900",
  violet: "from-violet-50 via-fuchsia-50 to-pink-50 text-neutral-900",
  forest: "from-emerald-50 via-green-50 to-lime-50 text-neutral-900",
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
    <div className="min-h-screen" ref={rootRef}>
      {/* Background gradient per theme */}
      <div className={`fixed inset-0 -z-10 bg-gradient-to-br ${themeClass}`} />

      {/* Progress + top chrome */}
      <div className="fixed top-0 left-0 right-0 z-20 px-4 py-2 flex items-center justify-between bg-white/70 backdrop-blur border-b">
        <div className="text-sm font-medium">{brand}</div>
        <div className="flex items-center gap-3">
          <div className="text-sm opacity-80">{idx + 1} / {total}</div>
          <div className="w-36 h-1.5 bg-black/10 rounded overflow-hidden">
            <div
              className="h-full bg-black/70"
              style={{ width: `${total ? ((idx + 1) / total) * 100 : 0}%` }}
            />
          </div>
          <div className="hidden md:flex items-center gap-1.5">
            {Array.from({ length: total }).map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full ${i === idx ? "bg-black/70 w-2 h-2" : "bg-black/20"}`}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 rounded border" onClick={() => setIdx((i) => Math.max(0, i - 1))}>← Prev</button>
            <button className="px-3 py-1 rounded border" onClick={() => setIdx((i) => Math.min(total - 1, i + 1))}>Next →</button>
            <button className="px-3 py-1 rounded border" onClick={() => setHelp((v) => !v)}>?</button>
            <button className="px-3 py-1 rounded border" onClick={() => toggleFullscreen(rootRef.current)}>Fullscreen</button>
            <button className="px-3 py-1 rounded border" onClick={() => setBlack((x) => !x)}>Blackout</button>
            {typeof onExit === "function" && (
              <button className="px-3 py-1 rounded bg-rose-600 text-white" onClick={onExit}>Exit</button>
            )}
          </div>
        </div>
      </div>

      {/* Timer */}
      {showTimer && (
        <div className="fixed top-4 right-4 z-30 text-sm font-semibold bg-black/80 text-white px-3 py-1 rounded-full shadow">
          {mm}:{ss}
        </div>
      )}

      {/* Slide stage */}
      <div className="pt-16 pb-6 px-6">
        <div className="w-full grid place-items-center">
          <div className="w-full max-w-6xl aspect-[16/9] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-black/5 bg-white/40">
            <div ref={slideRef} className="w-full h-full">
              <SlideCard slide={s} chosenAsset={chooseAssetForSlide(s, plan[idx]?.asset, assets)} />
            </div>
          </div>
        </div>
      </div>

      {/* Blackout & Help */}
      {black && <div className="fixed inset-0 bg-black z-40" onClick={() => setBlack(false)} />}
      {help && <Help onClose={() => setHelp(false)} />}
    </div>
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
    <div className="h-full p-8 md:p-10 flex flex-col">
      <div className="mb-4">
        {title && <div className="text-4xl md:text-5xl font-extrabold tracking-tight">{title}</div>}
        {subtitle && <div className="text-xl md:text-2xl opacity-80 mt-1">{subtitle}</div>}
      </div>

      {body && <p className="text-lg md:text-xl leading-relaxed">{body}</p>}

      {!!bullets.length && (
        <ul className="mt-4 space-y-2 text-lg md:text-xl leading-relaxed list-disc pl-6">
          {bullets.map((b, i) => <li key={i}>{b}</li>)}
        </ul>
      )}

      {hasCols && (
        <div className="mt-6 grid md:grid-cols-2 gap-6">
          {columns.map((col, i) => (
            <div key={i} className="rounded-xl bg-white/60 backdrop-blur p-4 border border-black/10">
              {col.title && <div className="font-semibold mb-2">{col.title}</div>}
              {Array.isArray(col.bullets) && col.bullets.length > 0 && (
                <ul className="space-y-2 list-disc pl-5">
                  {col.bullets.map((x, j) => <li key={j}>{x}</li>)}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Notes exist but hidden during present; keep reserved space tiny if you want */}
      {notes ? <div className="mt-auto text-xs opacity-0">{notes}</div> : null}
    </div>
  );

  // image panel
  const ImagePanel = wantsImage ? (
    <div className="relative w-full h-full">
      {/* faded image background */}
      <img
        src={chosenAsset}
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-50"
        draggable={false}
      />
      <div className="absolute inset-0 bg-white/20 backdrop-blur-sm" />
    </div>
  ) : (
    <div className="w-full h-full bg-white/30" />
  );

  if (wantsImage) {
    // two-column layout: image | text OR text | image
    return (
      <div className="w-full h-full grid grid-cols-1 md:grid-cols-2">
        {imageSide === "left" ? (
          <>
            <div className="hidden md:block">{ImagePanel}</div>
            {TextBlock}
          </>
        ) : (
          <>
            {TextBlock}
            <div className="hidden md:block">{ImagePanel}</div>
          </>
        )}
      </div>
    );
  }

  // single column textual slide
  return (
    <div className="w-full h-full">{TextBlock}</div>
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
