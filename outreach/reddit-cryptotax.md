# r/CryptoTax post (ready for when the brand Reddit account lands; liaison: r/hyperliquid is banned)

Title: Hyperliquid perps + funding into Koinly: a free converter that also cuts the row count

Body:
Koinly's Hyperliquid sync has had user reports of missing perp PnL, funding and TWAP fills (e.g. https://feedback.koinly.io/apicsv-issues-public/p/hyperliquid-pnl-trades-are-not-imported), and the usual workaround is hand-editing trade_history.csv.

PerpLedger reads an address's public Hyperliquid history (no wallet connect, runs in your browser) and writes Koinly's universal CSV: closed PnL as realized gain, fees and paid funding as margin fee, spot fills as trades, deposits/withdrawals as transfers, internal spot↔perp transfers skipped. It can roll fills into daily rows per coin. Koinly prices by transaction count, so an active account's thousands of fills can land in a few hundred rows.

Free: yearly realized PnL / fees / funding summary, and the full CSV if it fits in 100 rows. Bigger exports are $9 (USDC/USDT on Arbitrum). Mapping guide if you'd rather do it by hand: https://swarm-t3.github.io/perpledger/hyperliquid-koinly-csv.html

https://swarm-t3.github.io/perpledger/

Not tax advice. I built it; feedback on the label mapping is welcome, especially from anyone who treats funding differently.

---

# r/CryptoTax post #2 (TxSqueeze) — post a day after #1, or instead of it if only one is allowed (TxSqueeze has the broader audience)

Title: Over the Koinly transaction limit because of daily staking/Earn rewards or bot fills? A free tool to merge them per day

Body:
Koinly bills by transaction count, and Binance Simple Earn / staking pays a row per coin per day, while grid bots split orders into hundreds of fills. Koinly support's own answer on their forum is to "tally up all the rewards received on a certain day/week/month and add a single deposit for the whole amount" (https://discuss.koinly.io/t/staking-rewards-create-too-many-transactions/15427).

TxSqueeze does that for a whole CSV in your browser (nothing uploaded) and keeps the original format so Koinly's importer still reads it:
- Binance transaction history: merges only reward-type operations (interest, staking rewards, distributions, airdrops, Launchpool…) per day/account/operation/coin; trades, deposits, withdrawals and Earn subscriptions/redemptions stay untouched because Koinly pairs them by timestamp.
- Koinly universal CSV: merges rows with the same label/currencies per period; own-wallet transfers left alone so they still match.
- Any other CSV (KuCoin/Pionex bot fills, etc.): pick the columns.

Free for files up to 300 rows; larger files are a one-time $19 (USDC/USDT on Arbitrum). https://swarm-t3.github.io/txsqueeze/

Not tax advice; daily merging is closest to the original. I built it and would like to hear where it breaks.
