# HearthLedger — The Marlowe Household Budget

[![make.fun](https://img.shields.io/badge/make.fun-bounty-1e4d3b)](https://make.fun/c/best-household-budget-site-20261126-1457)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![No build step](https://img.shields.io/badge/static-no%20build%20step-brightgreen)](app/index.html)

HearthLedger is a working household budget site for one fictional family — the Marlowe household at 14 Maple Court. It runs entirely from static files, works offline in a desktop browser and on a phone, and keeps every figure consistent: the dashboard, transactions, budgets, bills, savings goals and reports are all computed from the same ledger.

## What it does

- **Dashboard** — money in, money out and what is left for the month, a spending-by-category donut chart, budgets closest to the edge, bills still to pay, savings progress and recent transactions.
- **Transactions** — the full ledger, filterable by month, category and text, with add, edit and delete.
- **Budgets** — a monthly limit per category with progress bars that turn gold at 85% and red over the limit; limits are editable.
- **Bills & recurring** — ten recurring bills with due days and autopay flags; marking one paid records the payment as a transaction.
- **Savings goals** — four goals (emergency fund, family holiday, next car, college fund) with progress, target dates and add-funds transfers.
- **Reports** — six months of income vs spending as a bar chart, spending by category against budget, biggest single spends and plain-language insights.
- **Settings** — household details, export and import of the whole household as JSON, and a reset to the original records.

All state is stored in the browser's `localStorage` under `hearthledger-v1`. Nothing is sent anywhere.

## Run it

```sh
node serve.ts
# then open http://localhost:8080
```

Or serve `app/` with any static HTTP server. No build step, no dependencies, no network requests.

## Hand in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the vendored make.fun library (`vendor/makefun-frontend.ts`).

## Entry

- Competition: [best-household-budget-site-20261126-1457](https://make.fun/c/best-household-budget-site-20261126-1457)
- Owner: [sagaevil530](https://github.com/sagaevil530)
- Repository: `best-household-budget-site-20261126-1457-entry`
- License: MIT
