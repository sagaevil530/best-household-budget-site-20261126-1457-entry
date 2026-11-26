// Budgets: one monthly limit per category. Edit any limit, and the bars show
// what is spent, what is left and what has gone over — for the chosen month.

import { spendingByCategory } from './data.js';
import { escapeHtml, money, moneyShort, monthLabel, shiftMonth, percent } from './format.js';
import { showToast } from './ui.js';

export const title = 'Budgets';

export function render(state) {
  const month = state.currentMonth;
  const byCat = spendingByCategory(state, month);
  const totalBudget = state.categories.reduce((s, c) => s + c.budgetCents, 0);
  const totalSpent = state.categories.reduce((s, c) => s + (byCat[c.id] || 0), 0);
  const totalPct = Math.min(percent(totalSpent, totalBudget), 100);

  const rows = state.categories.map((c) => {
    const spent = byCat[c.id] || 0;
    const pct = Math.min(percent(spent, c.budgetCents), 100);
    const over = spent > c.budgetCents;
    const left = c.budgetCents - spent;
    return `<div class="bar-row">
      <div class="bar-head">
        <span><span class="cat-dot" style="background:${c.color}"></span><strong>${escapeHtml(c.label)}</strong></span>
        <span class="pct">${moneyShort(spent)} of ${moneyShort(c.budgetCents)} · ${pct}%</span>
      </div>
      <div class="bar"><span class="${over ? 'over' : pct >= 85 ? 'near' : ''}" style="width:${pct}%"></span></div>
      <div class="bar-foot">
        <span>${over ? 'Over budget by ' + money(-left) : money(left) + ' left this month'}</span>
        <span><button class="btn ghost small" data-budget-edit="${c.id}">Change limit</button></span>
      </div>
    </div>`;
  }).join('');

  const overCount = state.categories.filter((c) => (byCat[c.id] || 0) > c.budgetCents).length;

  return `
  <div class="page-head">
    <div><h1>Budgets</h1>
    <p>Monthly limits for ${escapeHtml(monthLabel(month))}. Limits are set once and apply every month — change one any time and the whole household sees it.</p></div>
    <div class="month-nav">
      <button class="btn ghost small" data-month-shift="-1">← Prev</button>
      <span class="month-label">${escapeHtml(monthLabel(month))}</span>
      <button class="btn ghost small" data-month-shift="1">Next →</button>
    </div>
  </div>

  <div class="grid-3">
    <div class="stat"><p class="stat-label">Total budget</p><p class="stat-value">${money(totalBudget)}</p><p class="stat-sub">Across ${state.categories.length} categories</p></div>
    <div class="stat"><p class="stat-label">Spent so far</p><p class="stat-value ${totalSpent > totalBudget ? 'bad' : ''}">${money(totalSpent)}</p><p class="stat-sub">${totalPct}% of the month's budget</p></div>
    <div class="stat"><p class="stat-label">${totalSpent > totalBudget ? 'Over by' : 'Still to spend'}</p><p class="stat-value ${totalSpent > totalBudget ? 'bad' : 'good'}">${money(Math.abs(totalBudget - totalSpent))}</p><p class="stat-sub">${overCount ? overCount + (overCount === 1 ? ' category' : ' categories') + ' over budget' : 'Every category inside its limit'}</p></div>
  </div>

  <section class="card" style="margin-top:18px">
    <h2>Category limits</h2>
    <p class="lede">Spending is counted from the transactions in ${escapeHtml(monthLabel(month))}. A bar turns gold at 85% and red once the limit is passed.</p>
    ${rows}
  </section>

  <section class="card">
    <h2>How the Marlowe household sets its limits</h2>
    <ul class="insight-list">
      <li><strong>Needs first:</strong> housing, groceries, utilities, transport and childcare are set from the actual bills, then rounded up a little for a bad month.</li>
      <li><strong>Pay yourself first:</strong> $1,150 moves to savings on the 25th, before any fun money is spent.</li>
      <li><strong>One fun pot:</strong> dining out and entertainment share a $340 ceiling — if one goes over, the other gives way.</li>
      <li><strong>Review on the 1st:</strong> last month's leftovers roll into the emergency fund instead of vanishing.</li>
    </ul>
  </section>`;
}

export function bind(state, helpers) {
  document.querySelectorAll('[data-month-shift]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.currentMonth = shiftMonth(state.currentMonth, Number(btn.dataset.monthShift));
      helpers.save();
      helpers.refresh();
    });
  });
  document.querySelectorAll('[data-budget-edit]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const cat = state.categories.find((c) => c.id === btn.dataset.budgetEdit);
      if (!cat) return;
      const current = (cat.budgetCents / 100).toFixed(0);
      const answer = window.prompt(`Monthly limit for ${cat.label} (in dollars):`, current);
      if (answer === null) return;
      const cents = Math.round(parseFloat(answer) * 100);
      if (!Number.isFinite(cents) || cents < 0) { showToast('Enter a whole dollar amount of $0 or more.'); return; }
      cat.budgetCents = cents;
      helpers.save();
      showToast(`${cat.label} limit set to ${money(cents)}.`);
      helpers.refresh();
    });
  });
}
