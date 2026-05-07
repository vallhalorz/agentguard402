"use client";

import { useEffect, useState } from "react";

type Verdict = "allow" | "warn" | "block";

type Signal = {
  id: string;
  type: string;
  severity: "info" | "low" | "medium" | "high" | "critical";
  title: string;
  rationale: string;
  fatf_reference?: string;
  fincen_reference?: string;
  mica_reference?: string;
  evidence_ids: string[];
  score_contribution: number;
};

type PreflightResponse = {
  verdict: Verdict;
  score: number;
  severity: "info" | "low" | "medium" | "high" | "critical";
  reasoning: string;
  signals: Signal[];
  metadata: {
    rule_pack_version: string;
    sdn_list_version: string;
    goldrush_api_version: string;
    generation_id: string;
    generated_at: string;
  };
  latency_ms: number;
};

const VERDICT_BG: Record<Verdict, string> = {
  allow: "bg-verdict-allow",
  warn: "bg-verdict-warn",
  block: "bg-verdict-block",
};
const VERDICT_BORDER: Record<Verdict, string> = {
  allow: "border-verdict-allow/40",
  warn: "border-verdict-warn/40",
  block: "border-verdict-block/50",
};
const VERDICT_LABEL: Record<Verdict, string> = {
  allow: "ALLOW",
  warn: "WARN",
  block: "BLOCK",
};

export default function Home() {
  const [chain, setChain] = useState("eth-mainnet");
  const [toAddress, setToAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PreflightResponse | null>(null);
  const [origin, setOrigin] = useState("https://agentguard402.vercel.app");

  useEffect(() => {
    if (typeof window !== "undefined") setOrigin(window.location.origin);
  }, []);

  async function check(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(
        `/api/screen?chain=${encodeURIComponent(chain)}&to_address=${encodeURIComponent(toAddress.trim())}`,
      );
      if (!res.ok) {
        const body = await res.text();
        throw new Error(body || `HTTP ${res.status}`);
      }
      const data: PreflightResponse = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-12">
      {/* Hero */}
      <section className="terminal-glow rounded-2xl px-6 py-12 sm:py-16 -mx-6 sm:mx-0 space-y-6">
        <div className="max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full bg-paper-100 border border-paper-200 px-3 py-1 text-xs text-ink-500">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
            <span>Live demo · Powered by Sentry402 risk engine · x402 on Base Sepolia</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-semibold tracking-tight leading-[1.05]">
            Don&apos;t let your agent
            <br />
            <span className="text-accent-dark">touch a sanctioned wallet.</span>
          </h1>
          <p className="text-ink-500 text-lg leading-relaxed max-w-2xl">
            One HTTP call before every transfer. AgentGuard402 returns{" "}
            <code className="hash text-sm bg-paper-100 px-1.5 py-0.5 rounded">allow</code>,{" "}
            <code className="hash text-sm bg-paper-100 px-1.5 py-0.5 rounded">warn</code>, or{" "}
            <code className="hash text-sm bg-paper-100 px-1.5 py-0.5 rounded">block</code> with a
            citation-bound reason — backed by the Sentry402 rule pack: OFAC SDN, drainer pattern,
            DPRK cluster, MiCA EMT compliance, issuer-frozen lists. Two cents per check, paid via
            x402.
          </p>
        </div>

        <div className="rounded-xl bg-ink-950 border border-ink-700 shadow-card overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2 border-b border-ink-800 bg-ink-900">
            <span className="h-2.5 w-2.5 rounded-full bg-verdict-block/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-verdict-warn/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-verdict-allow/70" />
            <span className="ml-2 text-xs text-ink-400 hash">agent.ts</span>
          </div>
          <pre className="hash text-xs sm:text-sm text-paper-50 p-5 leading-relaxed overflow-x-auto">
{`// before agent.transfer(toAddress, amountUsd):
const verdict = await fetch('${origin}/api/preflight', {
  method: 'POST',
  headers: { 'X-PAYMENT': await signX402Payment() },
  body: JSON.stringify({
    chain: 'eth-mainnet',
    to_address: toAddress,
    amount_usd: amountUsd,
  }),
}).then(r => r.json());

`}<span className="text-verdict-block">{`if (verdict.verdict === 'block') {
  console.error('blocked:', verdict.reasoning);
  return; // do NOT pay a sanctioned wallet
}`}</span>{`
${"\n"}// safe to proceed
await agent.transfer(toAddress, amountUsd);`}
          </pre>
        </div>
      </section>

      {/* Playground */}
      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Try it</h2>
            <p className="text-sm text-ink-500 mt-1">
              Paste a destination address. Free preview uses the same engine as the paid endpoint.
            </p>
          </div>
          <div className="text-xs text-ink-400">
            Free preview hits <code className="hash bg-paper-100 px-1.5 py-0.5 rounded">/api/screen</code>.
            Production agents call{" "}
            <code className="hash bg-paper-100 px-1.5 py-0.5 rounded">/api/preflight</code> with x402.
          </div>
        </div>

        <form
          onSubmit={check}
          className="rounded-xl border border-paper-200 bg-white p-5 shadow-card space-y-4"
        >
          <label className="block">
            <span className="text-xs uppercase tracking-wider text-ink-500 font-medium mb-2 block">
              Destination address
            </span>
            <div className="grid sm:grid-cols-[1fr_auto_auto] gap-3">
              <input
                type="text"
                value={toAddress}
                onChange={(e) => setToAddress(e.target.value)}
                placeholder="0x... — where your agent is about to send funds"
                required
                aria-label="Destination address"
                className="hash rounded-lg border border-paper-200 px-4 py-2.5 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition"
              />
              <select
                value={chain}
                onChange={(e) => setChain(e.target.value)}
                aria-label="Chain"
                className="rounded-lg border border-paper-200 px-3 py-2.5 bg-white cursor-pointer hover:border-ink-400 transition"
              >
                <option value="eth-mainnet">Ethereum</option>
                <option value="base-mainnet">Base</option>
                <option value="matic-mainnet">Polygon</option>
                <option value="bsc-mainnet">BNB Chain</option>
                <option value="arbitrum-mainnet">Arbitrum</option>
                <option value="optimism-mainnet">Optimism</option>
                <option value="solana-mainnet">Solana (advisory)</option>
              </select>
              <button
                type="submit"
                disabled={loading || !toAddress}
                className="rounded-lg bg-ink-900 text-paper-50 px-5 py-2.5 font-medium hover:bg-ink-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                {loading ? "Checking..." : "Pre-flight check"}
              </button>
            </div>
          </label>

          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wider text-ink-500 font-medium">
              Try a destination
            </p>
            <div className="flex flex-wrap gap-2">
              <DemoChip
                onPick={(a) => {
                  setToAddress(a);
                  setChain("eth-mainnet");
                }}
                addr="0xcB74874f1e06Fcf80A306e06e5379A44B488bA2D"
                tone="block"
                label="OFAC SDN (Amnokgang DPRK)"
                expected="block"
              />
              <DemoChip
                onPick={(a) => {
                  setToAddress(a);
                  setChain("eth-mainnet");
                }}
                addr="0xd04E33461FEA8302c5E1e13895b60cEe8AEfda7F"
                tone="block"
                label="OFAC SDN (Sim Hyon Sop)"
                expected="block"
              />
              <DemoChip
                onPick={(a) => {
                  setToAddress(a);
                  setChain("eth-mainnet");
                }}
                addr="0x28C6c06298d514Db089934071355E5743bf21d60"
                tone="allow"
                label="Binance 14 (CEX)"
                expected="allow"
              />
              <DemoChip
                onPick={(a) => {
                  setToAddress(a);
                  setChain("eth-mainnet");
                }}
                addr="0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"
                tone="allow"
                label="vitalik.eth"
                expected="allow"
              />
            </div>
          </div>
        </form>

        {error && (
          <div
            role="alert"
            className="rounded-lg border-l-4 border-signal-high bg-signal-high/5 p-4 text-sm text-ink-700"
          >
            <p className="font-medium text-signal-high">Pre-flight failed</p>
            <p className="mt-1 hash text-xs">{error}</p>
          </div>
        )}

        {result && <VerdictView r={result} />}
      </section>

      {/* x402 details */}
      <section className="rounded-xl border border-accent/20 bg-gradient-to-br from-paper-100 to-white p-6 space-y-3 shadow-card">
        <h2 className="text-sm uppercase tracking-wider text-ink-500 font-medium">
          x402 micropayment rail
        </h2>
        <p className="text-sm text-ink-700 leading-relaxed">
          AgentGuard402&apos;s production endpoint{" "}
          <code className="hash text-xs bg-paper-100 px-1.5 py-0.5 rounded">POST /api/preflight</code>{" "}
          is x402-gated at $0.02 USDC on Base Sepolia. No API key, no signup, no monthly contract.
          Agents wrap every outbound transfer in this call. At 5 transfers per minute that is
          $0.10 per agent per minute, or $144 per agent per day for round-the-clock coverage —
          orders of magnitude below the $30K/year compliance-tool floor.
        </p>
        <pre className="hash text-xs bg-ink-950 text-paper-50 border border-ink-700 rounded-lg p-4 overflow-x-auto leading-relaxed">
{`# 1. agent calls without payment → 402 with x402 spec body
curl -i -X POST '${origin}/api/preflight' \\
  -H 'content-type: application/json' \\
  -d '{"chain":"eth-mainnet","to_address":"0xcB74874f1e06Fcf80A306e06e5379A44B488bA2D"}'
# → HTTP/1.1 402 Payment Required

# 2. agent signs x402 payment, retries
curl -i -X POST '${origin}/api/preflight' \\
  -H 'content-type: application/json' \\
  -H 'X-PAYMENT: <signed-payment-payload>' \\
  -d '{"chain":"eth-mainnet","to_address":"0xcB74874f1e06Fcf80A306e06e5379A44B488bA2D"}'
# → HTTP/1.1 200 OK
# → { "verdict": "block", "score": 100, "severity": "critical",
#     "reasoning": "...", "signals": [...], "evidence": {...} }`}
        </pre>
        <p className="text-xs text-ink-400">
          Same testnet-honest framing as Sentry402: GoldRush&apos;s own x402 service is on Base
          Sepolia today, mainnet &ldquo;coming soon&rdquo; per their docs. We do not pretend
          testnet USDC is real settlement.
        </p>
      </section>
    </div>
  );
}

function DemoChip({
  onPick,
  addr,
  tone,
  label,
  expected,
}: {
  onPick: (s: string) => void;
  addr: string;
  tone: "allow" | "block";
  label: string;
  expected: Verdict;
}) {
  const cls =
    tone === "block"
      ? "bg-verdict-block/10 text-verdict-block border-verdict-block/30 hover:bg-verdict-block/15"
      : "bg-verdict-allow/10 text-verdict-allow border-verdict-allow/30 hover:bg-verdict-allow/15";
  return (
    <button
      type="button"
      onClick={() => onPick(addr)}
      title={addr}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition ${cls}`}
    >
      <span aria-hidden className="hash text-[11px] opacity-80">
        {addr.slice(0, 6)}...{addr.slice(-4)}
      </span>
      <span className="text-ink-700">{label}</span>
      <span className="text-ink-400">→ {expected}</span>
    </button>
  );
}

function VerdictView({ r }: { r: PreflightResponse }) {
  const v = r.verdict;
  return (
    <article className="space-y-4 animate-in fade-in duration-300">
      <header
        className={`rounded-xl border-l-4 ${VERDICT_BORDER[v]} bg-white p-6 shadow-card flex items-center justify-between gap-6 ${v === "block" ? "verdict-block-pulse" : ""}`}
      >
        <div className="flex items-center gap-5 flex-1 min-w-0">
          <div
            className={`inline-flex items-center justify-center h-16 w-16 rounded-full ${VERDICT_BG[v]} text-white shrink-0`}
          >
            {v === "block" && (
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z" />
              </svg>
            )}
            {v === "warn" && (
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8">
                <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
              </svg>
            )}
            {v === "allow" && (
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
            )}
          </div>
          <div className="min-w-0">
            <p
              className={`text-2xl sm:text-3xl font-bold tracking-tight ${
                v === "block"
                  ? "text-verdict-block"
                  : v === "warn"
                    ? "text-verdict-warn"
                    : "text-verdict-allow"
              }`}
            >
              {VERDICT_LABEL[v]}
            </p>
            <p className="text-xs uppercase tracking-wider text-ink-400 font-medium mt-1">
              severity {r.severity} · score {r.score}/100 · {r.latency_ms}ms · rule pack{" "}
              {r.metadata.rule_pack_version}
            </p>
            <p className="text-sm text-ink-700 mt-2 leading-relaxed">{r.reasoning}</p>
          </div>
        </div>
      </header>

      {r.signals.length > 0 && (
        <section className="space-y-2">
          <h3 className="text-xs uppercase tracking-wider text-ink-500 font-medium">
            Cited signals ({r.signals.length})
          </h3>
          <ul className="space-y-2">
            {r.signals.slice(0, 5).map((s) => (
              <li
                key={s.id}
                className="rounded-lg border border-paper-200 bg-white p-3 shadow-card"
              >
                <div className="flex items-center gap-2 flex-wrap text-xs">
                  <span className="uppercase tracking-wider font-semibold text-ink-700">
                    {s.severity}
                  </span>
                  <span className="hash text-ink-500">{s.type}</span>
                  <span className="ml-auto tabular-nums font-semibold text-ink-700">
                    +{s.score_contribution}
                  </span>
                </div>
                <p className="text-sm font-medium text-ink-900 mt-1">{s.title}</p>
                <p className="text-xs text-ink-500 mt-1 leading-relaxed line-clamp-3">
                  {s.rationale}
                </p>
              </li>
            ))}
          </ul>
          <p className="text-[11px] text-ink-400">
            Full signal list and citation-bound evidence available in the JSON response. See{" "}
            <a
              href="https://sentry402.vercel.app"
              target="_blank"
              rel="noreferrer"
              className="text-accent-dark hover:underline"
            >
              Sentry402
            </a>{" "}
            for the regulator-defensible audit view.
          </p>
        </section>
      )}
    </article>
  );
}
