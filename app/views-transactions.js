// Transactions: the household ledger. Filter by month, category or text, and add,
// edit or delete any entry. Everything is saved in the browser.

import { categoryById, monthTransactions, newId } from './data.js';
import { escapeHtml, money, monthLabel, monthShortLabel, shiftMonth, dayLabel } from './format.js';
import { openModal, closeModal, showToast, armConfirm } from './ui.js';

export const title = 'Transactions';

let filterCategory = 'all';
let filterText = '';
let sortNewest = true;

export function render(state) {
  const month = state.currentMonth;
  let list = [...monthTransactions(state, month)];
  if (filterCategory !== 'all') list = list.filter((t) => t.category === filterCategory || (filterCategory === 'income' && t.kind === 'income'));
  if (filterText.trim()) {
    const q = filterText.trim().toLowerCase();
    list = list.filter((t) => (t.payee + ' ' + (t.note || '')).toLowerCase().includes(q));
  }
  list.sort((a, b) => {
    const byDate = a.date < b.date ? -1 : a.date > b.date ? 1 : 0;
    return sortNewest ? -byDate : byDate;
  });

  const income = list.filter((t) => t.kind === 'income').reduce((s, t) => s + t.amountCents, 0);
  const spent = list.filter((t) => t.kind === 'expense').reduce((s, t) => s + t.amountCents, 0);

  const catOptions = ['all', 'income', ...state.categories.map((c) => c.id)]
    .map((id) => `<option value="${id}" ${filterCategory === id ? 'selected' : ''}>${id === 'all' ? 'All categories' : categoryById(id).label}</option>`)
    .join('');

  const rows = list.length ? list.map((t) => {
    const cat = categoryById(t.category);
    return `<tr>
      <td>${dayLabel(t.date)}<span class="sub">${escapeHtml(t.note)}</span></td>
      <td>${escapeHtml(t.payee)}</td>
      <td><span class="cat-dot" style="background:${cat.color}"></span>${escapeHtml(cat.label)}</td>
      <td class="num ${t.kind === 'income' ? 'money-in' : 'money-out'}">${t.kind === 'income' ? '+' : '−'}${money(t.amountCents)}</td>
      <td class="num"><button class="btn ghost small" data-edit="${t.id}">Edit</button> <button class="btn danger small" data-delete="${t.id}">Delete</button></td>
    </tr>`;
  }).join('') : `<tr><td colspan="5"><p class="empty">No transactions match these filters. Try another month or category.</p></td></tr>`;

  return `
  <div class="page-head">
    <div><h1>Transactions</h1>
    <p>Every dollar in and out for ${escapeHtml(monthLabel(month))}. ${list.length} shown — ${money(income)} in, ${money(spent)} out.</p></div>
    <div class="btn-row">
      <div class="month-nav">
        <button class="btn ghost small" data-month-shift="-1">← Prev</button>
        <span class="month-label">${escapeHtml(monthShortLabel(month))}</span>
        <button class="btn ghost small" data-month-shift="1">Next →</button>
      </div>
      <button class="btn" id="add-tx">+ Add transaction</button>
    </div>
  </div>

  <section class="card">
    <div class="filters">
      <div class="field"><label for="f-cat">Category</label><select id="f-cat">${catOptions}</select></div>
      <div class="field grow"><label for="f-text">Search payee or note</label><input id="f-text" type="search" placeholder="e.g. GreenMart, Thai, plumber" value="${escapeHtml(filterText)}"></div>
      <div class="field"><label for="f-sort">Order</label><select id="f-sort">
        <option value="new" ${sortNewest ? 'selected' : ''}>Newest first</option>
        <option value="old" ${!sortNewest ? 'selected' : ''}>Oldest first</option>
      </select></div>
    </div>
    <div class="table-wrap"><table>
      <thead><tr><th>Date</th><th>Payee</th><th>Category</th><th class="num">Amount</th><th class="num">Actions</th></tr></thead>
      <tbody>${rows}</tbody>
    </table></div>
  </section>`;
}

function transactionForm(state, existing) {
  const t = existing || { date: state.currentMonth + '-26', payee: '', category: 'groceries', kind: 'expense', amountCents: 0, note: '' };
  const amount = existing ? (existing.amountCents / 100).toFixed(2) : '';
  const catOptions = state.categories.map((c) => `<option value="${c.id}" ${t.category === c.id ? 'selected' : ''}>${escapeHtml(c.label)}</option>`).join('');
  return `<h2>${existing ? 'Edit transaction' : 'Add a transaction'}</h2>
  <p class="lede">${existing ? 'Change any field and save — the dashboard, budgets and reports update at once.' : 'Record money in or out. It saves in this browser straight away.'}</p>
  <form id="tx-form">
    <div class="form-grid">
      <div class="field"><label for="tx-kind">Type</label><select id="tx-kind" name="kind">
        <option value="expense" ${t.kind === 'expense' ? 'selected' : ''}>Money out (spending)</option>
        <option value="income" ${t.kind === 'income' ? 'selected' : ''}>Money in (income)</option>
      </select></div>
      <div class="field"><label for="tx-amount">Amount ($)</label><input id="tx-amount" name="amount" type="number" min="0.01" step="0.01" required value="${amount}" placeholder="0.00"></div>
      <div class="field"><label for="tx-date">Date</label><input id="tx-date" name="date" type="date" required value="${escapeHtml(t.date)}"></div>
      <div class="field"><label for="tx-cat">Category</label><select id="tx-cat" name="category">${catOptions}</select></div>
      <div class="field full"><label for="tx-payee">Payee / description</label><input id="tx-payee" name="payee" type="text" required maxlength="80" value="${escapeHtml(t.payee)}" placeholder="e.g. GreenMart weekly shop"></div>
      <div class="field full"><label for="tx-note">Note <span class="hint">(optional)</span></label><input id="tx-note" name="note" type="text" maxlength="120" value="${escapeHtml(t.note || '')}" placeholder="Anything worth remembering"></div>
    </div>
    <div class="btn-row" style="margin-top:16px">
      <button class="btn" type="submit">${existing ? 'Save changes' : 'Add transaction'}</button>
      <button class="btn ghost" type="button" id="tx-cancel">Cancel</button>
    </div>
  </form>`;
}

export function bind(state, helpers) {
  document.querySelectorAll('[data-month-shift]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.currentMonth = shiftMonth(state.currentMonth, Number(btn.dataset.monthShift));
      helpers.save();
      helpers.refresh();
    });
  });
  document.getElementById('f-cat').addEventListener('change', (e) => { filterCategory = e.target.value; helpers.refresh(); });
  document.getElementById('f-sort').addEventListener('change', (e) => { sortNewest = e.target.value === 'new'; helpers.refresh(); });
  document.getElementById('f-text').addEventListener('input', (e) => {
    filterText = e.target.value;
    const pos = e.target.selectionStart;
    helpers.refresh();
    const input = document.getElementById('f-text');
    if (input) { input.focus(); input.setSelectionRange(pos, pos); }
  });

  const openAdd = () => {
    openModal(transactionForm(state, null));
    document.getElementById('tx-cancel').addEventListener('click', closeModal);
    document.getElementById('tx-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const form = e.target;
      const cents = Math.round(parseFloat(form.amount.value) * 100);
      if (!Number.isFinite(cents) || cents <= 0) { showToast('Enter an amount above $0.'); return; }
      state.transactions.push({
        id: newId(state),
        date: form.date.value,
        payee: form.payee.value.trim(),
        category: form.category.value,
        kind: form.kind.value,
        amountCents: cents,
        note: form.note.value.trim(),
        billId: '', goalId: '',
      });
      state.transactions.sort((a, b) => (a.date < b.date ? -1 : 1));
      helpers.save();
      closeModal();
      showToast('Transaction added.');
      helpers.refresh();
    });
  };
  document.getElementById('add-tx').addEventListener('click', openAdd);

  document.querySelectorAll('[data-edit]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const tx = state.transactions.find((t) => t.id === btn.dataset.edit);
      if (!tx) return;
      openModal(transactionForm(state, tx));
      document.getElementById('tx-cancel').addEventListener('click', closeModal);
      document.getElementById('tx-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const form = e.target;
        const cents = Math.round(parseFloat(form.amount.value) * 100);
        if (!Number.isFinite(cents) || cents <= 0) { showToast('Enter an amount above $0.'); return; }
        tx.date = form.date.value;
        tx.payee = form.payee.value.trim();
        tx.category = form.category.value;
        tx.kind = form.kind.value;
        tx.amountCents = cents;
        tx.note = form.note.value.trim();
        state.transactions.sort((a, b) => (a.date < b.date ? -1 : 1));
        helpers.save();
        closeModal();
        showToast('Transaction updated.');
        helpers.refresh();
      });
    });
  });

  document.querySelectorAll('[data-delete]').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (!armConfirm(btn)) return;
      state.transactions = state.transactions.filter((t) => t.id !== btn.dataset.delete);
      helpers.save();
      showToast('Transaction deleted.');
      helpers.refresh();
    });
  });
}
