# r/CryptoTax post (ready for when the brand Reddit account lands; liaison: r/hyperliquid is banned)

Title: Hyperliquid perps + funding into Koinly: a free converter that also cuts the row count

Body:
Koinly's Hyperliquid sync has had user reports of missing perp PnL, funding and TWAP fills (e.g. https://feedback.koinly.io/apicsv-issues-public/p/hyperliquid-pnl-trades-are-not-imported), and the usual workaround is hand-editing trade_history.csv.

PerpLedger reads an address's public Hyperliquid history (no wallet connect, runs in your browser) and writes Koinly's universal CSV: closed PnL as realized gain, fees and paid funding as margin fee, spot fills as trades, deposits/withdrawals as transfers, internal spot↔perp transfers skipped. It can roll fills into daily rows per coin. Koinly prices by transaction count, so an active account's thousands of fills can land in a few hundred rows.

Free: yearly realized PnL / fees / funding summary, and the full CSV if it fits in 100 rows. Bigger exports are $9 (USDC/USDT on Arbitrum). Mapping guide if you'd rather do it by hand: https://swarm-t3.github.io/perpledger/hyperliquid-koinly-csv.html

https://swarm-t3.github.io/perpledger/

Not tax advice. I built it; feedback on the label mapping is welcome, especially from anyone who treats funding differently.
