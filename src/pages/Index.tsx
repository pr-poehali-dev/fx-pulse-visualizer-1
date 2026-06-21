import { useEffect, useMemo, useRef, useState } from 'react';
import { CURRENCIES, Currency, Candle, Timeframe, MarketState, fetchMarket, fetchCandles } from '@/lib/fx-data';
import { Lang, T } from '@/lib/fx-i18n';
import Header from '@/components/fx/Header';
import Converter from '@/components/fx/Converter';
import MarketCard from '@/components/fx/MarketCard';
import ChartCard from '@/components/fx/ChartCard';
import Ticker from '@/components/fx/Ticker';
import Icon from '@/components/ui/icon';

const FALLBACK_MARKET: MarketState = {
  prices: {
    USD: 1, EUR: 1.08, JPY: 0.0067, RUB: 0.011, IDR: 0.000063,
    GBP: 1.27, CNY: 0.14, CHF: 1.11, AUD: 0.66, CAD: 0.73, INR: 0.012, TRY: 0.031,
    BTC: 67000, ETH: 3500, BNB: 600, TON: 5.2, USDT: 1,
    SOL: 150, XRP: 0.52, ADA: 0.45, DOGE: 0.13, AVAX: 35, DOT: 6.8, MATIC: 0.55,
  },
  changes: {
    USD: 0, EUR: 0.2, JPY: -0.3, RUB: 0.5, IDR: -0.1,
    GBP: 0.3, CNY: -0.2, CHF: 0.1, AUD: -0.4, CAD: 0.2, INR: -0.1, TRY: -0.8,
    BTC: 2.4, ETH: 1.8, BNB: -0.9, TON: 3.1, USDT: 0.01,
    SOL: 4.2, XRP: -1.3, ADA: 2.1, DOGE: 5.6, AVAX: -2.4, DOT: 1.2, MATIC: -0.7,
  },
};

const Index = () => {
  const [lang, setLang] = useState<Lang>(() => (localStorage.getItem('fx-lang') as Lang) || 'en');
  const t = T[lang];
  useEffect(() => { localStorage.setItem('fx-lang', lang); }, [lang]);

  const [market, setMarket] = useState<MarketState>(FALLBACK_MARKET);
  const [updated, setUpdated] = useState('--:--:--');
  const [loaded, setLoaded] = useState(false);
  const [filter, setFilter] = useState<'all' | 'fiat' | 'crypto'>('all');
  const [selected, setSelected] = useState('BTC');
  const [tf, setTf] = useState<Timeframe>('7D');
  const [candles, setCandles] = useState<Candle[]>([]);
  const [chartLoading, setChartLoading] = useState(true);
  const [miniCandles, setMiniCandles] = useState<Record<string, Candle[]>>({});

  const selectedCur = CURRENCIES.find(c => c.code === selected)!;

  // initial + 60s full refresh
  useEffect(() => {
    let alive = true;
    const load = async () => {
      const m = await fetchMarket();
      if (!alive) return;
      setMarket(m);
      setUpdated(new Date().toLocaleTimeString('en-GB'));
      setLoaded(true);
      // mini candles generated locally for speed
      const minis: Record<string, Candle[]> = {};
      for (const c of CURRENCIES) {
        const base = m.prices[c.code] ?? 1, ch = m.changes[c.code] ?? 0;
        const arr: Candle[] = [];
        let p = base / (1 + ch / 100);
        for (let i = 0; i < 30; i++) {
          const o = p; const d = (base - p) / (30 - i) + (Math.random() - 0.5) * base * (c.type === 'crypto' ? 0.02 : 0.004);
          const cl = Math.max(1e-9, o + d);
          arr.push({ t: i, o, h: Math.max(o, cl) * 1.005, l: Math.min(o, cl) * 0.995, c: cl, v: Math.random() * 50 });
          p = cl;
        }
        minis[c.code] = arr;
      }
      setMiniCandles(minis);
    };
    load();
    const id = setInterval(load, 60_000);
    return () => { alive = false; clearInterval(id); };
  }, []);

  // detail candles on select/timeframe change
  useEffect(() => {
    let alive = true;
    setChartLoading(true);
    (async () => {
      const base = market.prices[selected] ?? 1, ch = market.changes[selected] ?? 0;
      const data = await fetchCandles(selectedCur, tf, base, ch);
      if (!alive) return;
      setCandles(data);
      setChartLoading(false);
    })();
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, tf]);

  // 3s live tick — volatility
  const marketRef = useRef(market);
  marketRef.current = market;
  useEffect(() => {
    const id = setInterval(() => {
      setMarket(prev => {
        const prices = { ...prev.prices };
        const changes = { ...prev.changes };
        for (const c of CURRENCIES) {
          if (c.code === 'USD') continue;
          const vol = c.type === 'crypto' ? 0.0008 : 0.0003;
          const delta = (Math.random() - 0.5) * 2 * vol;
          prices[c.code] = (prices[c.code] ?? 1) * (1 + delta);
          changes[c.code] = (changes[c.code] ?? 0) + delta * 100;
        }
        return { prices, changes };
      });
      setCandles(prev => {
        if (!prev.length) return prev;
        const out = prev.slice();
        const last = { ...out[out.length - 1] };
        const vol = selectedCur.type === 'crypto' ? 0.0008 : 0.0003;
        last.c = last.c * (1 + (Math.random() - 0.5) * 2 * vol);
        last.h = Math.max(last.h, last.c);
        last.l = Math.min(last.l, last.c);
        out[out.length - 1] = last;
        return out;
      });
    }, 3000);
    return () => clearInterval(id);
  }, [selectedCur]);

  const visible = useMemo(
    () => CURRENCIES.filter(c => filter === 'all' || c.type === filter),
    [filter]
  );

  const stats = [
    { label: t.stat_fiat, value: '12', sub: 'USD · EUR · GBP · CNY · …', icon: 'Landmark', color: '#00d4ff' },
    { label: t.stat_crypto, value: '12', sub: 'BTC · ETH · SOL · XRP · …', icon: 'Bitcoin', color: '#a855f7' },
    { label: t.stat_pairs, value: '550+', sub: 'fiat ⇆ crypto', icon: 'Network', color: '#ec4899' },
    { label: t.stat_source, value: 'Live', sub: 'CoinGecko + Frankfurter', icon: 'Radio', color: '#22c55e' },
  ];

  const features = [
    { e: '🌍', t: t.f1t, d: t.f1d, color: '#00d4ff' },
    { e: '📈', t: t.f2t, d: t.f2d, color: '#a855f7' },
    { e: '⚡', t: t.f3t, d: t.f3d, color: '#ec4899' },
    { e: '🔒', t: t.f4t, d: t.f4d, color: '#fbbf24' },
  ];

  return (
    <div id="top" className="min-h-screen relative fx-noise">
      {/* background orbs + grid */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[10%] w-[40vw] h-[40vw] rounded-full bg-fx-cyan/45 blur-[140px] animate-orb-float" />
        <div className="absolute top-[20%] right-[5%] w-[35vw] h-[35vw] rounded-full bg-fx-purple/45 blur-[140px] animate-orb-float" style={{ animationDelay: '-8s' }} />
        <div className="absolute bottom-[5%] left-[20%] w-[38vw] h-[38vw] rounded-full bg-fx-pink/40 blur-[140px] animate-orb-float" style={{ animationDelay: '-16s' }} />
        <div className="absolute bottom-[20%] right-[25%] w-[28vw] h-[28vw] rounded-full bg-fx-gold/25 blur-[140px] animate-orb-float" style={{ animationDelay: '-4s' }} />
        <div className="absolute inset-0 fx-grid-bg" />
      </div>

      <Header t={t} lang={lang} setLang={setLang} />
      <Ticker market={market} />

      {/* HERO */}
      <section className="max-w-[1280px] mx-auto px-5 pt-16 pb-8 text-center">
        <span className="relative inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium text-white/80 animate-fade-up overflow-hidden">
          <span className="absolute inset-0 fx-ring-glow opacity-40 blur-[2px]" aria-hidden="true" />
          <span className="absolute inset-[1px] rounded-full bg-[#0a0c14]" aria-hidden="true" />
          <span className="relative w-1.5 h-1.5 rounded-full bg-fx-cyan animate-pulse-dot" />
          <span className="relative">{t.hero_badge}</span>
        </span>
        <h1 className="mt-6 font-black tracking-[-0.04em] leading-[0.95] animate-fade-up" style={{ fontSize: 'clamp(40px,8vw,80px)', animationDelay: '80ms' }}>
          <span className="text-white">{t.hero_h1a}</span><br />
          <span className="fx-grad-text">{t.hero_h1b}</span>
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-base sm:text-lg text-white/55 leading-relaxed animate-fade-up" style={{ animationDelay: '160ms' }}>
          {t.hero_sub}
        </p>
      </section>

      <Converter t={t} market={market} updated={updated} />

      {/* STATS */}
      <section className="max-w-[1280px] mx-auto px-5 mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={s.label} className="fx-glass fx-shine rounded-2xl p-5 animate-fade-up relative overflow-hidden hover:-translate-y-1 transition-transform duration-300" style={{ animationDelay: `${i * 60}ms` }}>
            <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full blur-2xl opacity-20" style={{ background: s.color }} aria-hidden="true" />
            <div className="grid place-items-center w-10 h-10 rounded-xl mb-3 relative" style={{ background: `${s.color}1a`, border: `1px solid ${s.color}33` }}>
              <Icon name={s.icon} size={18} style={{ color: s.color }} fallback="Coins" />
            </div>
            <div className="text-3xl font-extrabold font-mono tabular-nums" style={{ color: s.color }}>{s.value}</div>
            <div className="text-sm font-semibold text-white/80 mt-1">{s.label}</div>
            <div className="text-[11px] text-white/40 mt-0.5">{s.sub}</div>
          </div>
        ))}
      </section>

      {/* MARKET */}
      <section id="market" className="max-w-[1280px] mx-auto px-5 mt-20 scroll-mt-20">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-6">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight">{t.market_title}</h2>
            <p className="text-white/45 mt-1">{t.market_sub}</p>
          </div>
          <div className="flex fx-glass rounded-xl p-1 gap-1">
            {([['all', t.tab_all], ['fiat', t.tab_fiat], ['crypto', t.tab_crypto]] as const).map(([f, label]) => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-4 py-1.5 text-sm font-bold rounded-lg transition-all ${filter === f ? 'bg-gradient-to-br from-fx-cyan to-fx-purple text-void' : 'text-white/50 hover:text-white'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))' }}>
          {!loaded
            ? Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="fx-glass rounded-2xl h-[130px] relative overflow-hidden">
                <div className="absolute inset-0 animate-shimmer" style={{ background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.05),transparent)', backgroundSize: '936px 100%' }} />
              </div>
            ))
            : visible.map((c, i) => (
              <MarketCard key={c.code} cur={c} index={i} t={t}
                price={market.prices[c.code] ?? 0}
                change={market.changes[c.code] ?? 0}
                candles={miniCandles[c.code] ?? []}
                selected={selected === c.code}
                onSelect={() => { setSelected(c.code); document.getElementById('charts')?.scrollIntoView({ behavior: 'smooth' }); }} />
            ))}
        </div>
      </section>

      <ChartCard t={t} cur={selectedCur} tf={tf} setTf={setTf}
        price={market.prices[selected] ?? 0} change={market.changes[selected] ?? 0}
        candles={candles} loading={chartLoading} />

      {/* ABOUT */}
      <section id="about" className="max-w-[1280px] mx-auto px-5 mt-20 scroll-mt-20">
        <h2 className="text-3xl font-extrabold tracking-tight text-center mb-10">{t.about_title}</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f, i) => (
            <div key={f.t} className="fx-glass fx-shine rounded-2xl p-6 animate-fade-up hover:-translate-y-1.5 transition-transform duration-300 relative overflow-hidden" style={{ animationDelay: `${i * 60}ms` }}>
              <div className="absolute -top-12 -right-12 w-28 h-28 rounded-full blur-3xl opacity-20" style={{ background: f.color }} aria-hidden="true" />
              <div className="grid place-items-center w-14 h-14 rounded-2xl text-3xl mb-4 relative" style={{ background: `${f.color}1a`, border: `1px solid ${f.color}33` }}>{f.e}</div>
              <h3 className="font-bold text-lg mb-2">{f.t}</h3>
              <p className="text-sm text-white/50 leading-relaxed">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="max-w-[1280px] mx-auto px-5 mt-20 py-10 border-t border-white/[0.06] text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="grid place-items-center w-7 h-7 rounded-lg bg-gradient-to-br from-fx-cyan via-fx-purple to-fx-pink">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M3 17l5-6 4 4 8-9" stroke="#04050a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span className="font-extrabold fx-grad-text">FX Pulse</span>
        </div>
        <p className="text-sm text-white/40">© {new Date().getFullYear()} FX Pulse. {t.footer_rights}</p>
        <p className="text-xs text-white/30 mt-1">{t.footer_note}</p>
      </footer>
    </div>
  );
};

export default Index;