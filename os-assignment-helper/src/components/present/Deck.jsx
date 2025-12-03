// src/components/present/Deck.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import "./deck.css";

/**
 * Presenter with:
 * - Non-overlapping top bar
 * - Rounded, “IG-post” stage (16:9) in center
 * - Themes: ocean | carbon | sunset | violet | forest
 * - Optional image per slide (random from /src/assets), left/right placement
 * - 4 transitions (fade, slide, zoom, flip) picked deterministically by index
 * - Keyboard: ←/→ next/prev • F fullscreen • B blackout • N notes • ? help • Esc exit
 */

const THEMES = {
  ocean:  "from-sky-50 via-cyan-50 to-indigo-50",
  carbon: "from-neutral-900 via-neutral-800 to-neutral-700 text-white",
  sunset: "from-rose-50 via-orange-50 to-amber-50",
  violet: "from-violet-50 via-fuchsia-50 to-pink-50",
  forest: "from-emerald-50 via-green-50 to-lime-50"
};

const COLOR_WASHES = [
  "from-white/70 via-white/60 to-white/40",
  "from-orange-50/80 via-amber-100/80 to-amber-200/60",
  "from-sky-50/80 via-cyan-100/70 to-indigo-100/60",
  "from-rose-50/80 via-pink-100/70 to-fuchsia-100/60",
  "from-emerald-50/80 via-green-100/70 to-lime-100/60",
  "from-slate-50/80 via-gray-100/70 to-slate-200/50",
  "from-purple-50/80 via-violet-100/70 to-indigo-100/60",
  "from-yellow-50/80 via-orange-100/70 to-amber-100/60",
  "from-cyan-50/80 via-sky-100/70 to-emerald-100/60",
  "from-neutral-50/80 via-stone-100/70 to-zinc-100/60"
];

const TRANSITIONS = ["fade", "slide", "zoom", "flip"];

function clsx(...xs) { return xs.filter(Boolean).join(" "); }

export default function Deck({ slides = [], assets = [], onExit, brand = "OS Assignment" }) {
  const [idx, setIdx] = useState(0);
  const [black, setBlack] = useState(false);
  const [help, setHelp] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [sec, setSec] = useState(8 * 60);
  const running = useRef(true);
  const wrap = useRef(null);

  const total = slides.length || 0;
  const slide = slides[idx] || {};

  // Timer
  useEffect(() => {
    const id = setInterval(() => { if (running.current) setSec(s => Math.max(0, s - 1)); }, 1000);
    return () => clearInterval(id);
  }, []);

  // Keys
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight" || e.key === "PageDown" || e.key === "Enter" || e.key === " ") { e.preventDefault(); next(); }
      if (e.key === "ArrowLeft"  || e.key === "PageUp") { e.preventDefault(); prev(); }
      if (e.key === "f" || e.key === "F") toggleFullscreen(wrap.current);
      if (e.key === "b" || e.key === "B") setBlack(v => !v);
      if (e.key === "n" || e.key === "N") setNotesOpen(v => !v);
      if (e.key === "?") setHelp(v => !v);
      if (e.key === "Escape") { if (document.fullscreenElement) document.exitFullscreen().catch(()=>{}); onExit?.(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onExit]);

  const prev = () => setIdx(i => Math.max(0, i - 1));
  const next = () => setIdx(i => Math.min(total - 1, i + 1));

  const mm = String(Math.floor(sec/60)).padStart(2, "0");
  const ss = String(sec%60).padStart(2, "0");
  const progress = total ? ((idx + 1) / total) * 100 : 0;

  // Stable random image per slide index
  const imageFor = (i) => (assets.length ? assets[i % assets.length] : null);

  // Chosen transition per slide
  const transitionName = TRANSITIONS[idx % TRANSITIONS.length];

  const colorWash = COLOR_WASHES[idx % COLOR_WASHES.length];

  return (
    <div className="group min-h-screen bg-black text-white relative" ref={wrap}>
      {/* Glass top bar (hidden until hover) */}
      <div className="fixed top-0 left-0 right-0 z-40 px-4 py-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto">
        <div className="mx-auto max-w-6xl flex items-center justify-between rounded-2xl border border-white/10 bg-white/15 backdrop-blur-xl shadow-lg px-4 py-2">
          <div className="text-sm font-semibold text-white/90">{brand}</div>
          <div className="flex items-center gap-2 text-sm">
            <button className="btn" onClick={prev}>← Prev</button>
            <button className="btn" onClick={next}>Next →</button>
            <button className="btn" onClick={() => setNotesOpen(v => !v)}>Notes</button>
            <button className="btn" onClick={() => setHelp(v => !v)}>?</button>
            <button className="btn" onClick={() => toggleFullscreen(wrap.current)}>Fullscreen</button>
            <button className="btn" onClick={() => setBlack(v => !v)}>Blackout</button>
            <div className="px-2 py-1 text-xs opacity-80 bg-white/10 rounded-lg">{idx + 1} / {total}</div>
            <button className="btn-danger" onClick={onExit}>Exit</button>
          </div>
        </div>
      </div>

      {/* Progress bar under top bar */}
      <div className="fixed top-[70px] left-0 right-0 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto">
        <div className="mx-auto max-w-6xl h-1 bg-white/10 rounded-full overflow-hidden">
          <div className="h-1 bg-white/80 transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Stage */}
      <div className="pt-[96px] pb-10">
        <div className="mx-auto w-[min(88vw,1150px)] h-[78vh] max-h-[720px] flex items-center justify-center">
          <div className="relative w-full h-full rounded-[22px] overflow-hidden shadow-[0_32px_95px_-42px_rgba(0,0,0,.7)] ring-1 ring-white/10">
            <div className={`absolute inset-0 bg-gradient-to-br ${colorWash}`} />
            <div className="absolute inset-0 bg-white/12" />
            <div className="relative w-full h-full flex items-center justify-center p-7 md:p-9">
              <div className="w-full h-full rounded-2xl overflow-hidden ring-1 ring-white/30 bg-white/70 text-neutral-900">
                <SlideView
                  key={idx}
                  slide={slide}
                  themeClass={THEMES[slide.theme] || THEMES.sunset}
                  assetUrl={slide.image ? imageFor(idx) : null}
                  transition={transitionName}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Timer pill */}
      <div className="fixed bottom-6 right-6 z-40">
        <div className="rounded-xl bg-white/15 text-white px-3 py-2 text-sm font-semibold shadow-lg">{mm}:{ss}</div>
      </div>

      {/* Overlays */}
      {black && <div className="fixed inset-0 bg-black z-50" onClick={() => setBlack(false)} />}
      {help && <Help onClose={() => setHelp(false)} />}
      <Notes open={notesOpen} onClose={() => setNotesOpen(false)} notes={slide?.notes} />
    </div>
  );
}

function SlideView({ slide, themeClass, assetUrl, transition }) {
  const tw = clsx(
    "w-full h-full bg-gradient-to-br",
    themeClass,
    "p-8 md:p-12 flex items-center justify-center",
    `transition-${transition}` // CSS in deck.css
  );

  const imageSide = slide?.imageSide === "left" ? "left" : "right";
  const hasImage = Boolean(assetUrl);

  if (hasImage) {
    const textFirst = imageSide === "right";
    return (
      <div className={tw}>
        <div className="w-full h-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center px-2 md:px-6">
          {textFirst ? <SlideText slide={slide} /> : <SlideImage src={assetUrl} />}
          {textFirst ? <SlideImage src={assetUrl} /> : <SlideText slide={slide} />}
        </div>
      </div>
    );
  }

  return (
    <div className={tw}>
      <div className="w-full max-w-4xl mx-auto flex flex-col h-full justify-center text-center">
        <Header slide={slide} />
        <Body slide={slide} />
      </div>
    </div>
  );
}

function Header({ slide }) {
  return (
    <div className="mb-6">
      {slide?.title && <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-center">{slide.title}</h1>}
      {slide?.subtitle && <h2 className="text-xl md:text-2xl opacity-80 mt-1 text-center">{slide.subtitle}</h2>}
    </div>
  );
}

function Body({ slide }) {
  return (
    <div className="flex-1">
      {slide?.body && <p className="max-w-3xl text-lg leading-relaxed mb-4 mx-auto text-center">{slide.body}</p>}
      {Array.isArray(slide?.bullets) && slide.bullets.length > 0 && (
        <ul className="space-y-3 text-lg leading-relaxed list-disc pl-6 text-left max-w-3xl mx-auto">
          {slide.bullets.map((b, i) => <li key={i}>{b}</li>)}
        </ul>
      )}
    </div>
  );
}

function SlideImage({ src }) {
  return (
    <div className="w-full h-full relative rounded-2xl overflow-hidden border border-black/15 shadow-2xl bg-black/30">
      <img src={src} alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-black/5 to-transparent" />
    </div>
  );
}

function SlideText({ slide }) {
  return (
    <div className="flex flex-col px-2 md:px-4 text-center">
      <Header slide={slide} />
      <Body slide={slide} />
    </div>
  );
}

function Help({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm grid place-items-center p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl" onClick={(e)=>e.stopPropagation()}>
        <h3 className="text-lg font-semibold mb-2">Keyboard</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>→ / Space / Enter : Next</div><div>← : Previous</div>
          <div>F : Fullscreen</div><div>B : Blackout</div>
          <div>N : Notes</div><div>? : Help</div>
          <div>Esc : Exit</div><div>8:00 timer auto-runs</div>
        </div>
      </div>
    </div>
  );
}

function Notes({ open, onClose, notes }) {
  return (
    <div className={clsx(
      "fixed bottom-0 left-0 right-0 z-40 transition-transform duration-300",
      open ? "translate-y-0" : "translate-y-full"
    )}>
      <div className="mx-auto max-w-5xl rounded-t-2xl bg-white border-t shadow-xl">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="text-sm font-medium">Speaker notes</div>
          <button className="btn" onClick={onClose}>Close</button>
        </div>
        <div className="px-4 pb-4">
          {notes ? <pre className="whitespace-pre-wrap text-sm leading-relaxed">{notes}</pre> : <div className="text-sm opacity-70">No notes</div>}
        </div>
      </div>
    </div>
  );
}

function toggleFullscreen(el) {
  if (!el) return;
  if (!document.fullscreenElement) el.requestFullscreen?.().catch(()=>{});
  else document.exitFullscreen?.().catch(()=>{});
}
