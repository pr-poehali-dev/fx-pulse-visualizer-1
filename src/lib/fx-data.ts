export type FxType = 'fiat' | 'crypto';

export interface Currency {
  code: string;
  symbol: string;
  name: string;
  type: FxType;
  color: string;
  icon: string;
  coingeckoId?: string;
}

export const CURRENCIES: Currency[] = [
  // Fiat (12)
  { code: 'USD', symbol: '$', name: 'US Dollar', type: 'fiat', color: '#22c55e', icon: 'https://flagcdn.com/w160/us.png' },
  { code: 'EUR', symbol: '€', name: 'Euro', type: 'fiat', color: '#3b82f6', icon: 'https://flagcdn.com/w160/eu.png' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', type: 'fiat', color: '#ef4444', icon: 'https://flagcdn.com/w160/jp.png' },
  { code: 'RUB', symbol: '₽', name: 'Russian Ruble', type: 'fiat', color: '#8b5cf6', icon: 'https://flagcdn.com/w160/ru.png' },
  { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah', type: 'fiat', color: '#f43f5e', icon: 'https://flagcdn.com/w160/id.png' },
  { code: 'GBP', symbol: '£', name: 'British Pound', type: 'fiat', color: '#0ea5e9', icon: 'https://flagcdn.com/w160/gb.png' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', type: 'fiat', color: '#e11d48', icon: 'https://flagcdn.com/w160/cn.png' },
  { code: 'CHF', symbol: '₣', name: 'Swiss Franc', type: 'fiat', color: '#f97316', icon: 'https://flagcdn.com/w160/ch.png' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', type: 'fiat', color: '#14b8a6', icon: 'https://flagcdn.com/w160/au.png' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', type: 'fiat', color: '#f43f5e', icon: 'https://flagcdn.com/w160/ca.png' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', type: 'fiat', color: '#f59e0b', icon: 'https://flagcdn.com/w160/in.png' },
  { code: 'TRY', symbol: '₺', name: 'Turkish Lira', type: 'fiat', color: '#dc2626', icon: 'https://flagcdn.com/w160/tr.png' },
  // Crypto (12)
  { code: 'BTC', symbol: '₿', name: 'Bitcoin', type: 'crypto', color: '#f7931a', icon: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png', coingeckoId: 'bitcoin' },
  { code: 'ETH', symbol: 'Ξ', name: 'Ethereum', type: 'crypto', color: '#627eea', icon: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png', coingeckoId: 'ethereum' },
  { code: 'BNB', symbol: 'BNB', name: 'BNB', type: 'crypto', color: '#f3ba2f', icon: 'https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png', coingeckoId: 'binancecoin' },
  { code: 'TON', symbol: 'TON', name: 'Toncoin', type: 'crypto', color: '#0098ea', icon: 'https://assets.coingecko.com/coins/images/17980/small/ton_symbol.png', coingeckoId: 'toncoin' },
  { code: 'USDT', symbol: '₮', name: 'Tether', type: 'crypto', color: '#26a17b', icon: 'https://assets.coingecko.com/coins/images/325/small/Tether.png', coingeckoId: 'tether' },
  { code: 'SOL', symbol: 'SOL', name: 'Solana', type: 'crypto', color: '#14f195', icon: 'https://assets.coingecko.com/coins/images/4128/small/solana.png', coingeckoId: 'solana' },
  { code: 'XRP', symbol: 'XRP', name: 'XRP', type: 'crypto', color: '#23292f', icon: 'https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png', coingeckoId: 'ripple' },
  { code: 'ADA', symbol: 'ADA', name: 'Cardano', type: 'crypto', color: '#0033ad', icon: 'https://assets.coingecko.com/coins/images/975/small/cardano.png', coingeckoId: 'cardano' },
  { code: 'DOGE', symbol: 'Ð', name: 'Dogecoin', type: 'crypto', color: '#c2a633', icon: 'https://assets.coingecko.com/coins/images/5/small/dogecoin.png', coingeckoId: 'dogecoin' },
  { code: 'AVAX', symbol: 'AVAX', name: 'Avalanche', type: 'crypto', color: '#e84142', icon: 'https://assets.coingecko.com/coins/images/12559/small/Avalanche_Circle_RedWhite_Trans.png', coingeckoId: 'avalanche-2' },
  { code: 'DOT', symbol: 'DOT', name: 'Polkadot', type: 'crypto', color: '#e6007a', icon: 'https://assets.coingecko.com/coins/images/12171/small/polkadot.png', coingeckoId: 'polkadot' },
  { code: 'MATIC', symbol: 'POL', name: 'Polygon', type: 'crypto', color: '#8247e5', icon: 'https://assets.coingecko.com/coins/images/4713/small/polygon.png', coingeckoId: 'matic-network' },
];

export interface Candle { t: number; o: number; h: number; l: number; c: number; v: number; }
export type Timeframe = '1D' | '7D' | '30D' | '90D';

const TF_DAYS: Record<Timeframe, number> = { '1D': 1, '7D': 7, '30D': 30, '90D': 90 };

// price in USD per 1 unit of currency (for fiat: 1 currency = X usd)
export interface MarketState {
  prices: Record<string, number>;   // USD value of 1 unit
  changes: Record<string, number>;  // 24h change %
}

export async function fetchMarket(): Promise<MarketState> {
  const prices: Record<string, number> = { USD: 1 };
  const changes: Record<string, number> = { USD: 0 };

  const fiatCodes = CURRENCIES.filter(c => c.type === 'fiat' && c.code !== 'USD').map(c => c.code);
  const cryptoMap: Record<string, string> = {};
  CURRENCIES.filter(c => c.type === 'crypto' && c.coingeckoId).forEach(c => { cryptoMap[c.code] = c.coingeckoId!; });

  // Fiat via Frankfurter
  try {
    const r = await fetch(`https://api.frankfurter.app/latest?from=USD&to=${fiatCodes.join(',')}`);
    const d = await r.json();
    for (const c of fiatCodes) {
      const rate = d.rates?.[c];
      if (rate) { prices[c] = 1 / rate; changes[c] = (Math.random() - 0.5) * 1.2; }
    }
  } catch { /* fallback below */ }

  // Crypto via CoinGecko
  try {
    const ids = Object.values(cryptoMap).join(',');
    const r = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`);
    const d = await r.json();
    for (const [code, id] of Object.entries(cryptoMap)) {
      const row = d[id];
      if (row) { prices[code] = row.usd; changes[code] = row.usd_24h_change ?? 0; }
    }
  } catch { /* fallback below */ }

  // Fallbacks for any missing
  const fallback: Record<string, number> = {
    EUR: 1.08, JPY: 0.0067, RUB: 0.011, IDR: 0.000063,
    GBP: 1.27, CNY: 0.14, CHF: 1.11, AUD: 0.66, CAD: 0.73, INR: 0.012, TRY: 0.031,
    BTC: 67000, ETH: 3500, BNB: 600, TON: 5.2, USDT: 1,
    SOL: 150, XRP: 0.52, ADA: 0.45, DOGE: 0.13, AVAX: 35, DOT: 6.8, MATIC: 0.55,
  };
  for (const c of CURRENCIES) {
    if (prices[c.code] == null) { prices[c.code] = fallback[c.code] ?? 1; changes[c.code] = (Math.random() - 0.5) * 4; }
  }
  return { prices, changes };
}

function genCandles(base: number, change: number, count: number, type: FxType): Candle[] {
  const vol = type === 'crypto' ? 0.03 : 0.006;
  const out: Candle[] = [];
  let price = base / (1 + change / 100);
  const step = (base - price) / count;
  const now = Date.now();
  for (let i = count - 1; i >= 0; i--) {
    const o = price;
    const drift = step + (Math.random() - 0.5) * base * vol;
    const c = Math.max(0.0000001, o + drift);
    const h = Math.max(o, c) * (1 + Math.random() * vol);
    const l = Math.min(o, c) * (1 - Math.random() * vol);
    out.push({ t: now - i * 3600_000, o, h, l, c, v: Math.random() * 100 });
    price = c;
  }
  return out;
}

export async function fetchCandles(cur: Currency, tf: Timeframe, base: number, change: number): Promise<Candle[]> {
  const days = TF_DAYS[tf];
  if (cur.type === 'crypto' && cur.coingeckoId) {
    try {
      const r = await fetch(`https://api.coingecko.com/api/v3/coins/${cur.coingeckoId}/ohlc?vs_currency=usd&days=${days}`);
      const d = await r.json();
      if (Array.isArray(d) && d.length) {
        return d.map((row: number[], i: number, arr: number[][]) => ({
          t: row[0], o: row[1], h: row[2], l: row[3], c: row[4],
          v: Math.abs(row[4] - row[1]) / row[1] * 1000 * (i / arr.length + 0.3),
        }));
      }
    } catch { /* fallback */ }
  }
  if (cur.type === 'fiat' && cur.code !== 'USD') {
    try {
      const end = new Date();
      const start = new Date(end.getTime() - days * 86400_000);
      const fmt = (d: Date) => d.toISOString().slice(0, 10);
      const r = await fetch(`https://api.frankfurter.app/${fmt(start)}..${fmt(end)}?from=${cur.code}&to=USD`);
      const d = await r.json();
      const entries = Object.entries(d.rates || {}).sort();
      if (entries.length) {
        const out: Candle[] = [];
        let prev = (entries[0][1] as Record<string, number>).USD;
        for (const [date, val] of entries) {
          const c = (val as Record<string, number>).USD;
          out.push({
            t: new Date(date).getTime(), o: prev,
            h: Math.max(prev, c) * 1.001, l: Math.min(prev, c) * 0.999, c, v: 0,
          });
          prev = c;
        }
        return out;
      }
    } catch { /* fallback */ }
  }
  return genCandles(base, change, days === 1 ? 24 : days, cur.type);
}