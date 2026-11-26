// Savings goals: what the household is saving for, how far along each pot is,
// and adding money to a goal (which records the transfer as a transaction).

import { newId } from './data.js';
import { escapeHtml, money, moneyShort, percent } from './format.js';
import { openModal, closeModal, showToast, armConfirm } from './ui.js';

export const title = 'Savings goals';

export function render(state) {
  const totalSaved = state.goals.reduce((s, g) => s + g.savedCents, 0);
  const totalTarget = state.goals.reduce((s, g) => s + g.targetCents, 0);
  const totalPct = Math.min(percent(totalSaved, totalTarget), 100);

  const rows = [...state.goals].sort((a, b) => b.savedCents / b.targetCents - a.savedCents / a.targetCents).map((g) => {
    const pct = Math.min(percent(g.savedCents, g.targetCents), 100);
    const remaining = g.targetCents - g.savedCents;
    const monthsLeft = g.deadline ? monthsUntil(g.deadline) : null;
    const monthlyNeeded = monthsLeft && monthsLeft > 0 ? Math.ceil(remaining / monthsLeft / 100) : null;
    return `<div class="goal-row">
      <div class="goal-main">
        <h3>${escapeHtml(g.name)}</h3>
        <p>${escapeHtml(g.note)}</p>
        <p style="margin-top:4px">${g.deadline ? `Target date: ${escapeHtml(g.deadline)}${monthlyNeeded ? ` · about $${monthlyNeeded.toLocaleString('en-US')} a month from here` : ''}` : ''}</p>
        <div class="bar" style="margin-top:8px"><span style="width:${pct}%"></span></div>
        <div class="bar-foot"><span>${moneyShort(g.savedCents)} of ${moneyShort(g.targetCents)} · ${pct}%</span><span>${remaining > 0 ? moneyShort(remaining) + ' to go' : 'Reached!'}</span></div>
      </div>
      <div class="bill-amt">
        <button class="btn small" data-goal-add="${g.id}">Add funds</button>
        <span style="display:block; margin-top:6px"><button class="btn ghost small" data-goal-edit="${g.id}">Edit</button> <button class="btn danger small" data-goal-delete="${g.id}">Delete</button></span>
      </div>
    </div>`;
  }).join('');

  return `
  <div class="page-head">
    <div><h1>Savings goals</h1>
    <p>Four pots, one habit: $1,150 moves into savings on the 25th of every month, split between them. Add money any time — it is recorded as a transfer straight away.</p></div>
    <button class="btn" id="add-goal">+ New goal</button>
  </div>

  <div class="grid-3">
    <div class="stat"><p class="stat-label">Saved across all goals</p><p class="stat-value good">${money(totalSaved)}</p><p class="stat-sub">${totalPct}% of ${money(totalTarget)} combined</p></div>
    <div class="stat"><p class="stat-label">Monthly habit</p><p class="stat-value">$1,150</p><p class="stat-sub">Automatic transfers on the 25th</p></div>
    <div class="stat"><p class="stat-label">Closest to done</p><p class="stat-value">${escapeHtml(closestGoal(state).name)}</p><p class="stat-sub">${percent(closestGoal(state).savedCents, closestGoal(state).targetCents)}% funded</p></div>
  </div>

  <section class="card" style="margin-top:18px">
    <h2>Your goals</h2>
    <p class="lede">Most funded first.</p>
    ${rows}
  </section>

  <section class="card">
    <h2>How the household saves</h2>
    <ul class="insight-list">
      <li><strong>Pay yourself first:</strong> the $1,150 transfer goes out on the 25th, the day after the last grocery shop, so it is never "whatever is left".</li>
      <li><strong>Small pots, real dates:</strong> every goal has a target date. The holiday is July 2027; the car is March 2028.</li>
      <li><strong>Emergencies only:</strong> the emergency fund is for a broken boiler or a lost job — never for a sale.</li>
    </ul>
  </section>`;
}

function monthsUntil(deadline) {
  const [y, m] = deadline.split('-').map(Number);
  const now = new Date();
  return Math.max(0, (y - now.getFullYear()) * 12 + (m - (now.getMonth() + 1)));
}

function closestGoal(state) {
  return [...state.goals].sort((a, b) => b.savedCents / b.targetCents - a.savedCents / a.targetCents)[0];
}

function goalForm(state, existing) {
  const g = existing || { name: '', targetCents: 0, savedCents: 0, deadline: '', note: '' };
  const target = existing ? (existing.targetCents / 100).toFixed(0) : '';
  const saved = existing ? (existing.savedCents / 100).toFixed(0) : '0';
  return `<h2>${existing ? 'Edit goal' : 'Start a new savings goal'}</h2>
  <form id="goal-form">
    <div class="form-grid">
      <div class="field full"><label for="goal-name">Goal name</label><input id="goal-name" name="name" type="text" required maxlength="80" value="${escapeHtml(g.name)}" placeholder="e.g. New roof"></div>
      <div class="field"><label for="goal-target">Target amount ($)</label><input id="goal-target" name="target" type="number" min="1" step="1" required value="${target}" placeholder="5000"></div>
      <div class="field"><label for="goal-saved">Already saved ($)</label><input id="goal-saved" name="saved" type="number" min="0" step="1" required value="${saved}"></div>
      <div class="field"><label for="goal-deadline">Target date</label><input id="goal-deadline" name="deadline" type="date" value="${escapeHtml(g.deadline || '')}"></div>
      <div class="field full"><label for="goal-note">Note <span class="hint">(optional)</span></label><input id="goal-note" name="note" type="text" maxlength="140" value="${escapeHtml(g.note || '')}" placeholder="Why this matters"></div>
    </div>
    <div class="btn-row" style="margin-top:16px">
      <button class="btn" type="submit">${existing ? 'Save changes' : 'Create goal'}</button>
      <button class="btn ghost" type="button" id="goal-cancel">Cancel</button>
    </div>
  </form>`;
}

function readGoalForm(form) {
  const target = Math.round(parseFloat(form.target.value) * 100);
  const saved = Math.round(parseFloat(form.saved.value) * 100);
  if (!Number.isFinite(target) || target <= 0) return { error: 'Enter a target above $0.' };
  if (!Number.isFinite(saved) || saved < 0) return { error: 'Saved so far must be $0 or more.' };
  return {
    value: {
      name: form.name.value.trim(),
      targetCents: target,
      savedCents: saved,
      deadline: form.deadline.value || '',
      note: form.note.value.trim(),
    },
  };
}

export function bind(state, helpers) {
  document.getElementById('add-goal').addEventListener('click', () => {
    openModal(goalForm(state, null));
    document.getElementById('goal-cancel').addEventListener('click', closeModal);
    document.getElementById('goal-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const { value, error } = readGoalForm(e.target);
      if (error) { showToast(error); return; }
      state.goals.push({ id: 'goal-' + Date.now().toString(36), ...value });
      helpers.save();
      closeModal();
      showToast('Goal created.');
      helpers.refresh();
    });
  });

  document.querySelectorAll('[data-goal-edit]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const goal = state.goals.find((g) => g.id === btn.dataset.goalEdit);
      if (!goal) return;
      openModal(goalForm(state, goal));
      document.getElementById('goal-cancel').addEventListener('click', closeModal);
      document.getElementById('goal-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const { value, error } = readGoalForm(e.target);
        if (error) { showToast(error); return; }
        Object.assign(goal, value);
        helpers.save();
        closeModal();
        showToast('Goal updated.');
        helpers.refresh();
      });
    });
  });

  document.querySelectorAll('[data-goal-delete]').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (!armConfirm(btn)) return;
      state.goals = state.goals.filter((g) => g.id !== btn.dataset.goalDelete);
      helpers.save();
      showToast('Goal removed.');
      helpers.refresh();
    });
  });

  document.querySelectorAll('[data-goal-add]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const goal = state.goals.find((g) => g.id === btn.dataset.goalAdd);
      if (!goal) return;
      openModal(`<h2>Add funds — ${escapeHtml(goal.name)}</h2>
      <p class="lede">This records a transfer from checking to the goal, dated today, and adds it to the goal's balance.</p>
      <form id="fund-form">
        <div class="form-grid">
          <div class="field"><label for="fund-amount">Amount ($)</label><input id="fund-amount" name="amount" type="number" min="0.01" step="0.01" required placeholder="100.00"></div>
          <div class="field"><label for="fund-date">Date</label><input id="fund-date" name="date" type="date" required value="${state.currentMonth}-26"></div>
        </div>
        <div class="btn-row" style="margin-top:16px">
          <button class="btn" type="submit">Add funds</button>
          <button class="btn ghost" type="button" id="fund-cancel">Cancel</button>
        </div>
      </form>`);
      document.getElementById('fund-cancel').addEventListener('click', closeModal);
      document.getElementById('fund-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const form = e.target;
        const cents = Math.round(parseFloat(form.amount.value) * 100);
        if (!Number.isFinite(cents) || cents <= 0) { showToast('Enter an amount above $0.'); return; }
        goal.savedCents += cents;
        state.transactions.push({
          id: newId(state),
          date: form.date.value,
          payee: 'Transfer — ' + goal.name,
          category: 'savings',
          kind: 'expense',
          amountCents: cents,
          note: 'Extra contribution',
          billId: '',
          goalId: goal.id,
        });
        state.transactions.sort((a, b) => (a.date < b.date ? -1 : 1));
        helpers.save();
        closeModal();
        showToast(`${money(cents)} added to ${goal.name}.`);
        helpers.refresh();
      });
    });
  });
}
