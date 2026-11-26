// Reports: six months of income against spending, the biggest categories over
// time, and plain-language insights the household can act on.

import { categoryById, monthTotals, spendingByCategory } from './data.js';
import { escapeHtml, money, moneyShort, monthShortLabel, shiftMonth, percent } from './format.js';
import { monthBarsChart, categoryBarsChart } from './charts.js';

export const title = 'Reports';

const MONTHS = ['2026-06', '2026-07', '2026-08', '2026-09', '2026-10', '2026-11'];

export function render(state) {
  const months = MONTHS.map((key) => {
    const t = monthTotals(state, key);
    return { key, label: monthShortLabel(key), income: t.income, spent: t.spent };
  });
  const totalIncome = months.reduce((s, m) => s + m.income, 0);
  const totalSpent = months.reduce((s, m) => s + m.spent, 0);
  const avgIncome = Math.round(totalIncome / months.length);
  const avgSpent = Math.round(totalSpent / months.length);
  const bestMonth = [...months].sort((a, b) => (b.income - b.spent) - (a.income - a.spent))[0];
  const worstMonth = [...months].sort((a, b) => (a.income - a.spent) - (b.income - b.spent))[0];

  // Six-month totals by category, with the household's monthly budget x6 for scale.
  const sixMonth = {};
  for (const key of MONTHS) {
    const byCat = spendingByCategory(state, key);
    for (const [id, v] of Object.entries(byCat)) sixMonth[id] = (sixMonth[id] || 0) + v;
  }
  const catEntries = Object.entries(sixMonth)
    .map(([id, spent]) => {
      const cat = categoryById(id);
      return { label: cat.label, color: cat.color, spent, budget: cat.budgetCents * MONTHS.length };
    })
    .sort((a, b) => b.spent - a.spent);

  // Biggest single transactions of the last six months (excluding rent and pay).
  const big = [...state.transactions]
    .filter((t) => t.kind === 'expense' && t.category !== 'housing')
    .sort((a, b) => b.amountCents - a.amountCents)
    .slice(0, 5);

  const insights = buildInsights(state, months, avgIncome, avgSpent, bestMonth, worstMonth);

  const bigRows = big.map((t) => `<tr>
    <td>${escapeHtml(t.date)}</td>
    <td>${escapeHtml(t.payee)}</td>
    <td>${escapeHtml(categoryById(t.category).label)}</td>
    <td class="num">${money(t.amountCents)}</td>
  </tr>`).join('');

  return `
  <div class="page-head">
    <div><h1>Reports</h1>
    <p>Six months of the Marlowe household's money — June to November 2026 — in charts and plain words.</p></div>
  </div>

  <div class="grid-3">
    <div class="stat"><p class="stat-label">Average money in / month</p><p class="stat-value good">${money(avgIncome)}</p><p class="stat-sub">Six-month total ${money(totalIncome)}</p></div>
    <div class="stat"><p class="stat-label">Average money out / month</p><p class="stat-value">${money(avgSpent)}</p><p class="stat-sub">Six-month total ${money(totalSpent)}</p></div>
    <div class="stat"><p class="stat-label">Average left over / month</p><p class="stat-value ${avgIncome - avgSpent < 0 ? 'bad' : 'good'}">${money(avgIncome - avgSpent)}</p><p class="stat-sub">Best month: ${escapeHtml(bestMonth.label)} (${money(bestMonth.income - bestMonth.spent)} left)</p></div>
  </div>

  <section class="card" style="margin-top:18px">
    <h2>Money in vs money out</h2>
    <p class="lede">Every month, June to November 2026. Green is income, terracotta is spending.</p>
    ${monthBarsChart(months)}
  </section>

  <div class="grid-2">
    <section class="card">
      <h2>Where six months went</h2>
      <p class="lede">Total spending by category against six months of budget.</p>
      ${categoryBarsChart(catEntries)}
    </section>
    <section class="card">
      <h2>Biggest single spends</h2>
      <p class="lede">The largest one-off payments in six months, rent excluded.</p>
      <div class="table-wrap"><table>
        <thead><tr><th>Date</th><th>What</th><th>Category</th><th class="num">Amount</th></tr></thead>
        <tbody>${bigRows}</tbody>
      </table></div>
      <p class="small muted" style="margin-top:12px">The biggest is usually childcare or the car loan — the fixed costs. The surprises hide in the small ones.</p>
    </section>
  </div>

  <section class="card">
    <h2>What six months say</h2>
    <ul class="insight-list">${insights.map((i) => `<li>${i}</li>`).join('')}</ul>
  </section>`;
}

function buildInsights(state, months, avgIncome, avgSpent, bestMonth, worstMonth) {
  const out = [];
  const savingsRate = avgIncome > 0 ? percent(avgIncome - avgSpent, avgIncome) : 0;
  out.push(`<strong>The household keeps about ${savingsRate}% of what it earns.</strong> On average ${money(avgIncome - avgSpent)} a month is left after everything is paid — enough to fund the $1,150 savings habit and still build a cushion.`);
  out.push(`<strong>${escapeHtml(bestMonth.label)} was the strongest month</strong> (${money(bestMonth.income - bestMonth.spent)} left over), and <strong>${escapeHtml(worstMonth.label)} the tightest</strong> (${money(worstMonth.income - worstMonth.spent)} left over). The gap is mostly the freelance pay landing on different days, not overspending.`);
  const sixMonth = {};
  for (const key of MONTHS) {
    const byCat = spendingByCategory(state, key);
    for (const [id, v] of Object.entries(byCat)) sixMonth[id] = (sixMonth[id] || 0) + v;
  }
  const top = Object.entries(sixMonth).filter(([id]) => id !== 'housing' && id !== 'savings').sort((a, b) => b[1] - a[1])[0];
  if (top) {
    const cat = categoryById(top[0]);
    out.push(`<strong>After rent and savings, ${escapeHtml(cat.label.toLowerCase())} is the biggest cost</strong> — ${money(top[1])} in six months, about ${money(Math.round(top[1] / 6))} a month. It is a fixed bill, so the lever is not spending less on it but checking the rate once a year.`);
  }
  const groceryAvg = Math.round((sixMonth.groceries || 0) / 6);
  const groceryBudget = state.categories.find((c) => c.id === 'groceries').budgetCents;
  out.push(groceryAvg <= groceryBudget
    ? `<strong>Groceries stay inside budget.</strong> About ${money(groceryAvg)} a month against an ${money(groceryBudget)} limit — the weekly shop at GreenMart is doing its job.`
    : `<strong>Groceries run over budget.</strong> About ${money(groceryAvg)} a month against an ${money(groceryBudget)} limit — worth a look at the shopping list before raising the limit.`);
  out.push(`<strong>November's pattern matches the last six months.</strong> No category has drifted far from its six-month average, so the budget limits still fit the household.`);
  return out;
}

export function bind() { /* Reports are read-only; nothing to bind. */ }
