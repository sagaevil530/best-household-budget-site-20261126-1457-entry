// Hand-built SVG charts for HearthLedger — no chart library, no images.
// donutChart: spending by category. barsChart: income vs spending across months.

import { escapeHtml, moneyShort } from './format.js';

export function donutChart(entries, size) {
  const total = entries.reduce((s, e) => s + e.value, 0);
  const radius = 84;
  const cx = 100;
  const cy = 100;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;
  let circles = '';
  if (total <= 0) {
    circles = `<circle cx="${cx}" cy="${cy}" r="${radius}" fill="none" stroke="#e4d9c4" stroke-width="26"/>`;
  } else {
    for (const entry of entries) {
      const frac = entry.value / total;
      const len = Math.max(frac * circumference - 2, 0.5);
      circles += `<circle cx="${cx}" cy="${cy}" r="${radius}" fill="none" stroke="${entry.color}" stroke-width="26" stroke-dasharray="${len.toFixed(1)} ${circumference.toFixed(1)}" stroke-dashoffset="${(-offset).toFixed(1)}"><title>${escapeHtml(entry.label)} — ${moneyShort(entry.value)}</title></circle>`;
      offset += frac * circumference;
    }
  }
  return `<svg class="chart-svg" viewBox="0 0 200 200" width="${size}" height="${size}" role="img" aria-label="Spending by category">
    ${circles}
    <text x="100" y="96" text-anchor="middle" class="donut-center" font-size="19" fill="#22302a">${moneyShort(total)}</text>
    <text x="100" y="116" text-anchor="middle" font-size="11.5" fill="#5c6b62">spent this month</text>
  </svg>`;
}

export function monthBarsChart(months) {
  // months: [{ label, income, spent }] in chronological order.
  const width = 640;
  const height = 260;
  const padLeft = 56;
  const padBottom = 30;
  const padTop = 14;
  const plotW = width - padLeft - 16;
  const plotH = height - padTop - padBottom;
  const maxVal = Math.max(1, ...months.flatMap((m) => [m.income, m.spent]));
  const scale = plotH / maxVal;
  const groupW = plotW / months.length;
  const barW = Math.min(30, (groupW - 18) / 2);
  let bars = '';
  let labels = '';
  months.forEach((m, i) => {
    const gx = padLeft + i * groupW + groupW / 2;
    const inH = Math.max(m.income * scale, 2);
    const outH = Math.max(m.spent * scale, 2);
    bars += `<rect x="${(gx - barW - 2).toFixed(1)}" y="${(padTop + plotH - inH).toFixed(1)}" width="${barW}" height="${inH.toFixed(1)}" rx="3" fill="#2e6b4f"><title>${escapeHtml(m.label)} income ${moneyShort(m.income)}</title></rect>`;
    bars += `<rect x="${(gx + 2).toFixed(1)}" y="${(padTop + plotH - outH).toFixed(1)}" width="${barW}" height="${outH.toFixed(1)}" rx="3" fill="#c96f3f"><title>${escapeHtml(m.label)} spending ${moneyShort(m.spent)}</title></rect>`;
    labels += `<text x="${gx.toFixed(1)}" y="${height - 10}" text-anchor="middle" font-size="12" fill="#5c6b62">${escapeHtml(m.label)}</text>`;
  });
  const gridLines = [0.25, 0.5, 0.75, 1].map((f) => {
    const y = padTop + plotH * (1 - f);
    const val = Math.round(maxVal * f);
    return `<line x1="${padLeft}" y1="${y.toFixed(1)}" x2="${width - 16}" y2="${y.toFixed(1)}" stroke="#e4d9c4" stroke-width="1"/><text x="${padLeft - 6}" y="${(y + 4).toFixed(1)}" text-anchor="end" font-size="11" fill="#8a978d">${moneyShort(val)}</text>`;
  }).join('');
  return `<svg class="chart-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="Income and spending by month">
    ${gridLines}
    ${bars}
    <line x1="${padLeft}" y1="${padTop + plotH}" x2="${width - 16}" y2="${padTop + plotH}" stroke="#c9bda2" stroke-width="1"/>
    ${labels}
  </svg>
  <p class="chart-note"><span style="color:#2e6b4f">■</span> Money in &nbsp; <span style="color:#c96f3f">■</span> Money out — six months, in dollars.</p>`;
}

export function categoryBarsChart(entries) {
  // entries: [{ label, color, spent, budget }] — horizontal bars, spent against budget.
  const rows = entries.map((e) => {
    const pct = e.budget > 0 ? Math.min(Math.round((e.spent / e.budget) * 100), 100) : 0;
    const over = e.spent > e.budget;
    return `<div class="bar-row">
      <div class="bar-head"><span><span class="cat-dot" style="background:${e.color}"></span>${escapeHtml(e.label)}</span><span class="pct">${moneyShort(e.spent)} of ${moneyShort(e.budget)} · ${pct}%</span></div>
      <div class="bar"><span class="${over ? 'over' : pct >= 85 ? 'near' : ''}" style="width:${pct}%"></span></div>
      <div class="bar-foot"><span>${over ? 'Over budget by ' + moneyShort(e.spent - e.budget) : moneyShort(e.budget - e.spent) + ' left'}</span><span>${over ? 'over' : 'on track'}</span></div>
    </div>`;
  }).join('');
  return rows;
}
