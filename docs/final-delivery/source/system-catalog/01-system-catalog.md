# دليل المستخدم: كتالوج النظام الشامل (Exhaustive System Catalog)

## 1. إحصائيات النظام (System Metrics)

* إجمالي وحدات العمل / المجالات الوظيفية: 16 (Dashboard, Notifications, Account/Auth, Settings, Administration, System, Parties, Inventory, Treasury, Expenses, Purchases, Sales, Accounting, Labor, Payroll, Manufacturing)
* مجموعات التنقل الجانبية (Navigation Groups): 12 (Dashboard, Parties, Inventory, Purchases, Sales, Treasury, Expenses, Labor (incl. Payroll), Accounting, Manufacturing, Administration, System)
* عناصر القوائم (Menu Items): 130
* المسارات القابلة للتنقل (Navigable Routes): 142
* الشاشات الفريدة للمستخدم: 136
* مسارات إعادة التوجيه (Redirects): 5
* شاشات الـ Placeholders (قيد التنفيذ): 1 (Manufacturing Dashboard)

## 2. كتالوج التقارير ولوحات التحكم (Report & Dashboard Census)

* إجمالي القطع التحليلية والتقارير: 20
* تقارير واجهة المستخدم: 12 (General Ledger, Trial Balance, Income Statement, Balance Sheet, Cash Flow, Customer Receivables Aging, Supplier Payables Aging, Purchase Invoices Report, Receipts & Payments, Sales Profitability, Sales Invoices Report, Worker Salary Report)
* شاشات التحليل والمطابقة: 3 (Treasury GL Reconciliation, Inventory GL Reconciliation, Sales Customer Item Analysis)
* تقارير في الـ Backend فقط: 2 (Manufacturing Cost Analysis, Manufacturing WIP)
* لوحات تحكم للمستخدم: 2 (System Dashboard, Dashboard Default)
* لوحات تحكم Placeholders: 1 (Manufacturing Dashboard)

## 3. كتالوج الصلاحيات (Permission Domain Census)

* إجمالي الصلاحيات في الكود المصدري: 182
* إجمالي الصلاحيات في بيئة الاختبار (Staging): 178
* الصلاحيات المفقودة في بيئة الاختبار: 4 (`accounting.view`, `labor.operations.edit`, `labor.operations.delete`, `payroll.periods.reopen`)
* إجمالي نطاقات الصلاحيات المُسجلة: 14 نطاقاً فعلياً

النطاقات الفعلية (14):
1. `administration.*` (18 صلاحية)
2. `parties.*` (10 صلاحيات)
3. `inventory.*` (30 صلاحية)
4. `treasury.*` (17 صلاحية)
5. `expenses.*` (8 صلاحيات)
6. `purchases.*` (11 صلاحية)
7. `sales.*` (11 صلاحية)
8. `accounting.*` (24 صلاحية)
9. `labor.*` (24 صلاحية)
10. `payroll.*` (7 صلاحيات)
11. `manufacturing.*` (18 صلاحية)
12. `settings.*` (2 صلاحية)
13. `audit.*` (1 صلاحية)
14. `notifications.*` (1 صلاحية)

*(ملاحظة: نطاق `system.*` لا يحتوي على أي صلاحيات مخزنة في قاعدة البيانات؛ الوصول إلى وحدة النظام ولوحة إدارة النظام role-based عبر دور SystemOwner فقط).*

## 4. كتالوج سير العمل (Workflow Catalog)

إجمالي دورات العمل الرئيسية الموثقة: 26

1. Customer Sale
2. Sales Collection
3. Sales Return
4. Supplier Purchase
5. Supplier Payment
6. Purchase Return
7. Customer Receipt
8. Supplier Payment from Parties
9. Treasury Cash In
10. Treasury Cash Out
11. Treasury Transfer
12. Expense Posting
13. Party Opening Balance
14. Party Settlement
15. Inventory Opening Balance
16. Manual Inventory Adjustment
17. Customer Material Intake
18. Payroll Run
19. Payroll Payment
20. Payroll Reversal
21. Company-Owned Manufacturing
22. Customer-Owned Manufacturing
23. Accounting Manual Journal
24. Period Close/Reopen
25. Fiscal Rollover
26. Year-End Close

## 5. الاعتماديات بين الوحدات (Cross-Module Dependencies)

| الوحدة المصدر | تعتمد على | السبب (Direct / Reference) |
|---------------|-----------|----------------------------|
| Sales | Parties, Inventory, Accounting, Treasury | العميل، سحب المخزون، قيد الاستحقاق، التحصيل (Direct) |
| Purchases | Parties, Inventory, Accounting, Treasury | المورد، إيداع المخزون، الاستحقاق، الدفع (Direct) |
| Treasury | Parties, Accounting | حسابات الجهات للقبض/الدفع، القيد المحاسبي المباشر (Direct) |
| Expenses | Treasury, Accounting | الدفع من الخزينة، تسجيل المصروف المحاسبي (Direct) |
| Inventory | Parties | معرفة مالك المخزون (Reference) |
| Payroll | Labor, Treasury, Accounting | العمال والحركات، الدفع المباشر، القيد المحاسبي (Direct) |
| Manufacturing | Inventory, Parties | حركات استلام وصرف المواد، مالك أمر التصنيع (Direct) |

## 6. القيود التنفيذية المؤكدة (Verified Product Limitations)

هذه الميزات لا تمثل أخطاء برمجية (Bugs) بل هي حدود القدرة الحالية للمنتج:

* **غياب نظام البصمة المستقل:** لا توجد شاشة لتسجيل الدخول والانصراف اليومي، ويسجل الغياب عبر الحركات الشهرية.
* **التحصيل الجزئي للمبيعات:** شاشة المبيعات تدفع كامل المبلغ، بينما الدفع الجزئي يتم عبر وحدة الخزينة.
* **تحذير أرصدة الرواتب:** وحدة الرواتب لا تحترم صلاحية AllowNegativeBalance بل تتطلب رصيداً كافياً حتمياً للصرف.
* **إلغاء حركات التصنيع:** غير متاح بشكل مستقل للمستخدم، ويتم فقط ضمناً عند إلغاء الأمر بالكامل.
* **تقارير وتكاليف التصنيع الإضافية:** شاشات أعباء الإنتاج وتقارير WIP والتكاليف لا تزال Backend Only.

## 7. تراكم شاشات التوثيق والتحقق البصري (Reconciled Visual Checkpoints)

إجمالي نقاط التحقق البصري المعتمدة: 156 (155 إجراء SOP + شاشة لوحة تحكم التصنيع قيد التنفيذ)

تمت التسوية والاعتماد وفق سجل أدلة الجودة التاريخية (Phase 18 Evidence Reconciliation) إلى 3 فئات مانعة للجمع:
* **أدلة بصرية تاريخية مباشرة (Historical Visual QA Evidence):** 24 نقطة فحص
* **أدلة جودة تاريخية غير بصرية (Existing Non-Visual QA Evidence):** 104 نقاط فحص
* **غير معاد التحقق منها بصرياً في المرحلة الحالية (Not Visually Re-Verified):** 28 نقطة فحص
* **المجموع المطابق:** 24 + 104 + 28 = 156

## 8. حالة أدلة المستخدم (User Manual Index)

| الملف (Chapter) | الحالة التحليلية (Static Review) | حالة التحقق البصري (Visual Evidence Status) |
|-----------------|----------------------------------|--------------------------------------------|
| 01-getting-started-and-administration.md | COMPLETE | RECONCILED (EXISTING QA EVIDENCE) |
| 02-parties.md | COMPLETE | RECONCILED (EXISTING QA EVIDENCE) |
| 03-inventory.md | COMPLETE | RECONCILED (EXISTING QA EVIDENCE) |
| 04-treasury.md | COMPLETE | RECONCILED (EXISTING QA EVIDENCE) |
| 05-expenses.md | COMPLETE | RECONCILED (EXISTING QA EVIDENCE) |
| 06-purchases.md | COMPLETE | RECONCILED (EXISTING QA EVIDENCE) |
| 07-sales.md | COMPLETE | RECONCILED (EXISTING QA EVIDENCE) |
| 08-accounting.md | COMPLETE | RECONCILED (EXISTING QA EVIDENCE) |
| 09-labor.md | COMPLETE | RECONCILED (EXISTING QA EVIDENCE) |
| 10-payroll.md | COMPLETE | RECONCILED (EXISTING QA EVIDENCE) |
| 11-manufacturing.md | COMPLETE | RECONCILED (EXISTING QA EVIDENCE) |

جميع المسارات التنفيذية مغطاة بالكامل ولا توجد مسارات يتيمة أو شاشات مفقودة في الأدلة.
