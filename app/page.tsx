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
      <ApiSection origin={origin} />
      <EngineInventory />
      <PricingStrip />
    </div>
  );
}

/* ============================================================
 * Pricing strip — compact 4-card row at the bottom
 * ============================================================ */
function PricingStrip() {
  return (
    <section className="space-y-5">
      <div className="rule-thick" />
      <div>
        <p className="kicker mb-2">Pricing</p>
        <h2 className="editorial-headline text-2xl sm:text-3xl mb-3">
          Two cents per call.
        </h2>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <PriceCard
          tier="Free preview"
          price="$0"
          priceTone="allow"
          includes="All 16 rules. Identical to paid response."
          bestFor="Evaluation, dev, landing page."
        />
        <PriceCard
          tier="Pre-flight"
          price="$0.02"
          priceUnit="/ call"
          priceTone="block"
          includes="x402-gated. 1-hop sweep + 2-hop material."
          bestFor="Production agent endpoint."
          highlight
        />
        <PriceCard
          tier="Audit dossier"
          tierLink={{ href: "https://sentry402.vercel.app", label: "↗ Sentry402" }}
          price="$0.05"
          priceUnit="/ dossier"
          priceTone="ink"
          includes="Full RiskDossier + holdings + counterparty graph + JSON/PDF."
          bestFor="Compliance officers, SAR exhibits."
        />
        <PriceCard
          tier="Enterprise"
          price="contract"
          priceTone="ink"
          includes="SLA, custom rule pack, SOC2 logs, dedicated capacity."
          bestFor="VASPs, regulated agent platforms."
        />
      </div>
    </section>
  );
}

function PriceCard({
  tier, tierLink, price, priceUnit, priceTone, includes, bestFor, highlight,
}: {
  tier: string;
  tierLink?: { href: string; label: string };
  price: string;
  priceUnit?: string;
  priceTone: "allow" | "block" | "ink";
  includes: string;
  bestFor: string;
  highlight?: boolean;
}) {
  const priceClass =
    priceTone === "allow"
      ? "text-verdict-allow"
      : priceTone === "block"
        ? "text-accent"
        : "text-ink-900";
  const cardClass = highlight
    ? "bg-paper-100 border-2 border-accent shadow-glow"
    : "bg-paper-100 border border-ink-300 glass";
  return (
    <div className={`${cardClass} p-4 flex flex-col`}>
      <p className="kicker mb-1.5 text-ink-500">{tier}</p>
      <div className="flex items-baseline gap-1.5 mb-3">
        <span className={`editorial-headline text-3xl ${priceClass}`}>
          {price}
        </span>
        {priceUnit && (
          <span className="mono text-[11px] text-ink-500">{priceUnit}</span>
        )}
      </div>
      <p className="text-[12px] text-ink-700 leading-relaxed mb-2 flex-1">
        {includes}
      </p>
      <p className="text-[11px] text-ink-500 italic leading-snug">{bestFor}</p>
      {tierLink && (
        <a
          href={tierLink.href}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-block text-[11px] mono text-ink-500 border-b border-ink-300 hover:border-accent self-start"
        >
          {tierLink.label}
        </a>
      )}
    </div>
  );
}

/* ============================================================
 * Hero — tightened. Two short paragraphs, one demo response.
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
          Autonomous payment agents do not check sanctions lists. AgentGuard402 is
          one HTTP call you put in front of every transfer — and the response is{" "}
          <span className="mono text-ink-950">allow</span>,{" "}
          <span className="mono text-ink-950">warn</span>, or{" "}
          <span className="mono text-accent">block</span>, citation-bound, two cents.
        </p>

        {/* Scope box — what it is / what it isn't */}
        <div className="grid sm:grid-cols-2 gap-4 mb-6 max-w-prose">
          <div className="border border-ink-300 bg-paper-100 p-4">
            <p className="kicker mb-2 text-verdict-allow">What it does</p>
            <ul className="text-[13px] text-ink-800 space-y-1 leading-snug">
              <li>· Pre-flight sanctions verdict</li>
              <li>· 16 cited rules · 1-hop sweep</li>
              <li>· 2-hop materially-gated exposure</li>
              <li>· Citation-bound reasoning artifact</li>
              <li>· Free preview at <code className="mono text-[12px]">/api/screen</code></li>
            </ul>
          </div>
          <div className="border border-ink-300 bg-paper-100 p-4">
            <p className="kicker mb-2 text-accent">What it doesn&apos;t</p>
            <ul className="text-[13px] text-ink-800 space-y-1 leading-snug">
              <li>· File SARs (regulator submission is on you)</li>
              <li>· Freeze funds (we have no custody)</li>
              <li>· Provide legal advice</li>
              <li>· Replace a full KYT vendor</li>
              <li>· Audit-grade dossiers (
                <a href="https://sentry402.vercel.app" target="_blank" rel="noreferrer" className="border-b border-ink-300 hover:border-accent">
                  Sentry402
                </a>
                )
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2 text-[13px] text-ink-600">
          <span>Rule pack 0.3.0 · 16 cited rules</span>
          <span aria-hidden>·</span>
          <span>Settled on Base Sepolia</span>
        </div>
      </div>
      <aside className="lg:mt-8">
        <div className="glass p-5 shadow-card">
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
      Amnokgang Tech. Co. (DPRK)",
    "fatf_reference":
      "FATF Recommendation 6"
  }],
  "metadata": {
    "rule_pack_version":
      "0.3.0-mvp",
    "rule_pack_sha256": "9c…f1",
    "sdn_list_version":
      "2026-05-07-tc-expanded"
  }
}`}</pre>
        </div>
      </aside>
    </section>
  );
}

/* ============================================================
 * Coverage matrix
 * ============================================================ */
function TestMatrix() {
  return (
    <section id="evidence" className="space-y-6">
      <div className="rule-thick" />
      <div>
        <p className="kicker mb-2">Coverage matrix · 13 representative · 28 in TESTING.md</p>
        <h2 className="editorial-headline text-3xl sm:text-4xl mb-3 max-w-prose">
          We tested it. <span className="font-serif italic">Here is what caught.</span>
        </h2>
        <p className="text-ink-700 max-w-prose leading-relaxed">
          Across all 28: <strong>12/12</strong> active SDN blocked,{" "}
          <strong>7/7</strong> historic mixers detected (informational),{" "}
          <strong>0/9</strong> false positives. Run{" "}
          <code className="mono text-[13px]">npm run test:coverage</code>{" "}
          to refresh; 13 representative rows shown below.
        </p>
      </div>

      <CohortBlock
        title="Active OFAC SDN — should BLOCK"
        kicker="Cohort 1 / 3 · DPRK SB0416 + Lazarus"
        badge="12 / 12 caught"
        badgeTone="block"
        defaultOpen
      >
        <ResultRow
          label="Amnokgang Technology Dev. Co. (DPRK)"
          addr="0xcB74874f1e06Fcf80A306e06e5379A44B488bA2D"
          expected="block" actual="block" score="100"
          signal="ofac_direct_match" latency="~600ms" status="caught"
        />
        <ResultRow
          label="Yun Song Guk (DPRK IT-worker, Laos)"
          addr="0xb637F84B66876EBf609C2A4208905F9DDac9D075"
          expected="block" actual="block" score="100"
          signal="ofac_direct_match" latency="~580ms" status="caught"
        />
        <ResultRow
          label="Sim Hyon Sop (KKBC rep, DPRK)"
          addr="0xd04E33461FEA8302c5E1e13895b60cEe8AEfda7F"
          expected="block" actual="block" score="100"
          signal="ofac_direct_match" latency="~590ms" status="caught"
        />
        <ResultRow
          label="Lazarus ByBit hack 2025-02"
          addr="0x47666Fab8bd0Ac7003bce3f5C3585383F09486E2"
          expected="block" actual="block" score="100"
          signal="ofac_direct_match" latency="~620ms" status="caught"
        />
        <ResultRow
          label="Ronin Bridge exploiter (Lazarus 2022-04-14)"
          addr="0x098B716B8Aaf21512996dC57EB0615e2383E2f96"
          expected="block" actual="block" score="100"
          signal="ofac_direct_match" latency="~610ms" status="caught"
        />
      </CohortBlock>

      <CohortBlock
        title="Tornado Cash historic — should DETECT, not block"
        kicker="Cohort 2 / 3 · delisted 2025-03-21"
        badge="7 / 7 detected"
        badgeTone="warn"
      >
        <ResultRow
          label="Tornado Cash Router (historic)"
          addr="0x722122dF12D4e14e13Ac3b6895a86e84145b6967"
          expected="allow" actual="allow" score="8"
          signal="tornado_cash_historic_exposure" latency="~520ms" status="caught"
        />
        <ResultRow
          label="TC 0.1 ETH pool"
          addr="0x8589427373D6D84E98730D7795D8f6f8731FDA16"
          expected="allow" actual="allow" score="8"
          signal="tornado_cash_historic_exposure" latency="~510ms" status="caught"
        />
        <ResultRow
          label="TC 100 ETH pool"
          addr="0xd96f2B1c14Db8458374d9aCa76E26c3D18364307"
          expected="allow" actual="allow" score="8"
          signal="tornado_cash_historic_exposure" latency="~500ms" status="caught"
        />
      </CohortBlock>

      <CohortBlock
        title="Clean wallets — should ALLOW"
        kicker="Cohort 3 / 3 · no false positives"
        badge="9 / 9 clean"
        badgeTone="allow"
      >
        <ResultRow
          label="vitalik.eth"
          addr="0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"
          expected="allow" actual="allow" score="0"
          signal="—" latency="~270ms" status="clean"
        />
        <ResultRow
          label="Binance 14 (hot wallet)"
          addr="0x28C6c06298d514Db089934071355E5743bf21d60"
          expected="allow" actual="allow" score="0"
          signal="—" latency="~310ms" status="clean"
        />
        <ResultRow
          label="Uniswap V3 Router"
          addr="0xE592427A0AEce92De3Edee1F18E0157C05861564"
          expected="allow" actual="allow" score="0"
          signal="—" latency="~280ms" status="clean"
        />
        <ResultRow
          label="USDT contract (Tether)"
          addr="0xdAC17F958D2ee523a2206206994597C13D831ec7"
          expected="allow" actual="allow" score="0"
          signal="—" latency="~290ms" status="clean"
        />
        <ResultRow
          label="ETH 2.0 Beacon Deposit"
          addr="0x00000000219ab540356cBB839Cbe05303d7705Fa"
          expected="allow" actual="allow" score="0"
          signal="—" latency="~260ms" status="clean"
        />
      </CohortBlock>

      <p className="text-[12px] text-ink-500 italic max-w-prose">
        Vercel Pro · Goldrush Foundational · eth-mainnet. Full machine-readable
        matrix:{" "}
        <a
          href="https://github.com/vallhalorz/agentguard402/blob/main/TESTING.md"
          target="_blank" rel="noreferrer"
          className="border-b border-ink-300 hover:border-accent text-ink-900"
        >
          TESTING.md
        </a>.
      </p>

      {/* Why not just the CDP Facilitator? — competitive frame */}
      <div className="border-l-[6px] border-l-ink-900 bg-paper-100 px-5 py-4 max-w-prose">
        <p className="kicker mb-1.5">Why not just the CDP Facilitator?</p>
        <p className="text-[14px] text-ink-800 leading-relaxed">
          Coinbase&apos;s CDP Facilitator blocks active OFAC SDN at the rails layer,
          for free. AgentGuard402 sits one layer up: multi-jurisdiction list coverage
          (FATF + OpenSanctions roadmap + issuer freeze events), 2-hop materially-gated
          counterparty exposure, and a citation-bound reasoning artifact a compliance
          officer can attach to a SAR exhibit. We catch the wallet that{" "}
          <em>funded</em> the SDN address — not just the SDN address itself. We do not
          replace the facilitator; we sit beside it.
        </p>
      </div>
    </section>
  );
}

function CohortBlock({
  title, kicker, children, badge, badgeTone, defaultOpen,
}: {
  title: string;
  kicker: string;
  children: React.ReactNode;
  badge?: string;
  badgeTone?: "block" | "warn" | "allow";
  defaultOpen?: boolean;
}) {
  const badgeClass =
    badgeTone === "block"
      ? "border-accent text-accent"
      : badgeTone === "warn"
        ? "border-verdict-warn text-verdict-warn"
        : "border-verdict-allow text-verdict-allow";
  return (
    <details
      open={defaultOpen}
      className="group border border-ink-300 bg-paper-100 [&_summary::-webkit-details-marker]:hidden"
    >
      <summary className="flex items-center gap-4 px-5 py-4 cursor-pointer list-none hover:bg-paper-200 transition-colors">
        {/* Chevron — rotates when open */}
        <svg
          className="h-3.5 w-3.5 text-ink-500 transition-transform duration-200 group-open:rotate-90 shrink-0"
          viewBox="0 0 12 12"
          fill="none"
          aria-hidden
        >
          <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div className="flex-1 min-w-0">
          <p className="kicker mb-0.5">{kicker}</p>
          <h3 className="editorial-headline text-xl sm:text-2xl leading-tight">{title}</h3>
        </div>
        {badge && (
          <span className={`mono text-[11px] uppercase tracking-widest font-semibold border px-2.5 py-1 ${badgeClass} bg-paper-50 shrink-0 hidden sm:inline-block`}>
            {badge}
          </span>
        )}
      </summary>
      <div className="px-5 pb-5 pt-1 border-t border-paper-300">
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
    </details>
  );
}

function ResultRow({
  label, addr, expected, actual, score, signal, latency, status,
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
    status === "caught" ? "✓ caught"
      : status === "clean" ? "✓ clean"
        : status === "missed" ? "✗ missed"
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
 * API — proper reference: endpoints, schema, errors, pricing,
 * list coverage, latency budget. The thing developers paste
 * into their docs.
 * ============================================================ */
function ApiSection({ origin }: { origin: string }) {
  return (
    <section id="api" className="space-y-8">
      <div className="rule-thick" />
      <div>
        <p className="kicker mb-2">API reference · v1</p>
        <h2 className="editorial-headline text-3xl sm:text-4xl mb-3">
          Two endpoints. <span className="font-serif italic">Same engine.</span>
        </h2>
        <p className="text-ink-700 max-w-prose leading-relaxed">
          Free preview for evaluation. x402-gated production endpoint for agents.
          Identical response shape — what you build against on the free tier
          works in production.
        </p>
      </div>

      {/* Endpoints table */}
      <div>
        <p className="kicker mb-2">Endpoints</p>
        <table className="result-table">
          <thead>
            <tr>
              <th>Method · Path</th>
              <th>Auth</th>
              <th>Price</th>
              <th>Use</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <span className="mono text-[12px] text-ink-900">GET /api/screen</span>
                <div className="text-[11px] text-ink-500 mt-0.5">
                  ?chain=eth-mainnet&amp;to_address=0x…
                </div>
              </td>
              <td className="text-[12px] text-ink-700">none</td>
              <td className="mono text-[12px] text-verdict-allow">free</td>
              <td className="text-[13px]">Evaluation, landing page, dev environment.</td>
            </tr>
            <tr>
              <td>
                <span className="mono text-[12px] text-ink-900">POST /api/preflight</span>
                <div className="text-[11px] text-ink-500 mt-0.5">
                  X-PAYMENT: &lt;signed x402 USDC&gt;
                </div>
              </td>
              <td className="mono text-[12px] text-ink-700">x402</td>
              <td className="mono text-[12px] text-accent">$0.02 USDC</td>
              <td className="text-[13px]">Production agent endpoint. Base Sepolia today.</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Request / response schemas */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div>
          <p className="kicker mb-2">Request body</p>
          <div className="terminal p-4 text-[12px] leading-relaxed">
            <pre className="overflow-x-auto whitespace-pre-wrap">{`POST /api/preflight
content-type: application/json
X-PAYMENT: <signed x402 USDC payload>

{
  "chain": `}<span className="ok">{`"eth-mainnet"`}</span>{`,
  "to_address": `}<span className="ok">{`"0xcB74…bA2D"`}</span>{`,
  "amount_usd": 50,
  "from_agent": "0x…"   `}<span className="dim">{`// optional, echoed`}</span>{`
}`}</pre>
          </div>
        </div>
        <div>
          <p className="kicker mb-2">Response (200)</p>
          <div className="terminal p-4 text-[12px] leading-relaxed">
            <pre className="overflow-x-auto whitespace-pre-wrap">{`{
  "verdict": `}<span className="bad">{`"block"`}</span>{` | "warn" | "allow",
  "score": 0..100,
  "severity": "info|low|medium|high|critical",
  "reasoning": "1-3 sentence summary",
  "signals": [Signal, …],
  "evidence": { "ev_…": Evidence },
  "metadata": {
    "rule_pack_version": "0.3.0-mvp",
    "rule_pack_sha256":  "9c…f1",
    "sdn_list_version":  "2026-05-07…"
  },
  "latency_ms": 580
}`}</pre>
          </div>
        </div>
      </div>

      {/* Status codes */}
      <div className="grid lg:grid-cols-[1fr_1fr] gap-8">
        <div>
          <p className="kicker mb-2">HTTP status codes</p>
          <table className="result-table">
            <thead>
              <tr>
                <th>Status</th>
                <th>Meaning</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="mono text-[12px] text-verdict-allow">200</td>
                <td className="text-[13px]">Verdict returned. Read <code className="mono text-[12px]">verdict</code> and branch.</td>
              </tr>
              <tr>
                <td className="mono text-[12px] text-verdict-warn">402</td>
                <td className="text-[13px]">Payment Required. Sign x402 USDC payload, retry.</td>
              </tr>
              <tr>
                <td className="mono text-[12px] text-verdict-warn">400</td>
                <td className="text-[13px]">Missing <code className="mono text-[12px]">chain</code> or <code className="mono text-[12px]">to_address</code>.</td>
              </tr>
              <tr>
                <td className="mono text-[12px] text-accent">500</td>
                <td className="text-[13px]">Engine or upstream GoldRush error. Retry with backoff.</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Latency budget */}
        <div>
          <p className="kicker mb-2">Latency budget</p>
          <table className="result-table">
            <thead>
              <tr>
                <th>Operation</th>
                <th>p50</th>
                <th>p95</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="text-[13px]">Direct OFAC SDN match</td>
                <td className="mono text-[12px] tabular-nums">≈50ms</td>
                <td className="mono text-[12px] tabular-nums">≈100ms</td>
              </tr>
              <tr>
                <td className="text-[13px]">1-hop deep + ERC-20 sweep</td>
                <td className="mono text-[12px] tabular-nums">≈580ms</td>
                <td className="mono text-[12px] tabular-nums">≈900ms</td>
              </tr>
              <tr>
                <td className="text-[13px]">2-hop material walk (≥$1k)</td>
                <td className="mono text-[12px] tabular-nums">+400ms</td>
                <td className="mono text-[12px] tabular-nums">+1.5s</td>
              </tr>
              <tr>
                <td className="text-[13px]">Solana (advisory only)</td>
                <td className="mono text-[12px] tabular-nums">≈200ms</td>
                <td className="mono text-[12px] tabular-nums">≈350ms</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* List coverage */}
      <div>
        <p className="kicker mb-2">Sanctions list coverage</p>
        <table className="result-table">
          <thead>
            <tr>
              <th>List</th>
              <th>Status</th>
              <th>Refresh</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="text-[13px] font-medium">OFAC SDN (US Treasury)</td>
              <td className="mono text-[11px] uppercase text-verdict-allow">active</td>
              <td className="mono text-[11px]">2026-05-07</td>
              <td className="text-[13px] text-ink-700">DPRK SB0416, Lazarus, Ronin Bridge.</td>
            </tr>
            <tr>
              <td className="text-[13px] font-medium">Tornado Cash historic</td>
              <td className="mono text-[11px] uppercase text-ink-500">informational</td>
              <td className="mono text-[11px]">delisted 2025-03-21</td>
              <td className="text-[13px] text-ink-700">Texas Federal Court enjoined re-listing 2025-04-29.</td>
            </tr>
            <tr>
              <td className="text-[13px] font-medium">FATF Targeted Updates</td>
              <td className="mono text-[11px] uppercase text-verdict-allow">active</td>
              <td className="mono text-[11px]">June 2025</td>
              <td className="text-[13px] text-ink-700">R.6, R.7, R.16 attribution sources.</td>
            </tr>
            <tr>
              <td className="text-[13px] font-medium">EU CFSP / UK OFSI / UN / MAS</td>
              <td className="mono text-[11px] uppercase text-verdict-warn">roadmap</td>
              <td className="mono text-[11px]">via OpenSanctions</td>
              <td className="text-[13px] text-ink-700">Most non-OFAC lists rarely contain crypto addresses; integrating for entity-name resolution.</td>
            </tr>
            <tr>
              <td className="text-[13px] font-medium">Issuer freeze (Tether/Circle/Paxos)</td>
              <td className="mono text-[11px] uppercase text-verdict-allow">active</td>
              <td className="mono text-[11px]">on-chain</td>
              <td className="text-[13px] text-ink-700">Public freeze events sweep at counterparty layer.</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Quick code copy block */}
      <div>
        <p className="kicker mb-2">Quick start · TypeScript</p>
        <div className="terminal p-4 text-[12px] leading-relaxed">
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
  if (r.verdict === 'warn') return queueForApproval(r);
  return agent.transfer(to, usd);
}`}</pre>
        </div>
      </div>

      {/* Verdict spec — what to do with each verdict */}
      <div>
        <p className="kicker mb-2">Verdict spec · agent action per severity</p>
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
              <td className="mono text-[12px] uppercase text-accent font-semibold">critical</td>
              <td className="mono text-[12px] text-accent font-semibold">block</td>
              <td className="text-[13px]">
                Abort transfer. Do not retry. Log <code className="mono text-[12px]">generation_id</code> and
                route to SAR queue if your firm is a regulated VASP.
              </td>
            </tr>
            <tr>
              <td className="mono text-[12px] uppercase text-accent">high</td>
              <td className="mono text-[12px] text-accent font-semibold">block</td>
              <td className="text-[13px]">Abort transfer. Optional: retry only after explicit human override.</td>
            </tr>
            <tr>
              <td className="mono text-[12px] uppercase text-verdict-warn">medium</td>
              <td className="mono text-[12px] text-verdict-warn">warn</td>
              <td className="text-[13px]">
                Queue for human approval. Attach the full dossier and signals to the
                approval payload — the reviewer needs the citation chain.
              </td>
            </tr>
            <tr>
              <td className="mono text-[12px] uppercase text-ink-500">low</td>
              <td className="mono text-[12px] text-verdict-allow">allow</td>
              <td className="text-[13px]">
                Proceed under normal policy. Persist <code className="mono text-[12px]">generation_id</code> for
                audit retrieval (FCA 2024 §3.4 reproducibility).
              </td>
            </tr>
            <tr>
              <td className="mono text-[12px] uppercase text-ink-500">info</td>
              <td className="mono text-[12px] text-verdict-allow">allow</td>
              <td className="text-[13px]">Proceed.</td>
            </tr>
          </tbody>
        </table>
        <p className="text-[12px] text-ink-500 italic mt-2 max-w-prose">
          Bias toward <span className="mono">warn</span> is intentional. FATF&apos;s
          risk-based approach and FinCEN April 2026 NPRM both prefer enhanced review
          over hard blocks at the medium tier — false positives have a real cost in
          agent-platform churn.
        </p>
      </div>
    </section>
  );
}

/* ============================================================
 * Playground
 * ============================================================ */
function Playground({
  chain, setChain, toAddress, setToAddress,
  loading, error, result, check,
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
    <section id="try" className="space-y-5">
      <div className="rule-thick" />
      <div>
        <p className="kicker mb-2">Try it · /api/screen (free)</p>
        <h2 className="editorial-headline text-3xl sm:text-4xl mb-2">
          Paste a destination.
        </h2>
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
              className="bg-accent text-ink-950 px-5 py-2.5 font-semibold tracking-wider text-[12px] uppercase hover:bg-accent-dark disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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
  onPick, addr, tone, label, expected,
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
      <header className={`border-l-[6px] ${verdictTone} bg-paper-100 p-5 border-y border-r border-ink-300 ${v === "block" ? "block-glow" : ""}`}>
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
 * Engine inventory
 * ============================================================ */
function EngineInventory() {
  const rules: Array<{ name: string; severity: Severity; cite: string; note: string }> = [
    { name: "ofac_direct_match", severity: "critical", cite: "FATF Rec 6 · SAR 31y", note: "Subject on active OFAC SDN list" },
    { name: "sanctions_adjacency", severity: "critical", cite: "FATF Rec 6", note: "Direct counterparty sanctioned (1-hop)" },
    { name: "sanctions_indirect_exposure", severity: "high", cite: "FATF Rec 16", note: "2-hop via material counterparty (≥$1k)" },
    { name: "stablecoin_dprk_cluster_proximity", severity: "critical", cite: "FATF Rec 7 · SB0416", note: "Direct interaction with SB0416 USDT clusters" },
    { name: "stablecoin_non_cooperative_issuer", severity: "critical", cite: "MiCA Art 17", note: "A7A5 / sanctions-evasion stablecoin holdings" },
    { name: "drainer_pattern", severity: "critical", cite: "SAR 35a", note: "≥3 unlimited approvals to one spender" },
    { name: "stablecoin_issuer_frozen_match", severity: "high", cite: "FATF Rec 16/20", note: "Counterparty frozen by Tether/Circle/Paxos" },
    { name: "approval_value_at_risk", severity: "high", cite: "SAR 35a", note: "Approvals expose ≥$1k value-at-risk" },
    { name: "stablecoin_velocity_typology", severity: "medium", cite: "FATF June 2025", note: "≥20 stablecoin tx in 24h (DPRK funnel)" },
    { name: "stablecoin_mica_emt_non_compliant", severity: "medium", cite: "MiCA Art 17/48", note: "Non-EMT stablecoin holdings ≥$1k" },
    { name: "high_velocity", severity: "medium", cite: "SAR 31a", note: ">50 transactions in 24h" },
    { name: "unlimited_approval", severity: "medium", cite: "—", note: "Outstanding uint256-max approvals" },
    { name: "fresh_wallet", severity: "low", cite: "—", note: "True wallet age <7 days" },
    { name: "tornado_cash_historic_exposure", severity: "low", cite: "informational", note: "Historic mixer (TC delisted 2025-03-21)" },
    { name: "stablecoin_issuer_compliance", severity: "low", cite: "informational", note: "Stablecoin issuer profile" },
    { name: "coverage_advisory", severity: "info", cite: "—", note: "Solana coverage limitation" },
  ];
  return (
    <section className="space-y-5">
      <div className="rule-thick" />
      <div>
        <p className="kicker mb-2">Engine · rule pack 0.3.0-mvp</p>
        <h2 className="editorial-headline text-3xl sm:text-4xl mb-3">
          Sixteen rules. <span className="font-serif italic">Every one cited.</span>
        </h2>
        <p className="text-ink-700 max-w-prose leading-relaxed">
          Rule pack file is hashed at build time, SHA-256 stamped into every
          dossier as <code className="mono text-[13px]">rule_pack_sha256</code>.
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
