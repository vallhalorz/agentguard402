import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AgentGuard402 — A pre-flight sanctions firewall for AI agents",
  description:
    "An x402-priced HTTP firewall that sits between an AI agent and the wallet it's about to pay. Two cents per call, citation-bound verdict, regulator-defensible audit trail.",
  metadataBase: new URL("https://agentguard402.vercel.app"),
  openGraph: {
    title: "AgentGuard402 — A pre-flight sanctions firewall for AI agents",
    description:
      "Two cents per pre-flight check. Citation-bound. Block before the transfer, not after the SAR.",
    url: "https://agentguard402.vercel.app",
    siteName: "AgentGuard402",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AgentGuard402",
    description:
      "x402 firewall for AI agents. $0.02 per pre-flight sanctions check. Citation-bound.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-paper-50 text-ink-900">
        {/* Masthead — newspaper-style, full bleed, no logo gradients */}
        <header className="border-b-2 border-ink-900 bg-paper-50 sticky top-0 z-10 backdrop-blur supports-[backdrop-filter]:bg-paper-50/90">
          <div className="mx-auto max-w-column px-6 py-3 flex items-baseline justify-between gap-6">
            <a href="/" className="group flex items-baseline gap-3">
              <span className="editorial-headline text-xl tracking-tighter">
                AgentGuard
                <span className="text-accent">402</span>
              </span>
              <span className="hidden sm:inline text-[11px] mono text-ink-500 uppercase tracking-widest">
                Vol. 1, № 1 · 2026-05-07
              </span>
            </a>
            <nav className="flex items-baseline gap-5 text-[12px] uppercase tracking-widest text-ink-700">
              <a href="#evidence" className="hover:text-accent transition-colors">
                Evidence
              </a>
              <a href="#integrate" className="hover:text-accent transition-colors">
                Integrate
              </a>
              <a
                href="https://github.com/vallhalorz/agentguard402"
                target="_blank"
                rel="noreferrer"
                className="hover:text-accent transition-colors"
              >
                Source
              </a>
            </nav>
          </div>
          {/* Sub-rule */}
          <div className="mx-auto max-w-column px-6">
            <div className="rule-thin" />
            <div className="flex items-center justify-between text-[11px] mono text-ink-500 py-1.5 uppercase tracking-widest">
              <span>An x402 firewall for AI agents</span>
              <span className="hidden md:inline">
                Engine ·{" "}
                <a
                  href="https://sentry402.vercel.app"
                  target="_blank"
                  rel="noreferrer"
                  className="text-ink-700 hover:text-accent border-b border-ink-300"
                >
                  Sentry402
                </a>
              </span>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-column px-6 py-12">{children}</main>

        <footer className="mx-auto max-w-column px-6 pt-12 pb-16 border-t border-ink-900 mt-20">
          <div className="rule-thick mb-6" />
          <div className="grid sm:grid-cols-3 gap-8 text-[13px] text-ink-700 leading-relaxed">
            <div>
              <p className="kicker mb-2">Colophon</p>
              <p>
                Set in <span className="font-serif italic">Newsreader</span>,
                Inter, and JetBrains Mono. Built for the Covalent GoldRush
                hackathon, Compliance &amp; Risk track. May 2026.
              </p>
            </div>
            <div>
              <p className="kicker mb-2">Disclaimer</p>
              <p>
                AgentGuard402 does not provide legal advice. Verdicts are
                deterministic and citation-bound, but a verdict alone is not a
                SAR. The regulator-defensible audit lives at{" "}
                <a
                  href="https://sentry402.vercel.app"
                  target="_blank"
                  rel="noreferrer"
                  className="border-b border-ink-300 hover:border-accent"
                >
                  Sentry402
                </a>
                .
              </p>
            </div>
            <div>
              <p className="kicker mb-2">Reproducibility</p>
              <p>
                Every dossier carries a <span className="mono text-ink-900">rule_pack_sha256</span>{" "}
                and a pinned{" "}
                <span className="mono text-ink-900">sdn_list_version</span> per
                FCA 2024 §3.4 (regulated firms must document which platform
                version produced each compliance decision).
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
