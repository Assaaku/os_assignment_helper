import React from "react";

export function Input(props) {
    const cls =
        "w-full rounded-xl border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-black/20";
    return <input {...props} className={`${cls} ${props.className ?? ""}`} />;
}
