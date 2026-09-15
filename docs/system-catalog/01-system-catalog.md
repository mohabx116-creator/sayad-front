# دليل المستخدم: كتالوج النظام الشامل (Exhaustive System Catalog)

## 1. إحصائيات النظام (System Metrics)

* إجمالي وحدات العمل / المجالات الوظيفية: 16 (Dashboard, Notifications, Account/Auth, Settings, Administration, System, Parties, Inventory, Treasury, Expenses, Purchases, Sales, Accounting, Labor, Payroll, Manufacturing)
* مجموعات التنقل الجانبية (Navigation Groups): 12 (Dashboard, Parties, Inventory, Purchases, Sales, Treasury, Expenses, Labor (incl. Payroll), Accounting, Manufacturing, Administration, System)
* المسارات القابلة للتنقل (Navigable Routes): 142
* الشاشات الفريدة للمستخدم: 136
* مسارات إعادة التوجيه (Redirects): 5
* شاشات الـ Placeholders (قيد التنفيذ): 1 (Manufacturing Dashboard)

## 2. كتالوج التقارير ولوحات التحكم (Report & Dashboard Census)

* إجمالي القطع التحليلية والتقارير: 18
* تقارير واجهة المستخدم: 12 (General Ledger, Trial Balance, Income Statement, Balance Sheet, Cash Flow, Customer Receivables Aging, Supplier Payables Aging, Purchase Invoices Report, Receipts & Payments, Sales Customer Item Analysis, Sales Profitability, Worker Salary Report)
* شاشات التحليل والمطابقة: 2 (Treasury GL Reconciliation, Inventory GL Reconciliation)
* تقارير في الـ Backend فقط: 2 (Manufacturing Cost Analysis, Manufacturing WIP)
* لوحات تحكم للمستخدم: 2 (System Dashboard, Dashboard Default)
* لوحات تحكم Placeholders: 1 (Manufacturing Dashboard)

## 3. كتالوج الصلاحيات (Permission Domain Census)

إجمالي النطاقات: 14

* `administration.*`
* `system.*`
* `parties.*`
* `inventory.*`
* `purchases.*`
* `sales.*`
* `treasury.*`
* `expenses.*`
* `accounting.*`
* `workers.*`
* `monthly-movements.*`
* `payroll.*`
* `operational-jobs.*`
* `operations.*`
* `manufacturing.*`

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

## 7. تراكم شاشات التوثيق البصري (Screenshot Placeholders)

إجمالي العدد: 171

* 01-getting-started-and-administration.md (35)
* 02-parties.md (13)
* 03-inventory.md (16)
* 04-treasury.md (30)
* 05-expenses.md (9)
* 06-purchases.md (9)
* 07-sales.md (7)
* 08-accounting.md (30)
* 09-labor.md (7)
* 10-payroll.md (6)
* 11-manufacturing.md (9)

لا توجد معرّفات مكررة (No duplicate screenshot IDs).

## 8. حالة أدلة المستخدم (User Manual Index)

| الملف (Chapter) | الحالة (Static Review) | المراجعة البصرية (Visual Review) |
|-----------------|------------------------|--------------------------------|
| 01-getting-started.md | COMPLETE | PENDING |
| 02-parties.md | COMPLETE | PENDING |
| 03-inventory.md | COMPLETE | PENDING |
| 04-treasury.md | COMPLETE | PENDING |
| 05-expenses.md | COMPLETE | PENDING |
| 06-purchases.md | COMPLETE | PENDING |
| 07-sales.md | COMPLETE | PENDING |
| 08-accounting.md | COMPLETE | PENDING |
| 09-labor.md | COMPLETE | PENDING |
| 10-payroll.md | COMPLETE | PENDING |
| 11-manufacturing.md | COMPLETE | PENDING |

جميع المسارات التنفيذية مغطاة ولا توجد مسارات يتيمة أو شاشات مفقودة في الأدلة.
