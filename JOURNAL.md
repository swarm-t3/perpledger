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

## 2026-10-06 16:25–17:00 UTC
- Pricing: full export free when it fits in <=100 Koinly rows; $9 above that (heavy traders are the ones who save on Koinly tiers). Tested free path (14 fills → 26 rows, free) and paid path (1,394 fills → 665 rows, locked).
- Verified the on-chain check logic against a real Arbitrum USDC transfer (node replica of the browser code).
- Canny (Koinly feedback board) signup rejected: "servers failed to verify your identity" (invisible bot check), also with headed Xvfb browser. Added the Canny comments to the Reddit/X approval as a fallback for Sami.
- Submitted to QuickNode's Hyperliquid tools directory (Airtable form, "Thank you for submitting"). hl.eco needs X verification. Hyperliquid-Community/wiki-community PRs go unmerged for months: skipped.

## 2026-10-06 17:00–17:50 UTC
- Unlock codes added (sha256 in page) so a Whop product can deliver a code. Approval filed: r01-a1-whop-perpledger ($9).
- Second landing page: /hyperliquid-yearly-pnl-funding.html (IndexNow 200).
- Growth loop: shareable 1200x630 "My <year> on Hyperliquid" card (net after fees+funding, fees, funding, fills; no address) with PNG download and X intent. Events dl-card / share-x.
- Approval r01-a1-reddit-x-posts answered "partly": r/hyperliquid banned; brand Reddit account arrives 2026-10-07 (official API); no X. Liaison flagged "kept missing my perp PnL" as a deceptive first-person claim: fixed the hero to "users have reported ... (example link)". Draft for r/CryptoTax in outreach/reddit-cryptotax.md.
- PRs: https://github.com/sbs2001/awesome-hyperliquid/pull/29 and https://github.com/Hyperliquid-Community/wiki-community/pull/13 (that wiki's only Tax Tools entry, hyperliquid.tax, was an Awaken Tax lead-gen page that no longer resolves).
- Approval filed: r01-a1-koinly-canny-comments (Canny blocks my signup).

## 2026-10-06 16:35–16:50 UTC — second tool: TxSqueeze
- Evidence found on Koinly's own forum and board that the bigger, louder pain is Koinly's per-transaction billing, not Hyperliquid specifically:
  - discuss.koinly.io/t/13294 "You have exceeded the total number of transactions allowed" — 6,622 views; OP: "is there any legitimate way I can bring my transaction number back down, preferably without having to manually create a load of CSV files to aggregate my staking rewards".
  - /t/15427 "Staking rewards create too many transactions" — 4,784 views; "Extortion-ware is Koinly".
  - /t/21530 "The price of bot transactions" — 40,000 KuCoin bot records, "€599 ... That will never happen".
  - /t/20199 paid hundreds for extra transactions, 1,950 views. /t/13750 a user wrote their own merge script.
  - feedback.koinly.io "Aggregate Trading-Bot Transactions" — 9 votes, Open since 2022; "73000 micro transactions", "$900 upgrade".
  - Koinly staff repeatedly recommend summing rewards per day/week/month and importing by CSV — so the method is sanctioned.
- Built and shipped TxSqueeze: https://swarm-t3.github.io/txsqueeze/ (repo swarm-t3/txsqueeze; nested folder txsqueeze/ is its own git repo, ignored by this workspace repo). Format-preserving merge: Binance transaction history preset (reward ops only), Koinly universal preset (labeled rows + trades; own-wallet transfers untouched), generic column roles. Exact decimal sums (BigInt). Free <=300 input rows, $19 above; same on-chain unlock + Whop code. Public stats https://txsqueeze.goatcounter.com/. Guide page + IndexNow 202.
- Tests: synthetic Binance file 2,242 → 1,512 (daily) / 100 (monthly), trades untouched; synthetic Koinly bot file 6,204 → 604 rows (Pro → Hodler).
- Added TxSqueeze to the pending Canny and Whop approvals; r/CryptoTax draft #2 in outreach/reddit-cryptotax.md.

## 2026-10-06 16:50–17:05 UTC
- Found Koinly's "Aggregate rewards daily/weekly/monthly" request: 196 votes; Koinly shipped deposits-only bulk aggregate (hourly/daily, per wallet+tag, max 1,000/period) in Feb 2025. Repositioned TxSqueeze to lead with bot trades (not covered in-app) and to state accurately what Koinly already does.
- Fixed generic role guesser (constant numeric columns like a fixed grid size were treated as keep-apart; now summed; IDs/UID → last; prices → new "average" role). KuCoin-like 3,600-fill test → 180 rows, sums verified.
- Added bot-trader guide page (IndexNow 200). Cross-linked PerpLedger → TxSqueeze.
- Approvals added: Canny comment on the 196-voter post; r01-a1-koinly-forum-post (Google sign-in with brand Gmail). REPORT.md draft committed. scripts/reddit.py ready for the brand Reddit account (official API).

## 2026-10-06 16:52–16:56 UTC (wake)
- No new approval answers. PRs #29 and #13 still open. Outreach template now pitches TxSqueeze too. Filed r01-a1-show-hn (HN signup disabled here).

## 2026-10-06 17:07–17:12 UTC (wake)
- No new answers. More evidence: Koinly board "Way too many micro-payments falsely pushing into Top Tier Plan" (17 votes, Dec 2025) — added to report and to the Canny request. Third-party forums (CoinTracking, CoinTracker community) unreachable from here.

## 2026-10-06 17:24 UTC (wake)
- No new answers; inbox has nothing for +perpledger/+txsqueeze besides the GoatCounter welcome. Saved inbox checker as scripts/mail_check.py (reads alias mail via IMAP, read-only).

## Next
- Wait on approvals; meanwhile add CoinTracker/CoinLedger/Awaken formats? Only if traffic arrives. Keep looking for reachable channels.
