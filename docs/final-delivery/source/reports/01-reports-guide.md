# SAYAD Reports & Analytics Guide

## 1. Reporting Artifact Census

The system contains exactly 20 reporting artifacts as confirmed by code analysis.

- **Total unique reporting artifacts**: 20
- **Reports**: 12
- **Dashboards**: 2
- **Analysis screens**: 1
- **Reconciliation screens**: 2
- **Backend-only artifacts**: 2
- **Placeholder artifacts**: 1

| ID | Name | Type | Owning Module | Route | User Exposed | Backend Only | Placeholder | Permission |
|----|------|------|---------------|-------|--------------|--------------|-------------|------------|
| 1 | Main Dashboard | DASHBOARD | System | `/dashboard` | Yes | No | No | Base Auth |
| 2 | System Dashboard | DASHBOARD | System | `/system` | Yes | No | No | `SystemOwner` |
| 3 | General Ledger | REPORT | Accounting | `/accounting/reports/general-ledger` | Yes | No | No | `accounting.reports.view` |
| 4 | Trial Balance | REPORT | Accounting | `/accounting/reports/trial-balance` | Yes | No | No | `accounting.reports.view` |
| 5 | Income Statement | REPORT | Accounting | `/accounting/reports/income-statement` | Yes | No | No | `accounting.reports.view` |
| 6 | Balance Sheet | REPORT | Accounting | `/accounting/reports/balance-sheet` | Yes | No | No | `accounting.reports.view` |
| 7 | Cash Flow | REPORT | Accounting | `/accounting/reports/cash-flow` | Yes | No | No | `accounting.reports.view` |
| 8 | Treasury GL Recon | RECONCILIATION| Accounting | `/accounting/reports/treasury-gl-reconciliation` | Yes | No | No | `accounting.reports.view` |
| 9 | Inventory GL Recon | RECONCILIATION| Accounting | `/accounting/reports/inventory-gl-reconciliation` | Yes | No | No | `accounting.reports.view` |
| 10 | Customer Aging | REPORT | Accounting | `/accounting/reports/customer-receivables-aging` | Yes | No | No | `accounting.reports.view` |
| 11 | Supplier Aging | REPORT | Accounting | `/accounting/reports/supplier-payables-aging` | Yes | No | No | `accounting.reports.view` |
| 12 | Purchase Invoices | REPORT | Accounting | `/accounting/reports/purchase-invoices` | Yes | No | No | `accounting.reports.view` (FE) / `purchases.invoices.view` (BE) |
| 13 | Receipts & Payments| REPORT | Accounting | `/accounting/reports/receipts-payments` | Yes | No | No | `accounting.reports.view` (FE) / `treasury.view` (BE) |
| 14 | Sales Customer Item| ANALYSIS | Accounting | `/accounting/reports/sales-customer-item-analysis`| Yes | No | No | `accounting.reports.view` |
| 15 | Sales Profitability| REPORT | Accounting | `/accounting/reports/sales-profitability` | Yes | No | No | `accounting.reports.view` |
| 16 | Sales Invoices | REPORT | Sales | `/sales/reports/invoices` | Yes | No | No | `sales.invoices.view` |
| 17 | Worker Salary | REPORT | Labor | `/labor/workers/salary-report` | Yes | No | No | `labor.workers.view` |
| 18 | Manufacturing Cost | BACKEND ONLY | Manufacturing | None | No | Yes | No | `manufacturing.reports.view` |
| 19 | Manufacturing WIP | BACKEND ONLY | Manufacturing | None | No | Yes | No | `manufacturing.reports.view` |
| 20 | Manufacturing Dash | PLACEHOLDER | Manufacturing | `/manufacturing/dashboard` | Yes | No | Yes | `manufacturing.dashboard.view` |

## 2. Accounting Reports

### General Ledger
- **Purpose**: Review the ledger for one posting account and its descendants with running balances.
- **Route**: `/accounting/reports/general-ledger`
- **Permission**: `accounting.reports.view`
- **Filters**: AccountId, FromDate, ToDate, IncludeDescendants (true/false)
- **Columns / Metrics**: Date, Journal Entry Number, Source Document Type, Description, Debit, Credit, Running Balance.
- **Calculation Rules**: Combines opening balance (sum of net before FromDate) and period transactions. Descendants can be optionally aggregated.
- **Data Source**: Journal Entries and Lines (excluding Draft).
- **Drilldown**: Yes, to Journal Entry.
- **Export/Print**: Not implemented.

### Trial Balance
- **Purpose**: View account balances for a specific period to ensure debits equal credits.
- **Route**: `/accounting/reports/trial-balance`
- **Permission**: `accounting.reports.view`
- **Filters**: FromDate, ToDate, IncludeInactiveAccounts, IncludeZeroBalances, IncludeHeaderAccounts.
- **Columns / Metrics**: Account Code, Name, Type, Normal Balance, Opening Debit, Opening Credit, Period Debit, Period Credit, Closing Debit, Closing Credit.
- **Calculation Rules**: Opening balances are accumulated prior to FromDate. Period balances are strictly between From and To Date. It sums up descendants' balances into header accounts based on the Account Hierarchy. Zero-balance accounts are excluded unless explicitly requested.

### Income Statement
- **Purpose**: Calculate Net Income based on Revenues and Expenses.
- **Route**: `/accounting/reports/income-statement`
- **Permission**: `accounting.reports.view`
- **Filters**: FromDate, ToDate.
- **Calculation Rules**: (Revenues - Expenses). Takes into account all posted journal entries within the period.

### Balance Sheet
- **Purpose**: Display Assets, Liabilities, and Equity as of a specific date.
- **Route**: `/accounting/reports/balance-sheet`
- **Permission**: `accounting.reports.view`
- **Filters**: AsOfDate.
- **Calculation Rules**: Assets = Liabilities + Equity. Computes Retained Earnings dynamically from unclosed fiscal years (Revenues - Expenses) and adds it to the Equity section to balance.

### Cash Flow
- **Purpose**: Report cash movements grouped by Operating, Investing, and Financing activities.
- **Route**: `/accounting/reports/cash-flow`
- **Permission**: `accounting.reports.view`
- **Filters**: FromDate, ToDate.
- **Calculation Rules**: Uses accounts tagged with `CashFlowActivityType`. Cash accounts themselves are excluded from activity classifications and used to calculate net change in cash.

## 3. Reconciliation Reports

### Treasury GL Reconciliation
- **Purpose**: Compare Operational Treasury Balance with GL Balance.
- **Calculation Rules**: Compares the sum of Treasury receipts/payments (operational) against the Journal Entry balance of the GL account linked to the treasury.

### Inventory GL Reconciliation
- **Purpose**: Compare Operational Inventory Value with GL Inventory Balance.
- **Calculation Rules**: Compares stock valuation (Moving Average) against the GL Inventory account balance.

## 4. Aging Reports

### Customer Receivables Aging
- **Purpose**: Analyze overdue balances for customers.
- **Filters**: AsOfDate, CustomerId, AgingBucket, OnlyOverdue.
- **Calculation Rules**: Outstanding invoices are grouped by due date into buckets:
  - **Current**: Not past due (0 days)
  - **Days1To30**: 1 to 30 days past due
  - **Days31To60**: 31 to 60 days past due
  - **Days61To90**: 61 to 90 days past due
  - **Over90**: More than 90 days past due

### Supplier Payables Aging
- **Purpose**: Analyze overdue balances for suppliers.
- **Filters**: AsOfDate, SupplierId, AgingBucket, OnlyOverdue.
- **Calculation Rules**: Follows identical 30-day bucket boundaries as customer aging.

## 5. Other Module Reports

### Purchase Invoices Report
- **Route**: `/accounting/reports/purchase-invoices`
- **Permission**: Frontend enforces `accounting.reports.view`. Backend enforces `purchases.invoices.view`.
- **Columns**: Invoice Number, Date, Supplier, Items Count, Total, Status.
- **Export/Print**: Not implemented.

### Receipts & Payments Report
- **Route**: `/accounting/reports/receipts-payments`
- **Permission**: Frontend enforces `accounting.reports.view`. Backend enforces `treasury.view`.
- **Data Source**: Treasury Receipts and Payments.

### Sales Customer Item Analysis
- **Route**: `/accounting/reports/sales-customer-item-analysis`
- **Calculation Rules**: Excludes cancelled invoices.

### Sales Profitability
- **Route**: `/accounting/reports/sales-profitability`
- **Calculation Rules**: Uses frozen cost captured on the sales StockOut movement for COGS.

### Sales Invoices Report
- **Route**: `/sales/reports/invoices`
- **Permission**: `sales.invoices.view` (both frontend and backend).
- **Status**: Implemented and User-Exposed.

### Worker Salary Report
- **Route**: `/labor/workers/salary-report`
- **Permission**: `labor.workers.view`
- **Data Source**: `PayrollStatements`.
- **Filters**: Month, Year, Payment Status.
- **Columns**: Worker, Period, Base Wage, Additions, Deductions, Net Wage, Payment Status.

## 6. Dashboards

- **Main Dashboard**: Available at `/dashboard`. Shows basic KPI cards.
- **System Dashboard**: Available at `/system`.
- **Manufacturing Dashboard**: PLACEHOLDER screen (`/manufacturing/dashboard`).
- **Treasury Dashboard**: NOT IMPLEMENTED (No dedicated dashboard route exists; `/treasury` redirects to `/treasury/accounts`). The Treasury Home Page acts as a dashboard visually but is not exposed as a dashboard artifact in standard routing.

## 7. Report Permissions

Permissions are based on precise backend strings:
- Accounting Reports: `accounting.reports.view`
- Treasury Reports: `treasury.view`
- Sales Reports: `sales.invoices.view`
- Purchase Reports: `purchases.invoices.view`
- Labor/Salary: `labor.workers.view`
- Manufacturing Reports: `manufacturing.reports.view`
- Manufacturing Dashboard: `manufacturing.dashboard.view`

## 8. Export and Print Audit

- **Reports with export**: 0
- **Reports with print**: 0
- **Export/Print status**: NOT IMPLEMENTED for all user-exposed reporting artifacts. (No `window.print`, `IconPrinter`, or export logic in source code).

## 9. Status Filter Rules

- **Accounting/GL Reports**: ALWAYS exclude `Draft` journal entries. Include `Posted`.
- **Sales/Purchases Reports**: Usually allow filtering by `Status` (Draft, Posted, Cancelled).
- **Aging Reports**: Exclude `Draft`.

## 10. Currency and Date Semantics

- **Currency**: Multi-currency reports typically group by currency or require a currency filter. No on-the-fly FX conversion is performed for grouping.
- **Dates**: GL/TB/IS/BS/CF use `EntryDate` (Posting Date). Aging reports use `DueDate` vs `AsOfDate`. Invoices reports use `InvoiceDate`.

## 11. Report Limitations

- Manufacturing reports (Production Cost, WIP) are Backend Only.
- Manufacturing Dashboard is a placeholder.
- Export and Print functionalities are not implemented on any report.
- Multi-currency reports do not perform FX conversion.

## 12. Screenshot Checklist

- `RPT-DASHBOARD-DEFAULT-001`
- `RPT-DASHBOARD-SYSTEM-001`
- `RPT-GL-001`
- `RPT-TRIAL-BALANCE-001`
- `RPT-INCOME-STATEMENT-001`
- `RPT-BALANCE-SHEET-001`
- `RPT-CASH-FLOW-001`
- `RPT-TREASURY-RECON-001`
- `RPT-INVENTORY-RECON-001`
- `RPT-CUSTOMER-AGING-001`
- `RPT-SUPPLIER-AGING-001`
- `RPT-PURCHASE-INVOICES-001`
- `RPT-RECEIPTS-PAYMENTS-001`
- `RPT-SALES-CUSTOMER-ITEM-001`
- `RPT-SALES-PROFITABILITY-001`
- `RPT-SALES-INVOICES-001`
- `RPT-WORKER-SALARY-001`
- `RPT-MANUFACTURING-DASHBOARD-001` (Placeholder)
