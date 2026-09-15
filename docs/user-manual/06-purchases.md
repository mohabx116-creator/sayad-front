# دليل المستخدم: وحدة المشتريات (Purchases)

تُعد وحدة المشتريات (Purchases) من أهم الوحدات في نظام SAYAD، حيث تدير دورة شراء المخزون، بدءاً من تسجيل فواتير الشراء، ترحيلها للتأثير على المخزون والحسابات، إثبات الدفع، وحتى إدارة مرتجعات المشتريات.

يتم من خلال هذه الوحدة التأثير المباشر على أرصدة الموردين، كميات المخزون في المستودعات، والقيود المحاسبية، وحركة الخزينة عند الدفع.

---

## 1. نظرة عامة (Overview)

تتكون وحدة المشتريات بشكل أساسي من شقين:
1. **فواتير الشراء (Purchase Invoices):** تسجيل استلام بضاعة من مورد، مما ينشئ مديونية على الشركة للمورد، ويزيد رصيد المخزون.
2. **مرتجعات المشتريات (Purchase Returns):** تسجيل إرجاع بضاعة سبق شراؤها إلى المورد، مما يخفض مديونية الشركة، وينقص رصيد المخزون.

### دورة حياة المستندات (Document Lifecycle)
تمر جميع مستندات المشتريات (فواتير / مرتجعات) بالحالات التالية:
- **مسودة (Draft):** المستند قيد الإعداد. يمكن تعديله. لا ينتج عنه أي تأثير محاسبي أو مخزني.
- **مُرحّل (Posted):** تم اعتماد المستند. يُمنع التعديل عليه تماماً. ينشئ قيداً محاسبياً، ويؤثر على أرصدة المخزون، ويحدث رصيد المورد.
- **مُلغى (Cancelled):** تم إلغاء المستند المُرحّل. يُنشئ قيداً عكسياً لإبطال التأثير المحاسبي، وحركة عكسية على المخزون ورصيد المورد.

---

## 2. فواتير الشراء (Purchase Invoices)

### أ. استعراض الفواتير
توفر واجهة **فواتير الشراء** جدولاً يعرض جميع الفواتير المسجلة، حيث يمكنك:
- **البحث:** برقم الفاتورة، أو اسم المورد، أو كود المورد.
- **التصفية:** بناءً على الحالة (Draft, Posted, Cancelled) أو تاريخ الفاتورة.

![شاشة الفواتير (PUR-INVOICES-001) - يوضح الفلاتر والجدول وقائمة الفواتير - عربي](PUR-INVOICES-001)

### ب. إنشاء فاتورة شراء (Create Purchase Invoice)
![شاشة إنشاء الفاتورة (PUR-INVOICE-CREATE-001) - يوضح حقول الإدخال الأساسية وتفاصيل الأصناف - عربي](PUR-INVOICE-CREATE-001)

يُشترط لإنشاء الفاتورة:
- اختيار مورد مسجل ونشط (Active).
- تحديد تواريخ الفاتورة والاستحقاق.
- إضافة الأصناف (Quantity > 0, Unit Cost >= 0).

**ملاحظات حول التقييم (Valuation):**
- التكلفة الفعلية التي تؤثر على المخزون هي صافي السعر في السطر (Net Line Total)، أي السعر بعد خصم نسبة الخصم وإضافة الضرائب.

### ج. تعديل فاتورة شراء (Edit Purchase Invoice)
التعديل متاح **حصرياً** للفواتير في حالة **Draft**.
بمجرد الترحيل أو الإلغاء، يتم قفل الفاتورة بالكامل (لا يمكن تعديل أي حقل).
في حالة Draft، يمكن تغيير المورد، التواريخ، الأصناف، الكميات، والأسعار.

![شاشة التعديل (PUR-INVOICE-EDIT-001) - يوضح قابلية تعديل فاتورة مسودة - عربي](PUR-INVOICE-EDIT-001)

### د. تفاصيل الفاتورة والإجراءات (Purchase Invoice Details)
تعرض هذه الشاشة التفاصيل الكاملة وتتيح الإجراءات التالية:
![شاشة التفاصيل (PUR-INVOICE-DETAIL-001) - يعرض تفاصيل الفاتورة وحالة الدفع - عربي](PUR-INVOICE-DETAIL-001)

#### 1. الترحيل (Post)
ينقل الفاتورة من Draft إلى Posted بصورة ذرية (Atomic)، ويقوم بالآتي:
- **المخزون:** يُنشئ حركة (StockIn) لزيادة الكميات في المستودع الافتراضي (Default Warehouse) استناداً إلى الكمية الأساسية (Base Quantity).
- **التقييم:** يتم إعادة احتساب متوسط التكلفة المتحرك (Moving Average Cost) بناءً على تكلفة السطر الصافية.
- **المورد:** يزيد المديونية لصالح المورد (PurchaseInvoiceCredit).
- **المحاسبة:** يُنشئ قيد يومية من حساب المخزون كأصل إلى حساب الموردين.
![ترحيل الفاتورة (PUR-INVOICE-POST-001) - يوضح نافذة تأكيد الترحيل - عربي](PUR-INVOICE-POST-001)

#### 2. الدفع المباشر (Pay)
يمكن سداد الفواتير المُرحلة مباشرة إذا كانت حالة الدفع الخاصة بها "غير مسددة" (Outstanding).
إذا تمت عملية الدفع (تسوية مباشرة):
- يتم إنشاء حركة سداد (Payment) في وحدة الخزينة من الحساب المحدد.
- يُنشئ قيد تسوية (Settlement Journal) من حساب المورد إلى حساب الخزينة.
- يُخفض رصيد المورد بمقدار الدفعة.
![الدفع المباشر (PUR-PAYMENT-001) - يوضح نافذة تسجيل السداد المباشر - عربي](PUR-PAYMENT-001)

#### 3. الإلغاء (Cancel)
إلغاء فاتورة مُرحلة متاح بشروط:
- يُشترط إدخال سبب الإلغاء (Reason).
- **يُمنع الإلغاء تماماً** إذا كان هناك أي "مرتجعات مشتريات مُرحلة" مرتبطة بهذه الفاتورة.
- إذا كانت الفاتورة مسددة مسبقاً، يقوم النظام تلقائياً بإنشاء حركات وقيود تسوية عكسية (Payment Reversal) لإرجاع الأموال إلى الخزينة وإلغاء السداد.
- يتم إنشاء حركات مخزنية عكسية (Reversal) لخفض الكميات وإعادة ضبط تكلفة المخزون، وعكس قيد المشتريات.
- الفاتورة الملغاة لا يمكن ترحيلها مجدداً، ولا يمكن تعديلها.
![إلغاء الفاتورة (PUR-INVOICE-CANCEL-001) - يوضح نافذة الإلغاء وطلب السبب - عربي](PUR-INVOICE-CANCEL-001)

---

## 3. مرتجعات المشتريات (Purchase Returns)

### أ. إنشاء المرتجع (Create Purchase Return)
**يجب أن يكون المرتجع مرتبطاً بفاتورة شراء مُرحلة.** لا يدعم النظام المرتجعات المستقلة (Standalone).
- يتم اختيار الأصناف المراد إرجاعها بناءً على ما تم شراؤه مسبقاً في الفاتورة المصدر.
![إنشاء المرتجع (PUR-RETURN-CREATE-001) - يوضح ربط المرتجع بالفاتورة المصدر - عربي](PUR-RETURN-CREATE-001)

### ب. الترحيل (Post Purchase Return)
ينقل المرتجع إلى حالة Posted وينفذ الآتي:
- **المخزون:** ينشئ حركة صرف عكسية (StockOut) لتقليل الكميات.
- **التكلفة:** **النقطة الحرجة:** يُقيم النظام التكلفة المصروفة **بنفس التكلفة التي دخلت بها في فاتورة الشراء الأصلية (Source Movement)**، وليس بناءً على متوسط التكلفة الحالي.
- **تأثير المورد:** يُخفض رصيد المورد.
- **المحاسبة:** يُعكس قيد المشتريات.
![ترحيل المرتجع (PUR-RETURN-POST-001) - يوضح تأكيد الترحيل - عربي](PUR-RETURN-POST-001)

### ج. الإلغاء (Cancel Purchase Return)
يعكس عملية الإرجاع. يُنشئ حركات مخزنية عكسية تعيد البضاعة للمستودع ويعكس قيد الإرجاع.

---

## 4. الفروقات بين الدفع والتسوية (Payment vs Settlement)

- **دفع الفاتورة المباشر (Invoice Pay):** يتم من داخل تفاصيل فاتورة المشتريات، ويسمح بتسديد الفاتورة كلياً من حساب خزينة محدد.
- **سداد مورد (Supplier Payment):** يمكن أن يتم من خلال وحدة الأطراف (Parties)، والتي تتيح إرسال دفعة مالية للمورد (سواء كانت دفعة مقدمة أو غير مرتبطة بفاتورة معينة).
- **التسوية (Allocation):** هي عملية تخصيص دفعات المورد (التي تمت من وحدة الأطراف) لربطها بفواتير محددة من أجل إغلاق أرصدتها.

---

## 5. مصفوفات الأعمال والصلاحيات (Matrices)

### مصفوفة التأثير بين الوحدات (Cross-Module Effect Matrix)

| Flow | Inventory Qty | Inventory Value | Supplier Balance | Treasury Balance | Journal Entry |
|------|---------------|-----------------|------------------|------------------|---------------|
| Invoice Create | NO | NO | NO | NO | NO |
| Invoice Post | YES (Increase) | YES (Recalculate) | YES (Increase) | NO | YES |
| Invoice Pay | NO | NO | YES (Decrease) | YES (Decrease) | YES |
| Invoice Cancel | YES (Decrease) | YES (Recalculate) | YES (Decrease) | CONDITIONAL (Reversed if paid) | YES (Reversal) |
| Return Create | NO | NO | NO | NO | NO |
| Return Post | YES (Decrease) | YES (Original Cost) | YES (Decrease) | NO | YES |
| Return Cancel | YES (Increase) | YES (Original Cost) | YES (Increase) | NO | YES (Reversal) |

### مصفوفة قواعد الأعمال (Business Rule Matrix)
- **Supplier required:** ALLOWED (يجب اختياره دائماً)
- **Supplier active:** ALLOWED (يجب أن يكون نشطاً)
- **Item active:** ALLOWED (يجب أن يكون قابلاً للشراء ونشطاً)
- **Quantity > 0:** ALLOWED
- **Cost > 0 / >= 0:** ALLOWED (يمكن أن يكون 0)
- **Duplicate supplier invoice number:** NOT APPLICABLE (رقم اختياري)
- **Posted invoice edit:** BLOCKED
- **Cancel after payment:** ALLOWED (يعكس الدفعة تلقائياً)
- **Cancel after return:** BLOCKED (يُمنع الإلغاء إذا وجد مرتجع مرحل)
- **Standalone return allowed:** BLOCKED (يجب الرجوع للفاتورة)

### الصلاحيات المطلوبة (Permissions)

| Code | Arabic Meaning | Backend Enforcement | Frontend Guard |
|------|----------------|---------------------|----------------|
| `purchases.invoices.view` | عرض فواتير المشتريات | [HasPermission] Controller | Route Guard |
| `purchases.invoices.create` | إنشاء فواتير مشتريات | [HasPermission] Controller | Route Guard / UI Hide |
| `purchases.invoices.update` | تعديل فواتير مشتريات | [HasPermission] Controller | Route Guard / UI Hide |
| `purchases.invoices.post` | ترحيل فواتير مشتريات (والدفع) | [HasPermission] Controller | UI Hide |
| `purchases.invoices.cancel` | إلغاء فواتير المشتريات | [HasPermission] Controller | UI Hide |
| `purchases.returns.view` | عرض مرتجعات المشتريات | [HasPermission] Controller | Route Guard |
| `purchases.returns.create` | إنشاء مرتجعات مشتريات | [HasPermission] Controller | Route Guard / UI Hide |
| `purchases.returns.update` | تعديل مرتجعات مشتريات | [HasPermission] Controller | Route Guard / UI Hide |
| `purchases.returns.post` | ترحيل مرتجعات مشتريات | [HasPermission] Controller | UI Hide |
| `purchases.returns.cancel` | إلغاء مرتجعات مشتريات | [HasPermission] Controller | UI Hide |

---

## 6. إجراءات المستخدم (User Procedures)
يتم دعم الإجراءات التالية ضمن النظام:
- A. إنشاء فاتورة شراء: **IMPLEMENTED AND USER-EXPOSED**
- B. تعديل فاتورة شراء Draft: **IMPLEMENTED AND USER-EXPOSED**
- C. ترحيل فاتورة شراء: **IMPLEMENTED AND USER-EXPOSED**
- D. إلغاء فاتورة شراء: **IMPLEMENTED AND USER-EXPOSED**
- E. تسجيل دفعة مورد: **EXPOSED FROM ANOTHER MODULE** (عبر وحدة الأطراف Parties).
- F. سداد فاتورة جزئياً: **NOT IMPLEMENTED** (السداد المباشر من الفاتورة يسدد بالكامل عادة).
- G. سداد فاتورة بالكامل: **IMPLEMENTED AND USER-EXPOSED**
- H. إنشاء مرتجع شراء: **IMPLEMENTED AND USER-EXPOSED**
- I. تعديل مرتجع شراء Draft: **IMPLEMENTED AND USER-EXPOSED**
- J. ترحيل مرتجع شراء: **IMPLEMENTED AND USER-EXPOSED**
- K. إلغاء مرتجع شراء: **IMPLEMENTED AND USER-EXPOSED**
- L. مراجعة حالة السداد: **IMPLEMENTED AND USER-EXPOSED**
- M. البحث والتصفية: **IMPLEMENTED AND USER-EXPOSED**
- N. Import Purchases: **NOT IMPLEMENTED**
- O. Export Purchases: **NOT IMPLEMENTED**
