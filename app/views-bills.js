// Bills & recurring: the household's fixed outgoings. Mark a bill paid (which
// records the payment as a transaction), add a new bill, or edit and remove one.

import { categoryById, newId } from './data.js';
import { escapeHtml, money, monthLabel } from './format.js';
import { openModal, closeModal, showToast, armConfirm } from './ui.js';

export const title = 'Bills & recurring';

export function render(state) {
  const month = state.currentMonth;
  const rows = [...state.bills].sort((a, b) => a.day - b.day).map((bill) => {
    const paidTx = state.transactions.find((t) => t.billId === bill.id && t.date.slice(0, 7) === month);
    const cat = categoryById(bill.category);
    return `<div class="bill-row">
      <div class="bill-main">
        <h3>${escapeHtml(bill.name)}</h3>
        <p>${escapeHtml(bill.note)}</p>
        <p><span class="cat-dot" style="background:${cat.color}"></span>${escapeHtml(cat.label)} · due the ${bill.day}${bill.day === 1 ? 'st' : bill.day === 2 ? 'nd' : bill.day === 3 ? 'rd' : 'th'} ${bill.autopay ? '· autopay on' : '· pay by hand'}</p>
      </div>
      <div class="bill-amt">
        <strong>${money(bill.amountCents)}</strong>
        <span class="due">${paidTx ? 'Paid ' + paidTx.date.slice(8) + ' ' + monthLabel(month).split(' ')[0] : 'Not paid yet'}</span>
        <span class="due" style="margin-top:6px; display:block">
          ${paidTx
            ? '<span class="pill">✓ Paid</span>'
            : `<button class="btn small" data-pay="${bill.id}">Mark paid</button>`}
          <button class="btn ghost small" data-bill-edit="${bill.id}">Edit</button>
          <button class="btn danger small" data-bill-delete="${bill.id}">Delete</button>
        </span>
      </div>
    </div>`;
  }).join('');

  const total = state.bills.reduce((s, b) => s + b.amountCents, 0);
  const paidTotal = state.bills.reduce((s, b) => s + (state.transactions.some((t) => t.billId === b.id && t.date.slice(0, 7) === month) ? b.amountCents : 0), 0);

  return `
  <div class="page-head">
    <div><h1>Bills &amp; recurring</h1>
    <p>Fixed outgoings for ${escapeHtml(monthLabel(month))}. Marking a bill paid records the payment in Transactions, so the books always agree.</p></div>
    <button class="btn" id="add-bill">+ Add a bill</button>
  </div>

  <div class="grid-3">
    <div class="stat"><p class="stat-label">Fixed bills this month</p><p class="stat-value">${money(total)}</p><p class="stat-sub">${state.bills.length} recurring payments</p></div>
    <div class="stat"><p class="stat-label">Already paid</p><p class="stat-value good">${money(paidTotal)}</p><p class="stat-sub">${state.bills.filter((b) => state.transactions.some((t) => t.billId === b.id && t.date.slice(0, 7) === month)).length} of ${state.bills.length} bills</p></div>
    <div class="stat"><p class="stat-label">Still to pay</p><p class="stat-value ${total - paidTotal > 0 ? 'warn' : 'good'}">${money(total - paidTotal)}</p><p class="stat-sub">Due before the month ends</p></div>
  </div>

  <section class="card" style="margin-top:18px">
    <h2>All bills</h2>
    <p class="lede">Soonest due first. Autopay bills are taken automatically; the rest need a tap.</p>
    ${rows}
  </section>

  <section class="card">
    <h2>How the household handles bills</h2>
    <ul class="insight-list">
      <li><strong>Payday order:</strong> rent and childcare go out on the 1st and 3rd, right after Theo's pay lands, so the big ones never wait on June's pay on the 15th.</li>
      <li><strong>Autopay where it is safe:</strong> everything fixed is on autopay. Only the mobile bill is paid by hand, because its amount changes.</li>
      <li><strong>One change a month:</strong> if a bill rises, the budget for its category is raised the same day — never silently.</li>
    </ul>
  </section>`;
}

function billForm(state, existing) {
  const b = existing || { name: '', amountCents: 0, day: 1, category: 'utilities', autopay: true, note: '' };
  const amount = existing ? (existing.amountCents / 100).toFixed(2) : '';
  const catOptions = state.categories.map((c) => `<option value="${c.id}" ${b.category === c.id ? 'selected' : ''}>${escapeHtml(c.label)}</option>`).join('');
  return `<h2>${existing ? 'Edit bill' : 'Add a recurring bill'}</h2>
  <p class="lede">A bill repeats every month on the same day.</p>
  <form id="bill-form">
    <div class="form-grid">
      <div class="field full"><label for="bill-name">Bill name</label><input id="bill-name" name="name" type="text" required maxlength="80" value="${escapeHtml(b.name)}" placeholder="e.g. Water — City Water"></div>
      <div class="field"><label for="bill-amount">Amount ($ per month)</label><input id="bill-amount" name="amount" type="number" min="0.01" step="0.01" required value="${amount}" placeholder="0.00"></div>
      <div class="field"><label for="bill-day">Day of month</label><input id="bill-day" name="day" type="number" min="1" max="28" required value="${b.day}"></div>
      <div class="field"><label for="bill-cat">Category</label><select id="bill-cat" name="category">${catOptions}</select></div>
      <div class="field"><label for="bill-auto">Payment</label><select id="bill-auto" name="autopay">
        <option value="yes" ${b.autopay ? 'selected' : ''}>Autopay</option>
        <option value="no" ${!b.autopay ? 'selected' : ''}>Pay by hand</option>
      </select></div>
      <div class="field full"><label for="bill-note">Note <span class="hint">(optional)</span></label><input id="bill-note" name="note" type="text" maxlength="120" value="${escapeHtml(b.note || '')}"></div>
    </div>
    <div class="btn-row" style="margin-top:16px">
      <button class="btn" type="submit">${existing ? 'Save changes' : 'Add bill'}</button>
      <button class="btn ghost" type="button" id="bill-cancel">Cancel</button>
    </div>
  </form>`;
}

function readBillForm(form) {
  const cents = Math.round(parseFloat(form.amount.value) * 100);
  const day = parseInt(form.day.value, 10);
  if (!Number.isFinite(cents) || cents <= 0) return { error: 'Enter an amount above $0.' };
  if (!Number.isInteger(day) || day < 1 || day > 28) return { error: 'Day of month must be 1 to 28.' };
  return {
    value: {
      name: form.name.value.trim(),
      amountCents: cents,
      day,
      category: form.category.value,
      autopay: form.autopay.value === 'yes',
      note: form.note.value.trim(),
    },
  };
}

export function bind(state, helpers) {
  document.getElementById('add-bill').addEventListener('click', () => {
    openModal(billForm(state, null));
    document.getElementById('bill-cancel').addEventListener('click', closeModal);
    document.getElementById('bill-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const { value, error } = readBillForm(e.target);
      if (error) { showToast(error); return; }
      state.bills.push({ id: 'bill-' + Date.now().toString(36), ...value });
      helpers.save();
      closeModal();
      showToast('Bill added.');
      helpers.refresh();
    });
  });

  document.querySelectorAll('[data-bill-edit]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const bill = state.bills.find((b) => b.id === btn.dataset.billEdit);
      if (!bill) return;
      openModal(billForm(state, bill));
      document.getElementById('bill-cancel').addEventListener('click', closeModal);
      document.getElementById('bill-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const { value, error } = readBillForm(e.target);
        if (error) { showToast(error); return; }
        Object.assign(bill, value);
        helpers.save();
        closeModal();
        showToast('Bill updated.');
        helpers.refresh();
      });
    });
  });

  document.querySelectorAll('[data-bill-delete]').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (!armConfirm(btn)) return;
      state.bills = state.bills.filter((b) => b.id !== btn.dataset.billDelete);
      helpers.save();
      showToast('Bill removed.');
      helpers.refresh();
    });
  });

  document.querySelectorAll('[data-pay]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const bill = state.bills.find((b) => b.id === btn.dataset.pay);
      if (!bill) return;
      const month = state.currentMonth;
      const date = month + '-' + String(Math.min(bill.day, 28)).padStart(2, '0');
      state.transactions.push({
        id: newId(state),
        date,
        payee: bill.name,
        category: bill.category,
        kind: 'expense',
        amountCents: bill.amountCents,
        note: 'Bill payment',
        billId: bill.id,
        goalId: '',
      });
      state.transactions.sort((a, b) => (a.date < b.date ? -1 : 1));
      helpers.save();
      showToast(`${bill.name} marked paid — ${money(bill.amountCents)} recorded.`);
      helpers.refresh();
    });
  });
}
