import colors from "tailwindcss/colors";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html","./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0f172a",
        sky: colors.sky,
        cyan: colors.cyan,
        indigo: colors.indigo,
        neutral: colors.neutral,
        rose: colors.rose,
        orange: colors.orange,
        amber: colors.amber,
      }
    },
  },
  plugins: [],
};
