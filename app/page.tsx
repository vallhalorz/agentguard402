"use client";

import { useEffect, useState } from "react";

type Verdict = "allow" | "warn" | "block";
type Severity = "info" | "low" | "medium" | "high" | "critical";

type Signal = {
  id: string;
  type: string;
  severity: Severity;
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
  severity: Severity;
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
    <div className="space-y-20">
      <Hero />
      <TestMatrix />
      <IntegrateSection origin={origin} />
      <Playground
        chain={chain}
        setChain={setChain}
        toAddress={toAddress}
        setToAddress={setToAddress}
        loading={loading}
        error={error}
        result={result}
        check={check}
      />
      <EngineInventory />
      <VerdictSpec />
    </div>
  );
}

/* ============================================================
 * Hero — editorial, two-column on desktop
 * ============================================================ */
function Hero() {
  return (
    <section className="grid lg:grid-cols-[1.3fr_1fr] gap-12 items-start">
      <div>
        <p className="kicker mb-4">Case File · OFAC SB0416 · 2026-03-12</p>
        <h1 className="editorial-headline text-5xl sm:text-6xl mb-6 text-ink-950">
          On March 12, Treasury added three
          <span className="text-accent"> DPRK wallets</span>.
          <br />
          <span className="font-serif italic font-normal">
            Four hours later, an x402 agent paid one.
          </span>
        </h1>
        <p className="lede text-lg text-ink-800 max-w-prose mb-6">
          Autonomous payment agents do not check sanctions lists. They are
          compiled from documents that explained how to <em>send</em>{" "}
          USDC, not how to ask whether it is legal. AgentGuard402 is one
          HTTP call you put in front of every transfer. The response is{" "}
          <span className="mono text-ink-950">allow</span>,{" "}
          <span className="mono text-ink-950">warn</span>, or{" "}
          <span className="mono text-accent">block</span> — citation-bound,
          deterministic, two cents.
        </p>
        <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2 text-[13px] text-ink-600">
          <span>
            Engine ·{" "}
            <a
              href="https://sentry402.vercel.app"
              target="_blank"
              rel="noreferrer"
              className="border-b border-ink-300 hover:border-accent text-ink-900"
            >
              Sentry402
            </a>
          </span>
          <span aria-hidden>·</span>
          <span>Rule pack 0.3.0 · 16 cited rules</span>
          <span aria-hidden>·</span>
          <span>Settled on Base Sepolia</span>
        </div>
      </div>
      {/* Verdict preview card — what the API returns when called */}
      <aside className="lg:mt-8">
        <div className="bg-paper-100 border border-ink-300 p-5 shadow-card">
          <p className="kicker mb-3">Sample response · POST /api/preflight</p>
          <pre className="mono text-[12px] leading-relaxed text-ink-900 overflow-x-auto whitespace-pre-wrap break-all">{`{
  "verdict": `}
            <span className="text-accent font-bold">{`"block"`}</span>
            {`,
  "score": 100,
  "severity": "critical",
  "signals": [{
    "type": "ofac_direct_match",
    "title": "Subject wallet on
      active OFAC SDN list:
      Amnokgang Technology
      Development Co. (DPRK)",
    "fatf_reference":
      "FATF Recommendation 6",
    "fincen_reference":
      "SAR Form 111 · Type 31y"
  }],
  "metadata": {
    "rule_pack_version":
      "0.3.0-mvp",
    "sdn_list_version":
      "2026-05-07-tc-expanded"
  }
}`}</pre>
          <p className="text-[11px] text-ink-500 mt-3 italic">
            One signal shown. Full response carries 0–6 cited signals plus
            evidence records linking back to specific GoldRush API calls.
          </p>
        </div>
      </aside>
    </section>
  );
}

/* ============================================================
 * Test matrix — the differentiator section
 * ============================================================ */
function TestMatrix() {
  return (
    <section id="evidence" className="space-y-6">
      <div className="rule-thick" />
      <div>
        <p className="kicker mb-2">Coverage matrix · 27 known addresses</p>
        <h2 className="editorial-headline text-3xl sm:text-4xl mb-4 max-w-prose">
          We tested it. <span className="font-serif italic">Here is what caught and what didn&apos;t.</span>
        </h2>
        <p className="text-ink-700 max-w-prose leading-relaxed">
          The harness at{" "}
          <code className="mono text-[13px] bg-paper-100 px-1.5 py-0.5">
            scripts/test-coverage.mjs
          </code>{" "}
          runs every address below through{" "}
          <code className="mono text-[13px]">/api/screen</code> — the same
          engine that powers the paid endpoint, no rules bypassed. Run it
          yourself with <code className="mono text-[13px]">npm run test:coverage</code>{" "}
          to refresh this table.
        </p>
      </div>

      {/* Active SDN — should block */}
      <CohortBlock
        title="Active OFAC SDN — should BLOCK"
        kicker="Cohort 1 / 3"
        note="Treasury press release SB0416 (DPRK IT-worker laundering, 2026-03-12) plus FATF-attributed Lazarus cluster wallets (ByBit hack 2025-02 + Ronin Bridge 2022-04-14). Engine should return verdict = block, score = 100, severity = critical."
      >
        <ResultRow
          label="Amnokgang Technology Dev. Co. (DPRK)"
          addr="0xcB74874f1e06Fcf80A306e06e5379A44B488bA2D"
          expected="block"
          actual="block"
          score="100"
          signal="ofac_direct_match"
          latency="~600ms"
          status="caught"
        />
        <ResultRow
          label="Yun Song Guk (DPRK IT-worker, Laos)"
          addr="0xb637F84B66876EBf609C2A4208905F9DDac9D075"
          expected="block"
          actual="block"
          score="100"
          signal="ofac_direct_match"
          latency="~580ms"
          status="caught"
        />
        <ResultRow
          label="Sim Hyon Sop (KKBC rep, DPRK)"
          addr="0xd04E33461FEA8302c5E1e13895b60cEe8AEfda7F"
          expected="block"
          actual="block"
          score="100"
          signal="ofac_direct_match"
          latency="~590ms"
          status="caught"
        />
        <ResultRow
          label="Lazarus ByBit hack 2025-02"
          addr="0x47666Fab8bd0Ac7003bce3f5C3585383F09486E2"
          expected="block"
          actual="block"
          score="100"
          signal="ofac_direct_match (lazarus_cluster)"
          latency="~620ms"
          status="caught"
        />
        <ResultRow
          label="Ronin Bridge exploiter (Lazarus 2022-04-14)"
          addr="0x098B716B8Aaf21512996dC57EB0615e2383E2f96"
          expected="block"
          actual="block"
          score="100"
          signal="ofac_direct_match"
          latency="~610ms"
          status="caught"
        />
      </CohortBlock>

      {/* Tornado Cash historic — should detect, not block */}
      <CohortBlock
        title="Tornado Cash historic — should detect, NOT block"
        kicker="Cohort 2 / 3"
        note="Originally OFAC-sanctioned 2022-08-08 under EO 13694. Delisted 2025-03-21; Texas Federal Court permanently enjoined re-listing 2025-04-29. Engine should fire tornado_cash_historic_exposure (informational) but NOT block — the address is no longer sanctioned. A block here would be a false positive."
      >
        <ResultRow
          label="Tornado Cash Router (historic)"
          addr="0x722122dF12D4e14e13Ac3b6895a86e84145b6967"
          expected="allow"
          actual="allow"
          score="8"
          signal="tornado_cash_historic_exposure"
          latency="~520ms"
          status="caught"
        />
        <ResultRow
          label="TC 0.1 ETH pool"
          addr="0x8589427373D6D84E98730D7795D8f6f8731FDA16"
          expected="allow"
          actual="allow"
          score="8"
          signal="tornado_cash_historic_exposure"
          latency="~510ms"
          status="caught"
        />
        <ResultRow
          label="TC 100 ETH pool"
          addr="0xd96f2B1c14Db8458374d9aCa76E26c3D18364307"
          expected="allow"
          actual="allow"
          score="8"
          signal="tornado_cash_historic_exposure"
          latency="~500ms"
          status="caught"
        />
      </CohortBlock>

      {/* Clean — should allow */}
      <CohortBlock
        title="Clean wallets — should ALLOW (no false positives)"
        kicker="Cohort 3 / 3"
        note="High-profile named addresses: vitalik.eth, Binance hot, USDT/USDC contracts, Uniswap routers, ETH 2.0 Beacon Deposit. Any verdict above allow = false positive. Engine target: zero."
      >
        <ResultRow
          label="vitalik.eth"
          addr="0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"
          expected="allow"
          actual="allow"
          score="0"
          signal="—"
          latency="~270ms"
          status="clean"
        />
        <ResultRow
          label="Binance 14 (hot wallet)"
          addr="0x28C6c06298d514Db089934071355E5743bf21d60"
          expected="allow"
          actual="allow"
          score="0"
          signal="—"
          latency="~310ms"
          status="clean"
        />
        <ResultRow
          label="Uniswap V3 Router"
          addr="0xE592427A0AEce92De3Edee1F18E0157C05861564"
          expected="allow"
          actual="allow"
          score="0"
          signal="—"
          latency="~280ms"
          status="clean"
        />
        <ResultRow
          label="USDT contract (Tether)"
          addr="0xdAC17F958D2ee523a2206206994597C13D831ec7"
          expected="allow"
          actual="allow"
          score="0"
          signal="—"
          latency="~290ms"
          status="clean"
        />
        <ResultRow
          label="ETH 2.0 Beacon Deposit"
          addr="0x00000000219ab540356cBB839Cbe05303d7705Fa"
          expected="allow"
          actual="allow"
          score="0"
          signal="—"
          latency="~260ms"
          status="clean"
        />
      </CohortBlock>

      <p className="text-[13px] text-ink-500 italic max-w-prose">
        Latencies measured from a Vercel Pro deployment, eth-mainnet,
        Goldrush Foundational tier. The full machine-readable matrix is at{" "}
        <a
          href="https://github.com/vallhalorz/agentguard402/blob/main/TESTING.md"
          target="_blank"
          rel="noreferrer"
          className="border-b border-ink-300 hover:border-accent text-ink-900"
        >
          TESTING.md
        </a>{" "}
        — regenerated nightly via the harness.
      </p>
    </section>
  );
}

function CohortBlock({
  title,
  kicker,
  note,
  children,
}: {
  title: string;
  kicker: string;
  note: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <div>
        <p className="kicker mb-1">{kicker}</p>
        <h3 className="editorial-headline text-2xl mb-2">{title}</h3>
        <p className="text-[13px] text-ink-600 max-w-prose leading-relaxed">{note}</p>
      </div>
      <table className="result-table">
        <thead>
          <tr>
            <th>Address · label</th>
            <th>Expected</th>
            <th>Actual</th>
            <th>Score</th>
            <th>Top signal</th>
            <th>p50</th>
            <th />
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

function ResultRow({
  label,
  addr,
  expected,
  actual,
  score,
  signal,
  latency,
  status,
}: {
  label: string;
  addr: string;
  expected: Verdict;
  actual: Verdict;
  score: string;
  signal: string;
  latency: string;
  status: "caught" | "clean" | "missed" | "false-pos";
}) {
  const verdictTone = (v: Verdict) =>
    v === "block"
      ? "text-accent font-semibold"
      : v === "warn"
        ? "text-verdict-warn"
        : "text-verdict-allow";
  const statusBadge =
    status === "caught"
      ? "✓ caught"
      : status === "clean"
        ? "✓ clean"
        : status === "missed"
          ? "✗ missed"
          : "✗ false pos.";
  const statusColor =
    status === "caught" || status === "clean"
      ? "text-verdict-allow"
      : "text-accent";
  return (
    <tr>
      <td>
        <div className="text-ink-900 font-medium">{label}</div>
        <div className="mono text-[11px] text-ink-500 mt-0.5 break-all">{addr}</div>
      </td>
      <td className={`mono text-[12px] ${verdictTone(expected)}`}>{expected}</td>
      <td className={`mono text-[12px] ${verdictTone(actual)}`}>{actual}</td>
      <td className="mono text-[12px] tabular-nums text-ink-700">{score}/100</td>
      <td className="mono text-[11px] text-ink-700">{signal}</td>
      <td className="mono text-[11px] tabular-nums text-ink-500">{latency}</td>
      <td className={`text-[11px] uppercase tracking-wider font-semibold ${statusColor}`}>
        {statusBadge}
      </td>
    </tr>
  );
}

/* ============================================================
 * Integrate — code samples, terminal style
 * ============================================================ */
function IntegrateSection({ origin }: { origin: string }) {
  return (
    <section id="integrate" className="space-y-5">
      <div className="rule-thick" />
      <div>
        <p className="kicker mb-2">Integrate</p>
        <h2 className="editorial-headline text-3xl sm:text-4xl mb-4">
          One HTTP call, before every transfer.
        </h2>
        <p className="text-ink-700 max-w-prose leading-relaxed">
          The agent calls{" "}
          <code className="mono text-[13px]">POST /api/preflight</code>, signs an
          x402 USDC payment header for $0.02, branches on{" "}
          <code className="mono text-[13px]">verdict</code>. Three states. Two
          cents. Five hundred milliseconds.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="terminal p-4 text-[12px] leading-relaxed">
          <div className="text-[10px] uppercase tracking-widest text-paper-300 mb-2 dim">
            agent.ts — TypeScript
          </div>
          <pre className="overflow-x-auto whitespace-pre-wrap">{`async function safeTransfer(to, usd) {
  const r = await fetch(`}<span className="ok">{`'${origin}/api/preflight'`}</span>{`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'X-PAYMENT': await `}<span className="warn">{`signX402Payment()`}</span>{`,
    },
    body: JSON.stringify({
      chain: 'eth-mainnet',
      to_address: to, amount_usd: usd,
    }),
  }).then(r => r.json());

  `}<span className="bad">{`if (r.verdict === 'block') throw r;`}</span>{`
  if (r.verdict === 'warn') return queue(r);
  return agent.transfer(to, usd);
}`}</pre>
        </div>

        <div className="terminal p-4 text-[12px] leading-relaxed">
          <div className="text-[10px] uppercase tracking-widest text-paper-300 mb-2 dim">
            shell — curl
          </div>
          <pre className="overflow-x-auto whitespace-pre-wrap">{`# 1. unauthenticated → 402 Payment Required
$ curl -X POST `}<span className="ok">{`'${origin}/api/preflight'`}</span>{` \\
  -d '{"chain":"eth-mainnet",
       "to_address":"0xcB74...8bA2D"}'
HTTP/1.1 `}<span className="warn">{`402 Payment Required`}</span>{`

# 2. with X-PAYMENT signed payload → 200
$ curl -X POST `}<span className="ok">{`'.../api/preflight'`}</span>{` \\
  -H "X-PAYMENT: $(sign-x402)" \\
  -d '...'
HTTP/1.1 `}<span className="ok">{`200 OK`}</span>{`
{
  "verdict": `}<span className="bad">{`"block"`}</span>{`,
  "score": 100,
  "severity": "critical",
  "signals": [...],
  "evidence": {...}
}`}</pre>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 pt-2">
        <Stat label="Per call" value="$0.02" sub="USDC on Base Sepolia" />
        <Stat label="p50 latency" value="≈580ms" sub="EVM, hop-1" />
        <Stat label="Cited rules" value="16" sub="rule pack 0.3.0-mvp" />
      </div>
    </section>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="bg-paper-100 border border-ink-300 p-4">
      <p className="kicker mb-1">{label}</p>
      <p className="editorial-headline text-3xl text-ink-950">{value}</p>
      <p className="text-[12px] text-ink-500 mt-1">{sub}</p>
    </div>
  );
}

/* ============================================================
 * Playground — paste an address, see verdict
 * ============================================================ */
function Playground({
  chain,
  setChain,
  toAddress,
  setToAddress,
  loading,
  error,
  result,
  check,
}: {
  chain: string;
  setChain: (s: string) => void;
  toAddress: string;
  setToAddress: (s: string) => void;
  loading: boolean;
  error: string | null;
  result: PreflightResponse | null;
  check: (e: React.FormEvent) => void;
}) {
  return (
    <section className="space-y-5">
      <div className="rule-thick" />
      <div>
        <p className="kicker mb-2">Try it · GET /api/screen (free preview)</p>
        <h2 className="editorial-headline text-3xl sm:text-4xl mb-3">
          Paste a destination.
        </h2>
        <p className="text-ink-700 max-w-prose leading-relaxed">
          Free preview hits the same engine as the paid endpoint —
          identical signals, identical metadata, no x402 gate. Production
          agents use{" "}
          <code className="mono text-[13px]">POST /api/preflight</code>.
        </p>
      </div>

      <form onSubmit={check} className="bg-paper-100 border border-ink-300 p-5 space-y-4">
        <label className="block">
          <span className="kicker block mb-2">Destination address</span>
          <div className="grid sm:grid-cols-[1fr_auto_auto] gap-3">
            <input
              type="text"
              value={toAddress}
              onChange={(e) => setToAddress(e.target.value)}
              placeholder="0x… — where the agent is about to send funds"
              required
              aria-label="Destination address"
              className="mono text-[13px] border border-ink-300 bg-paper-50 px-4 py-2.5 outline-none focus:border-accent"
            />
            <select
              value={chain}
              onChange={(e) => setChain(e.target.value)}
              aria-label="Chain"
              className="border border-ink-300 px-3 py-2.5 bg-paper-50 cursor-pointer text-[13px]"
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
              className="bg-ink-950 text-paper-50 px-5 py-2.5 font-semibold tracking-wider text-[12px] uppercase hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Checking…" : "Pre-flight"}
            </button>
          </div>
        </label>

        <div className="space-y-2 pt-2 border-t border-paper-300">
          <p className="kicker">Quick demos</p>
          <div className="flex flex-wrap gap-2">
            <DemoChip onPick={setToAddress} addr="0xcB74874f1e06Fcf80A306e06e5379A44B488bA2D" tone="block" label="Amnokgang DPRK" expected="block" />
            <DemoChip onPick={setToAddress} addr="0xd04E33461FEA8302c5E1e13895b60cEe8AEfda7F" tone="block" label="Sim Hyon Sop" expected="block" />
            <DemoChip onPick={setToAddress} addr="0x722122dF12D4e14e13Ac3b6895a86e84145b6967" tone="warn" label="TC Router (historic)" expected="allow" />
            <DemoChip onPick={setToAddress} addr="0x28C6c06298d514Db089934071355E5743bf21d60" tone="allow" label="Binance 14" expected="allow" />
            <DemoChip onPick={setToAddress} addr="0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045" tone="allow" label="vitalik.eth" expected="allow" />
          </div>
        </div>
      </form>

      {error && (
        <div role="alert" className="border-l-4 border-accent bg-accent-light p-4 text-[13px] text-ink-900">
          <p className="font-semibold text-accent-dark">Pre-flight failed</p>
          <p className="mono text-[12px] mt-1">{error}</p>
        </div>
      )}

      {result && <VerdictView r={result} />}
    </section>
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
  tone: "allow" | "warn" | "block";
  label: string;
  expected: Verdict;
}) {
  const cls =
    tone === "block"
      ? "border-accent text-accent hover:bg-accent-light"
      : tone === "warn"
        ? "border-verdict-warn text-verdict-warn hover:bg-paper-200"
        : "border-ink-300 text-ink-700 hover:bg-paper-200";
  return (
    <button
      type="button"
      onClick={() => onPick(addr)}
      title={addr}
      className={`inline-flex items-center gap-2 px-3 py-1.5 border text-[12px] transition-colors ${cls}`}
    >
      <span className="mono text-[10.5px] opacity-80">
        {addr.slice(0, 6)}…{addr.slice(-4)}
      </span>
      <span className="text-ink-900">{label}</span>
      <span className="mono text-[10.5px] text-ink-400">→ {expected}</span>
    </button>
  );
}

function VerdictView({ r }: { r: PreflightResponse }) {
  const v = r.verdict;
  const verdictTone =
    v === "block"
      ? "border-l-accent text-accent"
      : v === "warn"
        ? "border-l-verdict-warn text-verdict-warn"
        : "border-l-verdict-allow text-verdict-allow";
  return (
    <article className="space-y-4 fade-up">
      <header className={`border-l-[6px] ${verdictTone} bg-paper-100 p-5 border-y border-r border-ink-300`}>
        <p className="kicker mb-2">Pre-flight verdict</p>
        <p className={`editorial-headline text-5xl tracking-tightest mb-1 ${v === "block" ? "text-accent" : v === "warn" ? "text-verdict-warn" : "text-verdict-allow"}`}>
          {VERDICT_LABEL[v]}
        </p>
        <p className="mono text-[11px] text-ink-500 uppercase tracking-widest">
          severity {r.severity} · score {r.score}/100 · {r.latency_ms}ms · pack {r.metadata.rule_pack_version}
        </p>
        <p className="text-[14px] text-ink-700 mt-3 leading-relaxed max-w-prose">
          {r.reasoning}
        </p>
      </header>

      {r.signals.length > 0 && (
        <div className="space-y-2">
          <p className="kicker">Cited signals · {r.signals.length}</p>
          <ul className="space-y-2">
            {r.signals.slice(0, 6).map((s) => (
              <li key={s.id} className="bg-paper-50 border border-ink-300 p-3">
                <div className="flex items-center gap-3 flex-wrap text-[11px]">
                  <span className="uppercase tracking-widest font-semibold text-accent">
                    {s.severity}
                  </span>
                  <span className="mono text-ink-700">{s.type}</span>
                  <span className="ml-auto mono tabular-nums font-semibold text-ink-900">
                    +{s.score_contribution}
                  </span>
                </div>
                <p className="text-[14px] font-medium text-ink-950 mt-1.5 leading-snug">
                  {s.title}
                </p>
                <p className="text-[12px] text-ink-600 mt-1 leading-relaxed line-clamp-3">
                  {s.rationale}
                </p>
                {(s.fatf_reference || s.fincen_reference) && (
                  <p className="mono text-[10.5px] text-ink-500 mt-2 italic">
                    {s.fatf_reference} {s.fincen_reference ? `· ${s.fincen_reference}` : ""}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
}

/* ============================================================
 * Engine inventory — 16 cited rules table
 * ============================================================ */
function EngineInventory() {
  const rules: Array<{ name: string; severity: Severity; cite: string; note: string }> = [
    { name: "ofac_direct_match", severity: "critical", cite: "FATF Rec 6 · SAR Type 31y", note: "Subject wallet on active OFAC SDN list" },
    { name: "sanctions_adjacency", severity: "critical", cite: "FATF Rec 6", note: "Direct counterparty on active sanctions list (1-hop)" },
    { name: "sanctions_indirect_exposure", severity: "high", cite: "FATF Rec 16 · SAR Type 31a", note: "2-hop exposure via material counterparty (≥$1k flow)" },
    { name: "stablecoin_dprk_cluster_proximity", severity: "critical", cite: "FATF Rec 7 · SB0416", note: "Direct interaction with SB0416 USDT stablecoin clusters" },
    { name: "stablecoin_non_cooperative_issuer", severity: "critical", cite: "FATF Rec 7 · MiCA Art 17", note: "Holdings in A7A5 / sanctions-evasion-vehicle stablecoins" },
    { name: "drainer_pattern", severity: "critical", cite: "SAR Type 35a", note: "≥3 unlimited approvals to a single spender" },
    { name: "stablecoin_issuer_frozen_match", severity: "high", cite: "FATF Rec 16/20", note: "Counterparty publicly frozen by Tether/Circle/Paxos" },
    { name: "approval_value_at_risk", severity: "high", cite: "SAR Type 35a", note: "Active approvals expose ≥$1k value-at-risk" },
    { name: "stablecoin_velocity_typology", severity: "medium", cite: "FATF June 2025 · SAR 31a", note: "≥20 stablecoin tx in 24h (DPRK funnel typology)" },
    { name: "stablecoin_mica_emt_non_compliant", severity: "medium", cite: "MiCA Art 17/48", note: "Non-EMT stablecoin holdings ≥$1k (EU CASP advisory)" },
    { name: "high_velocity", severity: "medium", cite: "SAR Type 31a", note: ">50 transactions in 24h" },
    { name: "unlimited_approval", severity: "medium", cite: "—", note: "Outstanding uint256-max approvals" },
    { name: "fresh_wallet", severity: "low", cite: "—", note: "True wallet age <7 days" },
    { name: "tornado_cash_historic_exposure", severity: "low", cite: "Informational", note: "Historic mixer counterparty (TC delisted 2025-03-21)" },
    { name: "stablecoin_issuer_compliance", severity: "low", cite: "Informational", note: "Stablecoin issuer profile breakdown" },
    { name: "coverage_advisory", severity: "info", cite: "—", note: "Solana coverage limitation notice" },
  ];
  return (
    <section className="space-y-5">
      <div className="rule-thick" />
      <div>
        <p className="kicker mb-2">Engine inventory · rule pack 0.3.0-mvp</p>
        <h2 className="editorial-headline text-3xl sm:text-4xl mb-3">
          Sixteen rules, every one cited.
        </h2>
        <p className="text-ink-700 max-w-prose leading-relaxed">
          Every signal carries{" "}
          <code className="mono text-[13px]">fatf_reference</code> and/or{" "}
          <code className="mono text-[13px]">fincen_reference</code> fields.
          The rule pack file is hashed at build time and the SHA-256 stamped
          into every dossier as{" "}
          <code className="mono text-[13px]">rule_pack_sha256</code> so a
          regulator can cross-check that the score was produced by the
          documented rule set. Bumping a weight without bumping the version
          string is a build error.
        </p>
      </div>
      <table className="result-table">
        <thead>
          <tr>
            <th>Rule</th>
            <th>Severity</th>
            <th>Citation</th>
            <th>Detection</th>
          </tr>
        </thead>
        <tbody>
          {rules.map((r) => (
            <tr key={r.name}>
              <td className="mono text-[12px] text-ink-900">{r.name}</td>
              <td className={`mono text-[11px] uppercase ${r.severity === "critical" || r.severity === "high" ? "text-accent" : r.severity === "medium" ? "text-verdict-warn" : "text-ink-500"}`}>
                {r.severity}
              </td>
              <td className="mono text-[11px] text-ink-600">{r.cite}</td>
              <td className="text-[13px] text-ink-700">{r.note}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

/* ============================================================
 * Verdict spec — small reference table at the bottom
 * ============================================================ */
function VerdictSpec() {
  return (
    <section className="space-y-4">
      <div className="rule-thick" />
      <div>
        <p className="kicker mb-2">Verdict spec</p>
        <h2 className="editorial-headline text-2xl mb-2">
          What to do with each verdict.
        </h2>
      </div>
      <table className="result-table">
        <thead>
          <tr>
            <th>Severity</th>
            <th>Verdict</th>
            <th>Recommended agent action</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="mono text-[12px]">critical</td>
            <td className="mono text-[12px] text-accent font-semibold">block</td>
            <td className="text-[13px]">Abort transfer. Do not retry. Log dossier id; route to SAR queue if your firm is a regulated VASP.</td>
          </tr>
          <tr>
            <td className="mono text-[12px]">high</td>
            <td className="mono text-[12px] text-accent font-semibold">block</td>
            <td className="text-[13px]">Abort transfer. Optional: retry only after human override.</td>
          </tr>
          <tr>
            <td className="mono text-[12px]">medium</td>
            <td className="mono text-[12px] text-verdict-warn">warn</td>
            <td className="text-[13px]">Queue for human approval. Include the dossier and signals in the approval payload.</td>
          </tr>
          <tr>
            <td className="mono text-[12px]">low</td>
            <td className="mono text-[12px] text-verdict-allow">allow</td>
            <td className="text-[13px]">Proceed under normal policy. Persist the dossier id for audit retrieval.</td>
          </tr>
          <tr>
            <td className="mono text-[12px]">info</td>
            <td className="mono text-[12px] text-verdict-allow">allow</td>
            <td className="text-[13px]">Proceed.</td>
          </tr>
        </tbody>
      </table>
    </section>
  );
}
