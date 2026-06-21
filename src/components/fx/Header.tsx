import { useEffect, useState } from 'react';
import { Lang, Dict } from '@/lib/fx-i18n';

interface Props { t: Dict; lang: Lang; setLang: (l: Lang) => void; }

const Header = ({ t, lang, setLang }: Props) => {
  const [clock, setClock] = useState('--:--:--');
  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString('en-GB'));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const nav = [
    ['#converter', t.nav_converter], ['#market', t.nav_market],
    ['#charts', t.nav_charts], ['#about', t.nav_about],
  ];

  return (
    <header className="sticky top-0 z-50 fx-glass border-b border-white/[0.06]">
      <div className="max-w-[1280px] mx-auto px-5 h-16 flex items-center justify-between gap-4">
        <a href="#top" className="flex items-center gap-2.5 shrink-0" aria-label="FX Pulse home">
          <span className="grid place-items-center w-9 h-9 rounded-xl bg-gradient-to-br from-fx-cyan via-fx-purple to-fx-pink">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M3 17l5-6 4 4 8-9" stroke="#04050a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span className="text-lg font-extrabold tracking-tight fx-grad-text">FX Pulse</span>
        </a>

        <nav className="hidden md:flex items-center gap-1" aria-label="Primary">
          {nav.map(([href, label]) => (
            <a key={href} href={href}
              className="px-3.5 py-2 text-sm font-medium text-white/60 hover:text-white rounded-lg hover:bg-white/[0.05] transition-colors">
              {label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex fx-glass rounded-lg p-0.5">
            {(['en', 'ru'] as Lang[]).map(l => (
              <button key={l} onClick={() => setLang(l)}
                className={`px-2.5 py-1 text-xs font-bold rounded-md transition-colors ${lang === l ? 'bg-gradient-to-br from-fx-cyan to-fx-purple text-void' : 'text-white/50 hover:text-white'}`}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 fx-glass rounded-lg px-3 py-1.5">
            <span className="w-2 h-2 rounded-full bg-fx-green animate-pulse-dot shadow-[0_0_8px_#22c55e]" />
            <span className="text-[11px] font-bold text-fx-green tracking-wider">{t.live}</span>
            <span className="font-mono text-xs text-white/70 tabular-nums">{clock}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
