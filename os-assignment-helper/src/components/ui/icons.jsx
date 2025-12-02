import React from "react";

export const Info = (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={`h-5 w-5 ${p.className||""}`}>
        <circle cx="12" cy="12" r="9" strokeWidth="2" />
        <path d="M12 8h.01M11 11h2v5h-2z" strokeWidth="2" />
    </svg>
);
export const Check = Info;
export const Clock = Info;
export const Play = Info;
export const Pause = Info;
export const RotateCcw = Info;
export const Upload = Info;

export const ChevronDown = (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={p.className}>
        <path d="m6 9 6 6 6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
