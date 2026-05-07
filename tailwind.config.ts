import type { Config } from "tailwindcss";

/**
 * AgentGuard402 — dark editorial palette.
 *
 * Hybrid B: keeps the editorial typography stack (Newsreader serif, Inter,
 * JetBrains Mono) and the single-accent red, but flips to a near-black warm
 * dark surface. Inspired by altitude.xyz's dark + glassmorphism aesthetic
 * but anchored to compliance-tool seriousness via serif headlines and
 * citation-bound rationale chips.
 *
 * Token semantics (preserved from light mode):
 *   - `paper.*`  → SURFACES (page bg, card bg, dividers).
 *   - `ink.*`    → FOREGROUND (text). Higher number = higher contrast.
 *   - `accent.*` → block / critical / SDN cite signal.
 *
 * Existing classnames carry over because the tokens have the same semantic
 * roles in dark mode — they just point to different colors.
 */
const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // SURFACES — warm near-black, slightly olive-tinted (not pure cool grey).
        paper: {
          50:  "#0a0908",  // page background — near-black with cream undertone
          100: "#13110f",  // card background
          200: "#1d1a16",  // section divider bg
          300: "#2a2620",  // hairline border on dark
        },
        // FOREGROUND — cream-leaning whites at higher numbers (most contrast).
        ink: {
          950: "#faf7f0",  // brightest cream text (max contrast on dark)
          900: "#f0e9d8",  // primary text
          800: "#d8cdb3",  // strong secondary
          700: "#b8aa8c",  // mid-strong (body)
          600: "#968b75",  // body / quotes
          500: "#7a7163",  // meta, kicker, mono labels
          400: "#5a5249",  // muted
          300: "#3a352e",  // dividers / borders on dark
        },
        // ACCENT — slightly brighter red for visibility on near-black.
        accent: {
          DEFAULT: "#dc4a44",  // brighter than light-mode #a8211b for dark contrast
          dark:    "#a8211b",
          light:   "#1f0707",  // dark-red glow background for callouts
        },
        signal: {
          info: "#6c7a8e",
          low: "#7a9a78",
          medium: "#d4a017",
          high: "#dc4a44",
          critical: "#ef5a52",
        },
        verdict: {
          allow: "#7a9a78",   // muted forest, lighter for dark
          warn:  "#d4a017",   // gold
          block: "#dc4a44",   // editorial red, brighter for dark
        },
      },
      fontFamily: {
        serif: ['"Newsreader"', "Charter", "Georgia", "Times New Roman", "serif"],
        sans:  ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
        mono:  ['"JetBrains Mono"', "ui-monospace", "SF Mono", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      letterSpacing: {
        tighter:  "-0.024em",
        tightest: "-0.04em",
      },
      boxShadow: {
        // Subtle inner glow on cards in dark mode
        card:  "0 1px 0 rgba(220, 74, 68, 0.04), 0 0 0 1px rgba(255, 247, 240, 0.06), inset 0 1px 0 rgba(255, 247, 240, 0.02)",
        plate: "0 1px 0 rgba(220, 74, 68, 0.08), 0 0 0 1px rgba(255, 247, 240, 0.10)",
        glow:  "0 0 32px rgba(220, 74, 68, 0.18)",  // accent glow for block-state
      },
      maxWidth: {
        column: "62rem",
        prose:  "44rem",
      },
      backgroundImage: {
        // Subtle radial gradient — altitude.xyz-style depth without heavy gradient
        "hero-aura":
          "radial-gradient(ellipse 80% 60% at 70% 0%, rgba(220, 74, 68, 0.08), transparent 60%), radial-gradient(ellipse 60% 50% at 0% 100%, rgba(184, 170, 140, 0.04), transparent 60%)",
      },
    },
  },
  plugins: [],
};

export default config;
