# SAYAD Standard Operating Procedures (SOP) Manual

## 24. SOP INDEX

| SOP ID | Procedure | Category | Implementation Status | User Exposed | Permission | Financial Effect | Inventory Effect | High Impact |
|--------|-----------|----------|-----------------------|--------------|------------|------------------|------------------|-------------|
| SOP-ADM-001 | Create User | ADM | IMPLEMENTED | YES | `administration.users.create` | None | None | NO |
| SOP-ADM-002 | Edit User | ADM | IMPLEMENTED | YES | `administration.users.edit` | None | None | NO |
| SOP-ADM-003 | Assign Roles | ADM | IMPLEMENTED | YES | `administration.users.edit` | None | None | NO |
| SOP-ADM-004 | Deactivate / Reactivate User | ADM | IMPLEMENTED | YES | `administration.users.edit` | None | None | NO |
| SOP-ADM-005 | Delete User | ADM | IMPLEMENTED | YES | `administration.users.delete` | None | None | YES |
| SOP-ADM-006 | Create Role | ADM | IMPLEMENTED | YES | `administration.roles.create` | None | None | NO |
| SOP-ADM-007 | Edit Role | ADM | IMPLEMENTED | YES | `administration.roles.edit` | None | None | NO |
| SOP-ADM-008 | Assign Permissions to Role | ADM | IMPLEMENTED | YES | `administration.roles.edit` | None | None | NO |
| SOP-ADM-009 | Delete Role | ADM | IMPLEMENTED | YES | `administration.roles.delete` | None | None | YES |
| SOP-PARTY-001 | Create Customer | PARTY | IMPLEMENTED | YES | `parties.create` | Subledger Setup | None | NO |
| SOP-PARTY-002 | Create Supplier | PARTY | IMPLEMENTED | YES | `parties.create` | Subledger Setup | None | NO |
| SOP-PARTY-003 | Create Customer + Supplier Party | PARTY | IMPLEMENTED | YES | `parties.create` | Dual Subledger | None | NO |
| SOP-PARTY-004 | Edit Party | PARTY | IMPLEMENTED | YES | `parties.update` | None | None | NO |
| SOP-PARTY-005 | Deactivate / Reactivate Party | PARTY | IMPLEMENTED | YES | `parties.activate` / `parties.deactivate` | None | None | NO |
| SOP-PARTY-006 | Record Party Opening Balance | PARTY | IMPLEMENTED | YES | `parties.opening-balance` | Subledger Balance | None | YES |
| SOP-PARTY-007 | Correct Party Opening Balance | PARTY | IMPLEMENTED | YES | `parties.opening-balance` | Subledger Adjust | None | YES |
| SOP-PARTY-008 | Customer Receipt | PARTY | IMPLEMENTED | YES | `treasury.transactions.create` | Dr Cash, Cr Customer | None | YES |
| SOP-PARTY-009 | Supplier Payment | PARTY | IMPLEMENTED | YES | `treasury.transactions.create` | Dr Supplier, Cr Cash | None | YES |
| SOP-PARTY-010 | Customer Settlement | PARTY | IMPLEMENTED | YES | `parties.manage` | Settlement Offset | None | YES |
| SOP-PARTY-011 | Supplier Settlement | PARTY | IMPLEMENTED | YES | `parties.manage` | Settlement Offset | None | YES |
| SOP-PARTY-012 | Party Adjustment | PARTY | IMPLEMENTED | YES | `parties.manage` | Adjustment Entry | None | YES |
| SOP-PARTY-013 | Reverse / Correct Party Effect | PARTY | IMPLEMENTED | YES | `parties.manage` | Reversal Entry | None | YES |
| SOP-PARTY-014 | Final Delete Party | PARTY | IMPLEMENTED | YES | `parties.delete` | Zero Balance Req | None | YES |
| SOP-PARTY-015 | Import Parties | PARTY | IMPLEMENTED | YES | `parties.create` | Bulk Master Setup | None | NO |
| SOP-PARTY-016 | Export Parties | PARTY | IMPLEMENTED | YES | `parties.view` | None | None | NO |
| SOP-INV-001 | Create Item | INV | IMPLEMENTED | YES | `inventory.items.create` | None | Catalog Setup | NO |
| SOP-INV-002 | Create Category | INV | IMPLEMENTED | YES | `inventory.categories.manage` | None | Category Setup | NO |
| SOP-INV-003 | Create Unit | INV | IMPLEMENTED | YES | `inventory.units.manage` | None | Unit Setup | NO |
| SOP-INV-004 | Configure Alternate Unit | INV | IMPLEMENTED | YES | `inventory.units.manage` | None | Conversion Setup | NO |
| SOP-INV-005 | Record Opening Stock | INV | IMPLEMENTED | YES | `inventory.opening-stock.manage` | Inventory Valuation | Increases Stock | YES |
| SOP-INV-006 | Correct Opening Stock | INV | IMPLEMENTED | YES | `inventory.opening-stock.manage` | Valuation Adjust | Stock Correction | YES |
| SOP-INV-007 | Stock In | INV | IMPLEMENTED | YES | `inventory.movements.stock-in` | WAC Valuation | Increases Stock | YES |
| SOP-INV-008 | Stock Out | INV | IMPLEMENTED | YES | `inventory.movements.stock-out` | COGS Valuation | Decreases Stock | YES |
| SOP-INV-009 | Adjustment Increase | INV | IMPLEMENTED | YES | `inventory.movements.adjust` | Inventory Gain | Increases Stock | YES |
| SOP-INV-010 | Adjustment Decrease | INV | IMPLEMENTED | YES | `inventory.movements.adjust` | Inventory Loss | Decreases Stock | YES |
| SOP-INV-011 | Reverse Inventory Movement | INV | IMPLEMENTED | YES | `inventory.movements.reverse` | Reverses Valuation | Counter Movement | YES |
| SOP-INV-012 | Customer Material Intake | INV | IMPLEMENTED | YES | `inventory.customer-material-intakes.create` | Zero Financial Value | Customer Stock Inc | NO |
| SOP-INV-013 | Customer Material Conversion | INV | IMPLEMENTED | YES | `inventory.customer-material-conversions.create` | Zero Financial Value | Customer Stock Conv | NO |
| SOP-INV-014 | Item Deactivate / Reactivate | INV | IMPLEMENTED | YES | `inventory.items.activate` / `deactivate` | None | Status Lock | NO |
| SOP-INV-015 | Import Items | INV | IMPLEMENTED | YES | `inventory.items.create` | None | Bulk Catalog Load | NO |
| SOP-INV-016 | Export Items | INV | IMPLEMENTED | YES | `inventory.items.view` / `inventory.view` | None | None | NO |
| SOP-TRS-001 | Create Treasury Account | TRS | IMPLEMENTED | YES | `treasury.accounts.create` | GL Asset Link | None | NO |
| SOP-TRS-002 | Set Treasury Opening Balance | TRS | IMPLEMENTED | YES | `treasury.accounts.opening-balance` | Dr Cash, Cr Equity | None | YES |
| SOP-TRS-003 | Correct Treasury Opening Balance | TRS | IMPLEMENTED | YES | `treasury.accounts.opening-balance` | Valuation Adjust | None | YES |
| SOP-TRS-004 | Manual Cash In | TRS | IMPLEMENTED | YES | `treasury.transactions.create` | Dr Cash, Cr Misc | None | YES |
| SOP-TRS-005 | Manual Cash Out | TRS | IMPLEMENTED | YES | `treasury.transactions.create` | Dr Misc, Cr Cash | None | YES |
| SOP-TRS-006 | Customer Receipt | TRS | IMPLEMENTED | YES | `treasury.transactions.create` | Dr Cash, Cr Customer | None | YES |
| SOP-TRS-007 | Supplier Payment | TRS | IMPLEMENTED | YES | `treasury.transactions.create` | Dr Supplier, Cr Cash | None | YES |
| SOP-TRS-008 | Treasury Transfer | TRS | IMPLEMENTED | YES | `treasury.transactions.transfer` | Dr Target, Cr Source | None | YES |
| SOP-TRS-009 | Cancel Treasury Transfer | TRS | IMPLEMENTED | YES | `treasury.transactions.transfer-cancel` | Reverses Transfer | None | YES |
| SOP-TRS-010 | Deactivate / Reactivate Treasury Account | TRS | IMPLEMENTED | YES | `treasury.accounts.activate` / `deactivate` | None | None | NO |
| SOP-TRS-011 | Final Delete Treasury Account | TRS | IMPLEMENTED | YES | `treasury.accounts.delete` | Zero Balance Req | None | YES |
| SOP-TRS-012 | Import Treasury Accounts | TRS | IMPLEMENTED | YES | `treasury.accounts.create` | Bulk GL Links | None | NO |
| SOP-TRS-013 | Export Treasury Accounts | TRS | IMPLEMENTED | YES | `treasury.accounts.view` | None | None | NO |
| SOP-TRS-014 | Review Treasury Statement | TRS | IMPLEMENTED | YES | `treasury.accounts.view` | Audit Recon | None | NO |
| SOP-EXP-001 | Create Expense Category | EXP | IMPLEMENTED | YES | `expenses.categories.manage` | Expense Classification | None | NO |
| SOP-EXP-002 | Configure Expense GL Account | EXP | IMPLEMENTED | YES | `expenses.categories.manage` | GL Mapping | None | NO |
| SOP-EXP-003 | Record and Post Expense | EXP | IMPLEMENTED | YES | `expenses.create` | Dr Expense, Cr Cash | None | YES |
| SOP-EXP-004 | Cancel Expense | EXP | IMPLEMENTED | YES | `expenses.cancel` | Reverses Expense GL | None | YES |
| SOP-EXP-005 | Deactivate / Reactivate Expense Category | EXP | IMPLEMENTED | YES | `expenses.categories.manage` | None | None | NO |
| SOP-PUR-001 | Create Purchase Invoice | PUR | IMPLEMENTED | YES | `purchases.invoices.create` | Draft Invoice | None | NO |
| SOP-PUR-002 | Post Purchase Invoice | PUR | IMPLEMENTED | YES | `purchases.invoices.post` | Dr Inv, Cr AP | Increases Stock (WAC) | YES |
| SOP-PUR-003 | Pay Purchase Invoice | PUR | IMPLEMENTED | YES | `treasury.transactions.create` | Dr AP, Cr Cash | None | YES |
| SOP-PUR-004 | Record Purchase Return | PUR | IMPLEMENTED | YES | `purchases.returns.create` | Draft Return | None | NO |
| SOP-PUR-005 | Post Purchase Return | PUR | IMPLEMENTED | YES | `purchases.returns.post` | Dr AP, Cr Inv | Decreases Stock | YES |
| SOP-PUR-006 | Cancel Purchase Invoice | PUR | IMPLEMENTED | YES | `purchases.invoices.cancel` | Reverses Inv & AP | Decreases Stock | YES |
| SOP-PUR-007 | Cancel Purchase Return | PUR | IMPLEMENTED | YES | `purchases.returns.cancel` | Reverses Return | Increases Stock | YES |
| SOP-SAL-001 | Create Sales Invoice | SAL | IMPLEMENTED | YES | `sales.invoices.create` | Draft Invoice | None | NO |
| SOP-SAL-002 | Post Credit Sales Invoice | SAL | IMPLEMENTED | YES | `sales.invoices.post` | Dr AR, Cr Rev; Dr COGS, Cr Inv | Decreases Stock | YES |
| SOP-SAL-003 | Post Cash/Bank Sales Invoice | SAL | IMPLEMENTED | YES | `sales.invoices.post` | Dr Cash, Cr Rev; Dr COGS, Cr Inv | Decreases Stock | YES |
| SOP-SAL-004 | Collect Full Outstanding from Sales | SAL | IMPLEMENTED | YES | `treasury.transactions.create` | Dr Cash, Cr AR | None | YES |
| SOP-SAL-005 | Record Partial Customer Collection via Treasury | SAL | IMPLEMENTED | YES | `treasury.transactions.create` | Dr Cash, Cr AR (Partial) | None | YES |
| SOP-SAL-006 | Create Sales Return | SAL | IMPLEMENTED | YES | `sales.returns.create` | Draft Return | None | NO |
| SOP-SAL-007 | Post Sales Return | SAL | IMPLEMENTED | YES | `sales.returns.post` | Dr Rev, Cr AR; Dr Inv, Cr COGS | Increases Stock | YES |
| SOP-SAL-008 | Cancel Sales Invoice | SAL | IMPLEMENTED | YES | `sales.invoices.cancel` | Reverses Sales GL | Returns Stock | YES |
| SOP-SAL-009 | Cancel Sales Return | SAL | IMPLEMENTED | YES | `sales.returns.cancel` | Reverses Return GL | Decreases Stock | YES |
| SOP-SAL-010 | Review Sales Invoices Report | SAL | IMPLEMENTED | YES | `sales.reports.view` | Audit | None | NO |
| SOP-ACC-001 | Create GL Account | ACC | IMPLEMENTED | YES | `accounting.accounts.create` | COA Structure | None | NO |
| SOP-ACC-002 | Edit GL Account | ACC | IMPLEMENTED | YES | `accounting.accounts.edit` | COA Structure | None | NO |
| SOP-ACC-003 | Activate / Deactivate GL Account | ACC | IMPLEMENTED | YES | `accounting.accounts.edit` | Account Lock | None | NO |
| SOP-ACC-004 | Delete GL Account | ACC | IMPLEMENTED | YES | `accounting.accounts.delete` | Zero Balance Req | None | YES |
| SOP-ACC-005 | Configure Accounting Mapping | ACC | IMPLEMENTED | YES | `accounting.mappings.manage` | System Posting Rules | None | YES |
| SOP-ACC-006 | Create Manual Journal Entry | ACC | IMPLEMENTED | YES | `accounting.journal-entries.create` | Draft Journal | None | NO |
| SOP-ACC-007 | Post Journal Entry | ACC | IMPLEMENTED | YES | `accounting.journal-entries.post` | General Ledger Post | None | YES |
| SOP-ACC-008 | Cancel / Reverse Journal Entry | ACC | IMPLEMENTED | YES | `accounting.journal-entries.cancel` | Reversal Journal | None | YES |
| SOP-ACC-009 | Delete Draft Journal Entry | ACC | IMPLEMENTED | YES | `accounting.journal-entries.delete` | None (Draft Only) | None | NO |
| SOP-ACC-010 | Create Fiscal Year | ACC | IMPLEMENTED | YES | `accounting.periods.manage` | Period Control | None | YES |
| SOP-ACC-011 | Close Accounting Period | ACC | IMPLEMENTED | YES | `accounting.periods.close` | Soft Close Period | None | YES |
| SOP-ACC-012 | Reopen Accounting Period | ACC | IMPLEMENTED | YES | `accounting.periods.close` | Hard Close Period | None | YES |
| SOP-ACC-013 | Perform Fiscal Rollover | ACC | IMPLEMENTED | YES | `accounting.periods.reopen` | Period Reopened | None | YES |
| SOP-ACC-014 | Roll Back Fiscal Rollover | ACC | IMPLEMENTED | YES | `accounting.periods.manage` | Dr Retained, Cr Assets | None | YES |
| SOP-ACC-015 | Perform Year-End Close | ACC | IMPLEMENTED | YES | `accounting.periods.manage` | Reverses Rollover | None | YES |
| SOP-ACC-016 | Reopen Year-End | ACC | IMPLEMENTED | YES | `accounting.periods.manage` | Retained Earnings Close | None | YES |
| SOP-LAB-001 | Create Worker | LAB | IMPLEMENTED | YES | `labor.workers.create` | Worker Subledger | None | NO |
| SOP-LAB-002 | Edit Worker | LAB | IMPLEMENTED | YES | `labor.workers.edit` | None | None | NO |
| SOP-LAB-003 | Deactivate / Reactivate Worker | LAB | IMPLEMENTED | YES | `labor.workers.edit` | None | None | NO |
| SOP-LAB-004 | Delete Worker | LAB | IMPLEMENTED | YES | `labor.attendance.manage` | Wage Hours Input | None | NO |
| SOP-LAB-005 | Create Operational Job | LAB | IMPLEMENTED | YES | `labor.piecework.manage` | Piecework Input | None | NO |
| SOP-LAB-006 | Record Worker Operation | LAB | IMPLEMENTED | YES | `labor.advances.create` | Worker Advance Outflow | None | YES |
| SOP-LAB-007 | Create Monthly Movement | LAB | IMPLEMENTED | YES | `labor.penalties.create` | Wage Deduction | None | NO |
| SOP-LAB-008 | Edit Monthly Movement | LAB | IMPLEMENTED | YES | `labor.bonuses.create` | Wage Incentive | None | NO |
| SOP-LAB-009 | Approve Monthly Movement | LAB | IMPLEMENTED | YES | `labor.allowances.create` | Wage Allowance | None | NO |
| SOP-LAB-010 | Reject Monthly Movement | LAB | IMPLEMENTED | YES | `labor.workers.view` | Audit | None | NO |
| SOP-LAB-011 | Delete Draft Monthly Movement | LAB | IMPLEMENTED | YES | `labor.jobs.manage` | Operational Job Rates | None | NO |
| SOP-LAB-012 | Update Wage Profile | LAB | IMPLEMENTED | YES | `labor.advances.settle` | Advance Clearance | None | YES |
| SOP-LAB-013 | Import Workers | LAB | IMPLEMENTED | YES | `labor.workers.create` | Bulk Worker Load | None | NO |
| SOP-LAB-014 | Export Workers | LAB | IMPLEMENTED | YES | `labor.workers.view` | None | None | NO |
| SOP-LAB-015 | Review Worker Salary Report | LAB | IMPLEMENTED | YES | `labor.workers.delete` | Zero Balance Req | None | YES |
| SOP-PAY-001 | Create Payroll Period | PAY | IMPLEMENTED | YES | `payroll.periods.create` | Period Lifecycle | None | NO |
| SOP-PAY-002 | Calculate Payroll | PAY | IMPLEMENTED | YES | `payroll.periods.calculate` | NetWage Engine | None | YES |
| SOP-PAY-003 | Recalculate Payroll | PAY | IMPLEMENTED | YES | `payroll.periods.view` | Audit | None | NO |
| SOP-PAY-004 | Review Payroll Statements | PAY | IMPLEMENTED | YES | `payroll.periods.calculate` | Wage Recalculation | None | YES |
| SOP-PAY-005 | Approve Payroll | PAY | IMPLEMENTED | YES | `payroll.periods.lock` | Calculation Frozen | None | YES |
| SOP-PAY-006 | Reopen Payroll | PAY | IMPLEMENTED | YES | `payroll.periods.approve` | Approved Payout | None | YES |
| SOP-PAY-007 | Pay All Workers | PAY | IMPLEMENTED | YES | `payroll.payments.create` | Dr Payroll Exp, Cr Cash | None | YES |
| SOP-PAY-008 | Pay Selected Workers | PAY | IMPLEMENTED | YES | `payroll.payments.create` | Dr Payroll Exp, Cr Cash | None | YES |
| SOP-PAY-009 | Reverse Payroll Payment | PAY | IMPLEMENTED | YES | `payroll.payments.reverse` | Reverses Payroll GL | None | YES |
| SOP-PAY-010 | Delete Payroll Period | PAY | IMPLEMENTED | YES | `payroll.periods.close` | Period Finalized | None | YES |
| SOP-MFG-001 | Create BOM | MFG | IMPLEMENTED | YES | `manufacturing.boms.create` | None | Recipe Setup | NO |
| SOP-MFG-002 | Edit BOM | MFG | IMPLEMENTED | YES | `manufacturing.boms.edit` | None | Recipe Update | NO |
| SOP-MFG-003 | Delete BOM | MFG | IMPLEMENTED | YES | `manufacturing.boms.delete` | None | Recipe Removal | NO |
| SOP-MFG-004 | Create Work Center | MFG | IMPLEMENTED | YES | `manufacturing.workcenters.create` | None | Capacity Setup | NO |
| SOP-MFG-005 | Edit Work Center | MFG | IMPLEMENTED | YES | `manufacturing.workcenters.edit` | None | Capacity Update | NO |
| SOP-MFG-006 | Create Production Order | MFG | IMPLEMENTED | YES | `manufacturing.orders.create` | Draft Order | None | NO |
| SOP-MFG-007 | Edit Draft Production Order | MFG | IMPLEMENTED | YES | `manufacturing.orders.update` | None | None | NO |
| SOP-MFG-008 | Approve Production Order | MFG | IMPLEMENTED | YES | `manufacturing.orders.approve` | None | Order Approved | NO |
| SOP-MFG-009 | Release Production Order | MFG | IMPLEMENTED | YES | `manufacturing.orders.release` | None | Ready for Issue | NO |
| SOP-MFG-010 | Issue Material | MFG | IMPLEMENTED | YES | `manufacturing.issues.create` | No Direct WIP GL | Raw Materials Out | YES |
| SOP-MFG-011 | Receive Finished Goods | MFG | IMPLEMENTED | YES | `manufacturing.receipts.create` | No Direct WIP GL | Finished Goods In | YES |
| SOP-MFG-012 | Complete Production Order | MFG | IMPLEMENTED | YES | `manufacturing.orders.complete` | Operational Cost Totals | None | NO |
| SOP-MFG-013 | Close Production Order | MFG | IMPLEMENTED | YES | `manufacturing.orders.close` | Terminal Closure | None | YES |
| SOP-MFG-014 | Cancel Production Order | MFG | IMPLEMENTED | YES | `manufacturing.orders.cancel` | Reverses Issue/Receipt Val | Reverses Stock Move | YES |
| SOP-MFG-015 | Customer-Owned Production | MFG | IMPLEMENTED | YES | `manufacturing.orders.create` | Zero Financial Valuation | Customer Stock Moves | NO |
| SOP-RPT-001 | General Ledger | RPT | IMPLEMENTED | YES | `accounting.reports.view` | Financial Reporting | None | NO |
| SOP-RPT-002 | Trial Balance | RPT | IMPLEMENTED | YES | `accounting.reports.view` | Trial Balance Audit | None | NO |
| SOP-RPT-003 | Income Statement | RPT | IMPLEMENTED | YES | `accounting.reports.view` | P&L Statement | None | NO |
| SOP-RPT-004 | Balance Sheet | RPT | IMPLEMENTED | YES | `accounting.reports.view` | Balance Sheet Audit | None | NO |
| SOP-RPT-005 | Cash Flow | RPT | IMPLEMENTED | YES | `accounting.reports.view` | Cash Flow Analysis | None | NO |
| SOP-RPT-006 | Treasury GL Reconciliation | RPT | IMPLEMENTED | YES | `accounting.reports.view` | Treasury vs GL Audit | None | NO |
| SOP-RPT-007 | Inventory GL Reconciliation | RPT | IMPLEMENTED | YES | `accounting.reports.view` | Stock vs GL Audit | Stock Valuation Recon | NO |
| SOP-RPT-008 | Customer Aging | RPT | IMPLEMENTED | YES | `parties.reports.view` | AR Aging Buckets | None | NO |
| SOP-RPT-009 | Supplier Aging | RPT | IMPLEMENTED | YES | `parties.reports.view` | AP Aging Buckets | None | NO |
| SOP-RPT-010 | Purchase Invoices Report | RPT | IMPLEMENTED | YES | `purchases.reports.view` | Vendor Invoice Audit | Purchases Volume | NO |
| SOP-RPT-011 | Receipts & Payments | RPT | IMPLEMENTED | YES | `treasury.reports.view` | Inflow / Outflow Audit | None | NO |
| SOP-RPT-012 | Sales Customer Item Analysis | RPT | IMPLEMENTED | YES | `sales.reports.view` | Customer Item Turnover | Volume Analysis | NO |
| SOP-RPT-013 | Sales Profitability | RPT | IMPLEMENTED | YES | `sales.reports.view` | Gross Margin Analysis | Profit Margins | NO |
| SOP-RPT-014 | Sales Invoices Report | RPT | IMPLEMENTED | YES | `sales.reports.view` | Sales Revenue Register | None | NO |
| SOP-RPT-015 | Worker Salary Report | RPT | IMPLEMENTED | YES | `labor.reports.view` | Payroll Outlay Audit | None | NO |
| SOP-XMOD-001 | End-to-End Credit Customer Sale Flow | XMOD | IMPLEMENTED | YES | `sales.invoices.create`, `treasury.transactions.create` | AR, Rev, COGS, Cash | Decreases Stock | YES |
| SOP-XMOD-002 | End-to-End Immediate-Payment Customer Sale Flow | XMOD | IMPLEMENTED | YES | `sales.invoices.create`, `treasury.transactions.create` | Direct Cash, Rev, COGS | Decreases Stock | YES |
| SOP-XMOD-003 | End-to-End Credit Supplier Purchase Flow | XMOD | IMPLEMENTED | YES | `purchases.invoices.create`, `treasury.transactions.create` | Inv, AP, Cash Outflow | Increases Stock (WAC) | YES |
| SOP-XMOD-004 | End-to-End Operational Expense Payment Flow | XMOD | IMPLEMENTED | YES | `expenses.create`, `treasury.transactions.create` | Dr Exp, Cr Cash | None | YES |
| SOP-XMOD-005 | End-to-End Payroll Cycle Flow | XMOD | IMPLEMENTED | YES | `payroll.periods.approve`, `payroll.payments.create` | Dr Payroll Exp, Cr Cash | None | YES |
| SOP-XMOD-006 | End-to-End Company-Owned Production Flow | XMOD | IMPLEMENTED | YES | `manufacturing.orders.create`, `manufacturing.receipts.create` | Standard Inv Valuation (No Mfg WIP GL) | Raw Out, Finished In | YES |
| SOP-XMOD-007 | End-to-End Customer-Owned Production Flow | XMOD | IMPLEMENTED | YES | `inventory.customer-material-intakes.create`, `manufacturing.orders.create` | Zero Financial Valuation | Customer Stock Moves | YES |


# SOP-ADM-001 — Create User

## Purpose
Create a new system user.

## When to Use
When onboarding personnel.

## Required Permission(s)
`administration.users.create`

## Preconditions
Role exists.

## Input / Required Data
Name, Username, Password, Role.

## Procedure
1. Navigate to Users.
2. Click Create.
3. Fill details.
4. Save.

## System Result
User created.

## Accounting Effect
Not applicable.

## Inventory Effect
Not applicable.

## Treasury Effect
Not applicable.

## Party Ledger Effect
Not applicable.

## Status Changes
Not applicable.

## Validation / Blocking Conditions
Username must be unique.

## Cancellation / Reversal
Not applicable.

## Verification
User appears in list.

## Related Reports
Not applicable.

## Related User Manual
01-getting-started-and-administration.md

## Screenshot / Visual QA Placeholder
SOP-ADM-001: Users list before/after.


# SOP-ADM-002 — Edit User

## Purpose
Update user details.

## When to Use
When user info changes.

## Required Permission(s)
`administration.users.update`

## Preconditions
User exists.

## Input / Required Data
Updated details.

## Procedure
1. Navigate to Users.
2. Select user.
3. Edit.
4. Save.

## System Result
User updated.

## Accounting Effect
Not applicable.

## Inventory Effect
Not applicable.

## Treasury Effect
Not applicable.

## Party Ledger Effect
Not applicable.

## Status Changes
Not applicable.

## Validation / Blocking Conditions
Protected System Owner cannot be edited.

## Cancellation / Reversal
Not applicable.

## Verification
Changes reflected.

## Related Reports
Not applicable.

## Related User Manual
01-getting-started-and-administration.md

## Screenshot / Visual QA Placeholder
SOP-ADM-002: User edit screen.


# SOP-ADM-003 — Assign Roles

## Purpose
Assign role to user.

## When to Use
When permissions change.

## Required Permission(s)
`administration.users.assign-roles`

## Preconditions
User and Role exist.

## Input / Required Data
Role selection.

## Procedure
1. Navigate to Users.
2. Select user.
3. Assign Role.
4. Save.

## System Result
User role updated.

## Accounting Effect
Not applicable.

## Inventory Effect
Not applicable.

## Treasury Effect
Not applicable.

## Party Ledger Effect
Not applicable.

## Status Changes
Not applicable.

## Validation / Blocking Conditions
Cannot demote System Owner.

## Cancellation / Reversal
Not applicable.

## Verification
Role changed.

## Related Reports
Not applicable.

## Related User Manual
01-getting-started-and-administration.md

## Screenshot / Visual QA Placeholder
SOP-ADM-003: Role assignment.


# SOP-ADM-004 — Deactivate / Reactivate User

## Purpose
Change user active status.

## When to Use
When user leaves or returns.

## Required Permission(s)
`administration.users.deactivate, administration.users.activate`

## Preconditions
User exists.

## Input / Required Data
Status toggle.

## Procedure
1. Select user.
2. Toggle status.
3. Confirm.

## System Result
Status updated.

## Accounting Effect
Not applicable.

## Inventory Effect
Not applicable.

## Treasury Effect
Not applicable.

## Party Ledger Effect
Not applicable.

## Status Changes
Active -> Inactive.

## Validation / Blocking Conditions
Cannot deactivate self.

## Cancellation / Reversal
Toggle again.

## Verification
Login blocked.

## Related Reports
Not applicable.

## Related User Manual
01-getting-started-and-administration.md

## Screenshot / Visual QA Placeholder
SOP-ADM-004: User status toggle.


# SOP-ADM-005 — Delete User

> [!CAUTION]
> HIGH IMPACT PROCEDURE

## Purpose
Remove user permanently.

## When to Use
When user created in error.

## Required Permission(s)
`administration.users.delete`

## Preconditions
User exists, soft deleted first.

## Input / Required Data
Confirmation.

## Procedure
1. Select user.
2. Click Delete.
3. Confirm.

## System Result
Record removed.

## Accounting Effect
Not applicable.

## Inventory Effect
Not applicable.

## Treasury Effect
Not applicable.

## Party Ledger Effect
Not applicable.

## Status Changes
Not applicable.

## Validation / Blocking Conditions
Cannot delete System Owner or self. Final delete requires elevated role.

## Cancellation / Reversal
Not applicable.

## Verification
User disappears.

## Related Reports
Not applicable.

## Related User Manual
01-getting-started-and-administration.md

## Screenshot / Visual QA Placeholder
SOP-ADM-005: User delete.


# SOP-ADM-006 — Create Role

## Purpose
Define a new role.

## When to Use
When new permission grouping needed.

## Required Permission(s)
`administration.roles.create`

## Preconditions
None.

## Input / Required Data
Role Name.

## Procedure
1. Navigate to Roles.
2. Click Create.
3. Save.

## System Result
Role created.

## Accounting Effect
Not applicable.

## Inventory Effect
Not applicable.

## Treasury Effect
Not applicable.

## Party Ledger Effect
Not applicable.

## Status Changes
Not applicable.

## Validation / Blocking Conditions
Name unique.

## Cancellation / Reversal
Not applicable.

## Verification
Role in list.

## Related Reports
Not applicable.

## Related User Manual
01-getting-started-and-administration.md

## Screenshot / Visual QA Placeholder
SOP-ADM-006: Role list.


# SOP-ADM-007 — Edit Role

## Purpose
Change role name.

## When to Use
Typo fix.

## Required Permission(s)
`administration.roles.update`

## Preconditions
Role exists.

## Input / Required Data
New name.

## Procedure
1. Select role.
2. Edit.
3. Save.

## System Result
Role updated.

## Accounting Effect
Not applicable.

## Inventory Effect
Not applicable.

## Treasury Effect
Not applicable.

## Party Ledger Effect
Not applicable.

## Status Changes
Not applicable.

## Validation / Blocking Conditions
System Administrator role protected.

## Cancellation / Reversal
Not applicable.

## Verification
Name changed.

## Related Reports
Not applicable.

## Related User Manual
01-getting-started-and-administration.md

## Screenshot / Visual QA Placeholder
SOP-ADM-007: Role edit.


# SOP-ADM-008 — Assign Permissions to Role

## Purpose
Set permissions for role.

## When to Use
When configuring access.

## Required Permission(s)
`administration.roles.assign-permissions`

## Preconditions
Role exists.

## Input / Required Data
Permissions list.

## Procedure
1. Select role.
2. Click Permissions.
3. Toggle.
4. Save.

## System Result
Access updated.

## Accounting Effect
Not applicable.

## Inventory Effect
Not applicable.

## Treasury Effect
Not applicable.

## Party Ledger Effect
Not applicable.

## Status Changes
Not applicable.

## Validation / Blocking Conditions
System Administrator role protected.

## Cancellation / Reversal
Not applicable.

## Verification
Permissions apply.

## Related Reports
Not applicable.

## Related User Manual
01-getting-started-and-administration.md

## Screenshot / Visual QA Placeholder
SOP-ADM-008: Role permissions.


# SOP-ADM-009 — Delete Role

> [!CAUTION]
> HIGH IMPACT PROCEDURE

## Purpose
Remove a role.

## When to Use
When obsolete.

## Required Permission(s)
`administration.roles.delete`

## Preconditions
Role exists.

## Input / Required Data
Confirmation.

## Procedure
1. Select role.
2. Delete.
3. Confirm.

## System Result
Role deleted.

## Accounting Effect
Not applicable.

## Inventory Effect
Not applicable.

## Treasury Effect
Not applicable.

## Party Ledger Effect
Not applicable.

## Status Changes
Not applicable.

## Validation / Blocking Conditions
Cannot delete System Administrator.

## Cancellation / Reversal
Not applicable.

## Verification
Role disappears.

## Related Reports
Not applicable.

## Related User Manual
01-getting-started-and-administration.md

## Screenshot / Visual QA Placeholder
SOP-ADM-009: Role delete.


# SOP-PARTY-001 — Create Customer

## Purpose
Add a new customer.

## When to Use
New client.

## Required Permission(s)
`parties.create`

## Preconditions
None.

## Input / Required Data
Name, Type.

## Procedure
1. Navigate to Parties.
2. Create.
3. Set type Customer.
4. Save.

## System Result
Customer created.

## Accounting Effect
Not applicable.

## Inventory Effect
Not applicable.

## Treasury Effect
Not applicable.

## Party Ledger Effect
Not applicable.

## Status Changes
Not applicable.

## Validation / Blocking Conditions
Name unique.

## Cancellation / Reversal
Not applicable.

## Verification
Customer in list.

## Related Reports
Not applicable.

## Related User Manual
02-parties.md

## Screenshot / Visual QA Placeholder
SOP-PARTY-001: Party create.


# SOP-PARTY-002 — Create Supplier

## Purpose
Add a new supplier.

## When to Use
New vendor.

## Required Permission(s)
`parties.create`

## Preconditions
None.

## Input / Required Data
Name, Type.

## Procedure
1. Navigate to Parties.
2. Create.
3. Set type Supplier.
4. Save.

## System Result
Supplier created.

## Accounting Effect
Not applicable.

## Inventory Effect
Not applicable.

## Treasury Effect
Not applicable.

## Party Ledger Effect
Not applicable.

## Status Changes
Not applicable.

## Validation / Blocking Conditions
Name unique.

## Cancellation / Reversal
Not applicable.

## Verification
Supplier in list.

## Related Reports
Not applicable.

## Related User Manual
02-parties.md

## Screenshot / Visual QA Placeholder
SOP-PARTY-002: Party create.


# SOP-PARTY-003 — Create Customer + Supplier Party

## Purpose
Add a party that is both.

## When to Use
Dual role entity.

## Required Permission(s)
`parties.create`

## Preconditions
None.

## Input / Required Data
Name, Type.

## Procedure
1. Navigate to Parties.
2. Create.
3. Set type Customer & Supplier.
4. Save.

## System Result
Party created.

## Accounting Effect
Not applicable.

## Inventory Effect
Not applicable.

## Treasury Effect
Not applicable.

## Party Ledger Effect
Not applicable.

## Status Changes
Not applicable.

## Validation / Blocking Conditions
Name unique.

## Cancellation / Reversal
Not applicable.

## Verification
Party in list.

## Related Reports
Not applicable.

## Related User Manual
02-parties.md

## Screenshot / Visual QA Placeholder
SOP-PARTY-003: Party create dual.


# SOP-PARTY-004 — Edit Party

## Purpose
Change party details.

## When to Use
Info change.

## Required Permission(s)
`parties.update`

## Preconditions
Party exists.

## Input / Required Data
Details.

## Procedure
1. Select party.
2. Edit.
3. Save.

## System Result
Party updated.

## Accounting Effect
Not applicable.

## Inventory Effect
Not applicable.

## Treasury Effect
Not applicable.

## Party Ledger Effect
Not applicable.

## Status Changes
Not applicable.

## Validation / Blocking Conditions
None.

## Cancellation / Reversal
Not applicable.

## Verification
Info changes.

## Related Reports
Not applicable.

## Related User Manual
02-parties.md

## Screenshot / Visual QA Placeholder
SOP-PARTY-004: Party edit.


# SOP-PARTY-005 — Deactivate / Reactivate Party

## Purpose
Toggle party status.

## When to Use
Stop operations.

## Required Permission(s)
`parties.deactivate`

## Preconditions
Party exists.

## Input / Required Data
Toggle.

## Procedure
1. Select.
2. Toggle.
3. Confirm.

## System Result
Status changed.

## Accounting Effect
Not applicable.

## Inventory Effect
Not applicable.

## Treasury Effect
Not applicable.

## Party Ledger Effect
Not applicable.

## Status Changes
Active <-> Inactive.

## Validation / Blocking Conditions
None.

## Cancellation / Reversal
Toggle again.

## Verification
Cannot select in invoices.

## Related Reports
Not applicable.

## Related User Manual
02-parties.md

## Screenshot / Visual QA Placeholder
SOP-PARTY-005: Party status.


# SOP-PARTY-006 — Record Party Opening Balance

## Purpose
Set initial balance.

## When to Use
System setup.

## Required Permission(s)
`parties.opening-balance.manage`

## Preconditions
Party exists.

## Input / Required Data
Amount.

## Procedure
1. Select party.
2. Opening Balance.
3. Save.

## System Result
Balance set.

## Accounting Effect
Accounting Journal.

## Inventory Effect
Not applicable.

## Treasury Effect
Not applicable.

## Party Ledger Effect
Balance updated.

## Status Changes
Not applicable.

## Validation / Blocking Conditions
None.

## Cancellation / Reversal
Edit balance.

## Verification
Ledger reflects.

## Related Reports
Not applicable.

## Related User Manual
02-parties.md

## Screenshot / Visual QA Placeholder
SOP-PARTY-006: Opening balance.


# SOP-PARTY-007 — Correct Party Opening Balance

## Purpose
Edit initial balance.

## When to Use
Correction.

## Required Permission(s)
`parties.opening-balance.manage`

## Preconditions
Balance exists.

## Input / Required Data
Amount.

## Procedure
1. Select party.
2. Opening Balance.
3. Save.

## System Result
Balance corrected.

## Accounting Effect
Journal updated.

## Inventory Effect
Not applicable.

## Treasury Effect
Not applicable.

## Party Ledger Effect
Balance updated.

## Status Changes
Not applicable.

## Validation / Blocking Conditions
None.

## Cancellation / Reversal
Edit again.

## Verification
Ledger reflects.

## Related Reports
Not applicable.

## Related User Manual
02-parties.md

## Screenshot / Visual QA Placeholder
SOP-PARTY-007: Correct balance.


# SOP-PARTY-008 — Customer Receipt

## Purpose
Receive money from customer.

## When to Use
Payment received.

## Required Permission(s)
`treasury.receipts.create`

## Preconditions
Customer exists.

## Input / Required Data
Amount, Account.

## Procedure
1. Navigate Treasury.
2. Receipt.
3. Select Customer.
4. Post.

## System Result
Receipt posted.

## Accounting Effect
Debit Treasury, Credit Party.

## Inventory Effect
Not applicable.

## Treasury Effect
Balance increases.

## Party Ledger Effect
Balance decreases.

## Status Changes
Draft -> Posted.

## Validation / Blocking Conditions
Sufficient funds.

## Cancellation / Reversal
Cancel Receipt.

## Verification
Ledger reflects.

## Related Reports
Receipts & Payments.

## Related User Manual
04-treasury.md

## Screenshot / Visual QA Placeholder
SOP-PARTY-008: Receipt.


# SOP-PARTY-009 — Supplier Payment

## Purpose
Pay money to supplier.

## When to Use
Payment made.

## Required Permission(s)
`treasury.payments.create`

## Preconditions
Supplier exists.

## Input / Required Data
Amount, Account.

## Procedure
1. Navigate Treasury.
2. Payment.
3. Select Supplier.
4. Post.

## System Result
Payment posted.

## Accounting Effect
Credit Treasury, Debit Party.

## Inventory Effect
Not applicable.

## Treasury Effect
Balance decreases.

## Party Ledger Effect
Balance decreases.

## Status Changes
Draft -> Posted.

## Validation / Blocking Conditions
Treasury has balance.

## Cancellation / Reversal
Cancel Payment.

## Verification
Ledger reflects.

## Related Reports
Receipts & Payments.

## Related User Manual
04-treasury.md

## Screenshot / Visual QA Placeholder
SOP-PARTY-009: Payment.


# SOP-PARTY-010 — Customer Settlement

## Purpose
Collect full invoice balance directly from sales.

## When to Use
Invoice paid.

## Required Permission(s)
`sales.invoices.post`

## Preconditions
Invoice exists.

## Input / Required Data
Amount.

## Procedure
1. Navigate Sales.
2. Select Invoice.
3. Collect.

## System Result
Collection posted.

## Accounting Effect
Debit Treasury, Credit Customer.

## Inventory Effect
Not applicable.

## Treasury Effect
Balance increases.

## Party Ledger Effect
Invoice settled.

## Status Changes
Not applicable.

## Validation / Blocking Conditions
Treasury account active.

## Cancellation / Reversal
Cancel.

## Verification
Invoice Paid.

## Related Reports
Sales Invoices Report.

## Related User Manual
07-sales.md

## Screenshot / Visual QA Placeholder
SOP-PARTY-010: Collect.


# SOP-PARTY-011 — Supplier Settlement

## Purpose
Pay full invoice balance directly from purchases.

## When to Use
Invoice paid.

## Required Permission(s)
`purchases.invoices.post`

## Preconditions
Invoice exists.

## Input / Required Data
Amount.

## Procedure
1. Navigate Purchases.
2. Select Invoice.
3. Pay.

## System Result
Payment posted.

## Accounting Effect
Credit Treasury, Debit Supplier.

## Inventory Effect
Not applicable.

## Treasury Effect
Balance decreases.

## Party Ledger Effect
Invoice settled.

## Status Changes
Not applicable.

## Validation / Blocking Conditions
Treasury has balance.

## Cancellation / Reversal
Cancel.

## Verification
Invoice Paid.

## Related Reports
Purchase Invoices Report.

## Related User Manual
06-purchases.md

## Screenshot / Visual QA Placeholder
SOP-PARTY-011: Pay.


# SOP-PARTY-012 — Party Adjustment

## Purpose
Adjust party balance.

## When to Use
Write-off.

## Required Permission(s)
`parties.adjustments.manage`

## Preconditions
Party exists.

## Input / Required Data
Amount, Note.

## Procedure
1. Select Party.
2. Adjustment.
3. Post.

## System Result
Adjustment posted.

## Accounting Effect
Journal Entry.

## Inventory Effect
Not applicable.

## Treasury Effect
Not applicable.

## Party Ledger Effect
Balance adjusted.

## Status Changes
Not applicable.

## Validation / Blocking Conditions
None.

## Cancellation / Reversal
Cancel.

## Verification
Ledger reflects.

## Related Reports
Not applicable.

## Related User Manual
02-parties.md

## Screenshot / Visual QA Placeholder
SOP-PARTY-012: Adjustment.


# SOP-PARTY-013 — Reverse / Correct Party Effect

## Purpose
Cancel a party transaction.

## When to Use
Error.

## Required Permission(s)
`parties.adjustments.manage`

## Preconditions
Transaction exists.

## Input / Required Data
Confirmation.

## Procedure
1. Select Transaction.
2. Cancel.

## System Result
Reversed.

## Accounting Effect
Counter Journal Entry.

## Inventory Effect
Not applicable.

## Treasury Effect
Reversed if treasury.

## Party Ledger Effect
Balance restored.

## Status Changes
Posted -> Cancelled.

## Validation / Blocking Conditions
Not applicable.

## Cancellation / Reversal
Not applicable.

## Verification
Ledger reflects.

## Related Reports
Not applicable.

## Related User Manual
02-parties.md

## Screenshot / Visual QA Placeholder
SOP-PARTY-013: Reversal.


# SOP-PARTY-014 — Final Delete Party

> [!CAUTION]
> HIGH IMPACT PROCEDURE

## Purpose
Permanently delete party.

## When to Use
Obsolete.

## Required Permission(s)
`parties.delete`

## Preconditions
Soft deleted, No transactions.

## Input / Required Data
Confirm.

## Procedure
1. Select deleted party.
2. Delete.

## System Result
Party removed.

## Accounting Effect
Not applicable.

## Inventory Effect
Not applicable.

## Treasury Effect
Not applicable.

## Party Ledger Effect
Not applicable.

## Status Changes
Not applicable.

## Validation / Blocking Conditions
Requires elevated role. Must have no linked transactions.

## Cancellation / Reversal
Not applicable.

## Verification
Removed.

## Related Reports
Not applicable.

## Related User Manual
02-parties.md

## Screenshot / Visual QA Placeholder
SOP-PARTY-014: Delete.


# SOP-PARTY-015 — Import Parties

## Purpose
Bulk import customer and supplier master records from Excel (.xlsx) file.

## When to Use
Bulk data operations, initial setup, or operational data reporting.

## Required Permission(s)
`parties.create`

## Preconditions
User has required role permissions.

## Input / Required Data
Standard Excel template (.xlsx) with required headers.

## Procedure
1. Navigate to Parties list (/parties).
2. Click "Import" in the ExcelActions toolbar.
3. Download the official Excel template (parties-import-template.xlsx).
4. Populate party details (Code, Name Arabic/English, Type, Phone, Tax Number, Credit Limit, Opening Balance).
5. Drag and drop or browse to select the completed .xlsx file.
6. The system executes server-side preview validation (PreviewPartiesImportCommand), displaying Valid and Invalid rows with specific column errors.
7. Review validated rows; if errors exist, correct the source file and re-upload.
8. Click "Commit" to finalize valid records into the database.

## System Result
Parties are created with their configured roles and initial balances.

## Accounting Effect
No direct GL impact during creation; opening balances post to party subledger if specified.

## Inventory Effect
Not applicable.

## Treasury Effect
Not applicable.

## Party Ledger Effect
Party ledger accounts initialized.

## Status Changes
Active party created.

## Validation / Blocking Conditions
Invalid file format, missing required columns, or validation errors in preview table.

## Cancellation / Reversal
Import cannot be reversed en masse automatically; imported records must be deactivated or corrected individually.

## Verification
Inspect list page to confirm newly imported records appear and export file matches displayed rows.

## Related Reports
Not applicable.

## Related User Manual
Excel Import/Export documentation in module user manual.

## Screenshot / Visual QA Placeholder
SOP-PARTY-015: Parties Import Dialog / Preview Validation




# SOP-PARTY-016 — Export Parties

## Purpose
Export filtered party records to Excel (.xlsx) for external analysis.

## When to Use
Bulk data operations, initial setup, or operational data reporting.

## Required Permission(s)
`parties.view`

## Preconditions
User has required role permissions.

## Input / Required Data
Standard Excel template (.xlsx) with required headers.

## Procedure
1. Navigate to Parties list (/parties).
2. Apply desired search, party type, or status filters.
3. Click "Export" in the ExcelActions toolbar.
4. The system streams the generated .xlsx workbook (parties-export.xlsx) to the browser.

## System Result
Excel file downloaded containing filtered party master records.

## Accounting Effect
Not applicable.

## Inventory Effect
Not applicable.

## Treasury Effect
Not applicable.

## Party Ledger Effect
Not applicable.

## Status Changes
No status change.

## Validation / Blocking Conditions
Invalid file format, missing required columns, or validation errors in preview table.

## Cancellation / Reversal
Import cannot be reversed en masse automatically; imported records must be deactivated or corrected individually.

## Verification
Inspect list page to confirm newly imported records appear and export file matches displayed rows.

## Related Reports
Not applicable.

## Related User Manual
Excel Import/Export documentation in module user manual.

## Screenshot / Visual QA Placeholder
SOP-PARTY-016: Parties Export Download




# SOP-INV-001 — Create Item

## Purpose
Define item.

## When to Use
New item.

## Required Permission(s)
`inventory.items.create`

## Preconditions
None.

## Input / Required Data
Name, Unit, Type.

## Procedure
1. Inventory.
2. Create Item.
3. Save.

## System Result
Item created.

## Accounting Effect
Not applicable.

## Inventory Effect
Zero stock.

## Treasury Effect
Not applicable.

## Party Ledger Effect
Not applicable.

## Status Changes
Not applicable.

## Validation / Blocking Conditions
None.

## Cancellation / Reversal
Not applicable.

## Verification
Item listed.

## Related Reports
Not applicable.

## Related User Manual
03-inventory.md

## Screenshot / Visual QA Placeholder
SOP-INV-001: Item.


# SOP-INV-002 — Create Category

## Purpose
Define category.

## When to Use
New category.

## Required Permission(s)
`inventory.categories.manage`

## Preconditions
None.

## Input / Required Data
Name.

## Procedure
1. Inventory Categories.
2. Create.
3. Save.

## System Result
Category created.

## Accounting Effect
Not applicable.

## Inventory Effect
Not applicable.

## Treasury Effect
Not applicable.

## Party Ledger Effect
Not applicable.

## Status Changes
Not applicable.

## Validation / Blocking Conditions
None.

## Cancellation / Reversal
Not applicable.

## Verification
Listed.

## Related Reports
Not applicable.

## Related User Manual
03-inventory.md

## Screenshot / Visual QA Placeholder
SOP-INV-002: Category.


# SOP-INV-003 — Create Unit

## Purpose
Define unit.

## When to Use
New unit.

## Required Permission(s)
`inventory.units.manage`

## Preconditions
None.

## Input / Required Data
Name.

## Procedure
1. Units.
2. Create.
3. Save.

## System Result
Unit created.

## Accounting Effect
Not applicable.

## Inventory Effect
Not applicable.

## Treasury Effect
Not applicable.

## Party Ledger Effect
Not applicable.

## Status Changes
Not applicable.

## Validation / Blocking Conditions
None.

## Cancellation / Reversal
Not applicable.

## Verification
Listed.

## Related Reports
Not applicable.

## Related User Manual
03-inventory.md

## Screenshot / Visual QA Placeholder
SOP-INV-003: Unit.


# SOP-INV-004 — Configure Alternate Unit

## Purpose
Alternate unit mapping.

## When to Use
Different UoM.

## Required Permission(s)
`inventory.items.update`

## Preconditions
Item exists.

## Input / Required Data
Ratio.

## Procedure
1. Edit Item.
2. Add Alternate.
3. Save.

## System Result
Mapped.

## Accounting Effect
Not applicable.

## Inventory Effect
Not applicable.

## Treasury Effect
Not applicable.

## Party Ledger Effect
Not applicable.

## Status Changes
Not applicable.

## Validation / Blocking Conditions
None.

## Cancellation / Reversal
Not applicable.

## Verification
Item view.

## Related Reports
Not applicable.

## Related User Manual
03-inventory.md

## Screenshot / Visual QA Placeholder
SOP-INV-004: Alt Unit.


# SOP-INV-005 — Record Opening Stock

## Purpose
Initial stock.

## When to Use
System setup.

## Required Permission(s)
`inventory.opening-stock.manage`

## Preconditions
Item exists.

## Input / Required Data
Qty, Cost.

## Procedure
1. Opening Stock.
2. Enter Qty/Cost.
3. Save.

## System Result
Stock set.

## Accounting Effect
Journal Entry.

## Inventory Effect
Increases.

## Treasury Effect
Not applicable.

## Party Ledger Effect
Not applicable.

## Status Changes
Not applicable.

## Validation / Blocking Conditions
None.

## Cancellation / Reversal
Edit again.

## Verification
Stock View.

## Related Reports
Inventory GL Reconciliation.

## Related User Manual
03-inventory.md

## Screenshot / Visual QA Placeholder
SOP-INV-005: Opening Stock.


# SOP-INV-006 — Correct Opening Stock

## Purpose
Fix initial stock.

## When to Use
Correction.

## Required Permission(s)
`inventory.opening-stock.manage`

## Preconditions
Opening stock exists.

## Input / Required Data
Qty, Cost.

## Procedure
1. Opening Stock.
2. Edit Qty/Cost.
3. Save.

## System Result
Stock corrected.

## Accounting Effect
Journal updated.

## Inventory Effect
Corrected.

## Treasury Effect
Not applicable.

## Party Ledger Effect
Not applicable.

## Status Changes
Not applicable.

## Validation / Blocking Conditions
None.

## Cancellation / Reversal
Edit again.

## Verification
Stock View.

## Related Reports
Inventory GL Reconciliation.

## Related User Manual
03-inventory.md

## Screenshot / Visual QA Placeholder
SOP-INV-006: Correct Stock.


# SOP-INV-007 — Stock In

## Purpose
Manual increase.

## When to Use
Found stock.

## Required Permission(s)
`inventory.movements.stock-in`

## Preconditions
Item exists.

## Input / Required Data
Qty.

## Procedure
1. Movements.
2. Stock In.
3. Save.

## System Result
Stock increased.

## Accounting Effect
Journal Entry (Cost).

## Inventory Effect
Increases.

## Treasury Effect
Not applicable.

## Party Ledger Effect
Not applicable.

## Status Changes
Not applicable.

## Validation / Blocking Conditions
None.

## Cancellation / Reversal
Reverse.

## Verification
Stock View.

## Related Reports
Not applicable.

## Related User Manual
03-inventory.md

## Screenshot / Visual QA Placeholder
SOP-INV-007: Stock In.


# SOP-INV-008 — Stock Out

## Purpose
Manual decrease.

## When to Use
Lost stock.

## Required Permission(s)
`inventory.movements.stock-out`

## Preconditions
Item exists.

## Input / Required Data
Qty.

## Procedure
1. Movements.
2. Stock Out.
3. Save.

## System Result
Stock decreased.

## Accounting Effect
Journal Entry (Cost).

## Inventory Effect
Decreases.

## Treasury Effect
Not applicable.

## Party Ledger Effect
Not applicable.

## Status Changes
Not applicable.

## Validation / Blocking Conditions
Sufficient stock.

## Cancellation / Reversal
Reverse.

## Verification
Stock View.

## Related Reports
Not applicable.

## Related User Manual
03-inventory.md

## Screenshot / Visual QA Placeholder
SOP-INV-008: Stock Out.


# SOP-INV-009 — Adjustment Increase

> [!CAUTION]
> HIGH IMPACT PROCEDURE

## Purpose
Adjust stock up.

## When to Use
Audit.

## Required Permission(s)
`inventory.movements.adjust`

## Preconditions
Item exists.

## Input / Required Data
Qty.

## Procedure
1. Adjustments.
2. Increase.
3. Save.

## System Result
Stock increased.

## Accounting Effect
Journal Entry.

## Inventory Effect
Increases.

## Treasury Effect
Not applicable.

## Party Ledger Effect
Not applicable.

## Status Changes
Not applicable.

## Validation / Blocking Conditions
None.

## Cancellation / Reversal
Reverse.

## Verification
Stock View.

## Related Reports
Not applicable.

## Related User Manual
03-inventory.md

## Screenshot / Visual QA Placeholder
SOP-INV-009: Adjust Up.


# SOP-INV-010 — Adjustment Decrease

> [!CAUTION]
> HIGH IMPACT PROCEDURE

## Purpose
Adjust stock down.

## When to Use
Audit.

## Required Permission(s)
`inventory.movements.adjust`

## Preconditions
Item exists.

## Input / Required Data
Qty.

## Procedure
1. Adjustments.
2. Decrease.
3. Save.

## System Result
Stock decreased.

## Accounting Effect
Journal Entry.

## Inventory Effect
Decreases.

## Treasury Effect
Not applicable.

## Party Ledger Effect
Not applicable.

## Status Changes
Not applicable.

## Validation / Blocking Conditions
Sufficient stock.

## Cancellation / Reversal
Reverse.

## Verification
Stock View.

## Related Reports
Not applicable.

## Related User Manual
03-inventory.md

## Screenshot / Visual QA Placeholder
SOP-INV-010: Adjust Down.


# SOP-INV-011 — Reverse Inventory Movement

## Purpose
Cancel movement.

## When to Use
Error.

## Required Permission(s)
`inventory.movements.reverse`

## Preconditions
Movement exists.

## Input / Required Data
Confirm.

## Procedure
1. Movements.
2. Reverse.

## System Result
Reversed.

## Accounting Effect
Counter Journal.

## Inventory Effect
Reversed.

## Treasury Effect
Not applicable.

## Party Ledger Effect
Not applicable.

## Status Changes
Not applicable.

## Validation / Blocking Conditions
Resulting stock >= 0.

## Cancellation / Reversal
Not applicable.

## Verification
Stock View.

## Related Reports
Not applicable.

## Related User Manual
03-inventory.md

## Screenshot / Visual QA Placeholder
SOP-INV-011: Reverse.


# SOP-INV-012 — Customer Material Intake

## Purpose
Receive customer material.

## When to Use
Tolling.

## Required Permission(s)
`inventory.customer-material-intakes.create, inventory.customer-material-intakes.post`

## Preconditions
Customer exists.

## Input / Required Data
Item, Qty.

## Procedure
1. Intakes.
2. Create.
3. Post.

## System Result
Stock received.

## Accounting Effect
None (Financial value = 0).

## Inventory Effect
Customer Stock Increases.

## Treasury Effect
Not applicable.

## Party Ledger Effect
Not applicable.

## Status Changes
Draft -> Posted.

## Validation / Blocking Conditions
None.

## Cancellation / Reversal
Cancel.

## Verification
Stock View.

## Related Reports
Not applicable.

## Related User Manual
03-inventory.md

## Screenshot / Visual QA Placeholder
SOP-INV-012: Material Intake.


# SOP-INV-013 — Customer Material Conversion

## Purpose
Convert customer material.

## When to Use
Tolling finished.

## Required Permission(s)
`inventory.customer-material-conversions.create, inventory.customer-material-conversions.post`

## Preconditions
Intake exists.

## Input / Required Data
Source, Target.

## Procedure
1. Conversions.
2. Create.
3. Post.

## System Result
Stock converted.

## Accounting Effect
None.

## Inventory Effect
Source Decreases, Target Increases.

## Treasury Effect
Not applicable.

## Party Ledger Effect
Not applicable.

## Status Changes
Draft -> Posted.

## Validation / Blocking Conditions
Sufficient customer stock.

## Cancellation / Reversal
Cancel.

## Verification
Stock View.

## Related Reports
Not applicable.

## Related User Manual
03-inventory.md

## Screenshot / Visual QA Placeholder
SOP-INV-013: Conversion.


# SOP-INV-014 — Item Deactivate / Reactivate

## Purpose
Toggle item.

## When to Use
Discontinued.

## Required Permission(s)
`inventory.items.deactivate, inventory.items.activate`

## Preconditions
Item exists.

## Input / Required Data
Toggle.

## Procedure
1. Items.
2. Toggle.
3. Confirm.

## System Result
Status changed.

## Accounting Effect
Not applicable.

## Inventory Effect
Not applicable.

## Treasury Effect
Not applicable.

## Party Ledger Effect
Not applicable.

## Status Changes
Active <-> Inactive.

## Validation / Blocking Conditions
None.

## Cancellation / Reversal
Toggle again.

## Verification
Item lists.

## Related Reports
Not applicable.

## Related User Manual
03-inventory.md

## Screenshot / Visual QA Placeholder
SOP-INV-014: Item Status.


# SOP-INV-015 — Import Items

## Purpose
Bulk import inventory items, categories, and units of measure from Excel (.xlsx).

## When to Use
Bulk data operations, initial setup, or operational data reporting.

## Required Permission(s)
`inventory.items.create`, `inventory.categories.manage`, `inventory.units.manage`

## Preconditions
User has required role permissions.

## Input / Required Data
Standard Excel template (.xlsx) with required headers.

## Procedure
1. Navigate to Inventory Items list (/inventory/items).
2. Click "Import" in the ExcelActions toolbar.
3. Download standard import template (items-import-template.xlsx).
4. Fill item codes, names, categories, base units, and reorder levels.
5. Upload completed file into the Import Wizard dialog.
6. Review preview validation table: checks for duplicate codes, missing required fields, and category/unit existence.
7. Click "Commit" to insert validated items into inventory catalog.

## System Result
Items, categories, and units are created in the active catalog.

## Accounting Effect
Not applicable.

## Inventory Effect
Catalog master data created (zero stock on hand until opening stock or purchase is posted).

## Treasury Effect
Not applicable.

## Party Ledger Effect
Not applicable.

## Status Changes
Items created in Active status.

## Validation / Blocking Conditions
Invalid file format, missing required columns, or validation errors in preview table.

## Cancellation / Reversal
Import cannot be reversed en masse automatically; imported records must be deactivated or corrected individually.

## Verification
Inspect list page to confirm newly imported records appear and export file matches displayed rows.

## Related Reports
Not applicable.

## Related User Manual
Excel Import/Export documentation in module user manual.

## Screenshot / Visual QA Placeholder
SOP-INV-015: Inventory Items Import Wizard / Preview




# SOP-INV-016 — Export Items

## Purpose
Export inventory catalog, stock levels, and category assignments to Excel.

## When to Use
Bulk data operations, initial setup, or operational data reporting.

## Required Permission(s)
`inventory.items.view` / `inventory.view`

## Preconditions
User has required role permissions.

## Input / Required Data
Standard Excel template (.xlsx) with required headers.

## Procedure
1. Navigate to Inventory Items list (/inventory/items).
2. Filter by category, status, or stock level as needed.
3. Click "Export" in the ExcelActions toolbar.
4. Download generated workbook (inventory-items-export.xlsx).

## System Result
Excel workbook downloaded with inventory details.

## Accounting Effect
Not applicable.

## Inventory Effect
Not applicable.

## Treasury Effect
Not applicable.

## Party Ledger Effect
Not applicable.

## Status Changes
No status change.

## Validation / Blocking Conditions
Invalid file format, missing required columns, or validation errors in preview table.

## Cancellation / Reversal
Import cannot be reversed en masse automatically; imported records must be deactivated or corrected individually.

## Verification
Inspect list page to confirm newly imported records appear and export file matches displayed rows.

## Related Reports
Not applicable.

## Related User Manual
Excel Import/Export documentation in module user manual.

## Screenshot / Visual QA Placeholder
SOP-INV-016: Inventory Items Export Download




# SOP-TRS-001 — Create Treasury Account

## Purpose
New account.

## When to Use
New bank/cash.

## Required Permission(s)
`treasury.accounts.create`

## Preconditions
None.

## Input / Required Data
Name, Type.

## Procedure
1. Treasury.
2. Create Account.
3. Save.

## System Result
Account created.

## Accounting Effect
Not applicable.

## Inventory Effect
Not applicable.

## Treasury Effect
Zero balance.

## Party Ledger Effect
Not applicable.

## Status Changes
Not applicable.

## Validation / Blocking Conditions
None.

## Cancellation / Reversal
Not applicable.

## Verification
Listed.

## Related Reports
Not applicable.

## Related User Manual
04-treasury.md

## Screenshot / Visual QA Placeholder
SOP-TRS-001: Account.


# SOP-TRS-002 — Set Treasury Opening Balance

## Purpose
Initial money.

## When to Use
Setup.

## Required Permission(s)
`treasury.accounts.update`

## Preconditions
Account exists.

## Input / Required Data
Amount.

## Procedure
1. Accounts.
2. Edit Balance.
3. Save.

## System Result
Balance set.

## Accounting Effect
Journal Entry.

## Inventory Effect
Not applicable.

## Treasury Effect
Balance updated.

## Party Ledger Effect
Not applicable.

## Status Changes
Not applicable.

## Validation / Blocking Conditions
None.

## Cancellation / Reversal
Edit again.

## Verification
Statement.

## Related Reports
Not applicable.

## Related User Manual
04-treasury.md

## Screenshot / Visual QA Placeholder
SOP-TRS-002: Opening.


# SOP-TRS-003 — Correct Treasury Opening Balance

## Purpose
Fix money.

## When to Use
Correction.

## Required Permission(s)
`treasury.accounts.update`

## Preconditions
Account exists.

## Input / Required Data
Amount.

## Procedure
1. Accounts.
2. Edit Balance.
3. Save.

## System Result
Balance corrected.

## Accounting Effect
Journal Entry updated.

## Inventory Effect
Not applicable.

## Treasury Effect
Balance updated.

## Party Ledger Effect
Not applicable.

## Status Changes
Not applicable.

## Validation / Blocking Conditions
None.

## Cancellation / Reversal
Edit again.

## Verification
Statement.

## Related Reports
Not applicable.

## Related User Manual
04-treasury.md

## Screenshot / Visual QA Placeholder
SOP-TRS-003: Correct Opening.


# SOP-TRS-004 — Manual Cash In

## Purpose
Receive cash.

## When to Use
Misc income.

## Required Permission(s)
`treasury.receipts.create, treasury.receipts.post`

## Preconditions
Account exists.

## Input / Required Data
Amount.

## Procedure
1. Receipts.
2. Create.
3. Post.

## System Result
Money received.

## Accounting Effect
Debit Treasury, Credit Misc.

## Inventory Effect
Not applicable.

## Treasury Effect
Increases.

## Party Ledger Effect
Not applicable.

## Status Changes
Draft -> Posted.

## Validation / Blocking Conditions
None.

## Cancellation / Reversal
Cancel.

## Verification
Statement.

## Related Reports
Receipts & Payments.

## Related User Manual
04-treasury.md

## Screenshot / Visual QA Placeholder
SOP-TRS-004: Cash In.


# SOP-TRS-005 — Manual Cash Out

## Purpose
Pay cash.

## When to Use
Misc expense.

## Required Permission(s)
`treasury.payments.create, treasury.payments.post`

## Preconditions
Account exists.

## Input / Required Data
Amount.

## Procedure
1. Payments.
2. Create.
3. Post.

## System Result
Money paid.

## Accounting Effect
Credit Treasury, Debit Misc.

## Inventory Effect
Not applicable.

## Treasury Effect
Decreases.

## Party Ledger Effect
Not applicable.

## Status Changes
Draft -> Posted.

## Validation / Blocking Conditions
AllowNegativeBalance or sufficient funds.

## Cancellation / Reversal
Cancel.

## Verification
Statement.

## Related Reports
Receipts & Payments.

## Related User Manual
04-treasury.md

## Screenshot / Visual QA Placeholder
SOP-TRS-005: Cash Out.


# SOP-TRS-006 — Customer Receipt

## Purpose
See SOP-PARTY-008.

## When to Use
Payment.

## Required Permission(s)
`treasury.receipts.create`

## Preconditions
None.

## Input / Required Data
None.

## Procedure
1. See SOP-PARTY-008.

## System Result
See SOP-PARTY-008.

## Accounting Effect
See SOP-PARTY-008.

## Inventory Effect
Not applicable.

## Treasury Effect
Not applicable.

## Party Ledger Effect
Not applicable.

## Status Changes
Not applicable.

## Validation / Blocking Conditions
Not applicable.

## Cancellation / Reversal
Not applicable.

## Verification
Not applicable.

## Related Reports
Not applicable.

## Related User Manual
04-treasury.md

## Screenshot / Visual QA Placeholder
SOP-TRS-006: Cust Receipt.


# SOP-TRS-007 — Supplier Payment

## Purpose
See SOP-PARTY-009.

## When to Use
Payment.

## Required Permission(s)
`treasury.payments.create`

## Preconditions
None.

## Input / Required Data
None.

## Procedure
1. See SOP-PARTY-009.

## System Result
See SOP-PARTY-009.

## Accounting Effect
See SOP-PARTY-009.

## Inventory Effect
Not applicable.

## Treasury Effect
Not applicable.

## Party Ledger Effect
Not applicable.

## Status Changes
Not applicable.

## Validation / Blocking Conditions
Not applicable.

## Cancellation / Reversal
Not applicable.

## Verification
Not applicable.

## Related Reports
Not applicable.

## Related User Manual
04-treasury.md

## Screenshot / Visual QA Placeholder
SOP-TRS-007: Supp Payment.


# SOP-TRS-008 — Treasury Transfer

## Purpose
Move money.

## When to Use
Internal transfer.

## Required Permission(s)
`treasury.transfers.create, treasury.transfers.post`

## Preconditions
Two accounts.

## Input / Required Data
Amount.

## Procedure
1. Transfers.
2. Create.
3. Post.

## System Result
Money moved.

## Accounting Effect
Debit Target, Credit Source.

## Inventory Effect
Not applicable.

## Treasury Effect
Source decreases, Target increases.

## Party Ledger Effect
Not applicable.

## Status Changes
Draft -> Posted.

## Validation / Blocking Conditions
Source sufficient funds (unless negative allowed).

## Cancellation / Reversal
Cancel.

## Verification
Statement.

## Related Reports
Not applicable.

## Related User Manual
04-treasury.md

## Screenshot / Visual QA Placeholder
SOP-TRS-008: Transfer.


# SOP-TRS-009 — Cancel Treasury Transfer

## Purpose
Reverse transfer.

## When to Use
Error.

## Required Permission(s)
`treasury.transfers.cancel`

## Preconditions
Transfer exists.

## Input / Required Data
Confirm.

## Procedure
1. Transfers.
2. Cancel.

## System Result
Reversed.

## Accounting Effect
Counter Journal.

## Inventory Effect
Not applicable.

## Treasury Effect
Target decreases, Source increases.

## Party Ledger Effect
Not applicable.

## Status Changes
Posted -> Cancelled.

## Validation / Blocking Conditions
Target sufficient funds (unless negative allowed).

## Cancellation / Reversal
Not applicable.

## Verification
Statement.

## Related Reports
Not applicable.

## Related User Manual
04-treasury.md

## Screenshot / Visual QA Placeholder
SOP-TRS-009: Cancel Transfer.


# SOP-TRS-010 — Deactivate / Reactivate Treasury Account

## Purpose
Toggle account.

## When to Use
Closed bank.

## Required Permission(s)
`treasury.accounts.deactivate, treasury.accounts.activate`

## Preconditions
Account exists.

## Input / Required Data
Toggle.

## Procedure
1. Accounts.
2. Toggle.
3. Confirm.

## System Result
Status changed.

## Accounting Effect
Not applicable.

## Inventory Effect
Not applicable.

## Treasury Effect
Not applicable.

## Party Ledger Effect
Not applicable.

## Status Changes
Active <-> Inactive.

## Validation / Blocking Conditions
None.

## Cancellation / Reversal
Toggle again.

## Verification
Not selectable.

## Related Reports
Not applicable.

## Related User Manual
04-treasury.md

## Screenshot / Visual QA Placeholder
SOP-TRS-010: Toggle.


# SOP-TRS-011 — Final Delete Treasury Account

> [!CAUTION]
> HIGH IMPACT PROCEDURE

## Purpose
Delete account.

## When to Use
Error.

## Required Permission(s)
`treasury.accounts.delete`

## Preconditions
Soft deleted, no txns.

## Input / Required Data
Confirm.

## Procedure
1. Accounts.
2. Delete.

## System Result
Removed.

## Accounting Effect
Not applicable.

## Inventory Effect
Not applicable.

## Treasury Effect
Not applicable.

## Party Ledger Effect
Not applicable.

## Status Changes
Not applicable.

## Validation / Blocking Conditions
Elevated role, no transactions.

## Cancellation / Reversal
Not applicable.

## Verification
Removed.

## Related Reports
Not applicable.

## Related User Manual
04-treasury.md

## Screenshot / Visual QA Placeholder
SOP-TRS-011: Delete.


# SOP-TRS-012 — Import Treasury Accounts

## Purpose
Bulk import cash boxes and bank accounts from Excel (.xlsx).

## When to Use
Bulk data operations, initial setup, or operational data reporting.

## Required Permission(s)
`treasury.accounts.create`

## Preconditions
User has required role permissions.

## Input / Required Data
Standard Excel template (.xlsx) with required headers.

## Procedure
1. Navigate to Treasury Accounts list (/treasury/accounts).
2. Click "Import" in the ExcelActions toolbar.
3. Download treasury import template (treasury-accounts-import-template.xlsx).
4. Enter account codes, names Arabic/English, account type (Cash/Bank), currency, and linked GL account code.
5. Upload file into Import Dialog.
6. The system validates: unique codes/names, valid GL account link, supported currencies, and format.
7. Review preview validation rows; fix any errors in Excel if rejected.
8. Click "Commit" to persist treasury accounts.

## System Result
Treasury accounts created and linked to GL asset accounts.

## Accounting Effect
Validates accounting link exists in Chart of Accounts.

## Inventory Effect
Not applicable.

## Treasury Effect
Treasury account records initialized.

## Party Ledger Effect
Not applicable.

## Status Changes
Accounts created in Active status.

## Validation / Blocking Conditions
Invalid file format, missing required columns, or validation errors in preview table.

## Cancellation / Reversal
Import cannot be reversed en masse automatically; imported records must be deactivated or corrected individually.

## Verification
Inspect list page to confirm newly imported records appear and export file matches displayed rows.

## Related Reports
Not applicable.

## Related User Manual
Excel Import/Export documentation in module user manual.

## Screenshot / Visual QA Placeholder
SOP-TRS-012: Treasury Accounts Import Dialog / Validation




# SOP-TRS-013 — Export Treasury Accounts

## Purpose
Export treasury accounts and balances to Excel workbook.

## When to Use
Bulk data operations, initial setup, or operational data reporting.

## Required Permission(s)
`treasury.accounts.view`

## Preconditions
User has required role permissions.

## Input / Required Data
Standard Excel template (.xlsx) with required headers.

## Procedure
1. Navigate to Treasury Accounts list (/treasury/accounts).
2. Click "Export" in the ExcelActions toolbar.
3. The system generates and downloads treasury-accounts-export.xlsx.

## System Result
Excel workbook downloaded.

## Accounting Effect
Not applicable.

## Inventory Effect
Not applicable.

## Treasury Effect
Not applicable.

## Party Ledger Effect
Not applicable.

## Status Changes
No status change.

## Validation / Blocking Conditions
Invalid file format, missing required columns, or validation errors in preview table.

## Cancellation / Reversal
Import cannot be reversed en masse automatically; imported records must be deactivated or corrected individually.

## Verification
Inspect list page to confirm newly imported records appear and export file matches displayed rows.

## Related Reports
Not applicable.

## Related User Manual
Excel Import/Export documentation in module user manual.

## Screenshot / Visual QA Placeholder
SOP-TRS-013: Treasury Accounts Export Download




# SOP-TRS-014 — Review Treasury Statement

## Purpose
Check ledger.

## When to Use
Reconciliation.

## Required Permission(s)
`treasury.statements.view`

## Preconditions
Account exists.

## Input / Required Data
Date Range.

## Procedure
1. Statements.
2. Select Account.
3. View.

## System Result
Ledger displayed.

## Accounting Effect
Not applicable.

## Inventory Effect
Not applicable.

## Treasury Effect
Not applicable.

## Party Ledger Effect
Not applicable.

## Status Changes
Not applicable.

## Validation / Blocking Conditions
None.

## Cancellation / Reversal
Not applicable.

## Verification
Not applicable.

## Related Reports
Treasury GL Reconciliation.

## Related User Manual
04-treasury.md

## Screenshot / Visual QA Placeholder
SOP-TRS-014: Statement.


# SOP-EXP-001 — Create Expense Category

## Purpose
Define category.

## When to Use
New expense type.

## Required Permission(s)
`expenses.categories.manage`

## Preconditions
None.

## Input / Required Data
Name, GL Account.

## Procedure
1. Categories.
2. Create.
3. Save.

## System Result
Category created.

## Accounting Effect
Not applicable.

## Inventory Effect
Not applicable.

## Treasury Effect
Not applicable.

## Party Ledger Effect
Not applicable.

## Status Changes
Not applicable.

## Validation / Blocking Conditions
None.

## Cancellation / Reversal
Not applicable.

## Verification
Listed.

## Related Reports
Not applicable.

## Related User Manual
05-expenses.md

## Screenshot / Visual QA Placeholder
SOP-EXP-001: Category.


# SOP-EXP-002 — Configure Expense GL Account

## Purpose
Link GL.

## When to Use
Setup.

## Required Permission(s)
`expenses.categories.manage`

## Preconditions
Category exists.

## Input / Required Data
GL Account.

## Procedure
1. Categories.
2. Edit.
3. Save.

## System Result
Linked.

## Accounting Effect
Not applicable.

## Inventory Effect
Not applicable.

## Treasury Effect
Not applicable.

## Party Ledger Effect
Not applicable.

## Status Changes
Not applicable.

## Validation / Blocking Conditions
None.

## Cancellation / Reversal
Not applicable.

## Verification
View.

## Related Reports
Not applicable.

## Related User Manual
05-expenses.md

## Screenshot / Visual QA Placeholder
SOP-EXP-002: GL.


# SOP-EXP-003 — Record and Post Expense

## Purpose
Pay expense.

## When to Use
Bill paid.

## Required Permission(s)
`expenses.create, expenses.post`

## Preconditions
Category, Treasury Account.

## Input / Required Data
Amount.

## Procedure
1. Expenses.
2. Create.
3. Post.

## System Result
Paid.

## Accounting Effect
Debit Expense GL, Credit Treasury.

## Inventory Effect
Not applicable.

## Treasury Effect
Decreases.

## Party Ledger Effect
Not applicable.

## Status Changes
Draft -> Posted.

## Validation / Blocking Conditions
Treasury sufficient funds (unless negative allowed).

## Cancellation / Reversal
Cancel.

## Verification
Statement.

## Related Reports
Receipts & Payments.

## Related User Manual
05-expenses.md

## Screenshot / Visual QA Placeholder
SOP-EXP-003: Post.


# SOP-EXP-004 — Cancel Expense

## Purpose
Reverse expense.

## When to Use
Error.

## Required Permission(s)
`expenses.cancel`

## Preconditions
Expense exists.

## Input / Required Data
Confirm.

## Procedure
1. Expenses.
2. Cancel.

## System Result
Reversed.

## Accounting Effect
Counter Journal.

## Inventory Effect
Not applicable.

## Treasury Effect
Increases.

## Party Ledger Effect
Not applicable.

## Status Changes
Posted -> Cancelled.

## Validation / Blocking Conditions
Not applicable.

## Cancellation / Reversal
Not applicable.

## Verification
Statement.

## Related Reports
Not applicable.

## Related User Manual
05-expenses.md

## Screenshot / Visual QA Placeholder
SOP-EXP-004: Cancel.


# SOP-EXP-005 — Deactivate / Reactivate Expense Category

## Purpose
Toggle category.

## When to Use
Discontinued.

## Required Permission(s)
`expenses.categories.manage`

## Preconditions
Category exists.

## Input / Required Data
Toggle.

## Procedure
1. Categories.
2. Toggle.
3. Confirm.

## System Result
Status changed.

## Accounting Effect
Not applicable.

## Inventory Effect
Not applicable.

## Treasury Effect
Not applicable.

## Party Ledger Effect
Not applicable.

## Status Changes
Active <-> Inactive.

## Validation / Blocking Conditions
None.

## Cancellation / Reversal
Toggle again.

## Verification
Not selectable.

## Related Reports
Not applicable.

## Related User Manual
05-expenses.md

## Screenshot / Visual QA Placeholder
SOP-EXP-005: Toggle.


# SOP-PUR-001 — Create Purchase Invoice

## Purpose
Record invoice.

## When to Use
Goods received.

## Required Permission(s)
`purchases.invoices.create`

## Preconditions
Supplier, Items.

## Input / Required Data
Lines.

## Procedure
1. Purchases.
2. Create.
3. Save.

## System Result
Draft created.

## Accounting Effect
Not applicable.

## Inventory Effect
Not applicable.

## Treasury Effect
Not applicable.

## Party Ledger Effect
Not applicable.

## Status Changes
Draft.

## Validation / Blocking Conditions
None.

## Cancellation / Reversal
Delete draft.

## Verification
View.

## Related Reports
Not applicable.

## Related User Manual
06-purchases.md

## Screenshot / Visual QA Placeholder
SOP-PUR-001: Create Invoice.


# SOP-PUR-002 — Post Purchase Invoice

## Purpose
Finalize invoice.

## When to Use
Verified.

## Required Permission(s)
`purchases.invoices.post`

## Preconditions
Draft exists.

## Input / Required Data
Confirm.

## Procedure
1. Purchases.
2. Post.

## System Result
Posted.

## Accounting Effect
Debit Inventory/Expense, Credit Supplier.

## Inventory Effect
Increases.

## Treasury Effect
Not applicable.

## Party Ledger Effect
Supplier Balance Increases.

## Status Changes
Draft -> Posted.

## Validation / Blocking Conditions
None.

## Cancellation / Reversal
Cancel.

## Verification
Ledger.

## Related Reports
Purchase Invoices Report.

## Related User Manual
06-purchases.md

## Screenshot / Visual QA Placeholder
SOP-PUR-002: Post Invoice.


# SOP-PUR-003 — Pay Purchase Invoice

## Purpose
Pay invoice from purchase module.

## When to Use
Payment.

## Required Permission(s)
`purchases.invoices.post`

## Preconditions
Posted invoice.

## Input / Required Data
Account.

## Procedure
1. Purchases.
2. Pay.
3. Select Treasury.
4. Post.

## System Result
Paid.

## Accounting Effect
Debit Supplier, Credit Treasury.

## Inventory Effect
Not applicable.

## Treasury Effect
Decreases.

## Party Ledger Effect
Supplier Balance Decreases.

## Status Changes
Posted -> Paid.

## Validation / Blocking Conditions
Treasury balance.

## Cancellation / Reversal
Cancel.

## Verification
Ledger.

## Related Reports
Not applicable.

## Related User Manual
06-purchases.md

## Screenshot / Visual QA Placeholder
SOP-PUR-003: Pay Invoice.


# SOP-PUR-004 — Record Purchase Return

## Purpose
Draft return.

## When to Use
Return goods.

## Required Permission(s)
`purchases.returns.create`

## Preconditions
Posted Invoice.

## Input / Required Data
Lines.

## Procedure
1. Returns.
2. Create from Invoice.
3. Save.

## System Result
Draft created.

## Accounting Effect
Not applicable.

## Inventory Effect
Not applicable.

## Treasury Effect
Not applicable.

## Party Ledger Effect
Not applicable.

## Status Changes
Draft.

## Validation / Blocking Conditions
Must reference original line.

## Cancellation / Reversal
Delete.

## Verification
View.

## Related Reports
Not applicable.

## Related User Manual
06-purchases.md

## Screenshot / Visual QA Placeholder
SOP-PUR-004: Create Return.


# SOP-PUR-005 — Post Purchase Return

## Purpose
Finalize return.

## When to Use
Goods sent.

## Required Permission(s)
`purchases.returns.post`

## Preconditions
Draft return.

## Input / Required Data
Confirm.

## Procedure
1. Returns.
2. Post.

## System Result
Posted.

## Accounting Effect
Debit Supplier, Credit Inventory (Historical Cost).

## Inventory Effect
Decreases.

## Treasury Effect
Not applicable.

## Party Ledger Effect
Supplier Balance Decreases.

## Status Changes
Draft -> Posted.

## Validation / Blocking Conditions
Sufficient stock.

## Cancellation / Reversal
Cancel.

## Verification
Ledger.

## Related Reports
Not applicable.

## Related User Manual
06-purchases.md

## Screenshot / Visual QA Placeholder
SOP-PUR-005: Post Return.


# SOP-PUR-006 — Cancel Purchase Invoice

## Purpose
Reverse invoice.

## When to Use
Error.

## Required Permission(s)
`purchases.invoices.cancel`

## Preconditions
Posted invoice.

## Input / Required Data
Confirm.

## Procedure
1. Invoice.
2. Cancel.

## System Result
Cancelled.

## Accounting Effect
Counter Journal.

## Inventory Effect
Decreases.

## Treasury Effect
Reverses payment if paid.

## Party Ledger Effect
Reverses balance.

## Status Changes
Posted -> Cancelled.

## Validation / Blocking Conditions
No returns against it. Sufficient stock for reversal.

## Cancellation / Reversal
Not applicable.

## Verification
View.

## Related Reports
Not applicable.

## Related User Manual
06-purchases.md

## Screenshot / Visual QA Placeholder
SOP-PUR-006: Cancel Invoice.


# SOP-PUR-007 — Cancel Purchase Return

## Purpose
Reverse return.

## When to Use
Error.

## Required Permission(s)
`purchases.returns.cancel`

## Preconditions
Posted return.

## Input / Required Data
Confirm.

## Procedure
1. Return.
2. Cancel.

## System Result
Cancelled.

## Accounting Effect
Counter Journal.

## Inventory Effect
Increases.

## Treasury Effect
Not applicable.

## Party Ledger Effect
Reverses balance.

## Status Changes
Posted -> Cancelled.

## Validation / Blocking Conditions
None.

## Cancellation / Reversal
Not applicable.

## Verification
View.

## Related Reports
Not applicable.

## Related User Manual
06-purchases.md

## Screenshot / Visual QA Placeholder
SOP-PUR-007: Cancel Return.


# SOP-SAL-001 — Create Sales Invoice

## Purpose
Record sale.

## When to Use
Goods sold.

## Required Permission(s)
`sales.invoices.create`

## Preconditions
Customer, Items.

## Input / Required Data
Lines.

## Procedure
1. Sales.
2. Create.
3. Save.

## System Result
Draft created.

## Accounting Effect
Not applicable.

## Inventory Effect
Not applicable.

## Treasury Effect
Not applicable.

## Party Ledger Effect
Not applicable.

## Status Changes
Draft.

## Validation / Blocking Conditions
None.

## Cancellation / Reversal
Delete.

## Verification
View.

## Related Reports
Not applicable.

## Related User Manual
07-sales.md

## Screenshot / Visual QA Placeholder
SOP-SAL-001: Create Invoice.


# SOP-SAL-002 — Post Credit Sales Invoice

## Purpose
Finalize on credit.

## When to Use
Sale complete.

## Required Permission(s)
`sales.invoices.post`

## Preconditions
Draft exists.

## Input / Required Data
Confirm.

## Procedure
1. Sales.
2. Post.

## System Result
Posted.

## Accounting Effect
Debit Customer, Credit Revenue, Debit COGS, Credit Inventory.

## Inventory Effect
Decreases.

## Treasury Effect
Not applicable.

## Party Ledger Effect
Customer Balance Increases.

## Status Changes
Draft -> Posted.

## Validation / Blocking Conditions
Sufficient stock.

## Cancellation / Reversal
Cancel.

## Verification
Ledger.

## Related Reports
Sales Invoices Report.

## Related User Manual
07-sales.md

## Screenshot / Visual QA Placeholder
SOP-SAL-002: Post Credit.


# SOP-SAL-003 — Post Cash/Bank Sales Invoice

## Purpose
Sale + Immediate collection.

## When to Use
Cash sale.

## Required Permission(s)
`sales.invoices.post`

## Preconditions
Draft exists.

## Input / Required Data
Treasury Account.

## Procedure
1. Sales.
2. Collect.
3. Select Account.

## System Result
Posted & Collected.

## Accounting Effect
Debit Treasury, Credit Revenue, Debit COGS, Credit Inventory.

## Inventory Effect
Decreases.

## Treasury Effect
Increases.

## Party Ledger Effect
Customer Balance unaffected (Debit/Credit offsets).

## Status Changes
Draft -> Paid.

## Validation / Blocking Conditions
Sufficient stock.

## Cancellation / Reversal
Cancel.

## Verification
Ledger.

## Related Reports
Sales Invoices Report.

## Related User Manual
07-sales.md

## Screenshot / Visual QA Placeholder
SOP-SAL-003: Post Cash.


# SOP-SAL-004 — Collect Full Outstanding from Sales

## Purpose
Collect later.

## When to Use
Payment received.

## Required Permission(s)
`sales.invoices.post`

## Preconditions
Posted invoice.

## Input / Required Data
Treasury Account.

## Procedure
1. Sales.
2. Collect.
3. Select Account.

## System Result
Collected.

## Accounting Effect
Debit Treasury, Credit Customer.

## Inventory Effect
Not applicable.

## Treasury Effect
Increases.

## Party Ledger Effect
Customer Balance Decreases.

## Status Changes
Posted -> Paid.

## Validation / Blocking Conditions
None.

## Cancellation / Reversal
Cancel.

## Verification
Ledger.

## Related Reports
Not applicable.

## Related User Manual
07-sales.md

## Screenshot / Visual QA Placeholder
SOP-SAL-004: Collect.


# SOP-SAL-005 — Record Partial Customer Collection via Treasury

## Purpose
Partial payment.

## When to Use
Partial cash.

## Required Permission(s)
`treasury.receipts.create`

## Preconditions
Customer.

## Input / Required Data
Amount.

## Procedure
1. Treasury.
2. Receipt.
3. Post.

## System Result
Received.

## Accounting Effect
Debit Treasury, Credit Customer.

## Inventory Effect
Not applicable.

## Treasury Effect
Increases.

## Party Ledger Effect
Customer Balance Decreases.

## Status Changes
Draft -> Posted.

## Validation / Blocking Conditions
None.

## Cancellation / Reversal
Cancel.

## Verification
Ledger.

## Related Reports
Not applicable.

## Related User Manual
07-sales.md

## Screenshot / Visual QA Placeholder
SOP-SAL-005: Partial Collect.


# SOP-SAL-006 — Create Sales Return

## Purpose
Draft return.

## When to Use
Return goods.

## Required Permission(s)
`sales.returns.create`

## Preconditions
Posted invoice.

## Input / Required Data
Lines.

## Procedure
1. Returns.
2. Create from Invoice.
3. Save.

## System Result
Draft created.

## Accounting Effect
Not applicable.

## Inventory Effect
Not applicable.

## Treasury Effect
Not applicable.

## Party Ledger Effect
Not applicable.

## Status Changes
Draft.

## Validation / Blocking Conditions
Must reference original line.

## Cancellation / Reversal
Delete.

## Verification
View.

## Related Reports
Not applicable.

## Related User Manual
07-sales.md

## Screenshot / Visual QA Placeholder
SOP-SAL-006: Create Return.


# SOP-SAL-007 — Post Sales Return

## Purpose
Finalize return.

## When to Use
Goods received.

## Required Permission(s)
`sales.returns.post`

## Preconditions
Draft return.

## Input / Required Data
Confirm.

## Procedure
1. Returns.
2. Post.

## System Result
Posted.

## Accounting Effect
Debit Revenue, Credit Customer, Debit Inventory, Credit COGS (Historical Cost).

## Inventory Effect
Increases.

## Treasury Effect
Not applicable.

## Party Ledger Effect
Customer Balance Decreases.

## Status Changes
Draft -> Posted.

## Validation / Blocking Conditions
None.

## Cancellation / Reversal
Cancel.

## Verification
Ledger.

## Related Reports
Not applicable.

## Related User Manual
07-sales.md

## Screenshot / Visual QA Placeholder
SOP-SAL-007: Post Return.


# SOP-SAL-008 — Cancel Sales Invoice

## Purpose
Reverse invoice.

## When to Use
Error.

## Required Permission(s)
`sales.invoices.cancel`

## Preconditions
Posted invoice.

## Input / Required Data
Confirm.

## Procedure
1. Invoice.
2. Cancel.

## System Result
Cancelled.

## Accounting Effect
Counter Journal.

## Inventory Effect
Increases.

## Treasury Effect
Reverses collection if paid.

## Party Ledger Effect
Reverses balance.

## Status Changes
Posted -> Cancelled.

## Validation / Blocking Conditions
No returns against it.

## Cancellation / Reversal
Not applicable.

## Verification
View.

## Related Reports
Not applicable.

## Related User Manual
07-sales.md

## Screenshot / Visual QA Placeholder
SOP-SAL-008: Cancel Invoice.


# SOP-SAL-009 — Cancel Sales Return

## Purpose
Reverse return.

## When to Use
Error.

## Required Permission(s)
`sales.returns.cancel`

## Preconditions
Posted return.

## Input / Required Data
Confirm.

## Procedure
1. Return.
2. Cancel.

## System Result
Cancelled.

## Accounting Effect
Counter Journal.

## Inventory Effect
Decreases.

## Treasury Effect
Not applicable.

## Party Ledger Effect
Reverses balance.

## Status Changes
Posted -> Cancelled.

## Validation / Blocking Conditions
Sufficient stock for reversal.

## Cancellation / Reversal
Not applicable.

## Verification
View.

## Related Reports
Not applicable.

## Related User Manual
07-sales.md

## Screenshot / Visual QA Placeholder
SOP-SAL-009: Cancel Return.


# SOP-SAL-010 — Review Sales Invoices Report

## Purpose
Check sales.

## When to Use
Reporting.

## Required Permission(s)
`sales.invoices.view`

## Preconditions
None.

## Input / Required Data
Dates.

## Procedure
1. Reports.
2. Sales Invoices.

## System Result
Report shown.

## Accounting Effect
Not applicable.

## Inventory Effect
Not applicable.

## Treasury Effect
Not applicable.

## Party Ledger Effect
Not applicable.

## Status Changes
Not applicable.

## Validation / Blocking Conditions
None.

## Cancellation / Reversal
Not applicable.

## Verification
View.

## Related Reports
Sales Invoices Report.

## Related User Manual
07-sales.md

## Screenshot / Visual QA Placeholder
SOP-SAL-010: Sales Report.


# SOP-ACC-001 — Create GL Account

## Purpose
Add account.

## When to Use
Chart of accounts.

## Required Permission(s)
`accounting.accounts.create`

## Preconditions
None.

## Input / Required Data
Name, Parent.

## Procedure
1. Accounting.
2. Accounts.
3. Create.

## System Result
Account created.

## Accounting Effect
Not applicable.

## Inventory Effect
Not applicable.

## Treasury Effect
Not applicable.

## Party Ledger Effect
Not applicable.

## Status Changes
Not applicable.

## Validation / Blocking Conditions
Number unique.

## Cancellation / Reversal
Not applicable.

## Verification
Listed.

## Related Reports
Not applicable.

## Related User Manual
08-accounting.md

## Screenshot / Visual QA Placeholder
SOP-ACC-001: GL Create.


# SOP-ACC-002 — Edit GL Account

## Purpose
Modify account.

## When to Use
Typo.

## Required Permission(s)
`accounting.accounts.update`

## Preconditions
Account exists.

## Input / Required Data
Details.

## Procedure
1. Accounts.
2. Edit.
3. Save.

## System Result
Updated.

## Accounting Effect
Not applicable.

## Inventory Effect
Not applicable.

## Treasury Effect
Not applicable.

## Party Ledger Effect
Not applicable.

## Status Changes
Not applicable.

## Validation / Blocking Conditions
None.

## Cancellation / Reversal
Not applicable.

## Verification
View.

## Related Reports
Not applicable.

## Related User Manual
08-accounting.md

## Screenshot / Visual QA Placeholder
SOP-ACC-002: GL Edit.


# SOP-ACC-003 — Activate / Deactivate GL Account

## Purpose
Toggle account.

## When to Use
Obsolete.

## Required Permission(s)
`accounting.accounts.activate, accounting.accounts.deactivate`

## Preconditions
Account exists.

## Input / Required Data
Toggle.

## Procedure
1. Accounts.
2. Toggle.

## System Result
Status changed.

## Accounting Effect
Not applicable.

## Inventory Effect
Not applicable.

## Treasury Effect
Not applicable.

## Party Ledger Effect
Not applicable.

## Status Changes
Active <-> Inactive.

## Validation / Blocking Conditions
Cannot deactivate if has balance.

## Cancellation / Reversal
Toggle.

## Verification
View.

## Related Reports
Not applicable.

## Related User Manual
08-accounting.md

## Screenshot / Visual QA Placeholder
SOP-ACC-003: GL Toggle.


# SOP-ACC-004 — Delete GL Account

## Purpose
Remove account.

## When to Use
Error.

## Required Permission(s)
`accounting.accounts.delete`

## Preconditions
No transactions.

## Input / Required Data
Confirm.

## Procedure
1. Accounts.
2. Delete.

## System Result
Removed.

## Accounting Effect
Not applicable.

## Inventory Effect
Not applicable.

## Treasury Effect
Not applicable.

## Party Ledger Effect
Not applicable.

## Status Changes
Not applicable.

## Validation / Blocking Conditions
No transactions.

## Cancellation / Reversal
Not applicable.

## Verification
Removed.

## Related Reports
Not applicable.

## Related User Manual
08-accounting.md

## Screenshot / Visual QA Placeholder
SOP-ACC-004: GL Delete.


# SOP-ACC-005 — Configure Accounting Mapping

## Purpose
System GL setup.

## When to Use
Setup.

## Required Permission(s)
`accounting.settings.update`

## Preconditions
GL Accounts exist.

## Input / Required Data
Mappings.

## Procedure
1. Settings.
2. Accounting.
3. Save.

## System Result
Mapped.

## Accounting Effect
Directs automatic journals.

## Inventory Effect
Not applicable.

## Treasury Effect
Not applicable.

## Party Ledger Effect
Not applicable.

## Status Changes
Not applicable.

## Validation / Blocking Conditions
None.

## Cancellation / Reversal
Not applicable.

## Verification
View.

## Related Reports
Not applicable.

## Related User Manual
08-accounting.md

## Screenshot / Visual QA Placeholder
SOP-ACC-005: Mapping.


# SOP-ACC-006 — Create Manual Journal Entry

## Purpose
Draft JV.

## When to Use
Adjustment.

## Required Permission(s)
`accounting.journal-entries.create`

## Preconditions
None.

## Input / Required Data
Lines.

## Procedure
1. Journals.
2. Create.
3. Save.

## System Result
Draft created.

## Accounting Effect
Not applicable.

## Inventory Effect
Not applicable.

## Treasury Effect
Not applicable.

## Party Ledger Effect
Not applicable.

## Status Changes
Draft.

## Validation / Blocking Conditions
Balanced.

## Cancellation / Reversal
Delete.

## Verification
View.

## Related Reports
Not applicable.

## Related User Manual
08-accounting.md

## Screenshot / Visual QA Placeholder
SOP-ACC-006: Create JV.


# SOP-ACC-007 — Post Journal Entry

> [!CAUTION]
> HIGH IMPACT PROCEDURE

## Purpose
Finalize JV.

## When to Use
Accounting.

## Required Permission(s)
`accounting.journal-entries.post`

## Preconditions
Draft exists.

## Input / Required Data
Confirm.

## Procedure
1. Journals.
2. Post.

## System Result
Posted.

## Accounting Effect
GL updated.

## Inventory Effect
Not applicable.

## Treasury Effect
Not applicable.

## Party Ledger Effect
Not applicable.

## Status Changes
Draft -> Posted.

## Validation / Blocking Conditions
Balanced, period open.

## Cancellation / Reversal
Cancel.

## Verification
Ledger.

## Related Reports
General Ledger.

## Related User Manual
08-accounting.md

## Screenshot / Visual QA Placeholder
SOP-ACC-007: Post JV.


# SOP-ACC-008 — Cancel / Reverse Journal Entry

## Purpose
Reverse JV.

## When to Use
Error.

## Required Permission(s)
`accounting.journal-entries.cancel`

## Preconditions
Posted JV.

## Input / Required Data
Confirm.

## Procedure
1. Journals.
2. Cancel.

## System Result
Reversed.

## Accounting Effect
Counter Journal.

## Inventory Effect
Not applicable.

## Treasury Effect
Not applicable.

## Party Ledger Effect
Not applicable.

## Status Changes
Posted -> Cancelled.

## Validation / Blocking Conditions
Period open.

## Cancellation / Reversal
Not applicable.

## Verification
Ledger.

## Related Reports
Not applicable.

## Related User Manual
08-accounting.md

## Screenshot / Visual QA Placeholder
SOP-ACC-008: Reverse JV.


# SOP-ACC-009 — Delete Draft Journal Entry

## Purpose
Remove draft.

## When to Use
Error.

## Required Permission(s)
`accounting.journal-entries.delete`

## Preconditions
Draft JV.

## Input / Required Data
Confirm.

## Procedure
1. Journals.
2. Delete.

## System Result
Removed.

## Accounting Effect
Not applicable.

## Inventory Effect
Not applicable.

## Treasury Effect
Not applicable.

## Party Ledger Effect
Not applicable.

## Status Changes
Not applicable.

## Validation / Blocking Conditions
Must be draft.

## Cancellation / Reversal
Not applicable.

## Verification
Removed.

## Related Reports
Not applicable.

## Related User Manual
08-accounting.md

## Screenshot / Visual QA Placeholder
SOP-ACC-009: Delete JV.


# SOP-ACC-010 — Create Fiscal Year

## Purpose
New year.

## When to Use
Setup.

## Required Permission(s)
`accounting.periods.manage`

## Preconditions
None.

## Input / Required Data
Dates.

## Procedure
1. Periods.
2. Create Year.

## System Result
Year created.

## Accounting Effect
Not applicable.

## Inventory Effect
Not applicable.

## Treasury Effect
Not applicable.

## Party Ledger Effect
Not applicable.

## Status Changes
Not applicable.

## Validation / Blocking Conditions
No overlap.

## Cancellation / Reversal
Not applicable.

## Verification
Listed.

## Related Reports
Not applicable.

## Related User Manual
08-accounting.md

## Screenshot / Visual QA Placeholder
SOP-ACC-010: Create Year.


# SOP-ACC-011 — Close Accounting Period

## Purpose
Lock period.

## When to Use
Month end.

## Required Permission(s)
`accounting.periods.manage`

## Preconditions
Period open.

## Input / Required Data
Confirm.

## Procedure
1. Periods.
2. Close.

## System Result
Period closed.

## Accounting Effect
Blocks postings.

## Inventory Effect
Not applicable.

## Treasury Effect
Not applicable.

## Party Ledger Effect
Not applicable.

## Status Changes
Open -> Closed.

## Validation / Blocking Conditions
None.

## Cancellation / Reversal
Reopen.

## Verification
Listed.

## Related Reports
Not applicable.

## Related User Manual
08-accounting.md

## Screenshot / Visual QA Placeholder
SOP-ACC-011: Close Period.


# SOP-ACC-012 — Reopen Accounting Period

## Purpose
Unlock period.

## When to Use
Correction.

## Required Permission(s)
`accounting.periods.reopen`

## Preconditions
Period closed.

## Input / Required Data
Confirm.

## Procedure
1. Periods.
2. Reopen.

## System Result
Period open.

## Accounting Effect
Allows postings.

## Inventory Effect
Not applicable.

## Treasury Effect
Not applicable.

## Party Ledger Effect
Not applicable.

## Status Changes
Closed -> Open.

## Validation / Blocking Conditions
Later periods must be open.

## Cancellation / Reversal
Close.

## Verification
Listed.

## Related Reports
Not applicable.

## Related User Manual
08-accounting.md

## Screenshot / Visual QA Placeholder
SOP-ACC-012: Reopen Period.


# SOP-ACC-013 — Perform Fiscal Rollover

> [!CAUTION]
> HIGH IMPACT PROCEDURE

## Purpose
Carry balances forward.

## When to Use
Year end.

## Required Permission(s)
`accounting.fiscal-years.rollover`

## Preconditions
Year closed.

## Input / Required Data
Confirm.

## Procedure
1. Periods.
2. Rollover.

## System Result
Balances transferred.

## Accounting Effect
Opening balances set in next year.

## Inventory Effect
Not applicable.

## Treasury Effect
Not applicable.

## Party Ledger Effect
Not applicable.

## Status Changes
Not applicable.

## Validation / Blocking Conditions
Source year closed, target year exists.

## Cancellation / Reversal
Rollback.

## Verification
Trial Balance.

## Related Reports
Not applicable.

## Related User Manual
08-accounting.md

## Screenshot / Visual QA Placeholder
SOP-ACC-013: Rollover.


# SOP-ACC-014 — Roll Back Fiscal Rollover

> [!CAUTION]
> HIGH IMPACT PROCEDURE

## Purpose
Undo carry forward.

## When to Use
Error.

## Required Permission(s)
`accounting.fiscal-years.rollback`

## Preconditions
Rolled over.

## Input / Required Data
Confirm.

## Procedure
1. Periods.
2. Rollback.

## System Result
Balances removed.

## Accounting Effect
Opening balances removed.

## Inventory Effect
Not applicable.

## Treasury Effect
Not applicable.

## Party Ledger Effect
Not applicable.

## Status Changes
Not applicable.

## Validation / Blocking Conditions
Target year unused.

## Cancellation / Reversal
Rollover.

## Verification
Trial Balance.

## Related Reports
Not applicable.

## Related User Manual
08-accounting.md

## Screenshot / Visual QA Placeholder
SOP-ACC-014: Rollback.


# SOP-ACC-015 — Perform Year-End Close

> [!CAUTION]
> HIGH IMPACT PROCEDURE

## Purpose
Transfer P&L.

## When to Use
Year end.

## Required Permission(s)
`accounting.year-end.close`

## Preconditions
Year closed.

## Input / Required Data
Confirm.

## Procedure
1. Periods.
2. Year End Close.

## System Result
Closed.

## Accounting Effect
P&L zeroed to Retained Earnings.

## Inventory Effect
Not applicable.

## Treasury Effect
Not applicable.

## Party Ledger Effect
Not applicable.

## Status Changes
Not applicable.

## Validation / Blocking Conditions
All periods closed.

## Cancellation / Reversal
Reopen.

## Verification
Trial Balance.

## Related Reports
Not applicable.

## Related User Manual
08-accounting.md

## Screenshot / Visual QA Placeholder
SOP-ACC-015: Year End.


# SOP-ACC-016 — Reopen Year-End

> [!CAUTION]
> HIGH IMPACT PROCEDURE

## Purpose
Undo P&L transfer.

## When to Use
Error.

## Required Permission(s)
`accounting.year-end.reopen`

## Preconditions
Year end closed.

## Input / Required Data
Confirm.

## Procedure
1. Periods.
2. Reopen Year End.

## System Result
Reopened.

## Accounting Effect
Retained earnings journal reversed.

## Inventory Effect
Not applicable.

## Treasury Effect
Not applicable.

## Party Ledger Effect
Not applicable.

## Status Changes
Not applicable.

## Validation / Blocking Conditions
None.

## Cancellation / Reversal
Close.

## Verification
Trial Balance.

## Related Reports
Not applicable.

## Related User Manual
08-accounting.md

## Screenshot / Visual QA Placeholder
SOP-ACC-016: Reopen Year End.


# SOP-LAB-001 — Create Worker

## Purpose
Add worker.

## When to Use
New hire.

## Required Permission(s)
`labor.workers.create`

## Preconditions
None.

## Input / Required Data
Details.

## Procedure
1. Workers.
2. Create.
3. Save.

## System Result
Worker created.

## Accounting Effect
Not applicable.

## Inventory Effect
Not applicable.

## Treasury Effect
Not applicable.

## Party Ledger Effect
Not applicable.

## Status Changes
Not applicable.

## Validation / Blocking Conditions
None.

## Cancellation / Reversal
Not applicable.

## Verification
Listed.

## Related Reports
Not applicable.

## Related User Manual
09-labor.md

## Screenshot / Visual QA Placeholder
SOP-LAB-001: Worker.


# SOP-LAB-002 — Edit Worker

## Purpose
Update worker.

## When to Use
Info change.

## Required Permission(s)
`labor.workers.edit`

## Preconditions
Worker exists.

## Input / Required Data
Details.

## Procedure
1. Workers.
2. Edit.
3. Save.

## System Result
Updated.

## Accounting Effect
Not applicable.

## Inventory Effect
Not applicable.

## Treasury Effect
Not applicable.

## Party Ledger Effect
Not applicable.

## Status Changes
Not applicable.

## Validation / Blocking Conditions
None.

## Cancellation / Reversal
Not applicable.

## Verification
View.

## Related Reports
Not applicable.

## Related User Manual
09-labor.md

## Screenshot / Visual QA Placeholder
SOP-LAB-002: Edit Worker.


# SOP-LAB-003 — Deactivate / Reactivate Worker

## Purpose
Toggle worker.

## When to Use
Leave.

## Required Permission(s)
`labor.workers.change-status`

## Preconditions
Worker exists.

## Input / Required Data
Toggle.

## Procedure
1. Workers.
2. Toggle.

## System Result
Status changed.

## Accounting Effect
Not applicable.

## Inventory Effect
Not applicable.

## Treasury Effect
Not applicable.

## Party Ledger Effect
Not applicable.

## Status Changes
Active <-> Inactive.

## Validation / Blocking Conditions
None.

## Cancellation / Reversal
Toggle.

## Verification
View.

## Related Reports
Not applicable.

## Related User Manual
09-labor.md

## Screenshot / Visual QA Placeholder
SOP-LAB-003: Worker Status.


# SOP-LAB-004 — Delete Worker

## Purpose
Remove worker.

## When to Use
Error.

## Required Permission(s)
`labor.workers.delete`

## Preconditions
No transactions.

## Input / Required Data
Confirm.

## Procedure
1. Workers.
2. Delete.

## System Result
Removed.

## Accounting Effect
Not applicable.

## Inventory Effect
Not applicable.

## Treasury Effect
Not applicable.

## Party Ledger Effect
Not applicable.

## Status Changes
Not applicable.

## Validation / Blocking Conditions
No payroll.

## Cancellation / Reversal
Not applicable.

## Verification
Removed.

## Related Reports
Not applicable.

## Related User Manual
09-labor.md

## Screenshot / Visual QA Placeholder
SOP-LAB-004: Worker Delete.


# SOP-LAB-005 — Create Operational Job

## Purpose
Add job role.

## When to Use
New role.

## Required Permission(s)
`labor.operational-jobs.create`

## Preconditions
None.

## Input / Required Data
Name, Rate.

## Procedure
1. Jobs.
2. Create.
3. Save.

## System Result
Job created.

## Accounting Effect
Not applicable.

## Inventory Effect
Not applicable.

## Treasury Effect
Not applicable.

## Party Ledger Effect
Not applicable.

## Status Changes
Not applicable.

## Validation / Blocking Conditions
None.

## Cancellation / Reversal
Not applicable.

## Verification
Listed.

## Related Reports
Not applicable.

## Related User Manual
09-labor.md

## Screenshot / Visual QA Placeholder
SOP-LAB-005: Job.


# SOP-LAB-006 — Record Worker Operation

## Purpose
Log daily work.

## When to Use
End of shift.

## Required Permission(s)
`labor.operations.create`

## Preconditions
Worker, Job.

## Input / Required Data
Hours.

## Procedure
1. Operations.
2. Create.
3. Save.

## System Result
Operation logged.

## Accounting Effect
None.

## Inventory Effect
Not applicable.

## Treasury Effect
Not applicable.

## Party Ledger Effect
Not applicable.

## Status Changes
Not applicable.

## Validation / Blocking Conditions
Does NOT feed payroll directly.

## Cancellation / Reversal
Delete.

## Verification
View.

## Related Reports
Not applicable.

## Related User Manual
09-labor.md

## Screenshot / Visual QA Placeholder
SOP-LAB-006: Operation.


# SOP-LAB-007 — Create Monthly Movement

## Purpose
Log attendance/deductions.

## When to Use
End of month.

## Required Permission(s)
`labor.monthly-movements.create`

## Preconditions
Worker.

## Input / Required Data
Amount.

## Procedure
1. Movements.
2. Create.
3. Save.

## System Result
Draft created.

## Accounting Effect
Not applicable.

## Inventory Effect
Not applicable.

## Treasury Effect
Not applicable.

## Party Ledger Effect
Not applicable.

## Status Changes
Draft.

## Validation / Blocking Conditions
None.

## Cancellation / Reversal
Delete.

## Verification
View.

## Related Reports
Not applicable.

## Related User Manual
09-labor.md

## Screenshot / Visual QA Placeholder
SOP-LAB-007: Movement.


# SOP-LAB-008 — Edit Monthly Movement

## Purpose
Update movement.

## When to Use
Correction.

## Required Permission(s)
`labor.monthly-movements.edit`

## Preconditions
Draft exists.

## Input / Required Data
Details.

## Procedure
1. Movements.
2. Edit.
3. Save.

## System Result
Updated.

## Accounting Effect
Not applicable.

## Inventory Effect
Not applicable.

## Treasury Effect
Not applicable.

## Party Ledger Effect
Not applicable.

## Status Changes
Not applicable.

## Validation / Blocking Conditions
Must be draft.

## Cancellation / Reversal
Not applicable.

## Verification
View.

## Related Reports
Not applicable.

## Related User Manual
09-labor.md

## Screenshot / Visual QA Placeholder
SOP-LAB-008: Edit Movement.


# SOP-LAB-009 — Approve Monthly Movement

## Purpose
Finalize movement.

## When to Use
Verified.

## Required Permission(s)
`labor.monthly-movements.approve`

## Preconditions
Draft exists.

## Input / Required Data
Confirm.

## Procedure
1. Movements.
2. Approve.

## System Result
Approved.

## Accounting Effect
Ready for payroll.

## Inventory Effect
Not applicable.

## Treasury Effect
Not applicable.

## Party Ledger Effect
Not applicable.

## Status Changes
Draft -> Approved.

## Validation / Blocking Conditions
None.

## Cancellation / Reversal
Reject.

## Verification
View.

## Related Reports
Not applicable.

## Related User Manual
09-labor.md

## Screenshot / Visual QA Placeholder
SOP-LAB-009: Approve Movement.


# SOP-LAB-010 — Reject Monthly Movement

## Purpose
Cancel movement.

## When to Use
Error.

## Required Permission(s)
`labor.monthly-movements.reject`

## Preconditions
Draft/Approved.

## Input / Required Data
Confirm.

## Procedure
1. Movements.
2. Reject.

## System Result
Rejected.

## Accounting Effect
Excluded from payroll.

## Inventory Effect
Not applicable.

## Treasury Effect
Not applicable.

## Party Ledger Effect
Not applicable.

## Status Changes
Approved -> Rejected.

## Validation / Blocking Conditions
Not processed in payroll.

## Cancellation / Reversal
Not applicable.

## Verification
View.

## Related Reports
Not applicable.

## Related User Manual
09-labor.md

## Screenshot / Visual QA Placeholder
SOP-LAB-010: Reject Movement.


# SOP-LAB-011 — Delete Draft Monthly Movement

## Purpose
Remove draft.

## When to Use
Error.

## Required Permission(s)
`labor.monthly-movements.delete`

## Preconditions
Draft.

## Input / Required Data
Confirm.

## Procedure
1. Movements.
2. Delete.

## System Result
Removed.

## Accounting Effect
Not applicable.

## Inventory Effect
Not applicable.

## Treasury Effect
Not applicable.

## Party Ledger Effect
Not applicable.

## Status Changes
Not applicable.

## Validation / Blocking Conditions
Must be draft.

## Cancellation / Reversal
Not applicable.

## Verification
Removed.

## Related Reports
Not applicable.

## Related User Manual
09-labor.md

## Screenshot / Visual QA Placeholder
SOP-LAB-011: Delete Movement.


# SOP-LAB-012 — Update Wage Profile

## Purpose
Change salary.

## When to Use
Raise.

## Required Permission(s)
`labor.workers.edit`

## Preconditions
Worker.

## Input / Required Data
Salary.

## Procedure
1. Workers.
2. Edit Profile.
3. Save.

## System Result
Updated.

## Accounting Effect
Used in next payroll.

## Inventory Effect
Not applicable.

## Treasury Effect
Not applicable.

## Party Ledger Effect
Not applicable.

## Status Changes
Not applicable.

## Validation / Blocking Conditions
None.

## Cancellation / Reversal
Not applicable.

## Verification
View.

## Related Reports
Not applicable.

## Related User Manual
09-labor.md

## Screenshot / Visual QA Placeholder
SOP-LAB-012: Wage Profile.


# SOP-LAB-013 — Import Workers

## Purpose
Bulk import worker profiles, wage configurations, and contact details from Excel.

## When to Use
Bulk data operations, initial setup, or operational data reporting.

## Required Permission(s)
`labor.workers.create`

## Preconditions
User has required role permissions.

## Input / Required Data
Standard Excel template (.xlsx) with required headers.

## Procedure
1. Navigate to Workers list (/labor/workers).
2. Click "Import" in the ExcelActions toolbar.
3. Download worker import template (workers-import-template.xlsx).
4. Fill national ID, name, code, job title, wage type (Monthly/Daily/Piecework), and rate.
5. Upload file into Worker Import Wizard.
6. System checks for duplicate national IDs/codes and validates wage schemas.
7. Review Preview validation table and click "Commit".

## System Result
Worker records registered and wage profiles established.

## Accounting Effect
Not applicable.

## Inventory Effect
Not applicable.

## Treasury Effect
Not applicable.

## Party Ledger Effect
Not applicable.

## Status Changes
Workers created in Active status.

## Validation / Blocking Conditions
Invalid file format, missing required columns, or validation errors in preview table.

## Cancellation / Reversal
Import cannot be reversed en masse automatically; imported records must be deactivated or corrected individually.

## Verification
Inspect list page to confirm newly imported records appear and export file matches displayed rows.

## Related Reports
Not applicable.

## Related User Manual
Excel Import/Export documentation in module user manual.

## Screenshot / Visual QA Placeholder
SOP-LAB-013: Workers Import Dialog / Preview Validation




# SOP-LAB-014 — Export Workers

## Purpose
Export worker roster and wage profile summaries to Excel.

## When to Use
Bulk data operations, initial setup, or operational data reporting.

## Required Permission(s)
`labor.workers.view`

## Preconditions
User has required role permissions.

## Input / Required Data
Standard Excel template (.xlsx) with required headers.

## Procedure
1. Navigate to Workers list (/labor/workers).
2. Filter by status, department, or job title.
3. Click "Export" in the ExcelActions toolbar.
4. Download workers-export.xlsx.

## System Result
Excel workbook downloaded with worker roster.

## Accounting Effect
Not applicable.

## Inventory Effect
Not applicable.

## Treasury Effect
Not applicable.

## Party Ledger Effect
Not applicable.

## Status Changes
No status change.

## Validation / Blocking Conditions
Invalid file format, missing required columns, or validation errors in preview table.

## Cancellation / Reversal
Import cannot be reversed en masse automatically; imported records must be deactivated or corrected individually.

## Verification
Inspect list page to confirm newly imported records appear and export file matches displayed rows.

## Related Reports
Not applicable.

## Related User Manual
Excel Import/Export documentation in module user manual.

## Screenshot / Visual QA Placeholder
SOP-LAB-014: Workers Export Download




# SOP-LAB-015 — Review Worker Salary Report

## Purpose
Check salaries.

## When to Use
Reporting.

## Required Permission(s)
`labor.workers.view`

## Preconditions
None.

## Input / Required Data
None.

## Procedure
1. Reports.
2. Worker Salary.
3. View.

## System Result
Report.

## Accounting Effect
Not applicable.

## Inventory Effect
Not applicable.

## Treasury Effect
Not applicable.

## Party Ledger Effect
Not applicable.

## Status Changes
Not applicable.

## Validation / Blocking Conditions
None.

## Cancellation / Reversal
Not applicable.

## Verification
View.

## Related Reports
Worker Salary Report.

## Related User Manual
09-labor.md

## Screenshot / Visual QA Placeholder
SOP-LAB-015: Salary Report.


# SOP-PAY-001 — Create Payroll Period

## Purpose
Define period.

## When to Use
Month end.

## Required Permission(s)
`payroll.periods.create`

## Preconditions
None.

## Input / Required Data
Dates.

## Procedure
1. Payroll.
2. Create Period.
3. Save.

## System Result
Period created.

## Accounting Effect
Not applicable.

## Inventory Effect
Not applicable.

## Treasury Effect
Not applicable.

## Party Ledger Effect
Not applicable.

## Status Changes
Draft.

## Validation / Blocking Conditions
None.

## Cancellation / Reversal
Delete.

## Verification
View.

## Related Reports
Not applicable.

## Related User Manual
10-payroll.md

## Screenshot / Visual QA Placeholder
SOP-PAY-001: Period.


# SOP-PAY-002 — Calculate Payroll

## Purpose
Generate payslips.

## When to Use
Month end.

## Required Permission(s)
`payroll.periods.calculate`

## Preconditions
Period exists.

## Input / Required Data
Confirm.

## Procedure
1. Period.
2. Calculate.

## System Result
Calculated.

## Accounting Effect
Not applicable.

## Inventory Effect
Not applicable.

## Treasury Effect
Not applicable.

## Party Ledger Effect
Not applicable.

## Status Changes
Draft -> Calculated.

## Validation / Blocking Conditions
None.

## Cancellation / Reversal
Recalculate.

## Verification
View.

## Related Reports
Not applicable.

## Related User Manual
10-payroll.md

## Screenshot / Visual QA Placeholder
SOP-PAY-002: Calculate.


# SOP-PAY-003 — Recalculate Payroll

## Purpose
Regenerate payslips.

## When to Use
Changes made.

## Required Permission(s)
`payroll.periods.calculate`

## Preconditions
Calculated period.

## Input / Required Data
Confirm.

## Procedure
1. Period.
2. Recalculate.

## System Result
Recalculated.

## Accounting Effect
Not applicable.

## Inventory Effect
Not applicable.

## Treasury Effect
Not applicable.

## Party Ledger Effect
Not applicable.

## Status Changes
Remains Calculated.

## Validation / Blocking Conditions
None.

## Cancellation / Reversal
Not applicable.

## Verification
View.

## Related Reports
Not applicable.

## Related User Manual
10-payroll.md

## Screenshot / Visual QA Placeholder
SOP-PAY-003: Recalculate.


# SOP-PAY-004 — Review Payroll Statements

## Purpose
Check slips.

## When to Use
Before approval.

## Required Permission(s)
`payroll.periods.view`

## Preconditions
Calculated period.

## Input / Required Data
None.

## Procedure
1. Period.
2. View Slips.

## System Result
Displayed.

## Accounting Effect
Not applicable.

## Inventory Effect
Not applicable.

## Treasury Effect
Not applicable.

## Party Ledger Effect
Not applicable.

## Status Changes
Not applicable.

## Validation / Blocking Conditions
None.

## Cancellation / Reversal
Not applicable.

## Verification
View.

## Related Reports
Not applicable.

## Related User Manual
10-payroll.md

## Screenshot / Visual QA Placeholder
SOP-PAY-004: Statements.


# SOP-PAY-005 — Approve Payroll

> [!CAUTION]
> HIGH IMPACT PROCEDURE

## Purpose
Lock calculation.

## When to Use
Verified.

## Required Permission(s)
`payroll.periods.approve`

## Preconditions
Calculated period.

## Input / Required Data
Confirm.

## Procedure
1. Period.
2. Approve.

## System Result
Approved.

## Accounting Effect
Not applicable.

## Inventory Effect
Not applicable.

## Treasury Effect
Not applicable.

## Party Ledger Effect
Not applicable.

## Status Changes
Calculated -> Approved.

## Validation / Blocking Conditions
None.

## Cancellation / Reversal
Reopen.

## Verification
View.

## Related Reports
Not applicable.

## Related User Manual
10-payroll.md

## Screenshot / Visual QA Placeholder
SOP-PAY-005: Approve.


# SOP-PAY-006 — Reopen Payroll

## Purpose
Unlock calculation.

## When to Use
Error.

## Required Permission(s)
`payroll.periods.reopen` (Defined in source but currently missing from staging permission rows.)

## Preconditions
Approved period.

## Input / Required Data
Confirm.

## Procedure
1. Period.
2. Reopen.

## System Result
Reopened.

## Accounting Effect
Not applicable.

## Inventory Effect
Not applicable.

## Treasury Effect
Not applicable.

## Party Ledger Effect
Not applicable.

## Status Changes
Approved -> Calculated.

## Validation / Blocking Conditions
Not paid.

## Cancellation / Reversal
Approve.

## Verification
View.

## Related Reports
Not applicable.

## Related User Manual
10-payroll.md

## Screenshot / Visual QA Placeholder
SOP-PAY-006: Reopen.


# SOP-PAY-007 — Pay All Workers

> [!CAUTION]
> HIGH IMPACT PROCEDURE

## Purpose
Issue payment.

## When to Use
Salary day.

## Required Permission(s)
`payroll.periods.pay`

## Preconditions
Approved period.

## Input / Required Data
Treasury Account.

## Procedure
1. Period.
2. Pay All.
3. Post.

## System Result
Paid.

## Accounting Effect
Debit Payroll Expense, Credit Treasury.

## Inventory Effect
Not applicable.

## Treasury Effect
Decreases.

## Party Ledger Effect
Not applicable.

## Status Changes
Approved -> Paid.

## Validation / Blocking Conditions
Sufficient Treasury balance.

## Cancellation / Reversal
Reverse.

## Verification
Ledger.

## Related Reports
Receipts & Payments.

## Related User Manual
10-payroll.md

## Screenshot / Visual QA Placeholder
SOP-PAY-007: Pay All.


# SOP-PAY-008 — Pay Selected Workers

## Purpose
Issue batch payment.

## When to Use
Staggered pay.

## Required Permission(s)
`payroll.periods.pay`

## Preconditions
Approved period.

## Input / Required Data
Treasury Account.

## Procedure
1. Period.
2. Select Workers.
3. Pay.
4. Post.

## System Result
Batch Paid.

## Accounting Effect
Debit Payroll Expense, Credit Treasury.

## Inventory Effect
Not applicable.

## Treasury Effect
Decreases.

## Party Ledger Effect
Not applicable.

## Status Changes
Remains Approved until all paid.

## Validation / Blocking Conditions
Sufficient Treasury balance. Full NetWage per worker.

## Cancellation / Reversal
Reverse.

## Verification
Ledger.

## Related Reports
Receipts & Payments.

## Related User Manual
10-payroll.md

## Screenshot / Visual QA Placeholder
SOP-PAY-008: Pay Selected.


# SOP-PAY-009 — Reverse Payroll Payment

> [!CAUTION]
> HIGH IMPACT PROCEDURE

## Purpose
Cancel payment.

## When to Use
Error.

## Required Permission(s)
`payroll.periods.pay`

## Preconditions
Paid batch.

## Input / Required Data
Confirm.

## Procedure
1. Period.
2. Reverse Batch.

## System Result
Reversed.

## Accounting Effect
Counter Journal.

## Inventory Effect
Not applicable.

## Treasury Effect
Increases.

## Party Ledger Effect
Not applicable.

## Status Changes
Paid -> Approved.

## Validation / Blocking Conditions
None.

## Cancellation / Reversal
Not applicable.

## Verification
Ledger.

## Related Reports
Not applicable.

## Related User Manual
10-payroll.md

## Screenshot / Visual QA Placeholder
SOP-PAY-009: Reverse.


# SOP-PAY-010 — Delete Payroll Period

## Purpose
Remove period.

## When to Use
Error.

## Required Permission(s)
`payroll.periods.delete`

## Preconditions
Draft/Calculated.

## Input / Required Data
Confirm.

## Procedure
1. Period.
2. Delete.

## System Result
Removed.

## Accounting Effect
Not applicable.

## Inventory Effect
Not applicable.

## Treasury Effect
Not applicable.

## Party Ledger Effect
Not applicable.

## Status Changes
Not applicable.

## Validation / Blocking Conditions
Must not be approved.

## Cancellation / Reversal
Not applicable.

## Verification
Removed.

## Related Reports
Not applicable.

## Related User Manual
10-payroll.md

## Screenshot / Visual QA Placeholder
SOP-PAY-010: Delete.


# SOP-MFG-001 — Create BOM

## Purpose
Bill of materials.

## When to Use
New product.

## Required Permission(s)
`manufacturing.bom.create`

## Preconditions
Items exist.

## Input / Required Data
Lines.

## Procedure
1. Manufacturing.
2. BOM.
3. Create.

## System Result
Created.

## Accounting Effect
Not applicable.

## Inventory Effect
Not applicable.

## Treasury Effect
Not applicable.

## Party Ledger Effect
Not applicable.

## Status Changes
Not applicable.

## Validation / Blocking Conditions
None.

## Cancellation / Reversal
Not applicable.

## Verification
View.

## Related Reports
Not applicable.

## Related User Manual
11-manufacturing.md

## Screenshot / Visual QA Placeholder
SOP-MFG-001: BOM.


# SOP-MFG-002 — Edit BOM

## Purpose
Update BOM.

## When to Use
Recipe change.

## Required Permission(s)
`manufacturing.bom.update`

## Preconditions
BOM exists.

## Input / Required Data
Lines.

## Procedure
1. BOM.
2. Edit.
3. Save.

## System Result
Updated.

## Accounting Effect
Not applicable.

## Inventory Effect
Not applicable.

## Treasury Effect
Not applicable.

## Party Ledger Effect
Not applicable.

## Status Changes
Not applicable.

## Validation / Blocking Conditions
None.

## Cancellation / Reversal
Not applicable.

## Verification
View.

## Related Reports
Not applicable.

## Related User Manual
11-manufacturing.md

## Screenshot / Visual QA Placeholder
SOP-MFG-002: Edit BOM.


# SOP-MFG-003 — Delete BOM

## Purpose
Remove BOM.

## When to Use
Obsolete.

## Required Permission(s)
`manufacturing.bom.delete`

## Preconditions
No orders.

## Input / Required Data
Confirm.

## Procedure
1. BOM.
2. Delete.

## System Result
Removed.

## Accounting Effect
Not applicable.

## Inventory Effect
Not applicable.

## Treasury Effect
Not applicable.

## Party Ledger Effect
Not applicable.

## Status Changes
Not applicable.

## Validation / Blocking Conditions
No linked orders.

## Cancellation / Reversal
Not applicable.

## Verification
Removed.

## Related Reports
Not applicable.

## Related User Manual
11-manufacturing.md

## Screenshot / Visual QA Placeholder
SOP-MFG-003: Delete BOM.


# SOP-MFG-004 — Create Work Center

## Purpose
Add center.

## When to Use
Setup.

## Required Permission(s)
`manufacturing.workcenters.create`

## Preconditions
None.

## Input / Required Data
Details.

## Procedure
1. Work Centers.
2. Create.
3. Save.

## System Result
Created.

## Accounting Effect
Not applicable.

## Inventory Effect
Not applicable.

## Treasury Effect
Not applicable.

## Party Ledger Effect
Not applicable.

## Status Changes
Not applicable.

## Validation / Blocking Conditions
None.

## Cancellation / Reversal
Not applicable.

## Verification
View.

## Related Reports
Not applicable.

## Related User Manual
11-manufacturing.md

## Screenshot / Visual QA Placeholder
SOP-MFG-004: Work Center.


# SOP-MFG-005 — Edit Work Center

## Purpose
Update center.

## When to Use
Setup.

## Required Permission(s)
`manufacturing.workcenters.update`

## Preconditions
Center exists.

## Input / Required Data
Details.

## Procedure
1. Work Centers.
2. Edit.
3. Save.

## System Result
Updated.

## Accounting Effect
Not applicable.

## Inventory Effect
Not applicable.

## Treasury Effect
Not applicable.

## Party Ledger Effect
Not applicable.

## Status Changes
Not applicable.

## Validation / Blocking Conditions
None.

## Cancellation / Reversal
Not applicable.

## Verification
View.

## Related Reports
Not applicable.

## Related User Manual
11-manufacturing.md

## Screenshot / Visual QA Placeholder
SOP-MFG-005: Edit Center.


# SOP-MFG-006 — Create Production Order

## Purpose
Draft order.

## When to Use
Need stock.

## Required Permission(s)
`manufacturing.orders.create`

## Preconditions
BOM exists.

## Input / Required Data
Qty.

## Procedure
1. Orders.
2. Create.
3. Save.

## System Result
Draft.

## Accounting Effect
Not applicable.

## Inventory Effect
Not applicable.

## Treasury Effect
Not applicable.

## Party Ledger Effect
Not applicable.

## Status Changes
Draft.

## Validation / Blocking Conditions
None.

## Cancellation / Reversal
Delete.

## Verification
View.

## Related Reports
Not applicable.

## Related User Manual
11-manufacturing.md

## Screenshot / Visual QA Placeholder
SOP-MFG-006: Order.


# SOP-MFG-007 — Edit Draft Production Order

## Purpose
Update order.

## When to Use
Correction.

## Required Permission(s)
`manufacturing.orders.update`

## Preconditions
Draft order.

## Input / Required Data
Lines.

## Procedure
1. Orders.
2. Edit.
3. Save.

## System Result
Updated.

## Accounting Effect
Not applicable.

## Inventory Effect
Not applicable.

## Treasury Effect
Not applicable.

## Party Ledger Effect
Not applicable.

## Status Changes
Draft.

## Validation / Blocking Conditions
Must be draft.

## Cancellation / Reversal
Not applicable.

## Verification
View.

## Related Reports
Not applicable.

## Related User Manual
11-manufacturing.md

## Screenshot / Visual QA Placeholder
SOP-MFG-007: Edit Order.


# SOP-MFG-008 — Approve Production Order

## Purpose
Lock order.

## When to Use
Ready.

## Required Permission(s)
`manufacturing.orders.approve`

## Preconditions
Draft order.

## Input / Required Data
Confirm.

## Procedure
1. Orders.
2. Approve.

## System Result
Approved.

## Accounting Effect
Not applicable.

## Inventory Effect
Not applicable.

## Treasury Effect
Not applicable.

## Party Ledger Effect
Not applicable.

## Status Changes
Draft -> Approved.

## Validation / Blocking Conditions
None.

## Cancellation / Reversal
Cancel.

## Verification
View.

## Related Reports
Not applicable.

## Related User Manual
11-manufacturing.md

## Screenshot / Visual QA Placeholder
SOP-MFG-008: Approve Order.


# SOP-MFG-009 — Release Production Order

## Purpose
Start production.

## When to Use
Floor ready.

## Required Permission(s)
`manufacturing.orders.release`

## Preconditions
Approved order.

## Input / Required Data
Confirm.

## Procedure
1. Orders.
2. Release.

## System Result
Released.

## Accounting Effect
Not applicable.

## Inventory Effect
Not applicable.

## Treasury Effect
Not applicable.

## Party Ledger Effect
Not applicable.

## Status Changes
Approved -> Released.

## Validation / Blocking Conditions
None.

## Cancellation / Reversal
Cancel.

## Verification
View.

## Related Reports
Not applicable.

## Related User Manual
11-manufacturing.md

## Screenshot / Visual QA Placeholder
SOP-MFG-009: Release Order.


# SOP-MFG-010 — Issue Material

## Purpose
Consume stock.

## When to Use
Production.

## Required Permission(s)
`manufacturing.orders.update`

## Preconditions
Released order.

## Input / Required Data
Lines.

## Procedure
1. Order.
2. Issue Material.

## System Result
Issued.

## Accounting Effect
Journal Entry.

## Inventory Effect
Decreases.

## Treasury Effect
Not applicable.

## Party Ledger Effect
Not applicable.

## Status Changes
Not applicable.

## Validation / Blocking Conditions
Sufficient stock.

## Cancellation / Reversal
Reverse (Backend).

## Verification
View.

## Related Reports
Not applicable.

## Related User Manual
11-manufacturing.md

## Screenshot / Visual QA Placeholder
SOP-MFG-010: Issue.


# SOP-MFG-011 — Receive Finished Goods

## Purpose
Produce stock.

## When to Use
Production.

## Required Permission(s)
`manufacturing.orders.update`

## Preconditions
Released order.

## Input / Required Data
Lines.

## Procedure
1. Order.
2. Receive.

## System Result
Received.

## Accounting Effect
Journal Entry.

## Inventory Effect
Increases.

## Treasury Effect
Not applicable.

## Party Ledger Effect
Not applicable.

## Status Changes
Not applicable.

## Validation / Blocking Conditions
None.

## Cancellation / Reversal
Reverse (Backend).

## Verification
View.

## Related Reports
Not applicable.

## Related User Manual
11-manufacturing.md

## Screenshot / Visual QA Placeholder
SOP-MFG-011: Receive.


# SOP-MFG-012 — Complete Production Order

## Purpose
Mark done.

## When to Use
Finished.

## Required Permission(s)
`manufacturing.orders.update`

## Preconditions
Released order.

## Input / Required Data
Confirm.

## Procedure
1. Order.
2. Complete.

## System Result
Completed.

## Accounting Effect
Not applicable.

## Inventory Effect
Not applicable.

## Treasury Effect
Not applicable.

## Party Ledger Effect
Not applicable.

## Status Changes
Released -> Completed.

## Validation / Blocking Conditions
None.

## Cancellation / Reversal
Not applicable.

## Verification
View.

## Related Reports
Not applicable.

## Related User Manual
11-manufacturing.md

## Screenshot / Visual QA Placeholder
SOP-MFG-012: Complete Order.


# SOP-MFG-013 — Close Production Order

## Purpose
Finalize.

## When to Use
Audit done.

## Required Permission(s)
`manufacturing.orders.close`

## Preconditions
Completed order.

## Input / Required Data
Confirm.

## Procedure
1. Order.
2. Close.

## System Result
Closed.

## Accounting Effect
Not applicable.

## Inventory Effect
Not applicable.

## Treasury Effect
Not applicable.

## Party Ledger Effect
Not applicable.

## Status Changes
Completed -> Closed.

## Validation / Blocking Conditions
None.

## Cancellation / Reversal
Not applicable.

## Verification
View.

## Related Reports
Not applicable.

## Related User Manual
11-manufacturing.md

## Screenshot / Visual QA Placeholder
SOP-MFG-013: Close Order.


# SOP-MFG-014 — Cancel Production Order

> [!CAUTION]
> HIGH IMPACT PROCEDURE — ORDER CANCELLATION & AUTOMATED STOCK REVERSAL

## Purpose
Cancel an active production order and reverse all associated inventory movements (both material issues and finished receipts) back to inventory stock.

## When to Use
When an order was created in error, client cancelled production, or material defects require full order abort prior to closure.

## Required Permission(s)
`manufacturing.orders.cancel`

## Preconditions
- Order status is NOT `Closed` (closed orders are strictly terminal and cannot be cancelled).
- Order status is NOT `Cancelled` (already cancelled).
- Concurrency `rowVersion` match.
- Sufficient stock on hand for finished goods: reversing a finished receipt acts as a stock-out; if finished goods were already sold or transferred, cancellation will be blocked by inventory validation.

## Input / Required Data
- Production Order ID.
- Mandatory cancellation reason text (`reason`).
- Row version concurrency token.

## Procedure
1. Navigate to Production Orders list (/manufacturing/orders) and select the order.
2. Click "Cancel Order" action.
3. In the cancellation dialog, enter the mandatory reason for cancellation.
4. Confirm cancellation.
5. The backend handler (`CancelProductionOrderCommand`):
   a. Reverses all posted finished receipts (`ReverseMovementAsync` on each receipt movement).
   b. Marks each receipt as `Cancelled`.
   c. Reverses all posted material issues (`ReverseMovementAsync` on each issue movement), returning raw materials to inventory.
   d. Marks each issue as `Cancelled`.
   e. Resets `ProducedQuantity` to 0.
   f. Sets order status to `Cancelled`.
   g. Records audit log with previous status and reason.

## System Result
Order transitions to `Cancelled`. Raw materials are returned to stock; finished goods are deducted.

## Accounting Effect
Participates in standard downstream inventory reversal valuation. Does NOT create direct WIP GL journals.

## Inventory Effect
Material issues are reversed (+ stock for raw materials); finished receipts are reversed (- stock for finished goods).

## Treasury Effect
Not applicable.

## Party Ledger Effect
Not applicable.

## Status Changes
Allowed from `Draft`, `Approved`, `Released`, `InProgress`, or `Completed` -> transitions to `Cancelled`. Terminal status.

## Validation / Blocking Conditions
- Blocked if order status is `Closed`.
- Blocked if finished goods stock is insufficient to execute reversal movement.
- Blocked if concurrency conflict occurs.

## Cancellation / Reversal
Cancellation itself is terminal; cannot un-cancel. A new production order must be created if work resumes.

## Verification
Confirm order badge shows "Cancelled" and Inventory Movements report shows reversal entries for both issues and receipts.

## Related Reports
Inventory Movements Report, Inventory Stock Report.

## Related User Manual
11-manufacturing.md

## Screenshot / Visual QA Placeholder
SOP-MFG-014: Cancel Production Order Dialog & Reversal Confirmation


# SOP-MFG-015 — Customer-Owned Production

## Purpose
Produce for customer.

## When to Use
Tolling.

## Required Permission(s)
`manufacturing.orders.create`

## Preconditions
Customer stock.

## Input / Required Data
Order.

## Procedure
1. Order.
2. Set Customer Owner.

## System Result
Produced.

## Accounting Effect
No financial value.

## Inventory Effect
Customer Stock Moves.

## Treasury Effect
Not applicable.

## Party Ledger Effect
Not applicable.

## Status Changes
Standard.

## Validation / Blocking Conditions
None.

## Cancellation / Reversal
Cancel.

## Verification
View.

## Related Reports
Not applicable.

## Related User Manual
11-manufacturing.md

## Screenshot / Visual QA Placeholder
SOP-MFG-015: Customer Prod.


# SOP-RPT-001 — General Ledger

## Purpose
View GL.

## When to Use
Reporting.

## Required Permission(s)
`accounting.reports.view`

## Preconditions
None.

## Input / Required Data
Dates.

## Procedure
1. Reports.
2. General Ledger.

## System Result
Displayed.

## Accounting Effect
Not applicable.

## Inventory Effect
Not applicable.

## Treasury Effect
Not applicable.

## Party Ledger Effect
Not applicable.

## Status Changes
Not applicable.

## Validation / Blocking Conditions
None.

## Cancellation / Reversal
Not applicable.

## Verification
View.

## Related Reports
General Ledger.

## Related User Manual
01-reports-guide.md

## Screenshot / Visual QA Placeholder
SOP-RPT-001: GL.


# SOP-RPT-002 — Trial Balance

## Purpose
View balances.

## When to Use
Reporting.

## Required Permission(s)
`accounting.reports.view`

## Preconditions
None.

## Input / Required Data
Dates.

## Procedure
1. Reports.
2. Trial Balance.

## System Result
Displayed.

## Accounting Effect
Not applicable.

## Inventory Effect
Not applicable.

## Treasury Effect
Not applicable.

## Party Ledger Effect
Not applicable.

## Status Changes
Not applicable.

## Validation / Blocking Conditions
None.

## Cancellation / Reversal
Not applicable.

## Verification
View.

## Related Reports
Trial Balance.

## Related User Manual
01-reports-guide.md

## Screenshot / Visual QA Placeholder
SOP-RPT-002: Trial.


# SOP-RPT-003 — Income Statement

## Purpose
View P&L.

## When to Use
Reporting.

## Required Permission(s)
`accounting.reports.view`

## Preconditions
None.

## Input / Required Data
Dates.

## Procedure
1. Reports.
2. Income Statement.

## System Result
Displayed.

## Accounting Effect
Not applicable.

## Inventory Effect
Not applicable.

## Treasury Effect
Not applicable.

## Party Ledger Effect
Not applicable.

## Status Changes
Not applicable.

## Validation / Blocking Conditions
None.

## Cancellation / Reversal
Not applicable.

## Verification
View.

## Related Reports
Income Statement.

## Related User Manual
01-reports-guide.md

## Screenshot / Visual QA Placeholder
SOP-RPT-003: Income.


# SOP-RPT-004 — Balance Sheet

## Purpose
View assets/liabilities.

## When to Use
Reporting.

## Required Permission(s)
`accounting.reports.view`

## Preconditions
None.

## Input / Required Data
Dates.

## Procedure
1. Reports.
2. Balance Sheet.

## System Result
Displayed.

## Accounting Effect
Not applicable.

## Inventory Effect
Not applicable.

## Treasury Effect
Not applicable.

## Party Ledger Effect
Not applicable.

## Status Changes
Not applicable.

## Validation / Blocking Conditions
None.

## Cancellation / Reversal
Not applicable.

## Verification
View.

## Related Reports
Balance Sheet.

## Related User Manual
01-reports-guide.md

## Screenshot / Visual QA Placeholder
SOP-RPT-004: Balance.


# SOP-RPT-005 — Cash Flow

## Purpose
View cash flow.

## When to Use
Reporting.

## Required Permission(s)
`accounting.reports.view`

## Preconditions
None.

## Input / Required Data
Dates.

## Procedure
1. Reports.
2. Cash Flow.

## System Result
Displayed.

## Accounting Effect
Not applicable.

## Inventory Effect
Not applicable.

## Treasury Effect
Not applicable.

## Party Ledger Effect
Not applicable.

## Status Changes
Not applicable.

## Validation / Blocking Conditions
None.

## Cancellation / Reversal
Not applicable.

## Verification
View.

## Related Reports
Cash Flow.

## Related User Manual
01-reports-guide.md

## Screenshot / Visual QA Placeholder
SOP-RPT-005: Cash Flow.


# SOP-RPT-006 — Treasury GL Reconciliation

## Purpose
Check GL vs Treasury.

## When to Use
Reporting.

## Required Permission(s)
`accounting.reports.view`

## Preconditions
None.

## Input / Required Data
Dates.

## Procedure
1. Reports.
2. Treasury GL.

## System Result
Displayed.

## Accounting Effect
Not applicable.

## Inventory Effect
Not applicable.

## Treasury Effect
Not applicable.

## Party Ledger Effect
Not applicable.

## Status Changes
Not applicable.

## Validation / Blocking Conditions
None.

## Cancellation / Reversal
Not applicable.

## Verification
View.

## Related Reports
Treasury GL Reconciliation.

## Related User Manual
01-reports-guide.md

## Screenshot / Visual QA Placeholder
SOP-RPT-006: Treasury Recon.


# SOP-RPT-007 — Inventory GL Reconciliation

## Purpose
Check GL vs Inventory.

## When to Use
Reporting.

## Required Permission(s)
`accounting.reports.view`

## Preconditions
None.

## Input / Required Data
Dates.

## Procedure
1. Reports.
2. Inventory GL.

## System Result
Displayed.

## Accounting Effect
Not applicable.

## Inventory Effect
Not applicable.

## Treasury Effect
Not applicable.

## Party Ledger Effect
Not applicable.

## Status Changes
Not applicable.

## Validation / Blocking Conditions
None.

## Cancellation / Reversal
Not applicable.

## Verification
View.

## Related Reports
Inventory GL Reconciliation.

## Related User Manual
01-reports-guide.md

## Screenshot / Visual QA Placeholder
SOP-RPT-007: Inv Recon.


# SOP-RPT-008 — Customer Aging

## Purpose
Check AR.

## When to Use
Reporting.

## Required Permission(s)
`accounting.reports.view`

## Preconditions
None.

## Input / Required Data
Dates.

## Procedure
1. Reports.
2. Customer Aging.

## System Result
Displayed.

## Accounting Effect
Not applicable.

## Inventory Effect
Not applicable.

## Treasury Effect
Not applicable.

## Party Ledger Effect
Not applicable.

## Status Changes
Not applicable.

## Validation / Blocking Conditions
None.

## Cancellation / Reversal
Not applicable.

## Verification
View.

## Related Reports
Customer Aging.

## Related User Manual
01-reports-guide.md

## Screenshot / Visual QA Placeholder
SOP-RPT-008: AR.


# SOP-RPT-009 — Supplier Aging

## Purpose
Check AP.

## When to Use
Reporting.

## Required Permission(s)
`accounting.reports.view`

## Preconditions
None.

## Input / Required Data
Dates.

## Procedure
1. Reports.
2. Supplier Aging.

## System Result
Displayed.

## Accounting Effect
Not applicable.

## Inventory Effect
Not applicable.

## Treasury Effect
Not applicable.

## Party Ledger Effect
Not applicable.

## Status Changes
Not applicable.

## Validation / Blocking Conditions
None.

## Cancellation / Reversal
Not applicable.

## Verification
View.

## Related Reports
Supplier Aging.

## Related User Manual
01-reports-guide.md

## Screenshot / Visual QA Placeholder
SOP-RPT-009: AP.


# SOP-RPT-010 — Purchase Invoices Report

## Purpose
List purchases.

## When to Use
Reporting.

## Required Permission(s)
`purchases.invoices.view, accounting.reports.view`

## Preconditions
None.

## Input / Required Data
Dates.

## Procedure
1. Reports.
2. Purchase Invoices.

## System Result
Displayed.

## Accounting Effect
Not applicable.

## Inventory Effect
Not applicable.

## Treasury Effect
Not applicable.

## Party Ledger Effect
Not applicable.

## Status Changes
Not applicable.

## Validation / Blocking Conditions
None.

## Cancellation / Reversal
Not applicable.

## Verification
View.

## Related Reports
Purchase Invoices Report.

## Related User Manual
01-reports-guide.md

## Screenshot / Visual QA Placeholder
SOP-RPT-010: Purchases.


# SOP-RPT-011 — Receipts & Payments

## Purpose
List cash.

## When to Use
Reporting.

## Required Permission(s)
`treasury.view, accounting.reports.view`

## Preconditions
None.

## Input / Required Data
Dates.

## Procedure
1. Reports.
2. Receipts & Payments.

## System Result
Displayed.

## Accounting Effect
Not applicable.

## Inventory Effect
Not applicable.

## Treasury Effect
Not applicable.

## Party Ledger Effect
Not applicable.

## Status Changes
Not applicable.

## Validation / Blocking Conditions
None.

## Cancellation / Reversal
Not applicable.

## Verification
View.

## Related Reports
Receipts & Payments.

## Related User Manual
01-reports-guide.md

## Screenshot / Visual QA Placeholder
SOP-RPT-011: Receipts.


# SOP-RPT-012 — Sales Customer Item Analysis

## Purpose
Analyze sales.

## When to Use
Reporting.

## Required Permission(s)
`sales.invoices.view, accounting.reports.view`

## Preconditions
None.

## Input / Required Data
Dates.

## Procedure
1. Reports.
2. Sales Customer Item Analysis.

## System Result
Displayed.

## Accounting Effect
Not applicable.

## Inventory Effect
Not applicable.

## Treasury Effect
Not applicable.

## Party Ledger Effect
Not applicable.

## Status Changes
Not applicable.

## Validation / Blocking Conditions
None.

## Cancellation / Reversal
Not applicable.

## Verification
View.

## Related Reports
Sales Customer Item Analysis.

## Related User Manual
01-reports-guide.md

## Screenshot / Visual QA Placeholder
SOP-RPT-012: Sales Analysis.


# SOP-RPT-013 — Sales Profitability

## Purpose
Check profit.

## When to Use
Reporting.

## Required Permission(s)
`sales.invoices.view, accounting.reports.view`

## Preconditions
None.

## Input / Required Data
Dates.

## Procedure
1. Reports.
2. Sales Profitability.

## System Result
Displayed.

## Accounting Effect
Not applicable.

## Inventory Effect
Not applicable.

## Treasury Effect
Not applicable.

## Party Ledger Effect
Not applicable.

## Status Changes
Not applicable.

## Validation / Blocking Conditions
None.

## Cancellation / Reversal
Not applicable.

## Verification
View.

## Related Reports
Sales Profitability.

## Related User Manual
01-reports-guide.md

## Screenshot / Visual QA Placeholder
SOP-RPT-013: Profit.


# SOP-RPT-014 — Sales Invoices Report

## Purpose
List sales.

## When to Use
Reporting.

## Required Permission(s)
`sales.invoices.view`

## Preconditions
None.

## Input / Required Data
Dates.

## Procedure
1. Reports.
2. Sales Invoices.

## System Result
Displayed.

## Accounting Effect
Not applicable.

## Inventory Effect
Not applicable.

## Treasury Effect
Not applicable.

## Party Ledger Effect
Not applicable.

## Status Changes
Not applicable.

## Validation / Blocking Conditions
None.

## Cancellation / Reversal
Not applicable.

## Verification
View.

## Related Reports
Sales Invoices Report.

## Related User Manual
01-reports-guide.md

## Screenshot / Visual QA Placeholder
SOP-RPT-014: Sales.


# SOP-RPT-015 — Worker Salary Report

## Purpose
List salaries.

## When to Use
Reporting.

## Required Permission(s)
`labor.workers.view`

## Preconditions
None.

## Input / Required Data
Dates.

## Procedure
1. Reports.
2. Worker Salary.

## System Result
Displayed.

## Accounting Effect
Not applicable.

## Inventory Effect
Not applicable.

## Treasury Effect
Not applicable.

## Party Ledger Effect
Not applicable.

## Status Changes
Not applicable.

## Validation / Blocking Conditions
None.

## Cancellation / Reversal
Not applicable.

## Verification
View.

## Related Reports
Worker Salary Report.

## Related User Manual
01-reports-guide.md

## Screenshot / Visual QA Placeholder
SOP-RPT-015: Salaries.


# SOP-XMOD-001 — End-to-End Credit Customer Sale Flow

> [!NOTE]
> HIGH IMPACT END-TO-END CROSS-MODULE PROCEDURE

## Purpose
Execute a complete customer sales lifecycle on credit: customer verification, credit invoice posting, inventory deduction, subledger debit, GL posting, and subsequent cash collection.

## Cross-Module Chain
Party Ledger → Sales Invoice → Inventory (Stock-Out & Weighted Average Costing) → Accounting (AR, Revenue, COGS, Inventory GL) → Treasury (Customer Receipt)

## When to Use
Standard business-to-business or wholesale credit sales operations.

## Required Permission(s)
`sales.invoices.create`, `sales.invoices.post`, `inventory.movements.stock-out`, `treasury.transactions.create`

## Preconditions
- Customer exists in active status with established credit limit.
- Inventory items are active and have sufficient available stock in the selected warehouse.
- Accounting period is open and automated posting GL mappings are configured.

## Step-by-Step Procedure
1. **Party Check**: Confirm customer account status and available credit limit.
2. **Create Sales Invoice**: Navigate to Sales > Invoices > New. Select Customer, Warehouse, and line items. Specify payment term as "Credit".
3. **Post Invoice**: Click "Post". The system atomically:
   - Deducts inventory quantities from the warehouse.
   - Computes cost of goods sold based on current weighted average cost.
   - Debits Customer Subledger (increasing receivable).
   - Generates and posts Journal Entry: Dr Accounts Receivable, Cr Sales Revenue; Dr COGS, Cr Inventory Asset.
   - Sets invoice status to `Posted` (PaymentStatus: `Unpaid`).
4. **Subsequent Payment Collection**: When customer settles:
   - Navigate to Treasury > Customer Receipt (or Sales Invoice > Settle).
   - Select treasury account (Cash box / Bank), Customer, and allocate to the posted invoice.
   - Posting receipt: Dr Treasury Account, Cr Accounts Receivable / Customer Subledger.
   - Invoice payment status transitions to `Paid` (or `PartiallyPaid`).

## System Result
Full cycle complete: Stock relieved, revenue recognized, customer balance cleared, and cash deposited in treasury.

## Accounting Effect
- At Invoice Post: Dr Accounts Receivable (Total), Cr Sales Revenue (Net), Dr Cost of Goods Sold, Cr Inventory Asset.
- At Treasury Receipt: Dr Treasury Asset Account, Cr Accounts Receivable.

## Inventory Effect
Relieves stock quantity immediately upon invoice posting via `SalesIssue` movement.

## Treasury Effect
Increases cash/bank balance upon customer payment receipt posting.

## Party Ledger Effect
Customer debit on invoice post; customer credit on treasury receipt post.

## Status Changes
Invoice: `Draft` → `Posted` → `Paid`.

## Validation / Blocking Conditions
- Insufficient stock blocks invoice posting.
- Inactive customer or closed accounting period blocks posting.

## Cancellation / Reversal
Cancel Sales Invoice creates opposite reversal movement (+ stock) and reversal journal. Cancelling customer receipt reverses treasury inflow.

## Verification
Check Customer Statement, General Ledger, Inventory Movements, and Sales Invoices Report.

## Related Reports
Sales Invoices Report, Customer Aging, General Ledger, Inventory GL Reconciliation.

## Related User Manual
02-parties.md, 03-inventory.md, 04-treasury.md, 07-sales.md, 08-accounting.md

## Screenshot / Visual QA Placeholder
SOP-XMOD-001: Credit Customer Sale End-to-End Lifecycle


# SOP-XMOD-002 — End-to-End Immediate-Payment Customer Sale Flow

## Purpose
Execute a point-of-sale or immediate-cash customer sale where invoice issuance and treasury collection occur simultaneously.

## Cross-Module Chain
Sales Invoice → Inventory (Stock-Out) → Treasury (Direct Cash/Bank Inflow) → Accounting (Direct Cash, Revenue, COGS, Inventory GL) → Party Ledger (Zero Net Impact)

## When to Use
Counter sales, cash-and-carry retail transactions, or immediate bank transfer sales.

## Required Permission(s)
`sales.invoices.create`, `sales.invoices.post`, `treasury.transactions.create`

## Preconditions
- Items in stock.
- Active Treasury account (Cash/Bank) selected as payment destination.
- Open accounting period.

## Step-by-Step Procedure
1. Navigate to Sales > Invoices > New.
2. Select Customer (or standard Cash Customer party).
3. Add sale items, quantities, and agreed prices.
4. Set Payment Method to "Cash" or "Bank" and select the destination Treasury Account.
5. Click "Post".
6. The system atomically:
   - Issues stock out from inventory.
   - Records treasury inflow into the specified Treasury Account.
   - Creates balanced GL posting: Dr Treasury Asset Account, Cr Sales Revenue; Dr COGS, Cr Inventory Asset.
   - Sets invoice status to `Posted` and payment status to `Paid`.
   - Records equal debit and credit in party ledger (zero net balance change).

## System Result
Instant stock deduction and verified treasury cash inflow in a single atomic transaction.

## Accounting Effect
Dr Treasury linked asset account, Cr Sales Revenue; Dr Cost of Goods Sold, Cr Inventory Asset.

## Inventory Effect
Immediate stock decrease.

## Treasury Effect
Immediate increase in destination cash box or bank account.

## Party Ledger Effect
Net zero balance change (immediate settlement).

## Status Changes
Invoice: `Draft` → `Posted` (PaymentStatus: `Paid`).

## Validation / Blocking Conditions
- Insufficient stock blocks posting.
- Inactive treasury account blocks posting.

## Cancellation / Reversal
Cancelling immediate sale reverses treasury inflow, returns goods to inventory, and creates reversal journal.

## Verification
Verify cash box balance, inventory item balance, and sales report.

## Related Reports
Sales Invoices Report, Receipts & Payments Report, Cash Flow.

## Related User Manual
04-treasury.md, 07-sales.md, 08-accounting.md

## Screenshot / Visual QA Placeholder
SOP-XMOD-002: Immediate Payment Sale Flow


# SOP-XMOD-003 — End-to-End Credit Supplier Purchase Flow

> [!NOTE]
> HIGH IMPACT END-TO-END CROSS-MODULE PROCEDURE

## Purpose
Execute a complete supplier procurement lifecycle on credit: purchase order/invoice recording, inventory receipt with weighted-average cost updating, accounts payable posting, and subsequent treasury disbursement.

## Cross-Module Chain
Supplier Party → Purchase Invoice → Inventory (Stock-In & Cost Recalculation) → Supplier Subledger → Accounting (Inventory Asset / Expense GL, AP) → Treasury (Supplier Payment)

## When to Use
Standard commercial vendor purchases and raw material procurement on credit terms.

## Required Permission(s)
`purchases.invoices.create`, `purchases.invoices.post`, `treasury.transactions.create`

## Preconditions
- Supplier party exists and active.
- Receiving warehouse active.
- Open accounting period.

## Step-by-Step Procedure
1. **Invoice Entry**: Navigate to Purchases > Invoices > New. Select Supplier, receiving Warehouse, items, quantities, unit purchase prices, and payment terms (Credit).
2. **Post Purchase Invoice**: Click "Post". The system atomically:
   - Increases inventory on-hand quantity in the warehouse.
   - Recalculates item weighted average cost (WAC).
   - Credits Supplier Subledger (increasing liability).
   - Generates and posts Journal Entry: Dr Inventory Asset (or Expense), Cr Accounts Payable.
   - Sets invoice status to `Posted` (PaymentStatus: `Unpaid`).
3. **Subsequent Payment Disbursement**: When payment is due:
   - Navigate to Treasury > Supplier Payment.
   - Select payment source (Cash Box / Bank), Supplier, and allocate against the purchase invoice.
   - Posting payment: Dr Accounts Payable / Supplier Subledger, Cr Treasury Account.
   - Invoice payment status transitions to `Paid`.

## System Result
Goods received in stock at updated weighted average cost; vendor payable settled through treasury disbursement.

## Accounting Effect
- At Invoice Post: Dr Inventory Asset (or Purchases Expense), Cr Accounts Payable.
- At Treasury Payment: Dr Accounts Payable, Cr Treasury linked asset account.

## Inventory Effect
Stock quantity increases; weighted average cost recalculated: `NewWAC = (OldValue + NewValue) / (OldQty + NewQty)`.

## Treasury Effect
Decreases cash/bank balance upon supplier payment posting.

## Party Ledger Effect
Supplier credit on invoice post; supplier debit on treasury payment post.

## Status Changes
Invoice: `Draft` → `Posted` → `Paid`.

## Validation / Blocking Conditions
- Negative purchase prices forbidden.
- Closed accounting period blocks posting.

## Cancellation / Reversal
Cancelling purchase invoice reverses stock increase (requires sufficient available stock) and reverses payable journal. Cancelling payment restores supplier payable.

## Verification
Check Supplier Statement, Inventory Stock Report, and Supplier Aging Report.

## Related Reports
Purchase Invoices Report, Supplier Aging, Inventory GL Reconciliation, General Ledger.

## Related User Manual
02-parties.md, 03-inventory.md, 04-treasury.md, 06-purchases.md, 08-accounting.md

## Screenshot / Visual QA Placeholder
SOP-XMOD-003: Credit Supplier Purchase Flow


# SOP-XMOD-004 — End-to-End Operational Expense Payment Flow

## Purpose
Record, classify, and disburse operational business expenses through treasury accounts with immediate automated GL journalization.

## Cross-Module Chain
Expense Entry → Category GL Mapping → Treasury Outflow → Accounting GL Posting

## When to Use
Utilities, rent, maintenance, office supplies, freight, or administrative expenses.

## Required Permission(s)
`expenses.create`, `expenses.post`, `treasury.transactions.create`

## Preconditions
- Expense Category configured with valid linked Expense GL Account.
- Treasury Account has sufficient balance (or allows negative balance).
- Open accounting period.

## Step-by-Step Procedure
1. Navigate to Expenses > New Expense.
2. Select Expense Category, payment Date, Amount, and payment Treasury Account (Cash/Bank).
3. Enter payee name, reference/receipt number, and operational notes.
4. Click "Save & Post".
5. The system atomically:
   - Validates treasury account balance.
   - Generates treasury outflow movement (`ExpensePayment`).
   - Generates and posts Journal Entry: Dr Category Expense GL Account, Cr Treasury Linked Asset GL Account.
   - Sets expense record status to `Posted`.

## System Result
Expense registered, treasury cash deducted, and GL expense ledger updated in real time.

## Accounting Effect
Dr Operating Expense GL Account, Cr Treasury Asset GL Account.

## Inventory Effect
Not applicable.

## Treasury Effect
Immediate deduction from source cash box or bank account.

## Party Ledger Effect
Not applicable (unless vendor party subledger is optionally referenced).

## Status Changes
Expense: `Draft` → `Posted`.

## Validation / Blocking Conditions
- Insufficient treasury funds (unless account allows negative balance).
- Missing GL account link on expense category.
- Closed accounting period.

## Cancellation / Reversal
Cancelling expense creates reversing treasury movement (+ cash) and reversing GL journal.

## Verification
Inspect Expense List, Treasury Account Statement, and Income Statement.

## Related Reports
Income Statement, Receipts & Payments Report, General Ledger.

## Related User Manual
04-treasury.md, 05-expenses.md, 08-accounting.md

## Screenshot / Visual QA Placeholder
SOP-XMOD-004: Operational Expense Payment Flow


# SOP-XMOD-005 — End-to-End Payroll Cycle Flow

> [!NOTE]
> HIGH IMPACT END-TO-END CROSS-MODULE PROCEDURE

## Purpose
Execute a full monthly or weekly labor compensation cycle: operational inputs, period wage calculation, managerial review, locking, executive approval, treasury batch disbursement, and automated GL payroll posting.

## Cross-Module Chain
Labor Inputs (Attendance, Piecework, Allowances, Deductions) → Payroll Period Calculation → Approval → Treasury Batch Payment → Accounting GL Journal → Worker Statement Updates

## When to Use
Standard periodic payroll processing for all active workforce.

## Required Permission(s)
`labor.workers.view`, `payroll.periods.calculate`, `payroll.periods.approve`, `payroll.payments.create`, `treasury.transactions.create`

## Preconditions
- Active workers with configured wage profiles (Monthly, Daily, or Piecework).
- All operational inputs (hours, attendance, piecework logs, advances, penalties) recorded for the period.
- Open payroll period and open accounting period.
- Dedicated treasury account has sufficient liquid funds for net payroll total.

## Step-by-Step Procedure
1. **Prepare Period**: Navigate to Payroll > Periods. Open target period (e.g. Month/Year).
2. **Operational Inputs**: Ensure all attendance, piecework logs, advances, and deductions are entered under Labor module.
3. **Calculate Period**: Click "Calculate". The engine evaluates each worker's wage profile, adding regular earnings, overtime, piecework earnings, and allowances, while subtracting advances and penalties to compute `NetWage`.
4. **Audit Calculation**: Review worker summary table. If adjustments are required, update labor entries and click "Recalculate".
5. **Lock & Approve**: Click "Lock" to freeze calculation results, then click "Approve". Status transitions to `Approved`.
6. **Batch Payment Disbursement**:
   - Navigate to Payroll Payments > New Payment Batch.
   - Select Approved Period and source Treasury Account (Cash/Bank).
   - Choose Full Batch or Selected-Worker Batch (each selected worker receives their full NetWage).
   - Confirm payment.
7. **System Execution**:
   - Creates `LaborPayrollPayment` record and individual `PaymentLines`.
   - Generates treasury outflow movement for the paid batch.
   - Generates and posts Journal Entry: Dr Payroll Expense GL Account, Cr Treasury Linked Asset GL Account.
   - Updates worker statements with payout details.
8. **Close Period**: Once all workers are paid, mark period as `Closed`.

## System Result
Workers paid, worker balances cleared, treasury deducted, and payroll expense recorded in general ledger.

## Accounting Effect
Dr Payroll Expense GL Account, Cr Treasury Linked Asset GL Account (No direct payroll payable liability in current implementation).

## Inventory Effect
Not applicable.

## Treasury Effect
Immediate deduction from source cash/bank account for total batch NetWage.

## Party Ledger Effect
Not applicable (tracked in dedicated Worker Subledger / Statements).

## Status Changes
Payroll Period: `Draft` → `Calculated` → `Locked` → `Approved` → `Paid` → `Closed`.

## Validation / Blocking Conditions
- Insufficient funds in treasury account strictly blocks batch payment (negative balance not allowed for payroll).
- Unapproved period cannot be paid.
- Missing worker wage profile blocks period calculation.

## Cancellation / Reversal
Payment reversal reverses the exact batch, restoring worker unpaid balances, returning funds to treasury, and posting reversing journal entry.

## Verification
Review Worker Salary Report, Treasury Statement, and General Ledger.

## Related Reports
Worker Salary Report, Receipts & Payments Report, General Ledger.

## Related User Manual
04-treasury.md, 09-labor.md, 08-accounting.md, 10-payroll.md

## Screenshot / Visual QA Placeholder
SOP-XMOD-005: Payroll Cycle End-to-End Flow


# SOP-XMOD-006 — End-to-End Company-Owned Production Flow

> [!NOTE]
> HIGH IMPACT END-TO-END CROSS-MODULE PROCEDURE

## Purpose
Execute a full manufacturing cycle for company-owned inventory: Bill of Materials definition, work center scheduling, production order release, raw material issuance, finished goods receipt with aggregated production costing, and order completion without direct WIP GL postings.

## Cross-Module Chain
Bill of Materials (BOM) → Work Center → Production Order → Material Issue (Inventory Stock-Out) → Operational Cost Aggregation → Finished Goods Receipt (Inventory Stock-In) → Complete & Close Order

## When to Use
Standard internal manufacturing, assembly, and conversion of raw materials into finished inventory.

## Required Permission(s)
`manufacturing.orders.create`, `manufacturing.orders.approve`, `manufacturing.orders.release`, `manufacturing.issues.create`, `manufacturing.receipts.create`, `manufacturing.orders.complete`, `manufacturing.orders.close`

## Preconditions
- Active BOM configured with raw material components and quantities.
- Active Work Center established.
- Raw materials available in stock in the production warehouse.
- Open inventory period.

## Step-by-Step Procedure
1. **Order Creation**: Navigate to Manufacturing > Orders > New. Select Product, BOM, Work Center, Target Quantity, and Scheduled Dates. Order starts in `Draft`.
2. **Approval & Release**: Click "Approve" (status `Approved`), then click "Release" (status `Released`).
3. **Material Issue**:
   - Create Material Issue against the released order.
   - Select warehouse and confirm component quantities based on BOM.
   - Posting the issue deducts raw materials from inventory stock. Order transitions to `InProgress`.
4. **Operational Cost Accumulation**: Labor and overhead costs accumulate operationally on the production order entity.
5. **Finished Goods Receipt**:
   - When production run completes, create Finished Goods Receipt.
   - Enter finished product quantity received into inventory warehouse.
   - Unit cost is determined by the aggregated production costs and component costs.
   - Posting receipt increases finished goods inventory on hand.
6. **Order Completion**: Click "Complete". Order status transitions to `Completed`.
7. **Order Closure**: Perform operational audit and click "Close". Status transitions to `Closed` (terminal state).

## System Result
Raw materials consumed and deducted from inventory; finished products created and added to inventory catalog at aggregated cost.

## Accounting Effect
Manufacturing operations do NOT create direct WIP GL journal entries in the current implementation. Valuation flows through downstream standard inventory accounting.

## Inventory Effect
Material Issue executes stock-out on raw materials; Finished Receipt executes stock-in on finished goods.

## Treasury Effect
Not applicable.

## Party Ledger Effect
Not applicable.

## Status Changes
Order: `Draft` → `Approved` → `Released` → `InProgress` → `Completed` → `Closed`.

## Validation / Blocking Conditions
- Insufficient raw material stock blocks Material Issue.
- Order cannot be closed until finished receipts are posted.
- Closed orders cannot be cancelled.

## Cancellation / Reversal
If cancelled prior to closure, the system automatically reverses all posted finished receipts (- stock) and material issues (+ stock), then marks order as `Cancelled`.

## Verification
Check Inventory Movements for raw material issues and finished receipts; verify finished goods stock balance in Inventory Stock Report.

## Related Reports
Inventory Movements Report, Inventory Stock Report.

## Related User Manual
03-inventory.md, 11-manufacturing.md

## Screenshot / Visual QA Placeholder
SOP-XMOD-006: Company-Owned Production Flow


# SOP-XMOD-007 — End-to-End Customer-Owned Production Flow

> [!NOTE]
> HIGH IMPACT END-TO-END CROSS-MODULE PROCEDURE

## Purpose
Execute tolling manufacturing using customer-supplied raw materials: customer material intake, customer-owned production order execution, material issuance, and finished receipt with strictly zero financial inventory valuation.

## Cross-Module Chain
Customer Material Intake → Customer-Owned Production Order → Customer Stock Issue → Finished Goods Receipt (Customer-Owned Stock) → Complete Order → (Optional Commercial Tolling Fee via Sales Invoice)

## When to Use
Tolling agreements, third-party processing, and manufacturing services where the client owns the raw materials and finished goods.

## Required Permission(s)
`inventory.customer-material-intakes.create`, `inventory.customer-material-intakes.post`, `manufacturing.orders.create`, `manufacturing.orders.approve`, `manufacturing.orders.release`, `manufacturing.issues.create`, `manufacturing.receipts.create`, `manufacturing.orders.complete`

## Preconditions
- Customer party registered.
- Customer-supplied raw materials received via posted Customer Material Intake (segregated customer stock).
- BOM configured for the tolling item.

## Step-by-Step Procedure
1. **Customer Material Intake**:
   - Navigate to Inventory > Customer Material Intakes > New.
   - Select Customer Party, Warehouse, items, and received quantities.
   - Post intake: increases customer-owned stock quantity with strictly ZERO financial inventory valuation and no GL entry.
2. **Create Tolling Production Order**:
   - Navigate to Manufacturing > Orders > New.
   - Select Product, BOM, and set "Customer Owner" to the designated Customer Party.
   - Order is tagged as Customer-Owned Production.
3. **Approve & Release**: Approve and release order as normal.
4. **Issue Customer Materials**:
   - Create Material Issue selecting Customer-Owned stock.
   - Deducts customer-owned inventory quantities.
5. **Receive Customer Finished Goods**:
   - Post Finished Goods Receipt into customer-owned inventory partition.
   - Recorded at zero inventory asset valuation.
6. **Complete Order**: Mark production order as `Completed`.
7. **Tolling Fee Invoicing**:
   - If a service fee is charged, issue a commercial Sales Invoice for "Manufacturing Services / Tolling Fee" under Sales module: Dr Customer Accounts Receivable, Cr Manufacturing Service Revenue (no stock movement).

## System Result
Customer materials transformed into finished customer goods without affecting company asset valuation or inventory GL balances.

## Accounting Effect
Intake, issue, and receipt have ZERO financial valuation / NotApplicable. Tolling fee invoice (if billed) posts standard AR and Revenue entries.

## Inventory Effect
Tracks physical quantities exclusively within customer-owned stock partitions.

## Treasury Effect
Not applicable during production.

## Party Ledger Effect
No balance impact from stock movements; customer debit arises only if separate tolling fee sales invoice is issued.

## Status Changes
Intake: `Draft` → `Posted`. Production Order: `Draft` → `Approved` → `Released` → `InProgress` → `Completed`.

## Validation / Blocking Conditions
- Attempting to issue customer-owned materials without sufficient customer intake stock is blocked.
- Intermixing company-owned and customer-owned stock is strictly prevented.

## Cancellation / Reversal
Order cancellation reverses customer receipts and returns customer materials to intake balance.

## Verification
Inspect Customer Material Intakes list, customer stock balances, and confirm zero GL impact on balance sheet.

## Related Reports
Customer Material Intakes Report, Inventory Stock Report (Customer-Owned filter).

## Related User Manual
02-parties.md, 03-inventory.md, 07-sales.md, 11-manufacturing.md

## Screenshot / Visual QA Placeholder
SOP-XMOD-007: Customer-Owned Tolling Production Flow


---

# APPENDIX A: BACKEND-ONLY OPERATIONS APPENDIX

> [!NOTE]
> The following procedures represent verified backend API operations that lack dedicated standalone user-facing screens or are triggered implicitly through parent workflows. They are documented here for complete technical and operational accuracy.

### OP-MFG-BK-001 — Manufacturing Issue Reversal
- **Description**: Reverses a posted production material issue movement (`InventoryMovement.IsReversal`), returning raw materials to inventory stock.
- **Execution**: Triggered automatically on backend when an authorized user cancels a production order via `CancelProductionOrderCommand`. No standalone "Reverse Issue" button exists in the frontend UI.
- **Permission**: `manufacturing.orders.cancel`
- **Visual QA**: Not applicable — no user-facing UI.

### OP-MFG-BK-002 — Manufacturing Receipt Reversal
- **Description**: Reverses a posted finished goods production receipt movement, deducting finished goods from inventory stock.
- **Execution**: Triggered automatically on backend when an authorized user cancels a production order via `CancelProductionOrderCommand`. Requires sufficient on-hand inventory to prevent negative stock.
- **Permission**: `manufacturing.orders.cancel`
- **Visual QA**: Not applicable — no user-facing UI.

### OP-MFG-BK-003 — Manufacturing Labor Operation Recording
- **Description**: Registers operational worker labor hours and machine time against a production order (`ProductionLaborOperation` entity).
- **Execution**: Supported via backend API endpoints; no dedicated frontend screen is currently exposed in the manufacturing navigation.
- **Permission**: `manufacturing.orders.update`
- **Visual QA**: Not applicable — no user-facing UI.

### OP-MFG-BK-004 — Manufacturing Production Charge Recording
- **Description**: Attaches indirect overhead costs, energy, or machine charges to a production order (`ProductionCharge` entity).
- **Execution**: Handled via backend commands; values accumulate into total order production cost at receipt time.
- **Permission**: `manufacturing.orders.update`
- **Visual QA**: Not applicable — no user-facing UI.

### OP-MFG-BK-005 — Manufacturing By-Product Receipt
- **Description**: Records secondary or by-product inventory yields generated during a production run.
- **Execution**: Backend receipt entity supports by-product lines; currently not exposed in the standard frontend production receipt dialog.
- **Permission**: `manufacturing.receipts.create`
- **Visual QA**: Not applicable — no user-facing UI.

### OP-MFG-BK-006 — Manufacturing Tolling Fee Recording
- **Description**: Internal computation of contractual tolling charges for customer-owned production runs.
- **Execution**: Evaluated on backend; customer billing is executed via standard Sales Invoices under the Sales module.
- **Permission**: `manufacturing.orders.update` / `sales.invoices.create`
- **Visual QA**: Not applicable — no user-facing UI.

---

# APPENDIX B: PLACEHOLDER CAPABILITIES APPENDIX

### CAP-MFG-DASH-001 — Manufacturing Dashboard
- **Route**: `/manufacturing/dashboard`
- **Component**: `ManufacturingDashboardPage.tsx`
- **Permission**: `manufacturing.dashboard.view`
- **Current State**: Displays a branded "Coming Soon / Under Construction" placeholder page with overview metrics cards.
- **Screenshot / Visual QA Placeholder**: SOP-MFG-DASH-001: Manufacturing Dashboard Coming Soon Placeholder Screen

---

# APPENDIX C: NOT IMPLEMENTED CAPABILITIES APPENDIX

> [!WARNING]
> The following features are identified as NOT IMPLEMENTED in the current system version. Do NOT attempt to execute or invent workflows for these items:

1. **Standalone Scrap Management**: Dedicated scrap entry screen, scrap reporting, and scrap GL write-offs are not implemented. Scrap quantity is only an informative field on production order completion.
2. **Dedicated Report Export / Print Buttons**: Standalone PDF/Print/Export toolbars on financial reporting pages are not implemented. Standard browser printing can be utilized.
3. **Expense Import from File**: Bulk file import for operational expenses is not implemented.
4. **Sales Invoice Import from File**: Bulk file import for customer sales invoices is not implemented.
5. **Purchase Invoice Import from File**: Bulk file import for supplier purchase invoices is not implemented.
6. **Payroll File Import / Export**: Direct file import or export from within the Payroll module is not implemented (worker master data import is handled under Labor).
7. **Manufacturing Import / Export**: Bulk Excel import/export of Bills of Materials, Work Centers, or Production Orders is not implemented.
- **Visual QA**: Not applicable — capability not implemented.


## Accounting Effect Matrix

| Operation | Inventory Effect | Treasury Effect | Party Ledger Effect | GL Effect | Reversible? | Source Module |
|-----------|------------------|-----------------|---------------------|-----------|-------------|---------------|
| Purchase Invoice | Increases | None | Supplier Balance Increases | Dr Inv/Exp, Cr Supplier | YES | Purchases |
| Purchase Return | Decreases | None | Supplier Balance Decreases | Dr Supplier, Cr Inv/Exp | YES | Purchases |
| Sales Invoice | Decreases | None | Customer Balance Increases | Dr Customer, Cr Rev, Dr COGS, Cr Inv | YES | Sales |
| Sales Return | Increases | None | Customer Balance Decreases | Dr Rev, Cr Customer, Dr Inv, Cr COGS | YES | Sales |
| Customer Receipt | None | Increases | Customer Balance Decreases | Dr Treasury, Cr Customer | YES | Treasury |
| Supplier Payment | None | Decreases | Supplier Balance Decreases | Dr Supplier, Cr Treasury | YES | Treasury |
| Expense | None | Decreases | None | Dr Exp, Cr Treasury | YES | Expenses |
| Treasury Transfer| None | Source Dec / Target Inc | None | Dr Target, Cr Source | YES | Treasury |
| Payroll Payment | None | Decreases | None | Dr Payroll Exp, Cr Treasury | YES | Payroll |
| Mfg Issue | Decreases | None | None | Standard Inventory Costing (No direct Mfg WIP Journal) | YES | Manufacturing |
| Mfg Receipt | Increases | None | None | Standard Inventory Costing (No direct Mfg WIP Journal) | YES | Manufacturing |
| Cust Mat Intake | Cust Inc | None | None | Zero Financial Valuation / NotApplicable | YES | Inventory |

## Status Transition Matrix

| Entity | Allowed From | Action | Resulting Status | Reversible? | Terminal? | Notes |
|--------|--------------|--------|------------------|-------------|-----------|-------|
| Purchase Invoice | Draft | Post | Posted | YES | YES | Cancellation reverses stock and AP journal |
| Purchase Return | Draft | Post | Posted | YES | YES | Cancellation reverses stock return and AP debit |
| Sales Invoice | Draft | Post | Posted | YES | NO | Transitions to Paid upon collection |
| Sales Return | Draft | Post | Posted | YES | YES | Cancellation reverses stock return and AR credit |
| Treasury Transfer| Draft | Post | Posted | YES | YES | Cancellation reverses debit/credit movements |
| Expense | Draft | Post | Posted | YES | YES | Cancellation reverses treasury cash and expense GL |
| Journal Entry | Draft | Post | Posted | YES | YES | Cancellation creates reversal journal entry |
| Payroll Period | Draft | Calculate | Calculated | NO | NO | Can recalculate before lock |
| Payroll Period | Calculated | Lock & Approve | Approved | YES (Reopen*) | NO | *Reopen permission missing from staging |
| Payroll Period | Approved | Batch Payment | Paid | YES (Reverse) | YES | Reversing batch restores worker unpaid balance |
| Mfg Order | Draft | Approve | Approved | NO | NO | Validates BOM and Work Center |
| Mfg Order | Approved | Release | Released | NO | NO | Allocates order for production |
| Mfg Order | Released | Start / Issue | InProgress | NO | NO | Material issues deduct raw materials |
| Mfg Order | InProgress | Complete | Completed | NO | NO | Finished goods receipts add stock |
| Mfg Order | Completed| Close | Closed | NO | YES | Terminal state; cannot cancel or modify |
| Mfg Order (Cancel Branch) | Draft, Approved, Released, InProgress, Completed | Cancel | Cancelled | NO | YES | Mandatory reason; reverses all posted issues and receipts; resets produced qty to 0; no delete action exists |

## Failure / Blocking Conditions

* **Insufficient stock**: Blocks Sales Invoice Post, Mfg Material Issue, Stock Out, and Adjust Down.
* **Insufficient Treasury balance**: Blocks Payroll Payment, Supplier Payment, Cash Out, Transfer, and Expense (unless AllowNegativeBalance is enabled on treasury account; Payroll strictly requires funds regardless).
* **Inactive account**: Blocks transactions using that GL, Treasury, Party, or Item.
* **Missing GL mapping**: Blocks automated posting of invoices and movements.
* **Closed accounting period**: Blocks any transaction with a date in a closed period.
* **Missing wage profile**: Blocks Payroll calculation for the worker.
* **Invalid return quantity**: Blocks returns exceeding the original invoice line quantity.
* **Posted return blocking invoice cancellation**: Cannot cancel a sales/purchase invoice if a return exists against it.
* **Manufacturing reversal prerequisites**: Cancellation requires sufficient on-hand finished goods stock to execute receipt reversals.
* **Protected admin/system users**: Blocks edit, delete, or role demotion of System Owner and System Administrator.

## Reversal / Correction Strategy

SAYAD enforces a strict immutable-accounting philosophy for posted financial records:
* **Edits**: Permitted only on Draft entities.
* **Cancels/Reversals**: Posted financial documents cannot be deleted. They must be explicitly cancelled, which automatically generates counter-movements and reversal journal entries.
* **Counter-movement**: Reversing an invoice or receipt creates an exact opposite entry to zero out the effect while preserving the audit trail.
* **Hard deletes**: Only permitted on Draft records or master data (Parties, Workers, Items) with no linked transactions, subject to soft-delete mechanisms and elevated role privileges for final deletion.
* **Forbids changes**: Once posted, quantities, amounts, and dates are locked. Correction requires reversal and re-entry.
