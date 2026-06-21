import { useEffect, useRef, useState } from 'react';
import { Currency, Candle, Timeframe } from '@/lib/fx-data';
import { drawChart } from '@/lib/fx-chart';
import { Dict } from '@/lib/fx-i18n';
import Icon from '@/components/ui/icon';

interface Props {
  cur: Currency; price: number; change: number; candles: Candle[];
  tf: Timeframe; setTf: (t: Timeframe) => void; loading: boolean; t: Dict;
}

const TFS: Timeframe[] = ['1D', '7D', '30D', '90D'];

const ChartCard = ({ cur, price, change, candles, tf, setTf, loading, t }: Props) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const [hoverX, setHoverX] = useState<number | null>(null);

  useEffect(() => {
    if (ref.current) drawChart(ref.current, { candles, symbol: cur.symbol === cur.code ? '$' : '$', tf, hoverX });
  }, [candles, tf, hoverX, cur]);

  useEffect(() => {
    const onResize = () => { if (ref.current) drawChart(ref.current, { candles, symbol: '$', tf, hoverX }); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [candles, tf, hoverX]);

  const up = change >= 0;
  const fmt = (n: number) => n >= 1000 ? n.toLocaleString('en-US', { maximumFractionDigits: 0 }) : n >= 1 ? n.toFixed(2) : n.toPrecision(4);

  const last = candles[candles.length - 1];
  const stats = last ? [
    [t.open, last.o], [t.high, Math.max(...candles.map(c => c.h))],
    [t.low, Math.min(...candles.map(c => c.l))], [t.close, last.c],
  ] : [];
  const totalVol = candles.reduce((s, c) => s + c.v, 0);

  return (
    <section id="charts" className="max-w-[1280px] mx-auto px-5 mt-20 scroll-mt-20">
      <div className="fx-glass rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl grid place-items-center shrink-0"
              style={{ background: cur.type === 'crypto' ? '#fff' : cur.color }}>
              <img src={cur.icon} alt="" className="w-9 h-9 rounded-full object-cover" />
            </div>
            <div>
              <div className="text-xs text-white/45 font-medium uppercase tracking-wider mb-0.5">{t.chart_title}</div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-2xl font-extrabold">{cur.name}</h2>
                <span className="font-mono text-sm text-white/40">{cur.code}</span>
              </div>
              <div className="flex items-center gap-3 mt-1">
                <span className="font-mono text-xl font-bold">${fmt(price)}</span>
                <span className={`text-sm font-bold ${up ? 'text-fx-green' : 'text-fx-red'}`}>
                  {up ? '▲' : '▼'} {Math.abs(change).toFixed(2)}%
                </span>
              </div>
            </div>
          </div>

          <div className="flex fx-glass rounded-xl p-1 gap-1">
            {TFS.map(f => (
              <button key={f} onClick={() => setTf(f)}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${tf === f ? 'bg-gradient-to-br from-fx-cyan to-fx-purple text-void' : 'text-white/50 hover:text-white'}`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-5">
          {stats.map(([label, val]) => (
            <div key={label as string} className="fx-glass rounded-xl px-3 py-2.5">
              <div className="text-[10px] uppercase tracking-wider text-white/40 mb-0.5">{label}</div>
              <div className="font-mono text-sm font-semibold">${fmt(val as number)}</div>
            </div>
          ))}
          <div className="fx-glass rounded-xl px-3 py-2.5">
            <div className="text-[10px] uppercase tracking-wider text-white/40 mb-0.5">{t.volume}</div>
            <div className="font-mono text-sm font-semibold">{totalVol.toFixed(1)}</div>
          </div>
        </div>

        <div className="relative">
          {loading && (
            <div className="absolute inset-0 grid place-items-center z-10">
              <Icon name="LoaderCircle" size={32} className="text-fx-cyan animate-spin" />
            </div>
          )}
          <canvas ref={ref}
            onMouseMove={e => setHoverX(e.clientX - e.currentTarget.getBoundingClientRect().left)}
            onMouseLeave={() => setHoverX(null)}
            className="w-full h-[460px] max-md:h-[360px] cursor-crosshair" />
        </div>
      </div>
    </section>
  );
};

export default ChartCard;
