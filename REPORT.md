# REPORT r01-a1

Status: DRAFT, updated through the round. Last update: 2026-10-06 ~17:00 UTC.

## Idea

Crypto tax software (Koinly especially) bills by transaction count and handles some sources badly. Two sharp, browser-only tools that fix specific, publicly documented complaints, paid in stablecoins on Arbitrum (or a Whop unlock code once approved):

1. **TxSqueeze**: merges trading-bot fills and daily reward rows into one row per day/week/month before import, keeping the file's own format. Evidence:
   - Koinly feature request "Aggregate rewards transactions daily/weekly/monthly": **196 votes** (https://feedback.koinly.io/feature-requests/p/aggregate-rewards-transactions-dailyweeklymonthly). Koinly shipped a partial fix in Feb 2025 (deposits only, hourly/daily, one wallet+tag at a time, https://support.koinly.io/en/articles/10441670-bulk-aggregate-deposit-transactions); later comments on the request say it didn't work for them or that they still merge by hand.
   - "Aggregate Trading-Bot Transactions": 9 votes, open since 2022; "73000 micro transactions from my $100 experiments", "$900 upgrade" (https://feedback.koinly.io/feature-requests/p/aggregate-trading-bot-transactions).
   - Koinly forum: "You have exceeded the total number of transactions allowed" 6,622 views, OP asks for exactly this tool (https://discuss.koinly.io/t/13294); "Staking rewards create too many transactions" 4,784 views, "Extortion-ware is Koinly" (/t/15427); "The price of bot transactions" 40,000 KuCoin bot records, "€599 … That will never happen" (/t/21530); a user wrote their own merge script (/t/13750).
   - Still live after Koinly's partial fix: "Way too many micro-payments falsely pushing into Top Tier Plan", 17 votes, Dec 2025; a commenter says the tax report costs more than a year of staking profit (https://feedback.koinly.io/feature-requests/p/way-too-many-micro-payments-falsely-pushing-into-top-tier-plan).
   - Koinly support itself recommends summing per day/week/month (/t/15427, /t/13294), so the method is sanctioned.
2. **PerpLedger**: Hyperliquid fills, funding and transfers → Koinly universal CSV with derivatives labels, rolled into daily rows; free yearly PnL/fees/funding summary and a shareable year card. Evidence: Koinly board "Hyperliquid: PNL trades are not imported" (13 votes; "they all failed"), "Hyperliquid support please" (15 votes), "spot↔perp transfers imported" (10 votes); Koinly forum Hyperliquid threads with 1,128 and 1,315 views; four CPA firms publish Hyperliquid tax guides (they serve these traders); Hyperliquid's API caps fill history at 10,000.

## What I shipped

| What | URL | How to verify |
|---|---|---|
| TxSqueeze (live tool, paywall, guides) | https://swarm-t3.github.io/txsqueeze/ | Drop any Binance transaction-history or Koinly CSV; guides at /reduce-koinly-transaction-count.html and /koinly-trading-bot-transactions.html |
| TxSqueeze repo | https://github.com/swarm-t3/txsqueeze | Source of the page; `docs/app.js` holds the merge engine and the on-chain payment check |
| PerpLedger (live tool, paywall, guides) | https://swarm-t3.github.io/perpledger/ | Paste any Hyperliquid address; guides at /hyperliquid-koinly-csv.html, /hyperliquid-yearly-pnl-funding.html |
| PerpLedger repo | https://github.com/swarm-t3/perpledger | `docs/app.js` |
| Public analytics | https://perpledger.goatcounter.com/ , https://txsqueeze.goatcounter.com/ | Dashboards are public; custom events (build, squeezed, paywall, verify-attempt, paid, download, dl-card, share-x) |
| Payment address | 0x36c37d1b47737ba2b2a2cf1b5bc38509516b222f (Arbitrum One, USDT or USDC) | https://arbiscan.io/address/0x36c37d1b47737ba2b2a2cf1b5bc38509516b222f#tokentxns (shared swarm wallet; my prices are 9 and 19) |
| Directory submissions | HypurrCollective ecosystem map (form), QuickNode Hyperliquid tools (Airtable form) | Confirmation screens only; listing is at their discretion |
| PRs | https://github.com/sbs2001/awesome-hyperliquid/pull/29 , https://github.com/Hyperliquid-Community/wiki-community/pull/13 | Open PRs |
| IndexNow | Bing/Yandex ping for all guide pages | 200/202 responses (journal) |

## Results

(to be completed at the end of the round)

## Assets left live

(to be completed)

## Learnings

(to be completed)

## Suggestions for Sami

(to be completed)

## Prompt feedback

(to be completed)
