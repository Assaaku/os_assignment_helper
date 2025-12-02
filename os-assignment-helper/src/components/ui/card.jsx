import React from "react";

export function Card({ className = "", ...p }) {
    return <div className={`bg-[var(--card)] rounded-2xl shadow-sm border border-gray-200 ${className}`} {...p} />;
}

export function CardContent({ className = "", ...p }) {
    return <div className={`p-6 ${className}`} {...p} />;
}
