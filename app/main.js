// HearthLedger router and boot. Hash routes, one per page:
//
//   #/                Dashboard
//   #/transactions    Transactions
//   #/budgets         Budgets
//   #/bills           Bills & recurring
//   #/goals           Savings goals
//   #/reports         Reports
//   #/settings        Settings
//
// window.__shotReady is false while a page renders and true once it is on
// screen, so a screenshot script knows when to capture.

import { loadState, saveState, monthTotals } from './data.js';
import { money } from './format.js';
import * as dashboard from './views-dashboard.js';
import * as transactions from './views-transactions.js';
import * as budgets from './views-budgets.js';
import * as bills from './views-bills.js';
import * as goals from './views-goals.js';
import * as reports from './views-reports.js';
import * as settings from './views-settings.js';

const app = document.getElementById('app');
const topbarTitle = document.getElementById('topbar-title');
const topbarDate = document.getElementById('topbar-date');
const side = document.querySelector('.side');
const menuBtn = document.getElementById('menu-btn');

let state = loadState();

const ROUTES = {
  '': dashboard,
  transactions,
  budgets,
  bills,
  goals,
  reports,
  settings,
};

const helpers = {
  save() { saveState(state); },
  refresh() { render(); },
  replaceState(next) { state = next; saveState(state); },
};

function renderSidebar() {
  const totals = monthTotals(state, state.currentMonth);
  document.getElementById('side-income').textContent = money(totals.income);
  document.getElementById('side-spent').textContent = money(totals.spent);
  document.getElementById('side-left').textContent = money(totals.left);
}

function render() {
  window.__shotReady = false;
  const route = location.hash.replace(/^#\/?/, '').split('/')[0];
  const view = ROUTES[route] || dashboard;
  document.title = `${view.title} — HearthLedger`;
  topbarTitle.textContent = view.title;
  topbarDate.textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  document.querySelectorAll('.nav a').forEach((a) => {
    a.classList.toggle('active', a.dataset.route === route);
  });
  app.innerHTML = view.render(state);
  renderSidebar();
  if (view.bind) view.bind(state, helpers);
  side.classList.remove('open');
  menuBtn.setAttribute('aria-expanded', 'false');
  window.scrollTo(0, 0);
  window.__shotReady = true;
}

menuBtn.addEventListener('click', () => {
  const open = side.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded', String(open));
});
side.addEventListener('click', (event) => {
  if (event.target.closest('a')) side.classList.remove('open');
});

window.addEventListener('hashchange', render);
render();
