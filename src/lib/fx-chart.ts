import type { Candle, Timeframe } from './fx-data';

const GREEN = '#22c55e';
const RED = '#ef4444';

export function drawMini(canvas: HTMLCanvasElement, candles: Candle[], color: string) {
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.clientWidth, h = canvas.clientHeight;
  canvas.width = w * dpr; canvas.height = h * dpr;
  const ctx = canvas.getContext('2d'); if (!ctx) return;
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, w, h);
  if (!candles.length) return;
  const data = candles.slice(-30);
  const hi = Math.max(...data.map(c => c.h));
  const lo = Math.min(...data.map(c => c.l));
  const range = hi - lo || 1;
  const cw = w / data.length;
  const y = (p: number) => h - ((p - lo) / range) * (h - 6) - 3;
  data.forEach((c, i) => {
    const x = i * cw + cw / 2;
    const up = c.c >= c.o;
    ctx.strokeStyle = up ? GREEN : RED;
    ctx.globalAlpha = 0.9;
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x, y(c.h)); ctx.lineTo(x, y(c.l)); ctx.stroke();
    ctx.fillStyle = up ? GREEN : RED;
    const bw = Math.max(1.5, cw * 0.6);
    const yo = y(c.o), yc = y(c.c);
    ctx.fillRect(x - bw / 2, Math.min(yo, yc), bw, Math.max(1, Math.abs(yc - yo)));
  });
  ctx.globalAlpha = 1;
  // subtle baseline glow
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, color + '00');
  grad.addColorStop(1, color + '22');
  ctx.fillStyle = grad;
  ctx.fillRect(0, h * 0.6, w, h * 0.4);
}

interface DrawOpts {
  candles: Candle[];
  symbol: string;
  tf: Timeframe;
  hoverX: number | null;
  onHoverCandle?: (c: Candle | null, px: number) => void;
}

const PAD = { l: 80, r: 24, t: 24, b: 56 };

export function drawChart(canvas: HTMLCanvasElement, opts: DrawOpts) {
  const { candles, symbol, tf, hoverX } = opts;
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.clientWidth, h = canvas.clientHeight;
  canvas.width = w * dpr; canvas.height = h * dpr;
  const ctx = canvas.getContext('2d'); if (!ctx) return;
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, w, h);
  if (!candles.length) return;

  const plotW = w - PAD.l - PAD.r;
  const plotH = h - PAD.t - PAD.b;
  const volH = plotH * 0.2;
  const priceH = plotH - volH;

  const hi = Math.max(...candles.map(c => c.h));
  const lo = Math.min(...candles.map(c => c.l));
  const range = hi - lo || 1;
  const maxV = Math.max(...candles.map(c => c.v), 0.0001);

  const x = (i: number) => PAD.l + (i + 0.5) * (plotW / candles.length);
  const y = (p: number) => PAD.t + priceH - ((p - lo) / range) * priceH;
  const vy = (v: number) => PAD.t + priceH + volH - (v / maxV) * volH;

  const fmtPrice = (p: number) => {
    if (p >= 1000) return p.toLocaleString('en-US', { maximumFractionDigits: 0 });
    if (p >= 1) return p.toFixed(2);
    return p.toPrecision(4);
  };

  // grid Y
  ctx.font = '11px "JetBrains Mono", monospace';
  ctx.textBaseline = 'middle';
  for (let i = 0; i <= 5; i++) {
    const yy = PAD.t + (priceH / 5) * i;
    const val = hi - (range / 5) * i;
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(PAD.l, yy); ctx.lineTo(w - PAD.r, yy); ctx.stroke();
    ctx.fillStyle = 'rgba(231,234,243,0.45)';
    ctx.textAlign = 'right';
    ctx.fillText(`${symbol}${fmtPrice(val)}`, PAD.l - 10, yy);
  }

  // grid X
  ctx.textAlign = 'center';
  const xticks = 6;
  for (let i = 0; i < xticks; i++) {
    const idx = Math.floor((candles.length - 1) * (i / (xticks - 1)));
    const xx = x(idx);
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.beginPath(); ctx.moveTo(xx, PAD.t); ctx.lineTo(xx, PAD.t + plotH); ctx.stroke();
    const d = new Date(candles[idx].t);
    const label = tf === '1D'
      ? `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
      : `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
    ctx.fillStyle = 'rgba(231,234,243,0.45)';
    ctx.fillText(label, xx, PAD.t + plotH + 18);
  }

  const cw = plotW / candles.length;
  const bw = Math.max(1.5, cw * 0.62);

  // volume
  candles.forEach((c, i) => {
    if (c.v <= 0) return;
    const up = c.c >= c.o;
    ctx.fillStyle = (up ? GREEN : RED) + '33';
    const top = vy(c.v);
    ctx.fillRect(x(i) - bw / 2, top, bw, PAD.t + priceH + volH - top);
  });

  // candles
  candles.forEach((c, i) => {
    const up = c.c >= c.o;
    const col = up ? GREEN : RED;
    const xx = x(i);
    ctx.strokeStyle = col; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(xx, y(c.h)); ctx.lineTo(xx, y(c.l)); ctx.stroke();
    ctx.fillStyle = col;
    const yo = y(c.o), yc = y(c.c);
    ctx.fillRect(xx - bw / 2, Math.min(yo, yc), bw, Math.max(1, Math.abs(yc - yo)));
  });

  // last price dashed line + tag
  const last = candles[candles.length - 1];
  const lastUp = last.c >= last.o;
  const lastCol = lastUp ? GREEN : RED;
  const ly = y(last.c);
  ctx.setLineDash([5, 5]);
  ctx.strokeStyle = lastCol + 'aa'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(PAD.l, ly); ctx.lineTo(w - PAD.r, ly); ctx.stroke();
  ctx.setLineDash([]);
  const tag = `${symbol}${fmtPrice(last.c)}`;
  ctx.font = '11px "JetBrains Mono", monospace';
  const tw = ctx.measureText(tag).width + 14;
  ctx.fillStyle = lastCol;
  ctx.fillRect(w - PAD.r - tw, ly - 9, tw, 18);
  ctx.fillStyle = '#04050a'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(tag, w - PAD.r - tw / 2, ly);

  // crosshair + tooltip
  if (hoverX != null && hoverX >= PAD.l && hoverX <= w - PAD.r) {
    const idx = Math.min(candles.length - 1, Math.max(0, Math.round((hoverX - PAD.l) / cw - 0.5)));
    const c = candles[idx];
    const xx = x(idx);
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(xx, PAD.t); ctx.lineTo(xx, PAD.t + plotH); ctx.stroke();
    ctx.setLineDash([]);

    const lines = [
      ['O', fmtPrice(c.o)], ['H', fmtPrice(c.h)],
      ['L', fmtPrice(c.l)], ['C', fmtPrice(c.c)],
    ];
    const boxW = 120, boxH = 76;
    let bx = xx + 14;
    if (bx + boxW > w - PAD.r) bx = xx - boxW - 14;
    const by = PAD.t + 8;
    ctx.fillStyle = 'rgba(13,16,24,0.92)';
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    roundRect(ctx, bx, by, boxW, boxH, 8); ctx.fill(); ctx.stroke();
    ctx.font = '11px "JetBrains Mono", monospace';
    ctx.textBaseline = 'middle';
    lines.forEach((ln, i) => {
      const yy = by + 16 + i * 15;
      ctx.textAlign = 'left'; ctx.fillStyle = 'rgba(231,234,243,0.5)';
      ctx.fillText(ln[0], bx + 12, yy);
      ctx.textAlign = 'right';
      ctx.fillStyle = c.c >= c.o ? GREEN : RED;
      ctx.fillText(`${symbol}${ln[1]}`, bx + boxW - 12, yy);
    });
  }
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function pickHoverIndex(candles: Candle[], hoverX: number, w: number): Candle | null {
  if (!candles.length) return null;
  const plotW = w - PAD.l - PAD.r;
  const cw = plotW / candles.length;
  const idx = Math.min(candles.length - 1, Math.max(0, Math.round((hoverX - PAD.l) / cw - 0.5)));
  return candles[idx] ?? null;
}
