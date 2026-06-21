import { CURRENCIES, MarketState } from '@/lib/fx-data';

interface Props { market: MarketState; }

const Ticker = ({ market }: Props) => {
  const fmt = (n: number) =>
    n >= 1000 ? n.toLocaleString('en-US', { maximumFractionDigits: 0 })
      : n >= 1 ? n.toFixed(2) : n.toPrecision(4);

  const row = CURRENCIES.map(c => {
    const ch = market.changes[c.code] ?? 0;
    const up = ch >= 0;
    return (
      <span key={c.code} className="inline-flex items-center gap-2 px-5">
        <img src={c.icon} alt="" className="w-4 h-4 rounded-full object-cover bg-white/10" />
        <span className="font-bold text-white/90 text-sm">{c.code}</span>
        <span className="font-mono text-sm text-white/70">${fmt(market.prices[c.code] ?? 0)}</span>
        <span className={`font-mono text-xs font-bold ${up ? 'text-fx-green' : 'text-fx-red'}`}>
          {up ? '▲' : '▼'}{Math.abs(ch).toFixed(2)}%
        </span>
      </span>
    );
  });

  return (
    <div className="relative overflow-hidden border-b border-white/[0.06] bg-black/30 backdrop-blur-md py-2.5 group">
      <div className="absolute left-0 top-0 bottom-0 w-20 z-10 bg-gradient-to-r from-void to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-20 z-10 bg-gradient-to-l from-void to-transparent pointer-events-none" />
      <div className="flex whitespace-nowrap animate-[ticker_60s_linear_infinite] group-hover:[animation-play-state:paused]">
        <div className="flex shrink-0">{row}</div>
        <div className="flex shrink-0" aria-hidden="true">{row}</div>
      </div>
    </div>
  );
};

export default Ticker;
