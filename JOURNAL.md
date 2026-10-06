# JOURNAL r01-a1

Deadline 2026-10-07 15:56 UTC.

## 2026-10-06 15:56–16:05 UTC — research and pick
- Reddit blocks this machine's IP (both reading via JSON/old.reddit and agent-browser: "blocked by network security"). So "reply in the thread" on Reddit is impossible without Sami.
- HN Algolia readable; HN account signup form has no visible captcha.
- GitHub bounty / "would pay" issue space is flooded by AI agents (claude-code usage-limit threads with 1500 comments full of tool promoters; bounty boards with 1000+ claim comments). Dev tools for Claude Code: crowded, free alternatives everywhere. Dropped.
- Picked: **Hyperliquid → Koinly CSV exporter (PerpLedger)**. Why: buyers already hold stablecoins on Arbitrum (Hyperliquid bridge chain) so a crypto paywall is natural; public complaints exist (Koinly feedback board: "Hyperliquid: PNL trades are not imported", 13 votes, comments "they all failed"; "Enhanced Hyperliquid API Integration" request, Oct 2025); Hyperliquid API caps at 10k fills; US extension deadline Oct 15 is a timing hook. Fully client-side, verifiable on-chain payment (tx hash check via Arbitrum public RPC).
- Accepting USDC as well as USDT on Arbitrum because Hyperliquid users withdraw USDC. Same EOA receives both.

## 2026-10-06 ~16:05 UTC — shipped
- Live: https://swarm-t3.github.io/perpledger/ (repo swarm-t3/perpledger, Pages from docs/)
- Tested on a real market-maker address: 11,497 fills + 885 funding + 605 transfers → 741 Koinly rows (daily aggregation).

## 2026-10-06 16:10–16:25 UTC — analytics, repositioning, channels
- Public analytics: https://perpledger.goatcounter.com/ (dashboard set to "Anyone"; custom events: build, built, paywall, verify-attempt, paid, dl-*).
- Repositioned headline on Koinly's per-transaction pricing (Newbie 100 / Hodler 1k / Trader 3k / Pro 10k+ tx). Results panel shows "fills → tier" vs "CSV rows → tier". Test: 11,499 fills → 453 rows (Pro → Hodler).
- Guide page for search: /hyperliquid-koinly-csv.html; sitemap; IndexNow ping accepted (202).
- Submitted to HypurrCollective Hyperliquid ecosystem map (noteforms form, "saved your answers").
- Approvals filed: r01-a1-reddit-x-posts (Reddit blocked here), r01-a1-postal-address-for-outreach (CAN-SPAM footer before any cold email).
- Channel tests: HN "account creation disabled" from this IP; Medium Cloudflare-blocked; Discourse ID unreachable; dev.to needs OAuth; Bluesky reachable but the crypto-tax conversation there is bots. agent-browser default session is SHARED with other agents: always use AGENT_BROWSER_SESSION=r01a1.
- Koinly forum Hyperliquid threads are closed but show interest: 1,128 and 1,315 views (discuss.koinly.io/t/26508, /t/25597).

## Next
- Wait on approvals; meanwhile add CoinTracker/CoinLedger/Awaken formats? Only if traffic arrives. Keep looking for reachable channels.
