// PerpLedger: Hyperliquid history -> Koinly universal CSV, entirely client-side.
const API = 'https://api.hyperliquid.xyz/info';
const ARB_RPC = 'https://arb1.arbitrum.io/rpc';
const PAY_TO = '0x36c37d1b47737ba2b2a2cf1b5bc38509516b222f';
const PRICE_UNITS = 9_000_000n; // 9.00 in 6-decimal stablecoins
const PAY_TOKENS = {
  '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9': 'USDT',
  '0xaf88d065e77c8cc2239327c5edb3a432268e5831': 'USDC',
};
const CODE_HASHES = ['82e33c23c414352b32f496a0605c2dfed206afa86e88f23dd47e92b8c6c8a8d5']; // sha256 of unlock codes sold via Whop
const TRANSFER_TOPIC = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';
const FILL_CAP = 10000;
const FREE_ROWS = 100; // small accounts export free

const $ = (id) => document.getElementById(id);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const num = (x) => Number(x || 0);
const fmt = (x, d = 2) => Number(x).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
const amt = (x) => (Math.round(Math.abs(x) * 1e8) / 1e8).toString();

function track(name) {
  try { window.goatcounter && window.goatcounter.count({ path: 'event-' + name, title: name, event: true }); } catch (e) {}
}

async function info(body, tries = 4) {
  for (let i = 0; i < tries; i++) {
    const r = await fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (r.ok) return r.json();
    if (r.status === 429) { await sleep(1500 * (i + 1)); continue; }
    throw new Error('Hyperliquid API ' + r.status);
  }
  throw new Error('Hyperliquid API rate limited, try again in a minute');
}

// Paginate a time-ordered endpoint forward from startTime.
async function paged(type, user, pageMax, label, key) {
  let start = 0, out = [], seen = new Set();
  for (let guard = 0; guard < 200; guard++) {
    const page = await info({ type, user, startTime: start });
    if (!Array.isArray(page) || page.length === 0) break;
    let added = 0;
    for (const x of page) { const k = key(x); if (!seen.has(k)) { seen.add(k); out.push(x); added++; } }
    $('status').textContent = `Reading ${label}… ${out.length}`;
    const last = page[page.length - 1].time;
    if (page.length < pageMax || added === 0) break;
    start = last;
  }
  return out;
}

function d2s(ms) {
  return new Date(ms).toISOString().replace('T', ' ').slice(0, 19);
}
function dayKey(ms) { return new Date(ms).toISOString().slice(0, 10); }
function yearOf(ms) { return new Date(ms).getUTCFullYear(); }

let spotNames = {};
async function loadSpotMeta() {
  const m = await info({ type: 'spotMeta' });
  const tok = {};
  for (const t of m.tokens) tok[t.index] = t.name;
  for (const u of m.universe) spotNames[u.name] = { base: tok[u.tokens[0]], quote: tok[u.tokens[1]] };
}
const isSpot = (coin) => coin.startsWith('@') || coin.includes('/');

// Koinly universal row
function krow(o) {
  return {
    Date: d2s(o.time) + ' UTC',
    'Sent Amount': o.sentAmt != null ? amt(o.sentAmt) : '',
    'Sent Currency': o.sentCur || '',
    'Received Amount': o.recvAmt != null ? amt(o.recvAmt) : '',
    'Received Currency': o.recvCur || '',
    'Fee Amount': o.feeAmt ? amt(o.feeAmt) : '',
    'Fee Currency': o.feeAmt ? o.feeCur : '',
    'Net Worth Amount': '', 'Net Worth Currency': '',
    Label: o.label || '',
    Description: o.desc || '',
    TxHash: o.hash || '',
  };
}
function signed(time, v, cur, gainLabel, lossLabel, desc, hash) {
  if (Math.abs(v) < 1e-9) return null;
  return v > 0
    ? krow({ time, recvAmt: v, recvCur: cur, label: gainLabel, desc, hash })
    : krow({ time, sentAmt: v, sentCur: cur, label: lossLabel, desc, hash });
}

function build(fills, funding, ledger, user, yearSel, agg) {
  const inYear = (t) => yearSel === 'all' || yearOf(t) === Number(yearSel);
  const koinly = [], generic = [];
  const S = {}; // per-year summary
  const sy = (t) => (S[yearOf(t)] ||= { pnl: 0, fees: 0, funding: 0, spotTrades: 0, perpFills: 0, deposits: 0, withdrawals: 0 });

  // ---- perp fills: PnL + fees; spot fills: trades
  const groups = new Map();
  for (const f of fills) {
    const t = f.time; const spot = isSpot(f.coin);
    const name = spot ? (spotNames[f.coin]?.base || f.coin) : f.coin;
    generic.push({ time: d2s(t), category: spot ? 'spot_fill' : 'perp_fill', coin: name, dir: f.dir, side: f.side, px: f.px, sz: f.sz, closedPnl: f.closedPnl, fee: f.fee, feeToken: f.feeToken, usdc: '', hash: f.hash, detail: (f.liquidation ? 'liquidation ' : '') + (f.twapId ? 'twap ' + f.twapId : '') });
    if (!inYear(t)) continue;
    const s = sy(t);
    if (spot) {
      s.spotTrades++;
      const quote = spotNames[f.coin]?.quote || 'USDC';
      const k = agg === 'daily' ? `S|${dayKey(t)}|${name}|${f.side}|${f.feeToken}` : `S|${f.tid}`;
      const g = groups.get(k) || { kind: 'spot', time: t, name, quote, side: f.side, sz: 0, notional: 0, fee: 0, feeToken: f.feeToken, n: 0, hash: f.hash };
      g.sz += num(f.sz); g.notional += num(f.sz) * num(f.px); g.fee += num(f.fee); g.n++; g.time = Math.max(g.time, t);
      groups.set(k, g);
    } else {
      s.perpFills++; s.pnl += num(f.closedPnl); s.fees += num(f.fee);
      const k = agg === 'daily' ? `P|${dayKey(t)}|${name}` : `P|${f.tid}`;
      const g = groups.get(k) || { kind: 'perp', time: t, name, pnl: 0, fee: 0, feeToken: f.feeToken || 'USDC', n: 0, hash: f.hash };
      g.pnl += num(f.closedPnl); g.fee += num(f.fee); g.n++; g.time = Math.max(g.time, t);
      groups.set(k, g);
    }
  }
  for (const g of groups.values()) {
    const many = g.n > 1 ? ` (${g.n} fills)` : '';
    const hash = g.n > 1 ? '' : g.hash;
    if (g.kind === 'perp') {
      const r1 = signed(g.time, g.pnl, 'USDC', 'realized gain', 'realized gain', `Hyperliquid ${g.name}-PERP realized PnL${many}`, hash);
      const r2 = signed(g.time, -g.fee, g.feeToken, 'realized gain', 'margin fee', `Hyperliquid ${g.name}-PERP trading fee${g.fee < 0 ? ' rebate' : ''}${many}`, hash);
      r1 && koinly.push(r1); r2 && koinly.push(r2);
    } else {
      const buy = g.side === 'B';
      koinly.push(krow({
        time: g.time,
        sentAmt: buy ? g.notional : g.sz, sentCur: buy ? g.quote : g.name,
        recvAmt: buy ? g.sz : g.notional, recvCur: buy ? g.name : g.quote,
        feeAmt: g.fee > 0 ? g.fee : 0, feeCur: g.feeToken,
        desc: `Hyperliquid spot ${buy ? 'buy' : 'sell'} ${g.name}${many}`, hash,
      }));
    }
  }

  // ---- funding
  const fg = new Map();
  for (const x of funding) {
    const d = x.delta; const t = x.time;
    generic.push({ time: d2s(t), category: 'funding', coin: d.coin, dir: '', side: '', px: '', sz: d.szi, closedPnl: '', fee: '', feeToken: '', usdc: d.usdc, hash: '', detail: 'rate ' + d.fundingRate });
    if (!inYear(t)) continue;
    sy(t).funding += num(d.usdc);
    const k = agg === 'daily' ? `${dayKey(t)}|${d.coin}` : `${t}|${d.coin}`;
    const g = fg.get(k) || { time: t, coin: d.coin, usdc: 0, n: 0 };
    g.usdc += num(d.usdc); g.n++; g.time = Math.max(g.time, t); fg.set(k, g);
  }
  for (const g of fg.values()) {
    const r = signed(g.time, g.usdc, 'USDC', 'realized gain', 'margin fee', `Hyperliquid ${g.coin}-PERP funding ${g.usdc >= 0 ? 'received' : 'paid'}`, '');
    r && koinly.push(r);
  }

  // ---- ledger (non-funding)
  const me = user.toLowerCase();
  for (const x of ledger) {
    const d = x.delta; const t = x.time; const ty = d.type;
    const usdc = num(d.usdc ?? d.amount ?? 0);
    generic.push({ time: d2s(t), category: 'ledger_' + ty, coin: d.token || 'USDC', dir: '', side: '', px: '', sz: '', closedPnl: '', fee: d.fee || '', feeToken: d.feeToken || '', usdc: d.usdc ?? d.amount ?? '', hash: x.hash, detail: JSON.stringify(d).slice(0, 300) });
    if (!inYear(t)) continue;
    const s = sy(t);
    if (ty === 'deposit') {
      s.deposits += usdc;
      koinly.push(krow({ time: t, recvAmt: usdc, recvCur: 'USDC', desc: 'Hyperliquid deposit (bridge from Arbitrum)', hash: x.hash }));
    } else if (ty === 'withdraw') {
      s.withdrawals += usdc;
      koinly.push(krow({ time: t, sentAmt: usdc, sentCur: 'USDC', feeAmt: num(d.fee), feeCur: 'USDC', desc: 'Hyperliquid withdrawal (bridge to Arbitrum)', hash: x.hash }));
    } else if (ty === 'spotTransfer' || ty === 'send') {
      const tok = d.token || 'USDC'; const a = num(d.amount ?? d.usdc);
      const out = (d.user || '').toLowerCase() === me && (d.destination || '').toLowerCase() !== me;
      const inn = (d.destination || '').toLowerCase() === me && (d.user || '').toLowerCase() !== me;
      if (out) koinly.push(krow({ time: t, sentAmt: a, sentCur: tok, feeAmt: num(d.fee), feeCur: d.feeToken || tok, desc: `Hyperliquid transfer to ${d.destination}`, hash: x.hash }));
      if (inn) koinly.push(krow({ time: t, recvAmt: a, recvCur: tok, desc: `Hyperliquid transfer from ${d.user}`, hash: x.hash }));
    } else if (ty === 'rewardsClaim') {
      koinly.push(krow({ time: t, recvAmt: num(d.amount), recvCur: d.token || 'USDC', label: 'reward', desc: 'Hyperliquid rewards claim', hash: x.hash }));
    } else if (ty === 'vaultDeposit') {
      koinly.push(krow({ time: t, sentAmt: usdc, sentCur: 'USDC', desc: `Hyperliquid vault deposit ${d.vault || ''} (deposit into vault; treat per your jurisdiction)`, hash: x.hash }));
    } else if (ty === 'vaultWithdraw') {
      const a = num(d.netWithdrawnUsd ?? d.requestedUsd ?? d.usdc);
      koinly.push(krow({ time: t, recvAmt: a, recvCur: 'USDC', desc: `Hyperliquid vault withdrawal ${d.vault || ''}`, hash: x.hash }));
    }
    // accountClassTransfer / subAccountTransfer / internalTransfer between own balances: kept in the full ledger CSV only.
  }

  koinly.sort((a, b) => (a.Date < b.Date ? -1 : 1));
  generic.sort((a, b) => (a.time < b.time ? -1 : 1));
  return { koinly, generic, S };
}

function toCSV(rows) {
  if (!rows.length) return '';
  const cols = Object.keys(rows[0]);
  const esc = (v) => { v = v == null ? '' : String(v); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; };
  return [cols.join(','), ...rows.map((r) => cols.map((c) => esc(r[c])).join(','))].join('\n');
}
function download(name, text) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type: 'text/csv' }));
  a.download = name; a.click();
}

let RESULT = null;
const paidUnlock = () => localStorage.getItem('pl_unlocked_tx');
const unlocked = () => paidUnlock() || (RESULT && RESULT.res.koinly.length <= FREE_ROWS);

function render(res, user, firstFill, fillCount) {
  $('out').hidden = false;
  $('sumaddr').textContent = user;
  const years = Object.keys(res.S).sort();
  const rowsSpec = [
    ['Perp realized PnL (USDC)', 'pnl'], ['Perp trading fees (USDC, negative = rebates)', 'fees'], ['Funding net (USDC, + received)', 'funding'],
    ['Net perp result after fees + funding', null], ['Perp fills', 'perpFills'], ['Spot fills', 'spotTrades'],
    ['Deposits (USDC)', 'deposits'], ['Withdrawals (USDC)', 'withdrawals'],
  ];
  let h = '<tr><th></th>' + years.map((y) => `<th>${y}</th>`).join('') + '</tr>';
  for (const [label, k] of rowsSpec) {
    h += `<tr><td>${label}</td>` + years.map((y) => {
      const s = res.S[y];
      const v = k ? s[k] : s.pnl - s.fees + s.funding;
      const ints = k === 'perpFills' || k === 'spotTrades';
      return `<td>${ints ? v : fmt(v)}</td>`;
    }).join('') + '</tr>';
  }
  $('summary').innerHTML = years.length ? h : '<tr><td>No activity found for this address and year.</td></tr>';
  let w = '';
  if (fillCount >= FILL_CAP - 50) w += `<div class="warn">Hyperliquid's API only exposes your latest 10,000 fills. Your fill data starts on <b>${d2s(firstFill)} UTC</b>. Funding and transfers are complete. Cover fills before that date with your own saved exports.</div>`;
  $('warn').innerHTML = w;
  const pv = res.koinly.slice(0, 15);
  $('rowcount').textContent = `${res.koinly.length} rows total (from ${fillCount} fills)`;
  $('preview').innerHTML = pv.length ? '<tr>' + Object.keys(pv[0]).map((c) => `<th>${c}</th>`).join('') + '</tr>' + pv.map((r) => '<tr>' + Object.values(r).map((v) => `<td>${v}</td>`).join('') + '</tr>').join('') : '';
  const tier = (n) => n <= 100 ? 'Newbie (~$49)' : n <= 1000 ? 'Hodler (~$99)' : n <= 3000 ? 'Trader (~$199)' : 'Pro (~$279) or higher';
  const yFills = Object.values(res.S).reduce((a, s) => a + s.perpFills + s.spotTrades, 0);
  $('savings').innerHTML = `<div class="warn" style="background:#0d1a1f;border-color:#14b8a6;color:#e6edf3">Koinly counts each imported row as a transaction. Fills in this period: <b>${yFills}</b> → Koinly tier ${tier(yFills)}. This CSV: <b>${res.koinly.length}</b> rows → ${tier(res.koinly.length)}. (Koinly list prices, approximate; check koinly.io/pricing.)</div>`;
  refreshLocks();
}

function refreshLocks() {
  const u = !!unlocked();
  for (const id of ['dlKoinly', 'dlGeneric']) $(id).classList.toggle('locked', !u);
  $('pay').hidden = u && !paidUnlock();
  if (paidUnlock()) $('paystatus').innerHTML = '<span class="ok">Unlocked on this browser. Thank you.</span>';
  else if (u) $('status').innerHTML += ' <span class="ok">Small account (≤ ' + FREE_ROWS + ' rows): full export is free.</span>';
}

$('f').addEventListener('submit', async (e) => {
  e.preventDefault();
  const user = $('addr').value.trim();
  if (!/^0x[0-9a-fA-F]{40}$/.test(user)) { $('status').innerHTML = '<span class="err">That is not a 0x address (42 characters).</span>'; return; }
  $('status').textContent = 'Reading Hyperliquid…';
  track('build');
  try {
    if (!Object.keys(spotNames).length) await loadSpotMeta();
    const fills = await paged('userFillsByTime', user, 2000, 'fills', (x) => x.tid + '|' + x.hash + '|' + x.oid);
    const funding = await paged('userFunding', user, 500, 'funding payments', (x) => x.time + '|' + x.delta.coin);
    const ledger = await paged('userNonFundingLedgerUpdates', user, 2000, 'transfers', (x) => x.time + '|' + x.hash + '|' + x.delta.type);
    const res = build(fills, funding, ledger, user, $('year').value, $('agg').value);
    RESULT = { res, user };
    const firstFill = fills.length ? Math.min(...fills.map((f) => f.time)) : 0;
    $('status').textContent = `Done: ${fills.length} fills, ${funding.length} funding payments, ${ledger.length} transfers.`;
    render(res, user, firstFill, fills.length);
    track('built');
  } catch (err) {
    $('status').innerHTML = `<span class="err">${err.message}</span>`;
  }
});

function guarded(fn) {
  return () => {
    if (!RESULT) return;
    if (!unlocked()) { track('paywall'); $('pay').scrollIntoView({ behavior: 'smooth' }); $('tx').focus(); return; }
    fn();
  };
}
const fname = (k) => `perpledger-${k}-${RESULT.user.slice(0, 8)}-${$('year').value}.csv`;
$('dlKoinly').onclick = guarded(() => { track('dl-koinly'); download(fname('koinly'), toCSV(RESULT.res.koinly)); });
$('dlGeneric').onclick = guarded(() => { track('dl-generic'); download(fname('ledger'), toCSV(RESULT.res.generic)); });
$('dlSummary').onclick = () => {
  if (!RESULT) return;
  track('dl-summary');
  const rows = Object.entries(RESULT.res.S).map(([y, s]) => ({ year: y, perp_realized_pnl: s.pnl.toFixed(6), perp_fees: s.fees.toFixed(6), funding_net: s.funding.toFixed(6), net: (s.pnl - s.fees + s.funding).toFixed(6), perp_fills: s.perpFills, spot_fills: s.spotTrades, deposits: s.deposits.toFixed(2), withdrawals: s.withdrawals.toFixed(2) }));
  download(fname('summary'), toCSV(rows));
};
$('copy').onclick = () => { navigator.clipboard.writeText(PAY_TO); $('copy').textContent = 'copied'; track('copy-address'); };

async function rpc(method, params) {
  const r = await fetch(ARB_RPC, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }) });
  const j = await r.json();
  if (j.error) throw new Error(j.error.message);
  return j.result;
}
$('verify').onclick = async () => {
  const tx = $('tx').value.trim();
  if (!/^0x[0-9a-fA-F]{64}$/.test(tx)) { $('paystatus').innerHTML = '<span class="err">Paste the 66-character transaction hash.</span>'; return; }
  $('paystatus').textContent = 'Checking Arbitrum…';
  track('verify-attempt');
  try {
    const rc = await rpc('eth_getTransactionReceipt', [tx]);
    if (!rc) { $('paystatus').innerHTML = '<span class="err">Transaction not found on Arbitrum One yet. Wait a few seconds and retry, and check it is on Arbitrum.</span>'; return; }
    if (rc.status !== '0x1') { $('paystatus').innerHTML = '<span class="err">That transaction failed on-chain.</span>'; return; }
    const to = '0x' + PAY_TO.slice(2).toLowerCase().padStart(64, '0');
    let paid = 0n, tok = '';
    for (const l of rc.logs) {
      const a = l.address.toLowerCase();
      if (PAY_TOKENS[a] && l.topics[0] === TRANSFER_TOPIC && l.topics[2] && l.topics[2].toLowerCase() === to) { paid += BigInt(l.data); tok = PAY_TOKENS[a]; }
    }
    if (paid >= PRICE_UNITS) {
      localStorage.setItem('pl_unlocked_tx', tx);
      track('paid');
      refreshLocks();
    } else if (paid > 0n) {
      $('paystatus').innerHTML = `<span class="err">Found ${Number(paid) / 1e6} ${tok}; the price is 9. Email us and we will sort it out.</span>`;
    } else {
      $('paystatus').innerHTML = '<span class="err">No USDT/USDC transfer to the PerpLedger address in that transaction.</span>';
    }
  } catch (err) {
    $('paystatus').innerHTML = `<span class="err">${err.message}</span>`;
  }
};

async function sha256hex(t) {
  const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(t));
  return Array.from(new Uint8Array(b)).map((x) => x.toString(16).padStart(2, '0')).join('');
}
$('redeem').onclick = async () => {
  const c = $('code').value.trim().toUpperCase();
  if (CODE_HASHES.includes(await sha256hex(c))) {
    localStorage.setItem('pl_unlocked_tx', 'code:' + c);
    track('code-redeemed');
    refreshLocks();
  } else {
    $('paystatus').innerHTML = '<span class="err">That code is not valid.</span>';
  }
};
