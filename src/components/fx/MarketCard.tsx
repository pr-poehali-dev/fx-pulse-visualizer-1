import { useEffect, useRef } from 'react';
import { Currency, Candle } from '@/lib/fx-data';
import { drawMini } from '@/lib/fx-chart';
import { Dict } from '@/lib/fx-i18n';

interface Props {
  cur: Currency; price: number; change: number; candles: Candle[];
  selected: boolean; onSelect: () => void; t: Dict; index: number;
}

const MarketCard = ({ cur, price, change, candles, selected, onSelect, t, index }: Props) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => { if (ref.current) drawMini(ref.current, candles, cur.color); }, [candles, cur.color]);

  const up = change >= 0;
  const fmt = (n: number) =>
    n >= 1000 ? n.toLocaleString('en-US', { maximumFractionDigits: 0 })
      : n >= 1 ? n.toFixed(2) : n.toPrecision(4);

  return (
    <button
      onClick={onSelect}
      style={{ animationDelay: `${index * 60}ms`, ['--glow' as string]: cur.color }}
      className={`group text-left fx-glass rounded-2xl p-4 relative overflow-hidden transition-all duration-300 animate-fade-up hover:-translate-y-1.5
        ${selected ? 'ring-2 shadow-[0_0_30px_var(--glow)]' : 'hover:ring-1 ring-white/10'}`}
    >
      <div className="absolute -top-16 -right-16 w-32 h-32 rounded-full opacity-0 group-hover:opacity-30 transition-opacity blur-2xl"
        style={{ background: cur.color }} aria-hidden="true" />

      <div className="flex items-center gap-3 mb-3 relative">
        <img src={cur.icon} alt="" className="w-9 h-9 rounded-full object-cover bg-white/10" />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-bold">{cur.code}</span>
            <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${cur.type === 'crypto' ? 'bg-fx-purple/20 text-fx-purple' : 'bg-fx-cyan/20 text-fx-cyan'}`}>
              {cur.type === 'crypto' ? t.tab_crypto : t.tab_fiat}
            </span>
          </div>
          <div className="text-xs text-white/45 truncate">{cur.name}</div>
        </div>
      </div>

      <div className="flex items-end justify-between gap-2 relative">
        <div>
          <div className="font-mono text-lg font-bold tabular-nums">${fmt(price)}</div>
          <span className={`inline-flex items-center gap-1 text-xs font-bold mt-1 px-2 py-0.5 rounded-full ${up ? 'bg-fx-green/15 text-fx-green' : 'bg-fx-red/15 text-fx-red'}`}>
            {up ? '▲' : '▼'} {Math.abs(change).toFixed(2)}%
          </span>
        </div>
        <canvas ref={ref} className="w-[90px] h-[44px]" aria-hidden="true" />
      </div>
    </button>
  );
};

export default MarketCard;
