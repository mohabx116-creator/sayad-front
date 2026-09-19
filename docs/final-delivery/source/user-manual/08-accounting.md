# دليل المستخدم: وحدة المحاسبة (Accounting)

تُعدّ وحدة المحاسبة العمود الفقري لنظام SAYAD. تتلقى قيوداً محاسبية تلقائية من جميع الوحدات (المبيعات، المشتريات، المخزون، الخزينة، المصروفات، الرواتب، التصنيع)، وتوفر كذلك إمكانية إنشاء قيود يدوية. تتيح الوحدة إدارة دليل الحسابات، الربط المحاسبي، الفترات المالية، السنوات المالية، القوائم المالية، والتقارير التحليلية.

---

## 1. دليل الحسابات (Chart of Accounts)

### شاشة قائمة دليل الحسابات
* **المسار:** `/accounting/chart-of-accounts`
* **الصلاحيات المطلوبة:** `accounting.accounts.view`
* **الإجراءات المتاحة:** إنشاء حساب جديد، عرض التفاصيل، تعديل، تفعيل/تعطيل، حذف.

### شاشة إنشاء/تعديل حساب
* **إنشاء:** `/accounting/chart-of-accounts/new`
* **تعديل:** `/accounting/chart-of-accounts/:id/edit`
* **الصلاحيات المطلوبة:** `accounting.accounts.create` / `accounting.accounts.update`

#### حقول النموذج المعروضة للمستخدم

| الحقل | إلزامي | ملاحظة |
|-------|--------|---------|
| Code (الرمز) | نعم | فريد في النظام |
| NameArabic (الاسم العربي) | نعم | - |
| NameEnglish (الاسم الإنجليزي) | لا | - |
| AccountType (نوع الحساب) | نعم | أحد الأنواع الخمسة |
| ParentId (الحساب الأب) | لا | يحدد موقع الحساب في التسلسل الهرمي |
| IsPosting (حساب ترحيل) | نعم | false = حساب تجميعي، لا يُستخدم في قيود مباشرة |
| IsActive (نشط) | نعم | يؤثر على إمكانية الاستخدام |
| CashFlowActivityType | نعم | Operating / Investing / Financing / Excluded / Unclassified |
| Description (ملاحظات) | لا | - |

> ملاحظة: حقل IsSystem يُعيَّن من النظام فقط ولا يظهر كحقل قابل للتعديل في النموذج.

#### أنواع الحسابات وطبيعتها

| النوع | الاسم العربي | الطبيعة الطبيعية |
|-------|-------------|-----------------|
| Asset | الأصول | مدين (Debit) |
| Liability | الالتزامات | دائن (Credit) |
| Equity | حقوق الملكية | دائن (Credit) |
| Revenue | الإيرادات | دائن (Credit) |
| Expense | المصروفات | مدين (Debit) |

### شاشة تفاصيل حساب
* **المسار:** `/accounting/chart-of-accounts/:id`
* **الصلاحيات المطلوبة:** `accounting.accounts.view`
* **الإجراءات المتاحة:** تعديل، تفعيل/تعطيل، حذف، إنشاء حساب فرعي.

#### حذف الحساب (Delete)
* حذف فعلي (Hard Delete) من قاعدة البيانات.
* **يُرفض الحذف إذا:**
  * الحساب يحتوي حسابات فرعية (أبناء).
  * الحساب مرتبط بقيود محاسبية.
  * الحساب مرتبط بإعدادات الربط المحاسبي.
  * الحساب من نوع نظام (IsSystem=true).

#### تعطيل الحساب (Deactivate)
* **يُرفض التعطيل إذا:**
  * الحساب له أبناء نشطون.
  * الحساب مرتبط بإعدادات الربط المحاسبي.
* الحسابات ذات الأرصدة يمكن تعطيلها من الناحية التقنية، لكن لا يمكن استخدامها في قيود جديدة.

---

## 2. إعدادات الربط المحاسبي (Accounting Settings / Mappings)

### شاشة الإعدادات
* **المسار:** `/accounting/settings`
* **الصلاحيات المطلوبة:** عرض: `accounting.settings.view` — تعديل: `accounting.settings.update`

#### مفاتيح الربط المحاسبي (18 ربط)
عند حفظ الإعدادات، يتحقق النظام من أن جميع الـ18 ربطاً مكتملة في نفس الوقت، وكل حساب يكون:
1. غير فارغ (AccountId مطلوب لجميع المفاتيح).
2. نشطاً (IsActive = true).
3. حساب ترحيل (IsPosting = true).
4. من النوع الصحيح المحدد لكل ربط.

| مفتاح الربط | الوصف | نوع الحساب المطلوب |
|------------|-------|-------------------|
| CustomerControl | مراقبة العملاء | Asset |
| SupplierControl | مراقبة الموردين | Liability |
| SalesRevenue | إيرادات المبيعات | Revenue |
| SalesReturns | مردودات المبيعات | Revenue |
| InventoryAsset | أصل المخزون | Asset |
| OpeningBalanceEquity | رصيد افتتاحي — حقوق الملكية | Equity |
| RetainedEarnings | الأرباح المحتجزة | Equity |
| CostOfGoodsSold | تكلفة البضاعة المباعة | Expense |
| PayrollExpense | مصروف الرواتب | Expense |
| CustomerDiscountsAllowed | خصومات العملاء الممنوحة | Expense |
| CustomerAdjustmentRevenue | إيرادات تسوية العملاء | Revenue |
| SupplierDiscountsReceived | خصومات الموردين المكتسبة | Revenue |
| SupplierAdjustmentExpense | مصروف تسوية الموردين | Expense |
| ManufacturingWorkInProgress | إنتاج تحت التشغيل (WIP) | Asset |
| ManufacturingLaborApplied | أجور مُطبَّقة على التصنيع | Expense |
| ManufacturingOverheadApplied | تكاليف غير مباشرة مطبقة | Expense |
| ManufacturingScrapExpense | مصروف خردة التصنيع | Expense |
| ManufacturingTollingRevenue | إيراد تصنيع العملاء | Revenue |

---

## 3. القيود اليومية (Journal Entries)

### دورة حياة القيد المحاسبي

```
Draft → Posted → Cancelled (ويُنشأ قيد عكسي Posted مستقل)
Draft → Deleted (حذف فعلي)
```

| الحالة | قابل للتعديل | قابل للترحيل | قابل للإلغاء | قابل للحذف | نهائي |
|--------|-------------|-------------|-------------|-----------|-------|
| Draft | نعم | نعم | لا | نعم | لا |
| Posted | لا | لا | نعم (بسبب) | لا | لا |
| Cancelled | لا | لا | لا | لا | نعم |

#### آلية الإلغاء (Cancel) بالتفصيل
عند إلغاء قيد مرحل يدوي:
1. يُنشئ النظام **قيداً جديداً عكسياً** يعكس جميع المدينات والدائنات تلقائياً بتاريخ اليوم.
2. يُرحَّل القيد العكسي فوراً (Status = Posted).
3. يُكتب على القيد الأصلي حالة **Cancelled** ويُسجَّل رقم القيد العكسي.
4. القيد الأصلي يبقى Cancelled، والقيد العكسي يظهر في القائمة بحالة Posted.
5. يشترط أن **لا يكون القيد قد عُكس مسبقاً**.
6. يشترط أن **يكون تاريخ القيد العكسي في فترة مفتوحة**.

#### قيود النظام (System-Generated)
* لا يمكن إلغاؤها يدوياً من شاشة القيود (مرفوض ببلاغ خطأ).
* لا يمكن تعديلها أو حذفها.
* يتم عكسها فقط عبر إلغاء المستند المصدر في وحدته الأصلية.

#### حذف قيد Draft
* حذف فعلي (Hard Delete) مع جميع بنوده.
* يُرفض حذف قيود النظام حتى في حالة Draft.

### شاشة قائمة القيود
* **المسار:** `/accounting/journal-entries`
* **الصلاحيات المطلوبة:** `accounting.journal-entries.view`

### شاشة إنشاء/تعديل قيد يدوي
* **إنشاء:** `/accounting/journal-entries/new`
* **تعديل:** `/accounting/journal-entries/:id/edit`
* **الصلاحيات المطلوبة:** `accounting.journal-entries.create` / `accounting.journal-entries.update`

#### حقول القيد اليدوي المعروضة للمستخدم

| الحقل | إلزامي | ملاحظة |
|-------|--------|---------|
| EntryDate (تاريخ القيد) | نعم | يُحدد الفترة المحاسبية |
| DescriptionArabic | لا | - |
| DescriptionEnglish | لا | - |
| Lines (بنود القيد) | نعم | حد أدنى بندان |

لكل بند:

| الحقل | إلزامي | ملاحظة |
|-------|--------|---------|
| AccountId (الحساب) | نعم | حساب ترحيل نشط فقط |
| DebitAmount (مدين) | لا | صفر أو أكبر |
| CreditAmount (دائن) | لا | صفر أو أكبر |
| DescriptionArabic | لا | - |
| DescriptionEnglish | لا | - |

> لا يوجد حقل Reference أو Cost Center أو Attachments في النموذج الحالي.

### شاشة تفاصيل قيد
* **المسار:** `/accounting/journal-entries/:id`
* **الصلاحيات المطلوبة:** `accounting.journal-entries.view`

#### القيود اليدوية مقابل قيود النظام

| الخاصية | قيد يدوي | قيد نظام |
|---------|---------|---------|
| IsSystemGenerated | false | true |
| منشئ بواسطة | المستخدم | الوحدة المصدر |
| قابل للتعديل | نعم (Draft فقط) | لا |
| قابل للإلغاء يدوياً | نعم (Posted) | لا |
| رابط المستند المصدر | لا | نعم |
| يُعكس بـ | إلغاء يدوي (ينشئ قيداً عكسياً) | إلغاء المستند المصدر |

---

## 4. الفترات المحاسبية والسنوات المالية

### شاشة الفترات والسنوات المالية
* **المسار:** `/accounting/periods`
* **الصلاحيات المطلوبة:** `accounting.periods.view`

### إنشاء سنة مالية جديدة
* **الصلاحية:** `accounting.periods.manage`
* **الحقول:** NameArabic، NameEnglish، StartDate، EndDate، PeriodCount.
* يُنشئ النظام الفترات تلقائياً. تبدأ جميع الفترات بحالة **مفتوحة (Open)** تلقائياً.
* لا يوجد إجراء "فتح فترة" مستقل من قِبل المستخدم — الفترات مفتوحة بحكم الإنشاء.

### إغلاق فترة (Close Period)
* **الصلاحية:** `accounting.periods.manage`
* يتطلب سبباً (Reason).
* تصبح الفترة مغلقة — لا يُسمح بترحيل أي مستند بتاريخ يقع فيها في أي وحدة.

### إعادة فتح فترة (Reopen Period)
* **الصلاحية:** `accounting.periods.reopen`
* يتطلب سبباً.

### ضبط التحكم بالفترات (Period Control)
* تفعيل أو تعطيل آلية التحقق من الفترات على مستوى النظام بالكامل.

#### تأثير إغلاق الفترة على الوحدات
إغلاق الفترة يحظر الترحيل في: المبيعات، المشتريات، المخزون، الخزينة، المصروفات، الرواتب، التصنيع.

---

## 5. السنوات المالية والإغلاق

### Fiscal Year Rollover مقابل Year-End Close

هذان **إجراءان منفصلان ومستقلان** ولا يُعدّان بديلاً عن بعضهما:

| | Fiscal Rollover | Year-End Close |
|--|----------------|----------------|
| الغرض | ترحيل الأرصدة إلى سنة مالية جديدة | إغلاق حسابات الدخل/المصروف وترحيل الأرباح |
| ينشئ سنة جديدة؟ | نعم | لا |
| ينقل أرصدة الميزانية؟ | نعم | لا |
| يغلق حسابات الدخل/المصروف؟ | نعم (ضمن العملية) | نعم |
| يُصدر قيداً يدوياً؟ | نعم (أرصدة افتتاحية) | نعم (قيد إقفال إلى RetainedEarnings) |
| يشترط إغلاق الفترات؟ | نعم (جميع الفترات) | نعم (جميع الفترات) |
| مسار الشاشة | `/accounting/fiscal-years/:id/rollover` | `/accounting/year-end-closing` |

### Fiscal Year Rollover
* **الصلاحية:** `accounting.fiscal-years.rollover`
* **شروط CanRollOver:** جميع الفترات مغلقة، لا قيود Draft، لم يُنفَّذ ترحيل نشط.
* **ما يفعله:** ينقل أرصدة الميزانية إلى أرصدة افتتاحية للسنة الجديدة، يُغلق حسابات الإيراد والمصروف إلى Retained Earnings، يُنشئ السنة المالية الجديدة وفتراتها.

### Rollback (التراجع عن الترحيل)
* **الصلاحية:** `accounting.fiscal-years.rollback`
* يتطلب سبباً.
* يُلغي السنة الجديدة الناتجة ويعكس ترحيل الأرصدة.
* **محظور إذا:**
  * تم تنفيذ Year-End Close على السنة الجديدة.
  * تمت معاملات في السنة الجديدة.

### Year-End Close (إغلاق نهاية السنة)
* **المسار:** `/accounting/year-end-closing`
* **الصلاحيات:** `accounting.year-end.view` / `accounting.year-end.close` / `accounting.year-end.reopen`
* **شروط CanClose:** جميع الفترات مغلقة، لا قيود Draft.
* **ما يفعله:** يُصدر قيداً يُحوّل الإيرادات والمصروفات إلى حساب الأرباح المحتجزة (RetainedEarnings). يعرض معاينة قبل التنفيذ (PreviewLines).

### Year-End Reopen (إعادة فتح السنة)
* **الصلاحية:** `accounting.year-end.reopen`. يتطلب سبباً.
* يعكس قيد الإغلاق. لا يُعيد فتح الفترات تلقائياً.

---

## 6. التقارير المالية

جميع التقارير تستخدم صلاحية موحدة: **`accounting.reports.view`**

### دفتر الأستاذ العام (General Ledger)
* **المسار:** `/accounting/reports/general-ledger`
* **الفلاتر:** AccountId (مطلوب)، FromDate، ToDate، IncludeDescendants، الصفحات.
* **الأعمدة:** EntryNumber، EntryDate، SourceType، DebitAmount، CreditAmount، RunningBalance، Description.
* **OpeningBalance:** محسوب تلقائياً من كل القيود قبل تاريخ البداية.

### ميزان المراجعة (Trial Balance)
* **المسار:** `/accounting/reports/trial-balance`
* **الفلاتر:** FromDate، ToDate.
* **الأعمدة:** الحساب، AccountType، NormalBalance، رصيد الافتتاح، مدين الفترة، دائن الفترة، الرصيد الختامي.

### قائمة الدخل (Income Statement)
* **المسار:** `/accounting/reports/income-statement`
* **الفلاتر:** FromDate، ToDate.
* **المحتوى:** يجمع حسابات Revenue والـ Expense وينتج صافي الربح/الخسارة.

### الميزانية العمومية (Balance Sheet)
* **المسار:** `/accounting/reports/balance-sheet`
* **الفلاتر:** AsOfDate.
* **المحتوى:** Asset، Liability، Equity.

### قائمة التدفقات النقدية (Cash Flow)
* **المسار:** `/accounting/reports/cash-flow`
* **الفلاتر:** FromDate، ToDate.
* **التصنيف:** بناءً على CashFlowActivityType (Operating / Investing / Financing / Excluded / Unclassified) لكل حساب.

---

## 7. تقارير التسوية (Reconciliation Reports)

### تسوية الخزينة مع الأستاذ (Treasury GL Reconciliation)
* **المسار:** `/accounting/reports/treasury-gl-reconciliation`
* **يُظهر:** الرصيد التشغيلي للخزينة، رصيد الأستاذ المحاسبي المرتبط بها، الفارق.

### تسوية المخزون مع الأستاذ (Inventory GL Reconciliation)
* **المسار:** `/accounting/reports/inventory-gl-reconciliation`
* **يُظهر:** القيمة التشغيلية للمخزون، رصيد الأستاذ المحاسبي لحساب المخزون، الفارق.

> شرائح التقادم والأعمدة التفصيلية للتسوية تتطلب تحقق بصري (LIVE VERIFICATION REQUIRED).

---

## 8. تقارير التقادم (Aging Reports)

### تقادم الذمم المدينة (Customer Receivables Aging)
* **المسار:** `/accounting/reports/customer-receivables-aging`
* **الفلاتر:** AsOfDate، تصفية حسب عميل.

### تقادم الذمم الدائنة (Supplier Payables Aging)
* **المسار:** `/accounting/reports/supplier-payables-aging`
* **الفلاتر:** AsOfDate، تصفية حسب مورد.

> شرائح التقادم الزمني (buckets) تتطلب تحقق بصري من الشاشة الفعلية (LIVE VERIFICATION REQUIRED).

---

## 9. التقارير متعددة الوحدات

### تقرير فواتير المشتريات (Purchase Invoices Report)
* **المسار:** `/accounting/reports/purchase-invoices`

### تقرير المقبوضات والمدفوعات (Receipts & Payments Report)
* **المسار:** `/accounting/reports/receipts-payments`

### تحليل مبيعات الأصناف للعملاء (Sales Customer Item Analysis)
* **المسار:** `/accounting/reports/sales-customer-item-analysis`
* **الفلاتر:** DateFrom، DateTo، CurrencyCode، بحث.
* **الأعمدة:** تحليل لكل عميل، تحليل لكل صنف، إجمالي المبيعات بالعملة.

### ربحية المبيعات (Sales Profitability)
* **المسار:** `/accounting/reports/sales-profitability`

> التصدير والطباعة (Export/Print) لجميع التقارير تتطلب تحقق بصري (LIVE VERIFICATION REQUIRED).

---

## 10. القيود الآلية من الوحدات الأخرى (System-Generated Journals)

لا يمكن تعديل قيود النظام يدوياً ولا إلغاؤها — عكسها يتم فقط عبر إلغاء المستند المصدر.

| المصدر | الحدث | مدين | دائن | متحقق من الكود |
|--------|------|------|------|---------------|
| Parties — افتتاحية عميل | رصيد افتتاحي | CustomerControl | OpeningBalanceEquity | نعم |
| Parties — افتتاحية مورد | رصيد افتتاحي | OpeningBalanceEquity | SupplierControl | نعم |
| Sales Invoice Post | إيراد | CustomerControl | SalesRevenue | نعم |
| Sales Invoice Post | تكلفة | CostOfGoodsSold | InventoryAsset | نعم |
| Sales Collection (Direct) | تسوية نقدية | حساب الخزينة (GL) | CustomerControl | نعم |
| Sales Return Post | عكس إيراد | SalesReturns | CustomerControl | نعم |
| Sales Return Post | عكس تكلفة | InventoryAsset | CostOfGoodsSold | نعم |
| Purchase Invoice Post | استلام بضاعة | InventoryAsset | SupplierControl | نعم |
| Purchase Payment | دفع مورد | SupplierControl | حساب الخزينة (GL) | نعم |
| Purchase Return Post | عكس استلام | SupplierControl | InventoryAsset | نعم |
| Expense Post | مصروف | حساب المصروف (GL) | حساب الخزينة (GL) | نعم — Treasury فقط |
| Treasury — قبض | استلام نقد | حساب الخزينة (GL) | CustomerControl أو حساب محدد | نعم |
| Treasury — صرف | دفع نقد | حساب محدد | حساب الخزينة (GL) | نعم |
| Treasury — تحويل | تحويل بين خزائن | الخزينة المستلمة (GL) | الخزينة المصدرة (GL) | نعم |
| Year-End Close | إقفال الأرباح | Revenue + Expense | RetainedEarnings | نعم |
| Payroll Post | مصروف راتب | PayrollExpense | حساب مقابل (يُوثَّق في فصل الرواتب) | جزئي |
| Manufacturing — صرف مواد (Company) | تقييم بتكلفة متوسطة | حركات المخزون (LegacyNotPosted) | (No GL Journal Created) | نعم |
| Manufacturing — صرف مواد (Customer) | تقييم صفر (0) | حركات المخزون (NotApplicable) | (No GL Journal Created) | نعم |
| Manufacturing — استلام إنتاج | إدخال مخزون | حركات المخزون (LegacyNotPosted) | (No GL Journal Created) | نعم |
| Manufacturing — عمالة ومصاريف | تحميل تكاليف تشغيلية | تكاليف مجمعة بالأمر | (No GL Journal Created) | نعم |

> **تحديث التصنيع:** في التطبيق الحالي، تُسجل عمليات التصنيع كحركات مخزون وتكاليف تشغيلية، لكن وحدة التصنيع لا تُنشئ قيود يومية مباشرة لـ WIP أو تكلفة الإنتاج. حركات المواد/الإنتاج المملوكة للشركة تحمل حالة LegacyNotPosted، بينما المواد المملوكة للعميل لا تحمل قيمة مالية محاسبية.

---

## 11. جدول الاتساق مع الأدلة السابقة

| الموضوع | ما يقوله دليل المحاسبة | ما يقوله الدليل المرجعي | متسق؟ |
|---------|----------------------|------------------------|-------|
| قيمة صرف المبيعات (COGS) | متوسط التكلفة المجمد وقت الترحيل | 07-sales.md: نفس القيمة | نعم |
| تكلفة مرتجع المبيعات | تكلفة الحركة الأصلية المجمدة | 07-sales.md: ResolveSalesReturn | نعم |
| قيد المصروف | مدين حساب المصروف، دائن حساب الخزينة | 05-expenses.md: خزينة فقط | نعم |
| قيد فاتورة الشراء | مدين المخزون، دائن SupplierControl | 06-purchases.md: نفسه | نعم |
| قيد مرتجع الشراء | مدين SupplierControl، دائن المخزون | 06-purchases.md: نفسه | نعم |
| تحصيل المبيعات (Direct) | مدين الخزينة GL، دائن CustomerControl | 07-sales.md: نفسه | نعم |
| تحويل الخزينة | مدين الخزينة المستلمة، دائن الخزينة المصدرة | 04-treasury.md: نفسه | نعم |
| قيمة المخزون | Moving Average Cost | 03-inventory.md: نفسه | نعم |
| دفع المورد (Purchase Payment) | مدين SupplierControl، دائن الخزينة | 06-purchases.md: نفسه | نعم |

**لا توجد تعارضات — جميع الصفوف متسقة.**

---

## 12. الصلاحيات المحاسبية الدقيقة (24 صلاحية)

| كود الصلاحية | الوصف |
|-------------|-------|
| `accounting.view` | عرض موديول المحاسبة |
| `accounting.accounts.view` | عرض دليل الحسابات |
| `accounting.accounts.create` | إنشاء حسابات |
| `accounting.accounts.update` | تعديل حسابات |
| `accounting.accounts.activate` | تفعيل حساب |
| `accounting.accounts.deactivate` | تعطيل حساب |
| `accounting.accounts.delete` | حذف حساب |
| `accounting.settings.view` | عرض إعدادات الربط |
| `accounting.settings.update` | تعديل إعدادات الربط |
| `accounting.periods.view` | عرض الفترات والسنوات |
| `accounting.periods.manage` | إغلاق الفترات وإنشاء السنوات |
| `accounting.periods.reopen` | إعادة فتح الفترات |
| `accounting.fiscal-years.rollover` | تنفيذ Rollover |
| `accounting.fiscal-years.rollback` | التراجع عن Rollover |
| `accounting.year-end.view` | عرض شاشة إغلاق السنة |
| `accounting.year-end.close` | إغلاق السنة المالية |
| `accounting.year-end.reopen` | إعادة فتح السنة المالية |
| `accounting.reports.view` | عرض جميع التقارير |
| `accounting.journal-entries.view` | عرض القيود |
| `accounting.journal-entries.create` | إنشاء قيد يدوي |
| `accounting.journal-entries.update` | تعديل قيد Draft |
| `accounting.journal-entries.post` | ترحيل قيد |
| `accounting.journal-entries.cancel` | إلغاء قيد مرحل |
| `accounting.journal-entries.delete` | حذف قيد Draft |

---

## 13. مصفوفة قواعد العمل

| القاعدة | الحكم |
|--------|-------|
| قيد غير متوازن عند الترحيل | BLOCKED |
| قيد في فترة مغلقة | BLOCKED |
| حساب غير نشط في القيد | BLOCKED |
| حساب تجميعي في القيد | BLOCKED |
| تعديل قيد مرحل | BLOCKED |
| حذف قيد مرحل | BLOCKED |
| حذف قيد Draft | ALLOWED |
| إلغاء قيد مرحل يدوي | ALLOWED (مع سبب + ينشئ قيداً عكسياً) |
| إلغاء قيد نظام يدوياً | BLOCKED |
| حذف حساب له أبناء | BLOCKED |
| حذف حساب به قيود | BLOCKED |
| حذف حساب مرتبط بإعدادات | BLOCKED |
| حذف حساب نظام (IsSystem) | BLOCKED |
| تعطيل حساب له أبناء نشطون | BLOCKED |
| تعطيل حساب مرتبط بإعدادات | BLOCKED |
| تداخل السنوات المالية | BLOCKED |
| Rollover بفترات مفتوحة | BLOCKED |
| Rollover بقيود Draft | BLOCKED |
| Rollover مرتين (بدون Rollback) | BLOCKED |
| Year-End بفترات مفتوحة | BLOCKED |
| Year-End بقيود Draft | BLOCKED |
| إعادة فتح سنة مغلقة | ALLOWED (مع سبب) |
| Rollback بعد Year-End على السنة الجديدة | BLOCKED |

---

## 14. مصفوفة الإجراءات (Procedures)

| رمز | الإجراء | الحالة |
|-----|---------|--------|
| A | إنشاء حساب في دليل الحسابات | IMPLEMENTED AND USER-EXPOSED |
| B | إنشاء حساب فرعي | IMPLEMENTED AND USER-EXPOSED |
| C | تعديل حساب | IMPLEMENTED AND USER-EXPOSED |
| D | تفعيل/تعطيل حساب | IMPLEMENTED AND USER-EXPOSED |
| E | حذف حساب | IMPLEMENTED AND USER-EXPOSED |
| F | إعداد الربط المحاسبي | IMPLEMENTED AND USER-EXPOSED |
| G | إنشاء قيد يدوي | IMPLEMENTED AND USER-EXPOSED |
| H | تعديل قيد Draft | IMPLEMENTED AND USER-EXPOSED |
| I | ترحيل قيد | IMPLEMENTED AND USER-EXPOSED |
| J | إلغاء قيد مرحل (ينشئ قيداً عكسياً) | IMPLEMENTED AND USER-EXPOSED |
| K | حذف قيد Draft | IMPLEMENTED AND USER-EXPOSED |
| L | إنشاء سنة مالية | IMPLEMENTED AND USER-EXPOSED |
| M | إغلاق فترة محاسبية | IMPLEMENTED AND USER-EXPOSED |
| N | إعادة فتح فترة | IMPLEMENTED AND USER-EXPOSED |
| O | تنفيذ Fiscal Rollover | IMPLEMENTED AND USER-EXPOSED |
| P | التراجع عن Rollover | IMPLEMENTED AND USER-EXPOSED |
| Q | تنفيذ Year-End Close | IMPLEMENTED AND USER-EXPOSED |
| R | إعادة فتح السنة المالية | IMPLEMENTED AND USER-EXPOSED |
| S | مراجعة General Ledger | IMPLEMENTED AND USER-EXPOSED |
| T | مراجعة Trial Balance | IMPLEMENTED AND USER-EXPOSED |
| U | مراجعة Income Statement | IMPLEMENTED AND USER-EXPOSED |
| V | مراجعة Balance Sheet | IMPLEMENTED AND USER-EXPOSED |
| W | مراجعة Cash Flow | IMPLEMENTED AND USER-EXPOSED |
| X | مراجعة Treasury GL Reconciliation | IMPLEMENTED AND USER-EXPOSED |
| Y | مراجعة Inventory GL Reconciliation | IMPLEMENTED AND USER-EXPOSED |
| Z | مراجعة Customer Receivables Aging | IMPLEMENTED AND USER-EXPOSED |
| AA | مراجعة Supplier Payables Aging | IMPLEMENTED AND USER-EXPOSED |
| AB | مراجعة Purchase Invoices Report | IMPLEMENTED AND USER-EXPOSED |
| AC | مراجعة Receipts & Payments Report | IMPLEMENTED AND USER-EXPOSED |
| AD | مراجعة Sales Customer Item Analysis | IMPLEMENTED AND USER-EXPOSED |
| AE | مراجعة Sales Profitability | IMPLEMENTED AND USER-EXPOSED |

---

## 15. قائمة الصور التوضيحية (Screenshot Checklist)

| المعرف | الشاشة | المسار | يتطلب |
|--------|--------|--------|--------|
| ACC-DASHBOARD-001 | لوحة المحاسبة | /accounting | تخطيط عام AR/EN |
| ACC-COA-001 | دليل الحسابات | /accounting/chart-of-accounts | عرض شجري، الأعمدة |
| ACC-ACCOUNT-CREATE-001 | إنشاء حساب | /accounting/chart-of-accounts/new | النموذج الكامل |
| ACC-ACCOUNT-DETAIL-001 | تفاصيل حساب | /accounting/chart-of-accounts/:id | التفاصيل والأبناء |
| ACC-ACCOUNT-EDIT-001 | تعديل حساب | /accounting/chart-of-accounts/:id/edit | النموذج |
| ACC-MAPPINGS-001 | إعدادات الربط | /accounting/settings | جميع الـ18 ربط |
| ACC-JOURNALS-001 | قائمة القيود | /accounting/journal-entries | الفلاتر، الأعمدة |
| ACC-JOURNAL-CREATE-001 | إنشاء قيد | /accounting/journal-entries/new | النموذج |
| ACC-JOURNAL-POST-001 | ترحيل قيد | /accounting/journal-entries/:id | حوار التأكيد |
| ACC-JOURNAL-CANCEL-001 | إلغاء قيد | /accounting/journal-entries/:id | حوار السبب، القيد العكسي |
| ACC-PERIODS-001 | الفترات والسنوات | /accounting/periods | قائمة السنوات والفترات |
| ACC-PERIOD-CLOSE-001 | إغلاق فترة | /accounting/periods | حوار الإغلاق |
| ACC-PERIOD-REOPEN-001 | إعادة فتح فترة | /accounting/periods | حوار إعادة الفتح |
| ACC-ROLLOVER-001 | Fiscal Rollover | /accounting/fiscal-years/:id/rollover | معاينة الترحيل |
| ACC-ROLLBACK-001 | Rollback | /accounting/fiscal-years/:id/rollover | التراجع |
| ACC-YEAREND-001 | Year-End Close | /accounting/year-end-closing | معاينة الإقفال |
| ACC-YEAREND-REOPEN-001 | إعادة فتح السنة | /accounting/year-end-closing | حوار إعادة الفتح |
| ACC-GL-001 | دفتر الأستاذ | /accounting/reports/general-ledger | الفلاتر، RunningBalance |
| ACC-TRIAL-BALANCE-001 | ميزان المراجعة | /accounting/reports/trial-balance | الجدول الكامل |
| ACC-INCOME-STATEMENT-001 | قائمة الدخل | /accounting/reports/income-statement | البيانات والإجماليات |
| ACC-BALANCE-SHEET-001 | الميزانية العمومية | /accounting/reports/balance-sheet | الأصول/الالتزامات |
| ACC-CASH-FLOW-001 | التدفقات النقدية | /accounting/reports/cash-flow | التصنيفات |
| ACC-TREASURY-RECON-001 | تسوية الخزينة | /accounting/reports/treasury-gl-reconciliation | الفروقات |
| ACC-INVENTORY-RECON-001 | تسوية المخزون | /accounting/reports/inventory-gl-reconciliation | الفروقات |
| ACC-CUSTOMER-AGING-001 | تقادم العملاء | /accounting/reports/customer-receivables-aging | الشرائح الزمنية |
| ACC-SUPPLIER-AGING-001 | تقادم الموردين | /accounting/reports/supplier-payables-aging | الشرائح الزمنية |
| ACC-PURCHASE-REPORT-001 | تقرير المشتريات | /accounting/reports/purchase-invoices | البيانات |
| ACC-RECEIPTS-PAYMENTS-001 | مقبوضات/مدفوعات | /accounting/reports/receipts-payments | البيانات |
| ACC-SALES-ANALYSIS-001 | تحليل مبيعات الأصناف | /accounting/reports/sales-customer-item-analysis | التحليل |
| ACC-SALES-PROFIT-001 | ربحية المبيعات | /accounting/reports/sales-profitability | المقاييس |

**جميع الصور أعلاه تتطلب تحقق بصري حي (LIVE VERIFICATION REQUIRED)**
