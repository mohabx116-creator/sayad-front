# دليل استخدام نظام تصنيع صياد (SAYAD Manufacturing Manual)

## 1. نظرة عامة (Overview)
يوفر نظام صياد للتصنيع إدارة مبسطة ومحكمة لأوامر الإنتاج (Production Orders)، فواتير المواد (BOMs)، تكاليف العمالة والتشغيل، والاستلامات المخزنية. يتميز النظام بقدرته على معالجة **التصنيع المملوك للشركة** (Company-Owned) وكذلك **التصنيع للغير أو مواد العملاء** (Customer-Owned).

> [!IMPORTANT]
> **التكامل المحاسبي المباشر غير مطبق حالياً داخل وحدة التصنيع:** جميع القيود المحاسبية للمواد المستهلكة أو المنتجة تتم عن طريق النظام المالي/المخزني العام استناداً إلى حركات المخزون (Inventory Movements). وحدة التصنيع لا تولد قيد (WIP) أثناء الصرف، ولا توجد حسابات قيد التنفيذ.

---

## 2. الصلاحيات الدقيقة (Permissions)

| كود الصلاحية الدقيق | الغرض الموثق (Backend Enforced) |
|-------------------|---------------------------------|
| `manufacturing.view` | الدخول العام لوحدة التصنيع |
| `manufacturing.dashboard.view` | عرض لوحة المؤشرات (في حال تفعيلها مستقبلاً - حالياً Placeholder) |
| `manufacturing.boms.view` | عرض فواتير المواد |
| `manufacturing.boms.create` | إنشاء فاتورة مواد جديدة |
| `manufacturing.boms.update` | تعديل فاتورة مواد |
| `manufacturing.boms.delete` | حذف فاتورة مواد |
| `manufacturing.orders.view` | عرض أوامر التصنيع وتفاصيلها |
| `manufacturing.orders.create` | إنشاء أمر تصنيع جديد |
| `manufacturing.orders.update` | تعديل مسودة أمر التصنيع (Draft) |
| `manufacturing.orders.approve` | اعتماد الأمر (Approve) |
| `manufacturing.orders.release` | إصدار الأمر للتشغيل (Release) |
| `manufacturing.orders.cancel` | إلغاء أمر تصنيع |
| `manufacturing.orders.close` | إغلاق أمر تصنيع مكتمل |
| `manufacturing.work-centers.view` | عرض مراكز العمل |
| `manufacturing.work-centers.create` | إنشاء مركز عمل |
| `manufacturing.work-centers.update` | تعديل مركز عمل |
| `manufacturing.work-centers.delete` | حذف مركز عمل |
| `manufacturing.reports.view` | عرض التقارير (Backend Only حالياً لغياب شاشات التقارير المتقدمة) |

*(ملاحظة: تُستخدم الصلاحية `orders.update` ضمناً في العمليات التشغيلية كالصرف والاستلام وإضافة التكاليف ضمن الأوامر المصدرة، حيث لا توجد صلاحيات مستقلة مثل `orders.issue` أو `orders.receipt`)*.

---

## 3. فواتير المواد (Bill of Materials - BOM)

تعتبر (BOM) الوصفة الأساسية للمنتج التام.

* **الشاشة:** إعدادات الإنتاج -> فواتير المواد (`/manufacturing/boms`).
* **الهيكل:** منتج تام (Finished Good Item) + مكونات (Raw Materials).
* **إصدارات (Versioning):** تدعم الـ BOM رقم إصدار (Version) ونسخة لكل منتج.
* **الوحدات:** يتم تحديد (Batch Size) لمعايرة الكميات، وتُصرف المواد بالكمية المطلوبة (Quantity) مع نسبة هالك (Scrap Percentage).
* **الحذف والتعديل:** يمكن تعطيل الـ BOM (Deactivate). بمجرد استخدامها في أمر تصنيع، تكون التعديلات على الـ BOM غير ذات أثر رجعي.

---

## 4. دورة حياة أمر التصنيع (Production Order Lifecycle)

1. **مسودة (Draft):** يمكن تعديل ترويسة الأمر (Header). يمكن إلغاء الأمر ولا يوجد حذف نهائي (Delete).
2. **معتمد (Approved):** تجميد التعديلات الإدارية والاستعداد للتشغيل. يمكن الإلغاء.
3. **مُصدَر/متاح (Released):** جاهز للبدء. **مسموح:** صرف المواد (Issue).
4. **قيد التنفيذ (InProgress):** بمجرد صرف مواد أو استلام جزئي. **مسموح:** إضافة صرفيات، عكس صرفيات، استلام، عكس استلام، إضافة تكلفة عمالة، إضافة أعباء. لا يمكن الإلغاء إلا بعد عكس جميع الصرفيات والاستلامات المرحلة.
5. **مكتمل (Completed):** تم الاستلام النهائي للمنتج. **مسموح:** الإغلاق (Close). لا يمكن إضافة صرفيات أو استلامات إضافية.
6. **مغلق (Closed):** أمر تاريخي مقفل. لا يمكن فتحه، ولا تعديله، ولا إلغاؤه.
7. **ملغى (Cancelled):** تم إلغاء الأمر ولا يمكن إعادته.

> [!WARNING]
> **قاعدة حذف الأوامر (Order Deletion):** لا يوجد إجراء حذف نهائي (Delete Order) في الكود برمجيّاً (NOT IMPLEMENTED). الطريقة الوحيدة للتراجع هي الإلغاء (Cancel).

---

## 5. نماذج الملكية (Ownership Models)

> [!WARNING]
> **التفرقة الجوهرية للتقييم المالي في التصنيع:**

* **تصنيع مملوك للشركة (Company-Owned):**
  * يتم تقييم صرف المواد بناءً على التكلفة المتوسطة (Moving Average).
  * المنتجات التامة تدخل المخزون وتأخذ قيمتها من إجمالي تكاليف الأمر.
* **تصنيع للغير (Customer-Owned / Toll Manufacturing):**
  * يجب اختيار مالك (Owner Party).
  * المخزون مفصول مالياً.
  * تُسجل المواد المصروفة بقيمة مالية **صفر (0)**، وحالة التقييم المحاسبي (Not Applicable).
  * المنتجات التامة تدخل المخزون بقيمة مالية **صفر (0)**.
  * يتم تسجيل أجور التصنيع (TollingServiceFee) كمرجع تكلفي تشغيلي (Production Charge) داخل أمر التصنيع، ولكن **لا ينشأ عنها قيد محاسبي مباشر للإيراد (No GL Journal Created)** في الإصدار الحالي للموديول.

---

## 6. العمليات والتشغيل (Operations)

### 6.1. صرف المواد (Material Issue)
* **الوصف:** الصرف للمنتج، ينقل الأمر إلى `InProgress`.
* **الأثر المخزني:** حركة مخزون `StockOut` تُرحل لوحدة المخزون.
* **التكلفة:** للملكية الخاصة يتم حساب التكلفة (UnitCost) باستخدام `AverageUnitCost` لحظة الصرف.
* **قواعد المخزون:** يرفض الرصيد السالب بشكل قاطع.
* **إرجاع المواد (Material Return):** لا توجد شاشة مستقلة باسم "إرجاع مواد" أو زر "عكس صرفية". العكس يتم برمجياً فقط عند إلغاء أمر التصنيع بالكامل (Cancel Order).

### 6.2. التكاليف الإضافية والعمالة (Labor & Charges)
* **العمالة (Labor Operations):** إدخال العمالة المباشرة ككيانات (LaborOperations) غير متاح حالياً في واجهة المستخدم (BACKEND ONLY). الشاشة المتاحة هي عمليات التصنيع (Production Operations) لجدولة المهام.
* **المصاريف (Production Charges):** إضافة المصاريف الإضافية ككيانات (Charges) غير متاح حالياً في واجهة المستخدم (BACKEND ONLY).
* **الخردة (Scrap):** مدعومة فقط كنسبة هالك (`ScrapPercentage`) في تركيبة (BOM) لرفع كمية الاستهلاك المطلوبة، ولا يوجد معاملة مالية/مخزنية أو قيد خردة مستقل (NOT IMPLEMENTED).

### 6.3. استلام الإنتاج التام والفرعي (Receipts & By-Products)
* **الوصف:** يتم استلام الإنتاج التام من خلال شاشة استلام الإنتاج (Receive Goods).
* **المنتجات الفرعية (By-Products):** الكيان مدعوم في قاعدة البيانات ولكن **غير متاح في واجهة المستخدم** (BACKEND ONLY). شاشة الاستلام تدعم المنتج التام فقط.
* **تكلفة المنتج التام:** (إجمالي المواد المصروفة + العمالة المطبقة + المصاريف الإضافية) مقسوماً على الكمية المستلمة.
* **الأثر المخزني:** حركة `StockIn`.
* **عكس الاستلام (Receipt Reversal):** لا يوجد زر لـ "عكس الاستلام" بشكل مستقل. يتم العكس برمجياً فقط عند إلغاء الأمر (Cancel Order).

---

## 6. الإلغاء وعكس الحركات (Cancellation & Reversal)

* **عكس الاستلام / عكس الصرف (Reversal):** يدعم النظام عكس حركات الصرف (Material Issue) واستلام الإنتاج التام. ينتج عن العكس حركة مخزون معاكسة، وتسترد المواد للمخزون أو يُلغى الإنتاج التام.
* **إلغاء الأمر (Cancel Order):** لا يمكن إلغاء أمر التصنيع إذا كانت هناك كميات منتجة لم يتم عكس استلامها أولاً (يجب أن يكون `ProducedQuantity = 0`).

---

## 7. المصفوفات التقاطعية (Cross-Module Matrices)

### التكامل المباشر
| الوحدة (Module) | التفاعل (Interaction) | التفاصيل |
|-----------------|-------------------------|-----------|
| **المخزون (Inventory)** | **مباشر (YES)** | يصدر التصنيع حركات (StockOut/StockIn) عبر `IManufacturingInventoryService` لحالة المالك السليمة. |
| **المحاسبة (Accounting)** | **غير منفذ (NOT IMPLEMENTED)** | **NO GL JOURNAL IS CREATED IN THE CURRENT IMPLEMENTATION.** لا يصدر وحدة التصنيع أي قيود محاسبية أو حسابات تحت التشغيل (WIP) بشكل مباشر. جميع القيود تحمل حالة (LegacyNotPosted) وتنتظر إجراءات وحدة المخزون. |
| **الأطراف (Parties)** | **مباشر (YES)** | تحديد المالك (OwnerParty) للمواد في حالة الـ (Customer-Owned). |
| **العمالة (Labor)** | **مرجعي (REFERENCE ONLY)** | كيان (ProductionLaborOperation) منفصل. |
| **الرواتب (Payroll)** | **لا يوجد (NO)** | لا ارتباط نهائياً. |

> [!WARNING]
> **تعارض مع دليل المحاسبة (Phase 8 Conflict Resolution):**
> دليل المحاسبة يزعم أن صرف المواد يُحمّل `ManufacturingWorkInProgress` مالياً بقيد يومية مباشر. 
> **الواقع (التحقق الفعلي):** حساب الـ WIP لا يُستخدم لإنشاء قيد يومية (Journal Entry) في وحدة التصنيع (NO GL JOURNAL IS CREATED IN THE CURRENT IMPLEMENTATION). الترحيل المحاسبي متروك للنظام المخزني المالي.

### مصفوفة الإجراءات (Procedure Matrix)

| الإجراء | الحالة |
|---------|---------|
| A. إنشاء فواتير المواد (BOM) | IMPLEMENTED AND USER-EXPOSED |
| B. تعديل BOM | IMPLEMENTED AND USER-EXPOSED |
| C. تعطيل/حذف BOM | IMPLEMENTED AND USER-EXPOSED |
| D. إنشاء Work Center | IMPLEMENTED AND USER-EXPOSED |
| E. إنشاء أمر تصنيع | IMPLEMENTED AND USER-EXPOSED |
| F. تعديل أمر Draft | IMPLEMENTED AND USER-EXPOSED |
| G. اعتماد الأمر | IMPLEMENTED AND USER-EXPOSED |
| H. Release Order | IMPLEMENTED AND USER-EXPOSED |
| I. إصدار مواد | IMPLEMENTED AND USER-EXPOSED |
| J. عكس إصدار مواد | BACKEND ONLY (تتم ضمناً عند إلغاء الأمر فقط) |
| K. تسجيل تكلفة عمالة تصنيع | BACKEND ONLY (لا توجد شاشة لـ LaborOperations) |
| L. تسجيل Production Charge | BACKEND ONLY (لا توجد شاشة لـ Charges) |
| M. تسجيل Scrap مستقل | NOT IMPLEMENTED |
| N. استلام منتج تام | IMPLEMENTED AND USER-EXPOSED |
| O. استلام By-Product | BACKEND ONLY (غير متاحة في شاشة الاستلام) |
| P. عكس استلام | BACKEND ONLY (تتم ضمناً عند إلغاء الأمر فقط) |
| Q. إكمال الأمر | IMPLEMENTED AND USER-EXPOSED |
| R. إغلاق الأمر | IMPLEMENTED AND USER-EXPOSED |
| S. إلغاء الأمر | IMPLEMENTED AND USER-EXPOSED |
| T. تصنيع Customer-Owned | IMPLEMENTED AND USER-EXPOSED |
| U. تسجيل Tolling Fee | BACKEND ONLY |
| V. مراجعة Dashboard | PLACEHOLDER / COMING SOON |
| W. مراجعة Manufacturing Reports | BACKEND ONLY |
| X. Import Manufacturing | NOT IMPLEMENTED |
| Y. Export Manufacturing | NOT IMPLEMENTED |

---

## 8. ملاحظات وشاشات غائبة (Gaps & Placeholders)

* تعتمد الوحدة على تجميع التكاليف تشغيلياً على مستوى "أمر التصنيع"، وتمرر هذه التكلفة المجمعة للمخزون عند الاستلام.
* عمليات عكس الاستلام وعكس الصرف مستقلة غير مدعومة في واجهة المستخدم، وتتم فقط عند إلغاء أمر التصنيع بالكامل.

> **قائمة لقطات الشاشة المتوقعة للتحقق البصري المباشر:**
> * MFG-BOMS-001
> * MFG-BOM-CREATE-001
> * MFG-WORK-CENTERS-001
> * MFG-ORDERS-001
> * MFG-ORDER-CREATE-001
> * MFG-ORDER-DETAIL-001
> * MFG-MATERIAL-ISSUE-001
> * MFG-RECEIPT-001
> * MFG-CUSTOMER-OWNED-001
