import { useState } from 'react';
import { CURRENCIES, MarketState } from '@/lib/fx-data';
import { Dict } from '@/lib/fx-i18n';
import Icon from '@/components/ui/icon';

interface Props { t: Dict; market: MarketState; updated: string; }

const Converter = ({ t, market, updated }: Props) => {
  const [amount, setAmount] = useState('100');
  const [from, setFrom] = useState('USD');
  const [to, setTo] = useState('BTC');

  const fromCur = CURRENCIES.find(c => c.code === from)!;
  const toCur = CURRENCIES.find(c => c.code === to)!;
  const fromUsd = market.prices[from] ?? 1;
  const toUsd = market.prices[to] ?? 1;
  const rate = fromUsd / toUsd;
  const result = (parseFloat(amount) || 0) * rate;

  const fmt = (n: number) =>
    n >= 1 ? n.toLocaleString('en-US', { maximumFractionDigits: 4 })
      : n.toPrecision(6);

  const swap = () => { setFrom(to); setTo(from); };

  const Select = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => {
    const cur = CURRENCIES.find(c => c.code === value)!;
    return (
      <div className="relative flex items-center gap-2 fx-glass rounded-xl px-3 min-w-[130px]">
        <img src={cur.icon} alt="" className="w-6 h-6 rounded-full object-cover bg-white/10" />
        <select value={value} onChange={e => onChange(e.target.value)}
          aria-label="currency"
          className="appearance-none bg-transparent py-3 pr-5 font-semibold text-white outline-none cursor-pointer w-full">
          {CURRENCIES.map(c => (
            <option key={c.code} value={c.code} className="bg-[#0d1018] text-white">{c.code}</option>
          ))}
        </select>
        <Icon name="ChevronDown" size={16} className="absolute right-2.5 text-white/40 pointer-events-none" />
      </div>
    );
  };

  return (
    <section id="converter" className="max-w-[1280px] mx-auto px-5 mt-4 scroll-mt-20">
      <div className="fx-glass rounded-3xl p-6 sm:p-8 relative overflow-hidden animate-fade-up">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-fx-cyan/40 to-transparent" />
        <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Icon name="ArrowLeftRight" size={20} className="text-fx-cyan" />
            {t.conv_title}
          </h2>
          <span className="text-[11px] font-bold uppercase tracking-wider text-fx-gold border border-fx-gold/30 bg-fx-gold/10 px-3 py-1 rounded-full">
            {t.conv_demo}
          </span>
        </div>

        <div className="grid md:grid-cols-[1fr_auto_1fr] gap-4 items-end">
          <div>
            <label className="text-xs font-medium text-white/50 mb-2 block">{t.conv_from}</label>
            <div className="flex gap-2">
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
                className="flex-1 fx-glass rounded-xl px-4 py-3 font-mono text-lg font-semibold text-white outline-none focus:ring-1 focus:ring-fx-cyan/50 min-w-0" />
              <Select value={from} onChange={setFrom} />
            </div>
          </div>

          <button onClick={swap} aria-label="swap currencies"
            className="grid place-items-center w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-fx-cyan to-fx-purple text-void hover:rotate-180 transition-transform duration-500 shadow-[0_0_20px_rgba(0,212,255,0.4)]">
            <Icon name="ArrowLeftRight" size={20} />
          </button>

          <div>
            <label className="text-xs font-medium text-white/50 mb-2 block">{t.conv_to}</label>
            <div className="flex gap-2">
              <div className="flex-1 fx-glass rounded-xl px-4 py-3 font-mono text-lg font-bold fx-grad-text truncate min-w-0">
                {fmt(result)}
              </div>
              <Select value={to} onChange={setTo} />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between flex-wrap gap-2 mt-6 pt-4 border-t border-white/[0.06] text-sm">
          <span className="font-mono text-white/60">
            {t.conv_rate}: 1 {fromCur.code} = <span className="text-white font-semibold">{fmt(rate)}</span> {toCur.code}
          </span>
          <span className="text-white/40 text-xs flex items-center gap-1.5">
            <Icon name="Clock" size={13} /> {t.conv_updated}: {updated}
          </span>
        </div>
      </div>
    </section>
  );
};

export default Converter;
