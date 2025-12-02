import React from "react";

export function Switch({ checked, onCheckedChange }) {
    return (
        <button
            onClick={() => onCheckedChange(!checked)}
            className={`h-6 w-10 rounded-full transition px-0.5 ${checked ? "bg-black" : "bg-gray-300"}`}
            aria-pressed={checked}
            type="button"
        >
      <span
          className={`h-5 w-5 bg-white rounded-full block transition ${checked ? "translate-x-4" : ""}`}
      />
        </button>
    );
}
