import React from "react";

export function Button({ variant = "primary", size = "md", className = "", ...p }) {
    const base = "rounded-2xl font-medium transition active:scale-[.98]";
    const sizes = size === "sm" ? "px-3 py-1.5 text-sm" : "px-4 py-2";
    const variants =
        variant === "secondary"
            ? "bg-gray-100 hover:bg-gray-200"
            : variant === "ghost"
                ? "hover:bg-gray-100"
                : "bg-black text-white hover:bg-gray-800";
    return <button className={`${base} ${sizes} ${variants} ${className}`} {...p} />;
}
