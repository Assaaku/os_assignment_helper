import React, { useEffect, useMemo, useRef, useState } from "react";

export default function Deck({ slides, slidesText, onExit, theme = "sunset", brand = "OS Assignment" }) {
  const [idx, setIdx] = useState(0);
  const [showTimer, setShowTimer] = useState(true);
  const [black, setBlack] = useState(false);
  const [sec, setSec] = useState(8 * 60);
  const [help, setHelp] = useState(false);
  const runningRef = useRef(true);
  const rootRef = useRef(null);

  const normalized = useMemo(() => {
    if (Array.isArray(slides)) return slides.map(structToSlideCard);
    return parseSlides(slidesText || "");
  }, [slides, slidesText]);

  const total = normalized.length;

  useEffect(() => {
    const n = Number(String(location.hash).replace("#", ""));
    if (!Number.isNaN(n) && n > 0 && n <= total) setIdx(n - 1);
  }, [total]);

  useEffect(() => {
    const id = setInterval(() => { if (runningRef.current) setSec(s => Math.max(0, s - 1)); }, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight" || e.key === "PageDown") setIdx(i => Math.min(total - 1, i + 1));
      if (e.key === "ArrowLeft"  || e.key === "PageUp")   setIdx(i => Math.max(0, i - 1));
      if (e.key === "t" || e.key === "T") setShowTimer(v => !v);
      if (e.key === "b" || e.key === "B") setBlack(v => !v);
      if (e.key === "r" || e.key === "R") setSec(8 * 60);
      if (e.key === "f" || e.key === "F") toggleFullscreen(rootRef.current);
      if (e.key === "?") setHelp(v => !v);
      if (e.key === " ") runningRef.current = !runningRef.current;
      if (e.key === "Escape") {
        if (document.fullscreenElement) document.exitFullscreen().catch(()=>{});
        onExit?.();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onExit, total]);

  useEffect(() => { location.hash = String(idx + 1); }, [idx]);

  const mm = String(Math.floor(sec / 60)).padStart(2, "0");
  const ss = String(sec % 60).padStart(2, "0");
  const s = normalized[idx] ?? emptySlide();

  const themeClass =
    s.tags.bg ? `theme-${s.tags.bg}` :
    theme === "ocean" ? "theme-ocean" :
    theme === "carbon" ? "theme-carbon" : "theme-sunset";

  const progress = total ? ((idx + 1) / total) * 100 : 0;

  return (
    <div className={`deck ${themeClass}`} ref={rootRef}>
      <div className="min-h-screen p-4 md:p-8">
        <div className="mx-auto max-w-6xl">
          {/* backdrop + chrome */}
          <div className="bg-grad rounded-2xl p-4 md:p-6 shadow-xl">
            <div className="topbar mb-3">
              <div className="opacity-90">{brand}</div>
              <div className="opacity-80">{idx + 1} / {total}</div>
            </div>
            <div className="progress mb-3"><div style={{ width: `${progress}%` }} /></div>

            <div className="w-full aspect-[16/9] bg-white/70 dark:bg-white/10 rounded-xl overflow-hidden">
              <SlideCard slide={s} />
            </div>

            <div className="bottombar mt-3">
              <div className="opacity-80">←/→ • Space • F • T • B • R • ? • Esc</div>
              <div className="opacity-80">{s.tags.layout ? `layout:${s.tags.layout}` : ""}</div>
            </div>
          </div>
        </div>
      </div>

      {showTimer && <div className="timer">{mm}:{ss}</div>}
      {help && <HelpOverlay onClose={() => setHelp(false)} />}
      {black && <div className="blackout" />}
    </div>
  );
}

/* ---------- Renderers ---------- */
function SlideCard({ slide }) {
  const { title, subtitle, blocks, tags } = slide;
  const hasSplit = tags.layout === "split" || blocks.some(b => b.type === "split");

  if (hasSplit) {
    const split = blocks.find(b => b.type === "split") || { left: [], right: [] };
    return (
      <div className="card">
        {title && <div className="title">{title}</div>}
        {subtitle && <div className="subtitle">{subtitle}</div>}
        <div className="grid grid-cols-2 gap-8 flex-1 mt-4">
          <ul className="bullets list-disc">{split.left.map((t,i)=><li key={i}>{t}</li>)}</ul>
          <ul className="bullets list-disc">{split.right.map((t,i)=><li key={i}>{t}</li>)}</ul>
        </div>
        {blocks.filter(b => b.type!=="split").map((b,i) => renderBlock(b,i))}
      </div>
    );
  }

  return (
    <div className="card">
      {title && <div className="title">{title}</div>}
      {subtitle && <div className="subtitle">{subtitle}</div>}
      {blocks.map((b,i)=>renderBlock(b,i))}
    </div>
  );
}

function renderBlock(b, i) {
  if (b.type === "bullets") return <ul key={i} className="bullets list-disc mt-4">{b.items.map((t,j)=><li key={j}>{t}</li>)}</ul>;
  if (b.type === "quote")   return <div key={i} className="quote mt-6">“{b.text}”</div>;
  if (b.type === "code")    return <pre key={i} className="mt-4 bg-neutral-900 text-white p-4 rounded-lg overflow-auto text-sm"><code>{b.code}</code></pre>;
  if (b.type === "image")   return <div key={i} className="imgwrap mt-4"><img alt={b.alt||""} src={b.src} /></div>;
  return null;
}

/* ---------- Helpers ---------- */
function HelpOverlay({ onClose }) {
  return (
    <div className="help" onClick={onClose}>
      <div className="box">
        <h2 className="text-2xl font-bold mb-2">Keyboard</h2>
        <div className="grid grid-cols-2 gap-2 text-sm opacity-95">
          <div>← / → : Prev / Next</div><div>F : Fullscreen</div>
          <div>Space : Pause/Resume timer</div><div>T : Toggle timer</div>
          <div>B : Blackout</div><div>R : Reset 8:00</div>
          <div>? : Help</div><div>Esc : Exit</div>
        </div>
        <h3 className="mt-4 font-semibold">Formatting</h3>
        <ul className="list-disc ml-6 mt-1 text-sm leading-relaxed">
          <li><code>#</code> title, <code>##</code> subtitle, <code>-</code> bullets</li>
          <li><code>::</code> between bullet groups → two columns</li>
          <li><code>&gt; </code> quote, <code>``` code ```</code> fenced code, <code>![alt](url)</code> image</li>
          <li>Per slide tags: <code>[bg=ocean]</code>, <code>[layout=split]</code></li>
        </ul>
        <p className="text-xs opacity-80 mt-3">Click anywhere to close.</p>
      </div>
    </div>
  );
}

function toggleFullscreen(el) {
  if (!el) return;
  if (!document.fullscreenElement) el.requestFullscreen?.().catch(()=>{});
  else document.exitFullscreen?.().catch(()=>{});
}

function emptySlide(){ return { title:"", subtitle:"", blocks:[], tags:{} }; }

/* Structured slide → normalized card */
function structToSlideCard(s) {
  const tags = s.tags || {};
  const blocks = [];
  if (s.columns && Array.isArray(s.columns)) {
    const left = s.columns[0]?.bullets || [];
    const right = s.columns[1]?.bullets || [];
    blocks.push({ type: "split", left, right });
  }
  if (s.bullets && s.bullets.length) {
    blocks.push({ type: "bullets", items: s.bullets });
  }
  if (s.body) {
    blocks.push({ type: "bullets", items: s.body.split("\n").map(x => x.trim()).filter(Boolean) });
  }
  return {
    title: s.title || "",
    subtitle: s.subtitle || "",
    blocks,
    tags: { layout: s.columns ? "split" : (s.tags?.layout || ""), bg: s.tags?.bg || "" }
  };
}

/* Markdown → normalized cards */
function parseSlides(text) {
  if (!text) return [];
  const pages = splitBySeparator(text);

  return pages.map(lines => {
    let title = "", subtitle = "";
    const tags = {};
    const blocks = [];
    let buf = [], inCode = false;

    // tags like [bg=ocean] [layout=split]
    if (lines.length && /^\[.*\]$/.test(lines[0].trim())) {
      const tagLine = lines.shift().trim();
      for (const chunk of tagLine.slice(1,-1).split(/\]\s*\[/)) {
        const [k,v] = chunk.split("=").map(s=>s.trim());
        if (k && v) tags[k] = v;
      }
    }
    if (lines[0]?.startsWith("# "))  title = lines.shift().replace(/^#\s*/,"" ).trim();
    if (lines[0]?.startsWith("## ")) subtitle = lines.shift().replace(/^##\s*/,"" ).trim();

    const left = [], right = [];
    let inSplit = false;

    const flushBullets = () => {
      if (!buf.length) return;
      if (inSplit) right.push(...buf);
      else blocks.push({ type: "bullets", items: [...buf] });
      buf = [];
    };

    for (const raw of lines) {
      const ln = raw.replace(/\t/g, "    ");
      if (/^```/.test(ln)) { // code fences
        inCode = !inCode;
        if (inCode) blocks.push({ type: "code", code: "" });
        continue;
      }
      if (inCode) {
        const last = blocks[blocks.length-1];
        last.code += (last.code ? "\n" : "") + ln;
        continue;
      }
      const img = ln.match(/^!\[(.*?)\]\((.+?)\)\s*$/);
      if (img) { flushBullets(); blocks.push({ type:"image", alt:img[1], src:img[2] }); continue; }
      if (/^\s*::\s*$/.test(ln)) { inSplit = true; if (buf.length) { left.push(...buf); buf=[]; } continue; }
      if (/^\s*>\s+/.test(ln)) { flushBullets(); blocks.push({ type:"quote", text: ln.replace(/^\s*>\s+/, "") }); continue; }
      if (/^\s*-\s+/.test(ln)) { buf.push(ln.replace(/^\s*-\s+/, "")); continue; }
      if (ln.trim()) buf.push(ln.trim());
    }
    flushBullets();
    if (inSplit || left.length || right.length) {
      blocks.unshift({ type: "split", left, right });
    }
    if (tags.layout === "split" && !blocks.some(b=>b.type==="split")) {
      blocks.unshift({ type:"split", left:[], right:[] });
    }
    return { title, subtitle, blocks, tags };
  });
}

function splitBySeparator(text) {
  const out = []; let cur = [];
  for (const line of text.split(/\r?\n/)) {
    if (/^\s*---\s*$/.test(line)) { out.push(cur); cur=[]; }
    else cur.push(line);
  }
  out.push(cur);
  return out.map(lines => lines.slice());
}
