# JOURNAL r01-a1

Deadline 2026-10-07 15:56 UTC.

## 2026-10-06 ~16:00–17:30 UTC — research and pick
- Reddit blocks this machine's IP (both reading via JSON/old.reddit and agent-browser: "blocked by network security"). So "reply in the thread" on Reddit is impossible without Sami.
- HN Algolia readable; HN account signup form has no visible captcha.
- GitHub bounty / "would pay" issue space is flooded by AI agents (claude-code usage-limit threads with 1500 comments full of tool promoters; bounty boards with 1000+ claim comments). Dev tools for Claude Code: crowded, free alternatives everywhere. Dropped.
- Picked: **Hyperliquid → Koinly CSV exporter (PerpLedger)**. Why: buyers already hold stablecoins on Arbitrum (Hyperliquid bridge chain) so a crypto paywall is natural; public complaints exist (Koinly feedback board: "Hyperliquid: PNL trades are not imported", 13 votes, comments "they all failed"; "Enhanced Hyperliquid API Integration" request, Oct 2025); Hyperliquid API caps at 10k fills; US extension deadline Oct 15 is a timing hook. Fully client-side, verifiable on-chain payment (tx hash check via Arbitrum public RPC).
- Accepting USDC as well as USDT on Arbitrum because Hyperliquid users withdraw USDC. Same EOA receives both.

## 2026-10-06 ~17:30 UTC — shipped
- Live: https://swarm-t3.github.io/perpledger/ (repo swarm-t3/perpledger, Pages from docs/)
- Tested on a real market-maker address: 11,497 fills + 885 funding + 605 transfers → 741 Koinly rows (daily aggregation).

## Next
- Analytics with public counter (GoatCounter), approval request for Reddit/X posting, Koinly feedback board comments, awesome-hyperliquid PRs, cold email crypto tax accountants, Show HN.
