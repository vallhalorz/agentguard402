import type { Config } from "tailwindcss";

/**
 * AgentGuard402 — editorial palette.
 *
 * Cream paper, near-black ink, single muted-red accent. Borrows from the
 * Financial Times "FT pink" reference column and reg-tech compliance docs:
 * a product that sits next to a SAR exhibit should not look like a marketing
 * landing page. We deliberately use only ONE accent color so the eye treats
 * `block` as the only visually-loud state — `allow` and `warn` recede.
 */
const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Ink: near-black for headlines, lighter shades for body and meta.
        ink: {
          950: "#0d0d0d",
          900: "#1a1a1a",
          800: "#2a2a2a",
          700: "#3d3d3d",
          600: "#5a5a5a",
          500: "#777777",
          400: "#9a9a9a",
          300: "#bdbdbd",
        },
        // Paper: cream, with two darker shades for cards and dividers.
        paper: {
          50: "#faf7f0",  // base background
          100: "#f3eee2", // card
          200: "#e8e0cb", // divider
          300: "#d6cbb0", // hairline
        },
        // Accent: deep editorial red used ONLY for block / critical / SDN cite.
        // Borrowed reference: the New York Times red used for breaking-news bands.
        accent: {
          DEFAULT: "#a8211b",
          dark:    "#7d1814",
          light:   "#fbeaea",
        },
        signal: {
          info: "#4b6584",
          low: "#5e7c5e",
          medium: "#a87800",
          high: "#a8211b",
          critical: "#7d1814",
        },
        verdict: {
          allow: "#3a5a40",   // muted forest, not bright
          warn: "#a87800",
          block: "#a8211b",
        },
      },
      fontFamily: {
        // Serif headlines: Newsreader from Google Fonts (Pradell-style book serif)
        serif: ['"Newsreader"', "Charter", "Georgia", "Times New Roman", "serif"],
        // Sans body: Inter
        sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
        // Mono: JetBrains Mono for code, addresses, metadata.
        mono: ['"JetBrains Mono"', "ui-monospace", "SF Mono", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      letterSpacing: {
        tighter: "-0.024em",
        tightest: "-0.04em",
      },
      boxShadow: {
        card: "0 1px 0 rgba(13, 13, 13, 0.04), 0 0 0 1px rgba(13, 13, 13, 0.05)",
        plate: "0 1px 0 rgba(13, 13, 13, 0.06), 0 0 0 1px rgba(13, 13, 13, 0.08)",
      },
      maxWidth: {
        column: "62rem", // narrower than max-w-6xl, more editorial
        prose: "44rem",
      },
    },
  },
  plugins: [],
};

export default config;
