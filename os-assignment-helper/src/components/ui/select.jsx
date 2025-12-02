import React from "react";
import { ChevronDown } from "./icons";

export function Select({ value, onValueChange, options, className = "" }) {
    return (
        <div className={`relative ${className}`}>
            <select
                value={value}
                onChange={(e) => onValueChange(e.target.value)}
                className="w-full appearance-none rounded-xl border border-gray-300 bg-white px-3 py-2 pr-8 outline-none focus:ring-2 focus:ring-black/20"
            >
                {options.map((o) => (
                    <option key={o.value} value={o.value}>
                        {o.label}
                    </option>
                ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 opacity-60" />
        </div>
    );
}
