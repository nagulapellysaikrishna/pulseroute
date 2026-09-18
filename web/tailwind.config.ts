import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#09090b",
        foreground: "#f4f4f5",
        card: {
          DEFAULT: "#111115",
          foreground: "#fafafa",
          border: "#202027",
        },
        brand: {
          50: "#eef2ff",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
        },
        edge: {
          emerald: "#10b981",
          cyan: "#06b6d4",
          violet: "#8b5cf6",
          amber: "#f59e0b",
        }
      },
      fontFamily: {
        mono: ["var(--font-geist-mono)", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
