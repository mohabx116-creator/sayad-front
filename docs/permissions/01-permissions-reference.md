# SAYAD Permissions Reference

## 1. Authoritative Permission Census

Current source permission catalog: 182
Current staging persisted permission rows: 178
Permission domains: 14

## 2. Source vs Staging Permission Drift

Source catalog: 182
Staging persisted: 178

Missing from staging:
- `accounting.view`
- `labor.operations.edit`
- `labor.operations.delete`
- `payroll.periods.reopen`

Classification: SOURCE-ACTIVE / STAGING-MISSING

This is a deployment/data-seeding discrepancy, not a permission-definition discrepancy.

## 3. Domain Inventory

1. **administration.***: 18 permissions (Owning module: Administration, Manual: Chapter 1)
2. **system.***: 0 persisted permissions (Access is role-based via SystemOwner)
3. **parties.***: 10 permissions (Owning module: Parties, Manual: Chapter 2)
4. **inventory.***: 30 permissions (Owning module: Inventory, Manual: Chapter 3)
5. **treasury.***: 17 permissions (Owning module: Treasury, Manual: Chapter 4)
6. **expenses.***: 8 permissions (Owning module: Expenses, Manual: Chapter 5)
7. **purchases.***: 11 permissions (Owning module: Purchases, Manual: Chapter 6)
8. **sales.***: 11 permissions (Owning module: Sales, Manual: Chapter 7)
9. **accounting.***: 24 permissions (Owning module: Accounting, Manual: Chapter 8)
10. **labor.***: 24 permissions (Owning module: Labor, Manual: Chapter 9)
11. **payroll.***: 7 permissions (Owning module: Payroll, Manual: Chapter 10)
12. **manufacturing.***: 18 permissions (Owning module: Manufacturing, Manual: Chapter 11)
13. **settings.***: 2 permissions (Owning module: Settings, Manual: Chapter 1)
14. **audit.***: 1 permission (Owning module: System, Manual: Chapter 1)
15. **notifications.***: 1 permission (Owning module: System, Manual: Chapter 1)

*(Total Domains: 14 unique prefixes used)*

## 4. Master Permission Table

| Domain | Permission Code | Arabic Meaning | Frontend Usage | Backend Enforcement | Notes |
|--------|-----------------|----------------|----------------|---------------------|-------|
| Administration | `administration.users.view` | عرض المستخدمين | ROUTE GUARD | ENDPOINT | |
| Administration | `administration.users.create` | إنشاء المستخدمين | ACTION GUARD | COMMAND | |
| Administration | `administration.users.update` | تعديل المستخدمين | ACTION GUARD | COMMAND | |
| Administration | `administration.users.activate` | تفعيل المستخدمين | ACTION GUARD | COMMAND | |
| Administration | `administration.users.deactivate` | تعطيل المستخدمين | ACTION GUARD | COMMAND | |
| Administration | `administration.users.lock` | قفل المستخدمين | ACTION GUARD | COMMAND | |
| Administration | `administration.users.unlock` | فتح قفل المستخدمين | ACTION GUARD | COMMAND | |
| Administration | `administration.users.reset-password` | إعادة تعيين كلمة المرور | ACTION GUARD | COMMAND | |
| Administration | `administration.users.assign-roles` | إسناد الأدوار للمستخدمين | ACTION GUARD | COMMAND | |
| Administration | `administration.users.delete` | حذف المستخدمين | ACTION GUARD | COMMAND | |
| Administration | `administration.roles.view` | عرض الأدوار | ROUTE GUARD | ENDPOINT | |
| Administration | `administration.roles.create` | إنشاء الأدوار | ACTION GUARD | COMMAND | |
| Administration | `administration.roles.update` | تعديل الأدوار | ACTION GUARD | COMMAND | |
| Administration | `administration.roles.activate` | تفعيل الأدوار | ACTION GUARD | COMMAND | |
| Administration | `administration.roles.deactivate` | تعطيل الأدوار | ACTION GUARD | COMMAND | |
| Administration | `administration.roles.assign-permissions` | إسناد الصلاحيات للأدوار | ACTION GUARD | COMMAND | |
| Administration | `administration.roles.delete` | حذف الأدوار | ACTION GUARD | COMMAND | |
| Administration | `administration.permissions.view` | عرض الصلاحيات | ROUTE GUARD | ENDPOINT | |
| Parties | `parties.view` | عرض الأطراف | ROUTE GUARD | ENDPOINT | |
| Parties | `parties.create` | إنشاء الأطراف | ACTION GUARD | COMMAND | |
| Parties | `parties.update` | تعديل الأطراف | ACTION GUARD | COMMAND | |
| Parties | `parties.activate` | تفعيل الأطراف | ACTION GUARD | COMMAND | |
| Parties | `parties.deactivate` | تعطيل الأطراف | ACTION GUARD | COMMAND | |
| Parties | `parties.opening-balance.view` | عرض الرصيد الافتتاحي | ACTION GUARD | ENDPOINT | |
| Parties | `parties.opening-balance.manage` | إدارة الرصيد الافتتاحي | ACTION GUARD | COMMAND | |
| Parties | `parties.statement.view` | عرض كشف حساب الطرف | ACTION GUARD | ENDPOINT | |
| Parties | `parties.adjustments.manage` | إدارة تسويات الأطراف | ACTION GUARD | COMMAND | |
| Labor | `labor.workers.view` | عرض العمال | MULTIPLE | ENDPOINT | Protects Worker Salary Report |
| Labor | `labor.workers.create` | إضافة عامل | ACTION GUARD | COMMAND | |
| Labor | `labor.workers.edit` | تعديل عامل | ACTION GUARD | COMMAND | |
| Labor | `labor.workers.delete` | حذف عامل | ACTION GUARD | COMMAND | |
| Labor | `labor.workers.change-status` | تغيير حالة العامل | ACTION GUARD | COMMAND | |
| Labor | `labor.operational-jobs.view` | عرض الوظائف التشغيلية | ROUTE GUARD | ENDPOINT | |
| Labor | `labor.operational-jobs.create` | إضافة وظيفة تشغيلية | ACTION GUARD | COMMAND | |
| Labor | `labor.operational-jobs.edit` | تعديل وظيفة تشغيلية | ACTION GUARD | COMMAND | |
| Labor | `labor.operational-jobs.delete` | حذف وظيفة تشغيلية | ACTION GUARD | COMMAND | |
| Labor | `labor.operational-jobs.change-status` | تغيير حالة الوظيفة التشغيلية| ACTION GUARD | COMMAND | |
| Labor | `labor.operations.view` | عرض سجل العمليات | ROUTE GUARD | ENDPOINT | |
| Labor | `labor.operations.create` | إنشاء عملية | ACTION GUARD | COMMAND | |
| Labor | `labor.operations.edit` | تعديل عملية | ACTION GUARD | COMMAND | Defined in source: YES, Backend enforcement: YES, Frontend usage: ACTION GUARD, Persisted in staging: NO |
| Labor | `labor.operations.delete` | حذف عملية | ACTION GUARD | COMMAND | Defined in source: YES, Backend enforcement: YES, Frontend usage: ACTION GUARD, Persisted in staging: NO |
| Labor | `labor.monthly-movements.view` | عرض الحركات الشهرية للعمال | ROUTE GUARD | ENDPOINT | |
| Labor | `labor.monthly-movements.create` | إضافة حركة شهرية | ACTION GUARD | COMMAND | |
| Labor | `labor.monthly-movements.edit` | تعديل حركة شهرية | ACTION GUARD | COMMAND | |
| Labor | `labor.monthly-movements.delete` | حذف حركة شهرية | ACTION GUARD | COMMAND | |
| Labor | `labor.monthly-movements.approve` | اعتماد حركة شهرية | ACTION GUARD | COMMAND | |
| Labor | `labor.monthly-movements.reject` | رفض حركة شهرية | ACTION GUARD | COMMAND | |
| Payroll | `payroll.periods.view` | عرض فترات الرواتب | ROUTE GUARD | ENDPOINT | |
| Payroll | `payroll.periods.create` | إنشاء فترة رواتب | ACTION GUARD | COMMAND | |
| Payroll | `payroll.periods.calculate` | حساب الرواتب | ACTION GUARD | COMMAND | Includes recalculate |
| Payroll | `payroll.periods.approve` | اعتماد فترة رواتب | ACTION GUARD | COMMAND | |
| Payroll | `payroll.periods.reopen` | إعادة فتح فترة رواتب | ACTION GUARD | COMMAND | Defined in source: YES, Backend enforcement: YES, Frontend usage: ACTION GUARD, Persisted in staging: NO |
| Payroll | `payroll.periods.pay` | صرف الرواتب | ACTION GUARD | COMMAND | Includes reverse pay |
| Payroll | `payroll.periods.delete` | حذف فترة رواتب | ACTION GUARD | COMMAND | |
| Treasury | `treasury.view` | عرض الخزينة | ROUTE GUARD | ENDPOINT | Protects Receipts & Payments |
| Treasury | `treasury.accounts.view` | عرض حسابات الخزينة | ROUTE GUARD | ENDPOINT | |
| Treasury | `treasury.accounts.create` | إنشاء حساب خزينة | ACTION GUARD | COMMAND | |
| Treasury | `treasury.accounts.update` | تعديل حسابات الخزينة | ACTION GUARD | COMMAND | |
| Treasury | `treasury.accounts.activate` | تفعيل حساب خزينة | ACTION GUARD | COMMAND | |
| Treasury | `treasury.accounts.deactivate`| تعطيل حساب خزينة | ACTION GUARD | COMMAND | |
| Treasury | `treasury.receipts.view` | عرض سندات القبض | ROUTE GUARD | ENDPOINT | |
| Treasury | `treasury.receipts.create` | إنشاء سند قبض | ACTION GUARD | COMMAND | |
| Treasury | `treasury.receipts.update` | تعديل سند قبض | ACTION GUARD | COMMAND | |
| Treasury | `treasury.receipts.post` | ترحيل سند قبض | ACTION GUARD | COMMAND | |
| Treasury | `treasury.receipts.cancel` | إلغاء سند قبض | ACTION GUARD | COMMAND | |
| Treasury | `treasury.payments.view` | عرض سندات الصرف | ROUTE GUARD | ENDPOINT | |
| Treasury | `treasury.payments.create` | إنشاء سند صرف | ACTION GUARD | COMMAND | |
| Treasury | `treasury.payments.update` | تعديل سند صرف | ACTION GUARD | COMMAND | |
| Treasury | `treasury.payments.post` | ترحيل سند صرف | ACTION GUARD | COMMAND | |
| Treasury | `treasury.payments.cancel` | إلغاء سند صرف | ACTION GUARD | COMMAND | |
| Treasury | `treasury.transfers.view` | عرض تحويلات الخزينة | ROUTE GUARD | ENDPOINT | |
| Treasury | `treasury.transfers.create` | إنشاء تحويلة خزينة | ACTION GUARD | COMMAND | |
| Treasury | `treasury.transfers.update` | تعديل تحويلة خزينة | ACTION GUARD | COMMAND | |
| Treasury | `treasury.transfers.post` | ترحيل تحويلة خزينة | ACTION GUARD | COMMAND | |
| Treasury | `treasury.transfers.cancel` | إلغاء تحويلة خزينة | ACTION GUARD | COMMAND | |
| Treasury | `treasury.statements.view` | عرض كشف الخزينة | ACTION GUARD | ENDPOINT | |
| Treasury | `treasury.lookups.view` | عرض إعدادات الخزينة | ACTION GUARD | ENDPOINT | |
| Expenses | `expenses.view` | عرض المصروفات | ROUTE GUARD | ENDPOINT | |
| Expenses | `expenses.create` | إنشاء المصروفات | ACTION GUARD | COMMAND | |
| Expenses | `expenses.edit` | تعديل المصروفات | ACTION GUARD | COMMAND | |
| Expenses | `expenses.post` | ترحيل المصروفات | ACTION GUARD | COMMAND | |
| Expenses | `expenses.cancel` | إلغاء المصروفات | ACTION GUARD | COMMAND | |
| Expenses | `expenses.categories.view` | عرض تصنيفات المصروفات | ROUTE GUARD | ENDPOINT | |
| Expenses | `expenses.categories.manage`| إدارة تصنيفات المصروفات | ACTION GUARD | COMMAND | |
| Purchases| `purchases.view` | عرض المشتريات | ROUTE GUARD | ENDPOINT | |
| Purchases| `purchases.invoices.view` | عرض فواتير المشتريات | MULTIPLE | ENDPOINT | Protects Reports in BE |
| Purchases| `purchases.invoices.create` | إنشاء فواتير المشتريات | ACTION GUARD | COMMAND | |
| Purchases| `purchases.invoices.update` | تعديل فواتير المشتريات | ACTION GUARD | COMMAND | |
| Purchases| `purchases.invoices.post` | ترحيل فواتير المشتريات | ACTION GUARD | COMMAND | Includes pay |
| Purchases| `purchases.invoices.cancel` | إلغاء فواتير المشتريات | ACTION GUARD | COMMAND | |
| Purchases| `purchases.returns.view` | عرض مرتجعات المشتريات | ROUTE GUARD | ENDPOINT | |
| Purchases| `purchases.returns.create` | إنشاء مرتجعات المشتريات | ACTION GUARD | COMMAND | |
| Purchases| `purchases.returns.update` | تعديل مرتجعات المشتريات | ACTION GUARD | COMMAND | |
| Purchases| `purchases.returns.post` | ترحيل مرتجعات المشتريات | ACTION GUARD | COMMAND | |
| Purchases| `purchases.returns.cancel` | إلغاء مرتجعات المشتريات | ACTION GUARD | COMMAND | |
| Sales | `sales.view` | عرض المبيعات | ROUTE GUARD | ENDPOINT | |
| Sales | `sales.invoices.view` | عرض فواتير المبيعات | MULTIPLE | ENDPOINT | Protects Reports in BE |
| Sales | `sales.invoices.create` | إنشاء فواتير المبيعات | ACTION GUARD | COMMAND | |
| Sales | `sales.invoices.update` | تعديل فواتير المبيعات | ACTION GUARD | COMMAND | |
| Sales | `sales.invoices.post` | ترحيل فواتير المبيعات | ACTION GUARD | COMMAND | Includes collect |
| Sales | `sales.invoices.cancel` | إلغاء فواتير المبيعات | ACTION GUARD | COMMAND | |
| Sales | `sales.returns.view` | عرض مرتجعات المبيعات | ROUTE GUARD | ENDPOINT | |
| Sales | `sales.returns.create` | إنشاء مرتجعات المبيعات | ACTION GUARD | COMMAND | |
| Sales | `sales.returns.update` | تعديل مرتجعات المبيعات | ACTION GUARD | COMMAND | |
| Sales | `sales.returns.post` | ترحيل مرتجعات المبيعات | ACTION GUARD | COMMAND | |
| Sales | `sales.returns.cancel` | إلغاء مرتجعات المبيعات | ACTION GUARD | COMMAND | |
| Inventory| `inventory.view` | عرض المخزون | ROUTE GUARD | ENDPOINT | |
| Inventory| `inventory.items.view` | عرض الأصناف | ROUTE GUARD | ENDPOINT | |
| Inventory| `inventory.items.create` | إنشاء الأصناف | ACTION GUARD | COMMAND | |
| Inventory| `inventory.items.update` | تعديل الأصناف | ACTION GUARD | COMMAND | |
| Inventory| `inventory.items.activate` | تفعيل الأصناف | ACTION GUARD | COMMAND | |
| Inventory| `inventory.items.deactivate`| تعطيل الأصناف | ACTION GUARD | COMMAND | |
| Inventory| `inventory.categories.view` | عرض تصنيفات الأصناف | ROUTE GUARD | ENDPOINT | |
| Inventory| `inventory.categories.manage`| إدارة تصنيفات الأصناف | ACTION GUARD | COMMAND | |
| Inventory| `inventory.units.view` | عرض وحدات القياس | ROUTE GUARD | ENDPOINT | |
| Inventory| `inventory.units.manage` | إدارة وحدات القياس | ACTION GUARD | COMMAND | |
| Inventory| `inventory.opening-stock.view`| عرض الرصيد الافتتاحي | ACTION GUARD | ENDPOINT | |
| Inventory| `inventory.opening-stock.manage`| إدارة الرصيد الافتتاحي | ACTION GUARD | COMMAND | |
| Inventory| `inventory.movements.view` | عرض حركات المخزون | ROUTE GUARD | ENDPOINT | |
| Inventory| `inventory.movements.stock-in`| إدخال مخزون | ACTION GUARD | COMMAND | |
| Inventory| `inventory.movements.stock-out`| صرف مخزون | ACTION GUARD | COMMAND | |
| Inventory| `inventory.movements.adjust`| تسوية مخزون | ACTION GUARD | COMMAND | |
| Inventory| `inventory.movements.reverse`| عكس حركات المخزون | ACTION GUARD | COMMAND | |
| Inventory| `inventory.party-items.view` | عرض ربط الأطراف | ROUTE GUARD | ENDPOINT | |
| Inventory| `inventory.party-items.manage`| إدارة ربط الأطراف | ACTION GUARD | COMMAND | |
| Inventory| `inventory.customer-material-intakes.view`| عرض استلام مواد العميل | ROUTE GUARD | ENDPOINT | |
| Inventory| `inventory.customer-material-intakes.create`| إنشاء استلام مواد العميل| ACTION GUARD | COMMAND | |
| Inventory| `inventory.customer-material-intakes.update`| تعديل استلام مواد العميل| ACTION GUARD | COMMAND | |
| Inventory| `inventory.customer-material-intakes.post`| ترحيل استلام مواد العميل| ACTION GUARD | COMMAND | |
| Inventory| `inventory.customer-material-intakes.cancel`| إلغاء استلام مواد العميل | ACTION GUARD | COMMAND | |
| Inventory| `inventory.customer-material-conversions.view`| عرض تحويل مواد العميل | ROUTE GUARD | ENDPOINT | |
| Inventory| `inventory.customer-material-conversions.create`| إنشاء تحويل مواد العميل | ACTION GUARD | COMMAND | |
| Inventory| `inventory.customer-material-conversions.update`| تعديل تحويل مواد العميل | ACTION GUARD | COMMAND | |
| Inventory| `inventory.customer-material-conversions.post`| ترحيل تحويل مواد العميل | ACTION GUARD | COMMAND | |
| Inventory| `inventory.customer-material-conversions.cancel`| إلغاء تحويل مواد العميل | ACTION GUARD | COMMAND | |
| Inventory| `inventory.alerts.view` | عرض تنبيهات المخزون | ROUTE GUARD | ENDPOINT | |
| Audit | `audit.view` | عرض سجل التدقيق | ROUTE GUARD | ENDPOINT | |
| Settings | `settings.view` | عرض الإعدادات | ROUTE GUARD | ENDPOINT | |
| Settings | `settings.manage` | إدارة الإعدادات | ACTION GUARD | COMMAND | |
| Notification | `notifications.view` | عرض الإشعارات | ROUTE GUARD | ENDPOINT | |
| Manufact | `manufacturing.view` | عرض التصنيع | ROUTE GUARD | ENDPOINT | |
| Manufact | `manufacturing.bom.view` | عرض فواتير المواد | ROUTE GUARD | ENDPOINT | |
| Manufact | `manufacturing.bom.create` | إنشاء فاتورة مواد | ACTION GUARD | COMMAND | |
| Manufact | `manufacturing.bom.update` | تعديل فاتورة مواد | ACTION GUARD | COMMAND | |
| Manufact | `manufacturing.bom.delete` | حذف فاتورة مواد | ACTION GUARD | COMMAND | |
| Manufact | `manufacturing.orders.view` | عرض أوامر الإنتاج | ROUTE GUARD | ENDPOINT | |
| Manufact | `manufacturing.orders.create` | إنشاء أمر إنتاج | ACTION GUARD | COMMAND | |
| Manufact | `manufacturing.orders.update` | تعديل أمر إنتاج | ACTION GUARD | COMMAND | |
| Manufact | `manufacturing.orders.approve`| اعتماد أمر إنتاج | ACTION GUARD | COMMAND | |
| Manufact | `manufacturing.orders.release`| إطلاق أمر إنتاج | ACTION GUARD | COMMAND | |
| Manufact | `manufacturing.orders.cancel` | إلغاء أمر إنتاج | ACTION GUARD | COMMAND | |
| Manufact | `manufacturing.orders.close` | إغلاق أمر إنتاج | ACTION GUARD | COMMAND | |
| Manufact | `manufacturing.workcenters.view`| عرض مراكز العمل | ROUTE GUARD | ENDPOINT | |
| Manufact | `manufacturing.workcenters.create`| إنشاء مركز عمل | ACTION GUARD | COMMAND | |
| Manufact | `manufacturing.workcenters.update`| تعديل مركز عمل | ACTION GUARD | COMMAND | |
| Manufact | `manufacturing.workcenters.delete`| حذف مركز عمل | ACTION GUARD | COMMAND | |
| Manufact | `manufacturing.reports.view` | عرض تقارير التصنيع | ROUTE GUARD | ENDPOINT | |
| Manufact | `manufacturing.dashboard.view`| عرض لوحة التصنيع | ROUTE GUARD | ENDPOINT | |
| Accounting | `accounting.view` | عرض المحاسبة | ROUTE GUARD | ENDPOINT | Defined in source: YES, Backend enforcement: YES, Frontend usage: ROUTE GUARD, Persisted in staging: NO |
| Accounting | `accounting.accounts.view` | عرض الحسابات | ROUTE GUARD | ENDPOINT | |
| Accounting | `accounting.accounts.create` | إنشاء الحسابات | ACTION GUARD | COMMAND | |
| Accounting | `accounting.accounts.update` | تعديل الحسابات | ACTION GUARD | COMMAND | |
| Accounting | `accounting.accounts.activate`| تفعيل الحسابات | ACTION GUARD | COMMAND | |
| Accounting | `accounting.accounts.deactivate`| إلغاء تفعيل الحسابات | ACTION GUARD | COMMAND | |
| Accounting | `accounting.accounts.delete` | حذف الحسابات | ACTION GUARD | COMMAND | |
| Accounting | `accounting.settings.view` | عرض إعدادات المحاسبة | ROUTE GUARD | ENDPOINT | |
| Accounting | `accounting.settings.update` | تعديل إعدادات المحاسبة | ACTION GUARD | COMMAND | |
| Accounting | `accounting.periods.view` | عرض الفترات المحاسبية | ROUTE GUARD | ENDPOINT | |
| Accounting | `accounting.periods.manage` | إدارة الفترات المحاسبية | ACTION GUARD | COMMAND | |
| Accounting | `accounting.periods.reopen` | إعادة فتح الفترات المحاسبية| ACTION GUARD | COMMAND | |
| Accounting | `accounting.fiscal-years.rollover`| ترحيل السنة المالية | ACTION GUARD | COMMAND | |
| Accounting | `accounting.fiscal-years.rollback`| التراجع عن ترحيل السنة المالية| ACTION GUARD | COMMAND | |
| Accounting | `accounting.year-end.view` | عرض إقفال السنة المالية | ROUTE GUARD | ENDPOINT | |
| Accounting | `accounting.year-end.close` | إقفال السنة المالية | ACTION GUARD | COMMAND | |
| Accounting | `accounting.year-end.reopen`| إعادة فتح إقفال السنة المالية| ACTION GUARD | COMMAND | |
| Accounting | `accounting.reports.view` | عرض التقارير المحاسبية | MULTIPLE | ENDPOINT | Protects Accounting reports |
| Accounting | `accounting.journal-entries.view`| عرض القيود اليومية | ROUTE GUARD | ENDPOINT | |
| Accounting | `accounting.journal-entries.create`| إنشاء القيود اليومية | ACTION GUARD | COMMAND | |
| Accounting | `accounting.journal-entries.update`| تعديل القيود اليومية | ACTION GUARD | COMMAND | |
| Accounting | `accounting.journal-entries.post`| ترحيل القيود اليومية | ACTION GUARD | COMMAND | |
| Accounting | `accounting.journal-entries.cancel`| إلغاء القيود اليومية | ACTION GUARD | COMMAND | |
| Accounting | `accounting.journal-entries.delete`| حذف القيود اليومية المسودة | ACTION GUARD | COMMAND | |

## 5. Frontend / Backend Mismatches

| Feature | Frontend Permission | Backend Permission | Match? | Impact |
|---------|---------------------|--------------------|--------|--------|
| Purchase Invoices Report | `accounting.reports.view` | `purchases.invoices.view` | NO | Requires user to have BOTH. |
| Receipts & Payments Report| `accounting.reports.view` | `treasury.view` | NO | Requires user to have BOTH. |

## 6. Permission Reuse

| Permission | Actions Controlled | Notes |
|------------|--------------------|-------|
| `sales.invoices.post` | Post Invoice, Collect Invoice | Full collection logic reusing post. |
| `purchases.invoices.post` | Post Invoice, Pay Invoice | Full payment logic reusing post. |
| `payroll.periods.calculate` | Calculate, Recalculate | |
| `payroll.periods.pay` | Pay Payroll, Reverse Payroll Payment | |

## 7. High-Risk Permissions

* **Administration:** `administration.users.delete`, `administration.roles.delete`
* **Accounting:** `accounting.fiscal-years.rollover`, `accounting.year-end.close`, `accounting.journal-entries.post`
* **Payroll:** `payroll.periods.pay`, `payroll.periods.approve`
* **Inventory/Manufacturing:** `inventory.movements.adjust`, `manufacturing.orders.cancel`

## 8. Role-Based Access

The following features bypass or require role-based access instead of normal permissions:
* **System Dashboard:** Requires `SystemOwnerRouteGuard` (Role).
* **System Owner Protection:** Certain users and roles cannot be edited or deleted by normal users regardless of having `.delete` permissions.
* **Final Delete:** Backend often enforces a restriction on soft-deleted entities requiring elevated roles to permanently delete.
