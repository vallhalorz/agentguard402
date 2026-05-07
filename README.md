# AgentGuard402

[![Powered by Sentry402](https://img.shields.io/badge/engine-Sentry402-a8211b?style=flat-square)](https://sentry402.vercel.app)
[![x402 Protocol](https://img.shields.io/badge/x402-Base%20Sepolia-0d0d0d?style=flat-square)](https://x402.org)
[![Rule pack](https://img.shields.io/badge/rule__pack-0.3.0--mvp-3a5a40?style=flat-square)](./lib/rule-pack.ts)
[![Coverage](https://img.shields.io/badge/test--coverage-27%20wallets-3a5a40?style=flat-square)](./TESTING.md)

**An x402 firewall for AI agents. Two cents per pre-flight check between your agent and a sanctioned wallet.**

Built for the [Covalent GoldRush hackathon](https://earn.superteam.fun/listing/build-with-goldrush-track-powered-by-covalent), Compliance & Risk track. May 2026.

**Live demo:** <https://agentguard402.vercel.app>
**Repo:** <https://github.com/vallhalorz/agentguard402>
**Risk engine:** [Sentry402](https://sentry402.vercel.app)

## The problem

x402-paying AI agents make autonomous transfers to arbitrary wallets. Without pre-flight compliance, an agent can pay a sanctioned counterparty in milliseconds — exposing the agent's owner to OFAC secondary sanctions, MiCA penalties, and a SAR filing window measured in hours.

The DEV.to community wrote about this in March 2026 ([*Your x402 Agent Just Paid a Sanctioned Wallet. Now What?*](https://dev.to/petter-strale/your-x402-agent-just-paid-a-sanctioned-wallet-now-what-4d03)). AWS's x402 agentic-commerce blog explicitly recommends a `discover → COMPLIANCE CHECK → pay → get-data` pattern, but no one has shipped the compliance layer at the agent-affordable price point.

AgentGuard402 is that layer. One HTTP call before each transfer, $0.02 per call via x402.

## How it works

```
Your agent code
   ↓
   POST /api/preflight (x402-gated, $0.02)
   ↓
AgentGuard402 runs the destination through the Sentry402 risk engine
   ↓
   ↙ allow ↘ warn ↘ block
   ↓        ↓        ↓
   transfer queue   abort
```

The endpoint returns:

```json
{
  "verdict": "block",
  "score": 100,
  "severity": "critical",
  "reasoning": "Destination matched 2 critical-severity indicators...",
  "signals": [
    {
      "type": "ofac_direct_match",
      "title": "Subject wallet on active OFAC SDN list: Amnokgang...",
      "rationale": "...",
      "fatf_reference": "FATF Recommendation 6 ...",
      "fincen_reference": "FinCEN SAR Form 111 — Type 31y ..."
    }
  ],
  "evidence": { "ev_...": { "endpoint": "...", "tx_hashes": [...] } },
  "latency_ms": 1240,
  "metadata": {
    "rule_pack_version": "0.2.2-mvp",
    "sdn_list_version": "2026-05-07-dprk-mar2026",
    "stablecoin_registry_version": "2026-05-07-seed",
    "generation_id": "gen_..."
  }
}
```

The `verdict` field is the only thing your agent code needs to branch on. Everything else is for audit trail and downstream SAR exhibits.

## Verdict mapping

| Severity | Verdict | Recommended agent action |
|---|---|---|
| critical | `block` | Abort transfer. Do not retry. |
| high | `block` | Abort transfer. |
| medium | `warn` | Queue for human approval. |
| low | `allow` | Proceed normally. |
| info | `allow` | Proceed. |

## Integrate it

### TypeScript / JavaScript

```ts
async function safeTransfer(
  toAddress: string,
  amountUsd: number,
  chain = "eth-mainnet",
) {
  const verdict = await fetch("https://agentguard402.vercel.app/api/preflight", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "X-PAYMENT": await signX402Payment(),
    },
    body: JSON.stringify({ chain, to_address: toAddress, amount_usd: amountUsd }),
  }).then((r) => r.json());

  if (verdict.verdict === "block") {
    throw new Error(`AgentGuard blocked transfer: ${verdict.reasoning}`);
  }
  if (verdict.verdict === "warn") {
    await escalateToHuman(verdict);
    return;
  }
  return agent.transfer(toAddress, amountUsd);
}
```

### Demo CLI

```bash
# Block scenario — destination is OFAC SDN
npm run demo:block

# Allow scenario — destination is vitalik.eth
npm run demo:allow

# Custom destination
node agent/agentguard-cli.mjs 0xYourAddressHere
```

### Free public preview

Visit <https://agentguard402.vercel.app> and paste any destination. Free preview hits `/api/screen` (no payment required, same response shape as `/api/preflight`).

## Endpoints

| Endpoint | Method | Auth | Price | Purpose |
|---|---|---|---|---|
| `/api/screen` | GET | none | free | Free preview, used by the landing page |
| `/api/preflight` | POST | x402 | $0.02 USDC | Production agent endpoint |

## Risk engine

AgentGuard402 reuses the [Sentry402](https://sentry402.vercel.app) risk engine verbatim. As of rule pack **0.3.0-mvp** the 16 active rules are:

1. `ofac_direct_match` — destination on active OFAC SDN list
2. `sanctions_adjacency` — destination's counterparty on SDN list (deep-sweep + ERC-20 transfer sweep)
3. `sanctions_indirect_exposure` — **NEW** 2-hop materially-gated exposure via $1k+ flow counterparty
4. `stablecoin_dprk_cluster_proximity` — destination interacted with SB0416 DPRK USDT addresses
5. `stablecoin_non_cooperative_issuer` — A7A5 / sanctions-evasion-vehicle stablecoin holdings
6. `drainer_pattern` — ≥3 unlimited approvals to one spender
7. `stablecoin_issuer_frozen_match` — Tether/Circle/Paxos public freeze list match
8. `approval_value_at_risk` — active approvals exposing $1k+ USD
9. `stablecoin_velocity_typology` — DPRK IT-worker funnel pattern
10. `stablecoin_mica_emt_non_compliant` — MiCA EMT-unauthorized stablecoin holdings
11. `high_velocity` — >50 tx in 24h
12. `unlimited_approval` — outstanding uint256-max approvals
13. `fresh_wallet` — under 7 days old (true wallet age via getEarliestTransactionsForAddress)
14. `tornado_cash_historic_exposure` — historic mixer counterparty (informational)
15. `stablecoin_issuer_compliance` — informational stablecoin issuer profile
16. `coverage_advisory` — Solana coverage limitation notice

Every signal is citation-bound to specific GoldRush API calls and pinned dataset versions. See [lib/rule-pack.ts](./lib/rule-pack.ts) for weights and thresholds.

## Coverage matrix

`scripts/test-coverage.mjs` runs every entry in our SDN seed list plus a curated set of clean wallets (CEX hot wallets, vitalik.eth, protocol routers, token contracts) through the engine and writes a markdown report to [`TESTING.md`](./TESTING.md).

Cohorts:

- **Active OFAC SDN** — DPRK SB0416 (2026-03-12) + FATF-attributed Lazarus (ByBit 2025-02, Ronin Bridge 2022-04). Expected verdict: `block`.
- **Tornado Cash historic** — original 2022-08-08 OFAC EO 13694 designation, delisted 2025-03-21 per Texas Federal Court permanent injunction. Expected verdict: `allow` with `tornado_cash_historic_exposure` signal (informational).
- **Clean wallets** — high-profile named addresses; any non-`allow` verdict is recorded as a false positive.

Run it:

```bash
npm run test:coverage              # against production
npm run test:coverage:local        # against http://localhost:3001
SENTRY_MODE=1 AGENTGUARD_URL=https://sentry402.vercel.app npm run test:coverage
```

The script exits non-zero if any active SDN address was missed or any clean wallet false-positived — suitable for CI gating.

## Pricing

$0.02 USDC per pre-flight check on Base Sepolia (testnet for now, mainnet is coming via GoldRush x402). At 5 transfers per minute that is $0.10/agent/minute or about $144/agent/day for 24/7 coverage. Compare to Chainalysis KYT enterprise contracts at $20K–$100K/year.

## Local setup

```bash
cp .env.example .env.local
# Add GOLDRUSH_API_KEY=cqt_...
npm install
npm run dev
```

Open <http://localhost:3000>.

## Status

In active development for the May 2026 GoldRush hackathon. Submission deadline 2026-05-12.

## License

MIT (planned).
