// HearthLedger data: the Marlowe household's records, June to November 2026.
// Every figure on the site is computed from these transactions, so income, spending,
// balances and budgets always add up. State is saved in localStorage; the seed below
// is only used the first time the site opens (or after a reset in Settings).

export const CATEGORIES = [
  { id: 'housing', label: 'Housing', color: '#1e4d3b', budgetCents: 193000 },
  { id: 'groceries', label: 'Groceries', color: '#2e6b4f', budgetCents: 85000 },
  { id: 'utilities', label: 'Utilities', color: '#33607a', budgetCents: 33000 },
  { id: 'transport', label: 'Transport', color: '#c99a2e', budgetCents: 48000 },
  { id: 'childcare', label: 'Childcare', color: '#6d4a6e', budgetCents: 64000 },
  { id: 'dining', label: 'Dining out', color: '#c96f3f', budgetCents: 22000 },
  { id: 'entertainment', label: 'Entertainment', color: '#a63d2f', budgetCents: 12000 },
  { id: 'health', label: 'Health', color: '#7a5a10', budgetCents: 21000 },
  { id: 'clothing', label: 'Clothing', color: '#8a6d3b', budgetCents: 15000 },
  { id: 'home', label: 'Home & garden', color: '#5c6b62', budgetCents: 20000 },
  { id: 'savings', label: 'Savings', color: '#3f7d5a', budgetCents: 115000 },
  { id: 'misc', label: 'Everything else', color: '#9a8f7a', budgetCents: 10000 },
];

export const INCOME_CATEGORY = { id: 'income', label: 'Income', color: '#1e4d3b' };

export function categoryById(id) {
  if (id === 'income') return INCOME_CATEGORY;
  return CATEGORIES.find((c) => c.id === id) || CATEGORIES[CATEGORIES.length - 1];
}

const STORE_KEY = 'hearthledger-v1';

// Monthly amounts that vary a little from month to month.
const MONTHLY_VARIATION = {
  '2026-06': { electricity: 8800, freelance: 38000 },
  '2026-07': { electricity: 9200, freelance: 41000 },
  '2026-08': { electricity: 10100, freelance: 36000 },
  '2026-09': { electricity: 9400, freelance: 44000 },
  '2026-10': { electricity: 9000, freelance: 39500 },
  '2026-11': { electricity: 9600, freelance: 42000 },
};

// Day-to-day spending, per month: [day, payee, category, cents, note?]
const MONTH_EXTRAS = {
  '2026-06': [
    [4, 'GreenMart weekly shop', 'groceries', 19840],
    [6, 'Corner bakery & coffee', 'dining', 1840],
    [9, 'Fuel — Shell on Route 9', 'transport', 5200],
    [11, 'GreenMart weekly shop', 'groceries', 17620],
    [14, 'Riverside Thai takeaway', 'dining', 4650],
    [18, 'GreenMart weekly shop', 'groceries', 20110],
    [21, 'Cinema — family matinee', 'entertainment', 4200],
    [25, 'GreenMart weekly shop', 'groceries', 16980],
    [27, 'Pharmacy — allergy medicine', 'health', 2840],
    [29, 'Bus passes — July', 'transport', 9000],
  ],
  '2026-07': [
    [3, 'GreenMart weekly shop', 'groceries', 18760],
    [5, 'Ice cream van — park day', 'dining', 1450],
    [8, 'Fuel — Shell on Route 9', 'transport', 4860],
    [10, 'GreenMart weekly shop', 'groceries', 21340],
    [13, 'Pizza night — Luigis', 'dining', 3890],
    [17, 'GreenMart weekly shop', 'groceries', 17490],
    [19, 'Kids’ new sandals', 'clothing', 4200],
    [22, 'Library summer fair', 'entertainment', 1250],
    [24, 'GreenMart weekly shop', 'groceries', 19230],
    [26, 'Dentist check-up — Milo', 'health', 8500],
    [30, 'Bus passes — August', 'transport', 9000],
  ],
  '2026-08': [
    [2, 'GreenMart weekly shop', 'groceries', 20150],
    [6, 'Fuel — Shell on Route 9', 'transport', 5400],
    [9, 'GreenMart weekly shop', 'groceries', 18980],
    [12, 'Riverside Thai takeaway', 'dining', 5120],
    [16, 'GreenMart weekly shop', 'groceries', 17640],
    [18, 'School shoes — Ada', 'clothing', 6800],
    [21, 'Swimming pool — family day', 'entertainment', 3600],
    [23, 'GreenMart weekly shop', 'groceries', 20870],
    [26, 'Pharmacy — vitamins', 'health', 3100],
    [29, 'Bus passes — September', 'transport', 9000],
    [30, 'Garden hose & seeds', 'home', 2740],
  ],
  '2026-09': [
    [3, 'GreenMart weekly shop', 'groceries', 19420],
    [5, 'Fuel — Shell on Route 9', 'transport', 4990],
    [8, 'GreenMart weekly shop', 'groceries', 18260],
    [11, 'Pizza night — Luigis', 'dining', 4150],
    [15, 'GreenMart weekly shop', 'groceries', 20780],
    [17, 'School supplies — both kids', 'misc', 6340],
    [20, 'Cinema — family matinee', 'entertainment', 4600],
    [22, 'GreenMart weekly shop', 'groceries', 17930],
    [25, 'Dentist check-up — Ada', 'health', 8500],
    [27, 'Rain jackets — Milo & Ada', 'clothing', 9200],
    [29, 'Bus passes — October', 'transport', 9000],
  ],
  '2026-10': [
    [2, 'GreenMart weekly shop', 'groceries', 18990],
    [4, 'Fuel — Shell on Route 9', 'transport', 5300],
    [7, 'GreenMart weekly shop', 'groceries', 19650],
    [10, 'Riverside Thai takeaway', 'dining', 4880],
    [14, 'GreenMart weekly shop', 'groceries', 18340],
    [16, 'Pumpkin patch & hayride', 'entertainment', 3800],
    [19, 'Pharmacy — flu jabs', 'health', 6400],
    [21, 'GreenMart weekly shop', 'groceries', 20120],
    [24, 'Halloween costumes', 'clothing', 5600],
    [27, 'Light bulbs & batteries', 'home', 2410],
    [29, 'Bus passes — November', 'transport', 9000],
  ],
  '2026-11': [
    [3, 'GreenMart weekly shop', 'groceries', 21240, 'Weekly shop — pantry restock'],
    [4, 'Corner bakery & coffee', 'dining', 2180],
    [6, 'Fuel — Shell on Route 9', 'transport', 5400],
    [8, 'Riverside Thai takeaway', 'dining', 5275],
    [9, 'Pharmacy — cough syrup', 'health', 3240],
    [10, 'GreenMart weekly shop', 'groceries', 18630],
    [12, 'Kids’ winter shoes — Ada', 'clothing', 7800],
    [13, 'Cinema — Friday night', 'entertainment', 4600],
    [15, 'Riverside Thai takeaway', 'dining', 2690],
    [16, 'Plumber — kitchen tap', 'home', 14000, 'Fixed the dripping tap'],
    [17, 'GreenMart weekly shop', 'groceries', 20410],
    [18, 'Fuel — Shell on Route 9', 'transport', 4800],
    [19, 'Dentist — June check-up', 'health', 12000],
    [20, 'Birthday gift — Grandma', 'misc', 3500],
    [21, 'Pizza night — Luigis', 'dining', 6400],
    [22, 'Light bulbs & fuses', 'home', 2400],
    [24, 'GreenMart weekly shop', 'groceries', 15820],
    [25, 'Corner bakery & coffee', 'dining', 2740],
  ],
};

const BILLS = [
  { id: 'bill-rent', name: 'Rent — 14 Maple Court', amountCents: 185000, day: 1, category: 'housing', autopay: true, note: 'Due the 1st. Landlord: Mrs Okafor.' },
  { id: 'bill-gym', name: 'Gym — Riverside Fitness', amountCents: 4500, day: 2, category: 'health', autopay: true, note: 'Family membership, Theo and June.' },
  { id: 'bill-childcare', name: 'After-school club', amountCents: 64000, day: 3, category: 'childcare', autopay: true, note: 'Milo and Ada, weekdays until 5:30.' },
  { id: 'bill-internet', name: 'Internet — Northline 300', amountCents: 6500, day: 5, category: 'utilities', autopay: true, note: 'Fibre broadband, billed monthly.' },
  { id: 'bill-electric', name: 'Electricity — City Power', amountCents: 9600, day: 8, category: 'utilities', autopay: true, note: 'Varies with the season; November was $96.' },
  { id: 'bill-car', name: 'Car loan — hatchback', amountCents: 31000, day: 10, category: 'transport', autopay: true, note: '14 payments left after November.' },
  { id: 'bill-water', name: 'Water — City Water', amountCents: 4800, day: 12, category: 'utilities', autopay: true, note: 'Metered, billed monthly.' },
  { id: 'bill-mobile', name: 'Mobile — two lines', amountCents: 11000, day: 15, category: 'utilities', autopay: false, note: 'Theo and June; pay by card each month.' },
  { id: 'bill-insurance', name: 'Home insurance', amountCents: 7800, day: 20, category: 'housing', autopay: true, note: 'Annual policy paid monthly.' },
  { id: 'bill-streaming', name: 'Streaming — family plan', amountCents: 1599, day: 7, category: 'entertainment', autopay: true, note: 'One plan, four profiles.' },
];

const GOALS = [
  { id: 'goal-emergency', name: 'Emergency fund', targetCents: 1000000, savedCents: 640000, deadline: '2027-12-31', note: '$400 a month since June. Three months of essentials is the aim.' },
  { id: 'goal-holiday', name: 'Family holiday — Kyoto', targetCents: 420000, savedCents: 275000, deadline: '2027-07-01', note: '$250 a month since June. Flights first, then the ryokan.' },
  { id: 'goal-car', name: 'Next car — used estate', targetCents: 1200000, savedCents: 390000, deadline: '2028-03-01', note: '$300 a month since June. Cash, no second loan.' },
  { id: 'goal-college', name: 'Kids’ college fund', targetCents: 2500000, savedCents: 820000, deadline: '2034-09-01', note: '$200 a month since June, split evenly between Milo and Ada.' },
];

function buildSeed() {
  const months = ['2026-06', '2026-07', '2026-08', '2026-09', '2026-10', '2026-11'];
  const transactions = [];
  let n = 0;
  const add = (date, payee, category, kind, amountCents, note, billId, goalId) => {
    n += 1;
    transactions.push({
      id: 'seed-' + String(n).padStart(4, '0'),
      date, payee, category, kind, amountCents,
      note: note || '', billId: billId || '', goalId: goalId || '',
    });
  };
  for (const key of months) {
    const vary = MONTHLY_VARIATION[key];
    // Income
    add(key + '-01', 'Theo — salary, Northline Logistics', 'income', 'income', 460000, 'Monthly pay, after tax');
    add(key + '-15', 'June — salary, Riverside Library', 'income', 'income', 215000, 'Part-time, three days a week');
    add(key + '-20', 'June — freelance illustration', 'income', 'income', vary.freelance, 'Book cover work');
    // Fixed bills
    add(key + '-01', 'Rent — 14 Maple Court', 'housing', 'expense', 185000, '', 'bill-rent');
    add(key + '-02', 'Gym — Riverside Fitness', 'health', 'expense', 4500, '', 'bill-gym');
    add(key + '-03', 'After-school club', 'childcare', 'expense', 64000, '', 'bill-childcare');
    add(key + '-05', 'Internet — Northline 300', 'utilities', 'expense', 6500, '', 'bill-internet');
    add(key + '-07', 'Streaming — family plan', 'entertainment', 'expense', 1599, '', 'bill-streaming');
    add(key + '-08', 'Electricity — City Power', 'utilities', 'expense', vary.electricity, '', 'bill-electric');
    add(key + '-10', 'Car loan — hatchback', 'transport', 'expense', 31000, '', 'bill-car');
    add(key + '-12', 'Water — City Water', 'utilities', 'expense', 4800, '', 'bill-water');
    add(key + '-15', 'Mobile — two lines', 'utilities', 'expense', 11000, '', 'bill-mobile');
    add(key + '-20', 'Home insurance', 'housing', 'expense', 7800, '', 'bill-insurance');
    // Savings transfers — the same four every month, so goal balances add up.
    add(key + '-25', 'Transfer — Emergency fund', 'savings', 'expense', 40000, 'Automatic transfer', '', 'goal-emergency');
    add(key + '-25', 'Transfer — Family holiday', 'savings', 'expense', 25000, 'Automatic transfer', '', 'goal-holiday');
    add(key + '-25', 'Transfer — Next car', 'savings', 'expense', 30000, 'Automatic transfer', '', 'goal-car');
    add(key + '-25', 'Transfer — College fund', 'savings', 'expense', 20000, 'Automatic transfer', '', 'goal-college');
    // Day-to-day spending
    for (const [day, payee, category, cents, note] of MONTH_EXTRAS[key]) {
      add(key + '-' + String(day).padStart(2, '0'), payee, category, 'expense', cents, note || '');
    }
  }
  transactions.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : a.id < b.id ? -1 : 1));
  return {
    version: 1,
    household: {
      name: 'The Marlowe household',
      members: 'June & Theo, Milo (9) and Ada (6)',
      home: '14 Maple Court',
      payday: 'Theo is paid on the 1st, June on the 15th',
      openingBalanceCents: 184200,
      openingDate: '2026-06-01',
    },
    categories: CATEGORIES.map((c) => ({ ...c })),
    transactions,
    bills: BILLS.map((b) => ({ ...b })),
    goals: GOALS.map((g) => ({ ...g })),
    currentMonth: '2026-11',
  };
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.version === 1 && Array.isArray(parsed.transactions)) return parsed;
    }
  } catch { /* fall through to the seed */ }
  const seed = buildSeed();
  saveState(seed);
  return seed;
}

export function saveState(state) {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch { /* storage full or blocked; the page still works in memory */ }
}

export function resetState() {
  try { localStorage.removeItem(STORE_KEY); } catch { /* ignore */ }
  return loadState();
}

export function monthTransactions(state, monthKey) {
  return state.transactions.filter((t) => t.date.slice(0, 7) === monthKey);
}

export function monthTotals(state, monthKey) {
  let income = 0;
  let spent = 0;
  for (const t of monthTransactions(state, monthKey)) {
    if (t.kind === 'income') income += t.amountCents;
    else spent += t.amountCents;
  }
  return { income, spent, left: income - spent };
}

export function balanceAt(state, throughDate) {
  let balance = state.household.openingBalanceCents;
  for (const t of state.transactions) {
    if (t.date > throughDate) break;
    balance += t.kind === 'income' ? t.amountCents : -t.amountCents;
  }
  return balance;
}

export function spendingByCategory(state, monthKey) {
  const totals = {};
  for (const t of monthTransactions(state, monthKey)) {
    if (t.kind !== 'expense') continue;
    totals[t.category] = (totals[t.category] || 0) + t.amountCents;
  }
  return totals;
}

export function newId(state) {
  const max = state.transactions.reduce((m, t) => {
    const num = parseInt(String(t.id).replace(/\D/g, ''), 10);
    return Number.isFinite(num) ? Math.max(m, num) : m;
  }, 0);
  return 'tx-' + (max + 1) + '-' + Date.now().toString(36);
}
