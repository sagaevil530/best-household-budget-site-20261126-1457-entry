// Dashboard: the month at a glance — money in and out, where it went, what is
// left, which bills are still due and how the savings goals are doing.

import { categoryById, monthTotals, monthTransactions, spendingByCategory, balanceAt } from './data.js';
import { donutChart } from './charts.js';
import { escapeHtml, money, moneyShort, monthLabel, monthShortLabel, shiftMonth, dayLabel, percent } from './format.js';

export const title = 'Dashboard';

export function render(state) {
  const month = state.currentMonth;
  const totals = monthTotals(state, month);
  const byCat = spendingByCategory(state, month);
  const balance = balanceAt(state, month + '-31');
  const savingsThisMonth = byCat.savings || 0;

  const donutEntries = Object.entries(byCat)
    .filter(([, v]) => v > 0)
    .map(([id, value]) => ({ label: categoryById(id).label, color: categoryById(id).color, value }))
    .sort((a, b) => b.value - a.value);

  const overBudget = state.categories
    .filter((c) => (byCat[c.id] || 0) > c.budgetCents)
    .map((c) => ({ label: c.label, over: (byCat[c.id] || 0) - c.budgetCents }));

  const topBudgets = state.categories
    .map((c) => ({ ...c, spent: byCat[c.id] || 0 }))
    .sort((a, b) => (b.spent / b.budgetCents) - (a.spent / a.budgetCents))
    .slice(0, 5);

  const upcoming = state.bills
    .map((bill) => {
      const paid = state.transactions.some(
        (t) => t.billId === bill.id && t.date.slice(0, 7) === month,
      );
      return { ...bill, paid };
    })
    .filter((b) => !b.paid)
    .sort((a, b) => a.day - b.day)
    .slice(0, 5);

  const recent = [...monthTransactions(state, month)]
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 8);

  const legend = donutEntries.map((e) => `<li><span><span class="cat-dot" style="background:${e.color}"></span>${escapeHtml(e.label)}</span><span class="amt">${money(e.value)}</span></li>`).join('');

  const budgetRows = topBudgets.map((c) => {
    const pct = Math.min(percent(c.spent, c.budgetCents), 100);
    const over = c.spent > c.budgetCents;
    return `<div class="bar-row">
      <div class="bar-head"><strong>${escapeHtml(c.label)}</strong><span class="pct">${moneyShort(c.spent)} of ${moneyShort(c.budgetCents)}</span></div>
      <div class="bar"><span class="${over ? 'over' : pct >= 85 ? 'near' : ''}" style="width:${pct}%"></span></div>
    </div>`;
  }).join('');

  const goalRows = state.goals.map((g) => {
    const pct = Math.min(percent(g.savedCents, g.targetCents), 100);
    return `<div class="bar-row">
      <div class="bar-head"><strong>${escapeHtml(g.name)}</strong><span class="pct">${moneyShort(g.savedCents)} of ${moneyShort(g.targetCents)}</span></div>
      <div class="bar"><span style="width:${pct}%"></span></div>
    </div>`;
  }).join('');

  const billRows = upcoming.length
    ? upcoming.map((b) => `<div class="bill-row">
        <div class="bill-main"><h3>${escapeHtml(b.name)}</h3><p>${escapeHtml(b.note)}</p></div>
        <div class="bill-amt"><strong>${money(b.amountCents)}</strong><span class="due">due ${monthShortLabel(month).split(' ')[0]} ${b.day}${b.autopay ? ' · autopay' : ''}</span></div>
      </div>`).join('')
    : `<p class="empty">Every bill for ${escapeHtml(monthLabel(month))} is paid. Nicely done.</p>`;

  const recentRows = recent.map((t) => {
    const cat = categoryById(t.category);
    return `<tr>
      <td>${dayLabel(t.date)}<span class="sub">${escapeHtml(t.payee)}</span></td>
      <td><span class="cat-dot" style="background:${cat.color}"></span>${escapeHtml(cat.label)}</td>
      <td class="num ${t.kind === 'income' ? 'money-in' : 'money-out'}">${t.kind === 'income' ? '+' : '−'}${money(t.amountCents)}</td>
    </tr>`;
  }).join('');

  return `
  <div class="page-head">
    <div><h1>Good evening, Marlowe household</h1>
    <p>Here is ${escapeHtml(monthLabel(month))} so far — what came in, what went out, and what is left for the rest of the month.</p></div>
    <div class="month-nav">
      <button class="btn ghost small" data-month-shift="-1" aria-label="Previous month">← Prev</button>
      <span class="month-label">${escapeHtml(monthLabel(month))}</span>
      <button class="btn ghost small" data-month-shift="1" aria-label="Next month">Next →</button>
    </div>
  </div>

  ${overBudget.length ? `<div class="callout red"><p><strong>Over budget:</strong> ${overBudget.map((o) => `${escapeHtml(o.label)} by ${money(o.over)}`).join(', ')}. Take a look at the <a href="#/budgets">Budgets page</a> to move money around.</p></div>` : `<div class="callout green"><p><strong>On track.</strong> Every category is inside its budget for ${escapeHtml(monthLabel(month))}.</p></div>`}

  <div class="grid-3">
    <div class="stat"><p class="stat-label">Money in</p><p class="stat-value good">${money(totals.income)}</p><p class="stat-sub">Paydays on the 1st, 15th and 20th</p></div>
    <div class="stat"><p class="stat-label">Money out</p><p class="stat-value">${money(totals.spent)}</p><p class="stat-sub">Includes ${money(savingsThisMonth)} moved to savings</p></div>
    <div class="stat"><p class="stat-label">Left to spend</p><p class="stat-value ${totals.left < 0 ? 'bad' : ''}">${money(totals.left)}</p><p class="stat-sub">Checking balance: ${money(balance)}</p></div>
  </div>

  <div class="grid-2wide" style="margin-top:18px">
    <section class="card">
      <h2>Where the money went</h2>
      <p class="lede">Spending by category, ${escapeHtml(monthLabel(month))}.</p>
      <div class="donut-wrap">${donutChart(donutEntries, 200)}<ul class="legend">${legend}</ul></div>
    </section>
    <section class="card">
      <h2>Budgets closest to the edge</h2>
      <p class="lede">The five categories nearest their monthly limit.</p>
      ${budgetRows}
      <p style="margin-top:14px"><a class="btn ghost small" href="#/budgets">See all budgets →</a></p>
    </section>
  </div>

  <div class="grid-2">
    <section class="card">
      <h2>Bills still to pay</h2>
      <p class="lede">Unpaid bills for ${escapeHtml(monthLabel(month))}, soonest first.</p>
      ${billRows}
      <p style="margin-top:14px"><a class="btn ghost small" href="#/bills">All bills &amp; recurring →</a></p>
    </section>
    <section class="card">
      <h2>Savings goals</h2>
      <p class="lede">${money(savingsThisMonth)} went into savings this month.</p>
      ${goalRows}
      <p style="margin-top:14px"><a class="btn ghost small" href="#/goals">Add to a goal →</a></p>
    </section>
  </div>

  <section class="card">
    <h2>Recent transactions</h2>
    <p class="lede">The latest money in and out for ${escapeHtml(monthLabel(month))}.</p>
    <div class="table-wrap"><table>
      <thead><tr><th>Date</th><th>Category</th><th class="num">Amount</th></tr></thead>
      <tbody>${recentRows}</tbody>
    </table></div>
    <p style="margin-top:14px"><a class="btn ghost small" href="#/transactions">All transactions →</a></p>
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
}
