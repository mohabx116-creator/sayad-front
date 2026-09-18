# دليل المستخدم: وحدة العمالة (Labor)

تُعنى وحدة العمالة (Labor) في نظام SAYAD بإدارة بيانات العمال، المهن التشغيلية، حركات العمل اليومية، والحركات الشهرية المؤثرة على الأجور.
تُعد هذه الوحدة مستقلة ومتميزة عن وحدة الرواتب (Payroll)؛ حيث تُسجل هنا البيانات التشغيلية، لتقوم وحدة الرواتب لاحقاً بمعالجتها محاسبياً ومالياً.

---

## 1. العلاقة بين العمالة والرواتب (Labor vs. Payroll Boundary)

يجب التمييز بوضوح بين الوظائف الموجودة في العمالة وتلك الخاصة بالرواتب:

**موجود في وحدة العمالة (Labor):**
* تسجيل بيانات العمال (Workers) ومقاييس الأجور (Wage Profile).
* إعداد المهن التشغيلية (Operational Jobs).
* تسجيل الحركات التشغيلية اليومية (Worker Operations) والكميات المنجزة.
* تسجيل الحركات الشهرية (Monthly Movements) مثل: الغياب، الإضافي، السهر، الخصومات، والمكافآت.

**لا يوجد نظام حضور وانصراف (Attendance/Time-Clock) مستقل.**
تُسجَّل الغيابات يدوياً كـ "حركة شهرية" (Monthly Movement - Absence). لا يوجد شاشة مخصصة للحضور اليومي (Check-in/Check-out).

**غير موجود في العمالة (ينتمي لوحدة الرواتب Payroll):**
* تشغيل مسير الرواتب الفعلي (Payroll Runs).
* حساب الضرائب والتأمينات المعقدة.
* إصدار قيود الاستحقاق المحاسبية (Accounting Posting).
* دفع الرواتب من الخزينة (Treasury Payment).

---

## 2. المهن التشغيلية (Operational Jobs)

تُستخدم لتصنيف الأعمال، وتُربط مع العامل لتحديد مهنته.

### شاشة المهن التشغيلية
* **المسار:** `/labor/operational-jobs`
* **الحقول المعروضة:** Code، Name، Description، IsActive.
* **الحذف (Delete):** حذف فعلي (Hard Delete). يُمنع إذا كانت المهنة مرتبطة بأي عامل أو حركة تشغيلية.
* **التعطيل (Deactivate):** يمنع استخدام المهنة مستقبلاً دون حذف تاريخها.

---

## 3. ملف العمال (Workers) وتاريخ الأجور (Wage Profiles)

### دورة حياة العامل (Worker Lifecycle)
* يُنشأ العامل بحالة "نشط" (Active) افتراضياً.
* **التعطيل (Deactivate):** يمكن إيقاف العامل لمنع إسناد حركات جديدة له.
* **الحذف (Hard Delete):** مسموح فقط إذا لم يكن للعامل أي حركات تشغيلية (Operations)، حركات شهرية (Monthly Movements)، أو سجلات رواتب (Payroll Statements). تُحذف سجلات الأجور (Wage Profiles) التابعة له تلقائياً.

### شاشة إنشاء/تعديل عامل
* **المسارات:** `/labor/workers/new` | `/labor/workers/:id/edit`
* **الحقول الأساسية المعروضة:** Code، Name، MobileNumber، Address، OperationalJobId، Notes، IsActive.

### إعدادات الأجر (Wage Profile)
يعتمد النظام على السجل التاريخي للأجور.
* **الحقول المعروضة:** EffectiveFrom (تاريخ التفعيل)، DailyWage، MonthlyDaysBasis، MealAllowanceType، MealAllowanceValue، OvertimeCalculationType، OvertimeRate، Notes.
* **قواعد التعديل:**
  1. إذا كان `EffectiveFrom` الجديد **يساوي** الحالي: يُعدّل السجل الحالي مباشرة.
  2. إذا كان `EffectiveFrom` الجديد **أكبر من** الحالي (مستقبلي): يُغلق السجل الحالي في اليوم السابق للإدخال الجديد (`EffectiveTo`)، ويُنشأ سجل أجر جديد، مما يضمن بقاء الحسابات التاريخية سليمة.
  3. إذا كان `EffectiveFrom` الجديد **أقل من** الحالي (أقدم): **يُرفض التعديل** (BLOCKED).

### استيراد وتصدير العمال (Excel Import/Export)
* **التصدير (Export):** متاح.
* **الاستيراد (Import):** متاح. يدعم تحميل قالب، رفع الملف (`Preview`) وعرض أخطاء التحقق لكل صف (مثل تكرار الكود)، ثم الاعتماد النهائي (`Commit`).

---

## 4. الحركات التشغيلية (Worker Operations)

تُسجل حجم العمل الفعلي الذي أنجزه العامل.
* **المسارات:** `/labor/operations`
* **الحقول:** WorkerId، OperationalJobId، OperationDate، CompletedQuantity، ClientRequestId، Notes.
* **قواعد العمل:**
  * **الكمية المنجزة (CompletedQuantity):** يجب أن تكون أكبر من الصفر حصراً.
  * **رقم طلب العميل (ClientRequestId):** هو مجرد **حقل مرجعي اختياري** (Reference Only) ولا يُنشئ ارتباطاً برمجياً صلباً مع أوامر التصنيع.

---

## 5. الحركات الشهرية (Monthly Movements)

تُسجل أي متغيرات تؤثر على راتب العامل.
* **المسارات:** `/labor/monthly-movements`
* **الأنواع (MovementType):** 1: Absence (غياب)، 2: Overtime (إضافي)، 3: NightWork (عمل ليلي)، 4: Deduction (خصم)، 5: Bonus (مكافأة).
* **حفظ البيانات (Snapshots):** عند إنشاء الحركة، يأخذ النظام **لقطة مُجمدة** لبيانات الأجر (مثل DailyWage و OvertimeRate) لضمان عدم تأثر الحركة بأي تغيير مستقبلي على ملف العامل.
* **دورة الحياة (Status):**
  * **Draft (مسودة):** قابلة للتعديل أو الحذف (Hard Delete).
  * **Approved (معتمدة):** غير قابلة للتعديل أو الحذف نهائياً. تُرسل لرواتب Payroll.
  * **Rejected (مرفوضة):** تتطلب إدخال سبب الرفض (RejectionReason). غير قابلة للتعديل أو الاعتماد لاحقاً.

---

## 6. تقرير رواتب العمال (Worker Salary Report)

* **المسار:** `/labor/workers/salary-report`
* يقدم هذا التقرير تحليلاً مبنياً فعلياً على **إصدارات الرواتب (Payroll Statements)**.
* **التكامل:** يجمع التقرير الأجور الأساسية، البدلات، المكافآت، الخصومات، والرواتب الصافية.
* يُظهر حالة الدفع (Paid/Unpaid) بناءً على ما يُنفذ في وحدة الرواتب/الخزينة.

---

## 7. التكامل مع الوحدات الأخرى (Integrations)

* **الرواتب (Payroll):** تسحب وحدة الرواتب كلاً من العمال، وملف الأجور، والحركات الشهرية المعتمدة (Approved Monthly Movements).
* **المحاسبة (Accounting):** العمالة **لا تنشئ** أي قيود محاسبية. تُرحّل استحقاقات الرواتب من خلال وحدة (Payroll).
* **الخزينة (Treasury):** العمالة **لا تدفع** نقداً بشكل مباشر. يتم الصرف في وحدة Payroll.
* **التصنيع (Manufacturing):** الحركات التشغيلية تعتبر مرجعية (Reference Only) عبر `ClientRequestId` ولا تؤثر مباشراً في القيود الصناعية من داخل العمالة.

---

## 8. مصفوفة الصلاحيات (Exact Permissions)

| كود الصلاحية (Permission String) |
|---------------------------------|
| `labor.workers.view` |
| `labor.workers.create` |
| `labor.workers.edit` |
| `labor.workers.delete` |
| `labor.workers.change-status` |
| `labor.operational-jobs.view` |
| `labor.operational-jobs.create` |
| `labor.operational-jobs.edit` |
| `labor.operational-jobs.delete` |
| `labor.operational-jobs.change-status` |
| `labor.operations.view` |
| `labor.operations.create` |
| `labor.operations.edit` |
| `labor.operations.delete` |
| `labor.monthly-movements.view` |
| `labor.monthly-movements.create` |
| `labor.monthly-movements.edit` |
| `labor.monthly-movements.delete` |
| `labor.monthly-movements.approve` |
| `labor.monthly-movements.reject` |

---

## 9. مصفوفة قواعد العمل (Business Rules)

| القاعدة | النتيجة |
|---------|---------|
| إدخال أجر يومي سالب (DailyWage) | BLOCKED |
| تحديث الأجر بتاريخ (EffectiveFrom) أقدم من الحالي | BLOCKED |
| إدخال مبلغ سالب أو كمية صفرية في حركة العمليات | BLOCKED |
| تعديل حركة شهرية بحالة Approved | BLOCKED |
| الموافقة على حركة شهرية لم تكن Draft | BLOCKED |
| رفض حركة شهرية بدون سبب | BLOCKED |
| حذف عامل مرتبط بحركات/رواتب | BLOCKED |

---

## 10. قائمة الإجراءات (Procedure Matrix)

| الإجراء | الحالة |
|---------|---------|
| A. إنشاء/تعديل وتفعيل عامل | IMPLEMENTED AND USER-EXPOSED |
| B. تحديث إعدادات الأجر (Wage Profile) | IMPLEMENTED AND USER-EXPOSED |
| C. Import / Export العمال (Excel) | IMPLEMENTED AND USER-EXPOSED |
| D. إنشاء وتعديل وحذف مهنة تشغيلية | IMPLEMENTED AND USER-EXPOSED |
| E. إدخال الكميات (Worker Operations) | IMPLEMENTED AND USER-EXPOSED |
| F. إنشاء حركات الغياب/السهر (Monthly Movements) | IMPLEMENTED AND USER-EXPOSED |
| G. اعتماد / رفض Movement | IMPLEMENTED AND USER-EXPOSED |
| H. مراجعة تقرير الرواتب | IMPLEMENTED AND USER-EXPOSED |
| I. تصدير/طباعة التقرير | LIVE VERIFICATION REQUIRED |
| J. إصدار قيد رواتب محاسبي | NOT IMPLEMENTED (يتبع وحدة Payroll) |
| K. دفع رواتب | NOT IMPLEMENTED (يتبع وحدة Payroll/Treasury) |

---

## 11. متطلبات التحقق البصري (Screenshot Checklist)

| المعرف | الشاشة | المسار | يتطلب |
|--------|--------|--------|--------|
| LAB-WORKERS-001 | قائمة العمال | /labor/workers | الأزرار والفلاتر |
| LAB-WORKER-CREATE-001 | إنشاء عامل | /labor/workers/new | نموذج الأجر |
| LAB-WORKER-IMPORT-001 | استيراد عمال | /labor/workers | نافذة الرفع والمعاينة |
| LAB-JOBS-001 | المهن التشغيلية | /labor/operational-jobs | القائمة |
| LAB-OPERATIONS-001 | الحركات التشغيلية | /labor/operations | الجدول والأعمدة |
| LAB-MOVEMENTS-001 | الحركات الشهرية | /labor/monthly-movements | الحالات (Draft/Approved) |
| LAB-SALARY-REPORT-001 | تقرير الرواتب | /labor/workers/salary-report | الجدول النهائي وفلاتره |

*(كافة الصور أعلاه تتطلب LIVE VISUAL VERIFICATION)*
