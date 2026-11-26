// Money and date helpers shared by every HearthLedger page.

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
export const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function money(cents) {
  const sign = cents < 0 ? '−' : '';
  const abs = Math.abs(cents);
  return sign + '$' + (abs / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function moneyShort(cents) {
  const abs = Math.abs(cents);
  if (abs >= 100000) return (cents < 0 ? '−$' : '$') + (abs / 100000).toFixed(1).replace(/\.0$/, '') + 'k';
  return money(cents);
}

export function monthKey(year, month) {
  return year + '-' + String(month + 1).padStart(2, '0');
}

export function monthLabel(key) {
  const [y, m] = key.split('-').map(Number);
  return MONTH_NAMES[m - 1] + ' ' + y;
}

export function monthShortLabel(key) {
  const [y, m] = key.split('-').map(Number);
  return MONTH_SHORT[m - 1] + ' ’' + String(y).slice(2);
}

export function shiftMonth(key, delta) {
  const [y, m] = key.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return monthKey(d.getFullYear(), d.getMonth());
}

export function dayLabel(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const weekday = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
  return weekday + ' ' + MONTH_SHORT[m - 1] + ' ' + d;
}

export function todayKey() {
  const now = new Date();
  return now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
}

export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function percent(part, whole) {
  if (!whole) return 0;
  return Math.round((part / whole) * 100);
}
