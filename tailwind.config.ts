import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Developer-first palette: deep slate surface, electric cyan accent.
        // Distinct from Sentry402's gold/paper compliance-officer aesthetic
        // so the two products read as a family but distinct surfaces.
        ink: {
          950: "#020617",
          900: "#0b0f17",
          800: "#0f172a",
          700: "#1e293b",
          600: "#334155",
          500: "#475569",
          400: "#64748b",
          300: "#94a3b8",
        },
        paper: {
          50: "#fafaf7",
          100: "#f4f3ee",
          200: "#e7e5dc",
        },
        signal: {
          info: "#6366f1",
          low: "#10b981",
          medium: "#f59e0b",
          high: "#f97316",
          critical: "#dc2626",
        },
        verdict: {
          allow: "#10b981",
          warn: "#f59e0b",
          block: "#dc2626",
        },
        accent: {
          DEFAULT: "#06b6d4", // cyan-500
          dark: "#0e7490",
          light: "#67e8f9",
        },
        brand: {
          DEFAULT: "#0c4a6e", // sky-900
          light: "#0284c7",
        },
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto"],
        mono: ["ui-monospace", "SF Mono", "Menlo", "Monaco", "Consolas"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(2, 6, 23, 0.04), 0 4px 16px rgba(2, 6, 23, 0.06)",
        glow: "0 0 0 3px rgba(6, 182, 212, 0.18)",
      },
    },
  },
  plugins: [],
};

export default config;
