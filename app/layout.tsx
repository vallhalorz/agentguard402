import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AgentGuard402 · An x402 firewall for AI agents",
  description:
    "Two cents per pre-flight check between your agent and a sanctioned wallet. One HTTP call before every transfer. Built on the Sentry402 risk engine.",
  metadataBase: new URL("https://agentguard402.vercel.app"),
  openGraph: {
    title: "AgentGuard402 · x402 firewall for AI agents",
    description:
      "One HTTP call between your agent and a sanctioned wallet. Pre-flight sanctions / drainer / DPRK screening at $0.02 per check on Base Sepolia.",
    url: "https://agentguard402.vercel.app",
    siteName: "AgentGuard402",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AgentGuard402",
    description:
      "x402 firewall for AI agents. $0.02 per pre-flight sanctions check.",
    creator: "@goldrushdev",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-paper-50 text-ink-900 antialiased">
        <header className="border-b border-paper-200 bg-paper-100 sticky top-0 z-10 backdrop-blur supports-[backdrop-filter]:bg-paper-100/85">
          <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
            <a href="/" className="flex items-center gap-3 group">
              <span
                aria-hidden
                className="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-gradient-to-br from-accent to-accent-dark shadow-sm"
              >
                <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                  <path
                    d="M12 2.5l7.5 3v6.4c0 4.6-3.2 8.7-7.5 9.9C7.7 20.6 4.5 16.5 4.5 11.9V5.5L12 2.5z"
                    fill="#020617"
                    fillOpacity="0.85"
                  />
                  <path
                    d="M8.5 13l1.6 1.7L15 9.6"
                    stroke="#fafaf7"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <div className="flex items-baseline gap-2">
                <span className="font-semibold tracking-tight text-base">AgentGuard402</span>
                <span className="text-xs text-ink-400 hidden sm:inline">
                  x402 firewall for AI agents
                </span>
              </div>
            </a>
            <div className="text-xs text-ink-400 flex items-center gap-3">
              <a
                href="https://github.com/vallhalorz/agentguard402"
                target="_blank"
                rel="noreferrer"
                className="hover:text-ink-900 transition"
              >
                GitHub
              </a>
              <span aria-hidden>·</span>
              <span>
                engine{" "}
                <a
                  href="https://sentry402.vercel.app"
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-accent-dark hover:text-accent transition-colors"
                >
                  Sentry402
                </a>
              </span>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
        <footer className="mx-auto max-w-6xl px-6 py-10 text-xs text-ink-400 border-t border-paper-200 mt-16 leading-relaxed">
          <p className="max-w-3xl">
            AgentGuard402 is a pre-flight sanctions firewall for AI agents that move funds. It does
            not provide legal advice, does not freeze funds, and does not contact regulators on
            your behalf. Risk verdicts are deterministic and citation-bound to specific GoldRush
            API calls and pinned dataset versions. Designed for the agentic-payments rails (x402,
            Coinbase Agent Kit, ElizaOS) where pre-procurement compliance review does not exist.
            Powered by the{" "}
            <a
              href="https://sentry402.vercel.app"
              target="_blank"
              rel="noreferrer"
              className="text-accent-dark hover:underline"
            >
              Sentry402
            </a>{" "}
            risk engine.
          </p>
        </footer>
      </body>
    </html>
  );
}
