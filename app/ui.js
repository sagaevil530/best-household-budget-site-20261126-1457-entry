// Small shared UI helpers: modal dialog and toast confirmation.

const backdrop = document.getElementById('modal-backdrop');
const box = document.getElementById('modal-box');
const toastEl = document.getElementById('toast');
let toastTimer = 0;

export function openModal(html) {
  box.innerHTML = html;
  backdrop.hidden = false;
  const first = box.querySelector('input, select, textarea, button');
  if (first) first.focus();
}

export function closeModal() {
  backdrop.hidden = true;
  box.innerHTML = '';
}

backdrop.addEventListener('click', (event) => {
  if (event.target === backdrop) closeModal();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !backdrop.hidden) closeModal();
});

export function showToast(message) {
  toastEl.textContent = message;
  toastEl.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toastEl.hidden = true; }, 3200);
}

// Turns a "Delete" button into a two-step confirm in place, so no record is
// removed by an accidental tap. Returns true on the confirming click.
export function armConfirm(button, label) {
  if (button.dataset.armed === '1') return true;
  button.dataset.armed = '1';
  button.textContent = label || 'Click again to confirm';
  setTimeout(() => {
    if (button.isConnected) {
      button.dataset.armed = '';
      button.textContent = 'Delete';
    }
  }, 4000);
  return false;
}
