// Settings: the household's details, a look at the data itself, export and
// import, and starting over from the original records.

import { resetState } from './data.js';
import { escapeHtml, money } from './format.js';
import { showToast, armConfirm } from './ui.js';

export const title = 'Settings';

export function render(state) {
  const txCount = state.transactions.length;
  const firstDate = state.transactions[0]?.date || '—';
  const lastDate = state.transactions[state.transactions.length - 1]?.date || '—';
  const json = JSON.stringify(state, null, 2);
  return `
  <div class="page-head">
    <div><h1>Settings</h1>
    <p>Household details, your data, and a way back to the original records.</p></div>
  </div>

  <section class="card">
    <h2>Household</h2>
    <form id="household-form">
      <div class="form-grid">
        <div class="field"><label for="hs-name">Household name</label><input id="hs-name" name="name" type="text" required maxlength="80" value="${escapeHtml(state.household.name)}"></div>
        <div class="field"><label for="hs-members">Who lives here</label><input id="hs-members" name="members" type="text" maxlength="120" value="${escapeHtml(state.household.members)}"></div>
        <div class="field"><label for="hs-home">Home</label><input id="hs-home" name="home" type="text" maxlength="120" value="${escapeHtml(state.household.home)}"></div>
        <div class="field"><label for="hs-payday">Paydays</label><input id="hs-payday" name="payday" type="text" maxlength="140" value="${escapeHtml(state.household.payday)}"></div>
        <div class="field"><label for="hs-opening">Opening balance on ${escapeHtml(state.household.openingDate)} ($)</label><input id="hs-opening" name="opening" type="number" step="0.01" value="${(state.household.openingBalanceCents / 100).toFixed(2)}"></div>
      </div>
      <div class="btn-row" style="margin-top:16px"><button class="btn" type="submit">Save household details</button></div>
    </form>
  </section>

  <section class="card">
    <h2>Your data</h2>
    <p>Everything on this site lives in this browser, under the key <code>hearthledger-v1</code>. ${txCount} transactions, from ${escapeHtml(firstDate)} to ${escapeHtml(lastDate)}. The checking balance is the opening balance of ${money(state.household.openingBalanceCents)} plus every transaction since.</p>
    <div class="btn-row">
      <button class="btn" id="export-btn">Download my data (JSON)</button>
      <button class="btn ghost" id="import-btn">Import data (JSON)</button>
      <input type="file" id="import-file" accept="application/json,.json" hidden>
    </div>
    <p class="small muted" style="margin-top:10px">Export keeps a copy of the whole household — transactions, bills, goals and budgets — so it can be restored on this or another browser.</p>
  </section>

  <section class="card">
    <h2>Start over</h2>
    <p>Restore the Marlowe household's original records for June to November 2026, exactly as the site first opened. Everything added or changed since is removed.</p>
    <div class="btn-row"><button class="btn danger" id="reset-btn">Reset to the original records</button></div>
  </section>

  <section class="card">
    <h2>About HearthLedger</h2>
    <p>HearthLedger is a household budget book for one family: the Marlowe household at 14 Maple Court. It is a static site — no accounts, no servers, no tracking. Figures are the household's own records; every page is computed from the same transactions, so the dashboard, budgets, bills, goals and reports always agree.</p>
    <p class="small muted">Made for the make.fun household budget bounty, November 2026. All names, figures and text are invented for the household.</p>
  </section>`;
}

export function bind(state, helpers) {
  document.getElementById('household-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const form = e.target;
    const opening = Math.round(parseFloat(form.opening.value) * 100);
    if (!Number.isFinite(opening)) { showToast('Enter an opening balance in dollars.'); return; }
    state.household.name = form.name.value.trim();
    state.household.members = form.members.value.trim();
    state.household.home = form.home.value.trim();
    state.household.payday = form.payday.value.trim();
    state.household.openingBalanceCents = opening;
    helpers.save();
    showToast('Household details saved.');
    helpers.refresh();
  });

  document.getElementById('export-btn').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'hearthledger-household.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast('Data downloaded.');
  });

  const fileInput = document.getElementById('import-file');
  document.getElementById('import-btn').addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', () => {
    const file = fileInput.files && fileInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.transactions) || !Array.isArray(parsed.bills) || !Array.isArray(parsed.goals)) {
          throw new Error('bad file');
        }
        helpers.replaceState(parsed);
        showToast('Data imported.');
        helpers.refresh();
      } catch {
        showToast('That file is not a HearthLedger export.');
      }
      fileInput.value = '';
    };
    reader.readAsText(file);
  });

  document.getElementById('reset-btn').addEventListener('click', (e) => {
    if (!armConfirm(e.currentTarget, 'Click again to reset everything')) return;
    const fresh = resetState();
    helpers.replaceState(fresh);
    showToast('Restored the original records.');
    helpers.refresh();
  });
}
