const fs = require('fs');

const arPath = 'src/utils/locales/ar.json';
const enPath = 'src/utils/locales/en.json';

const arKeys = {
  "inventory-actions-guide-cta-title": "💡 مش عارف تستخدم أنهي إجراء؟ اضغط هنا للشرح",
  "inventory-actions-guide-cta-subtitle": "شرح سريع لإدخال المخزون، الصرف، والتسوية ومتى تستخدم كل واحدة.",
  "inventory-actions-guide-title": "دليل إجراءات حركة المخزون",
  "inventory-actions-guide-subtitle": "اختر الإجراء المناسب حسب سبب الحركة الفعلية للمخزون.",
  "inventory-actions-guide-stock-in-title": "إدخال مخزون",
  "inventory-actions-guide-stock-in-desc": "يزيد كمية وقيمة المخزون يدويًا في الحالات الاستثنائية.",
  "inventory-actions-guide-stock-in-use1": "اكتشاف كمية موجودة فعليًا وغير مسجلة.",
  "inventory-actions-guide-stock-in-use2": "استلام استثنائي خارج دورة المشتريات.",
  "inventory-actions-guide-stock-in-use3": "تصحيح زيادة مثبتة بالمخزن.",
  "inventory-actions-guide-stock-in-effect": "يزيد رصيد الصنف وقيمة المخزون.",
  "inventory-actions-guide-stock-in-warning": "لا تستخدمه بدل فاتورة المشتريات العادية.",
  "inventory-actions-guide-stock-out-title": "صرف مخزون",
  "inventory-actions-guide-stock-out-desc": "يقلل كمية وقيمة المخزون يدويًا بدون فاتورة بيع.",
  "inventory-actions-guide-stock-out-use1": "تالف أو هالك.",
  "inventory-actions-guide-stock-out-use2": "فاقد.",
  "inventory-actions-guide-stock-out-use3": "استخدام داخلي.",
  "inventory-actions-guide-stock-out-use4": "عينات مجانية.",
  "inventory-actions-guide-stock-out-use5": "استهلاك تشغيلي.",
  "inventory-actions-guide-stock-out-effect": "يقل رصيد الصنف وقيمة المخزون.",
  "inventory-actions-guide-stock-out-warning": "لا تستخدمه بدل فاتورة المبيعات.",
  "inventory-actions-guide-adjustment-title": "تسوية مخزون",
  "inventory-actions-guide-adjustment-desc": "تصحح الفرق بين الرصيد الفعلي بالمخزن والرصيد المسجل بالنظام.",
  "inventory-actions-guide-adjustment-use1": "نتيجة جرد فعلي.",
  "inventory-actions-guide-adjustment-use2": "اكتشاف زيادة أو نقص.",
  "inventory-actions-guide-adjustment-use3": "تصحيح فرق مخزون مثبت.",
  "inventory-actions-guide-adjustment-effect": "قد تزيد أو تقل الكمية حسب نتيجة التسوية.",
  "inventory-actions-guide-adjustment-warning": "يجب كتابة سبب واضح للتسوية للحفاظ على سجل مراجعة مفهوم.",
  "inventory-actions-guide-important-title": "⚠️ مهم",
  "inventory-actions-guide-important-desc": "العمليات الطبيعية للمخزون يجب أن تتم من خلال المشتريات والمبيعات والمرتجعات. استخدم إجراءات الحركة اليدوية فقط للحالات الاستثنائية والتصحيحات والجرد.",
  "inventory-actions-guide-stock-in-inline": "يزيد كمية وقيمة المخزون يدويًا.",
  "inventory-actions-guide-stock-out-inline": "يقلل كمية وقيمة المخزون يدويًا.",
  "inventory-actions-guide-adjustment-inline": "يصحح الرصيد حسب نتيجة الجرد أو الفرق الفعلي.",
  "inventory-actions-guide-stock-in-tooltip": "إضافة كمية يدويًا للمخزون في الحالات الاستثنائية.",
  "inventory-actions-guide-stock-out-tooltip": "إخراج كمية يدويًا بسبب التالف أو الاستخدام الداخلي أو أسباب مشابهة.",
  "inventory-actions-guide-adjustment-tooltip": "تصحيح الرصيد طبقًا للكمية الفعلية بالمخزن."
};

const enKeys = {
  "inventory-actions-guide-cta-title": "💡 Not sure which inventory action to use? Click here for help",
  "inventory-actions-guide-cta-subtitle": "Quick guide to stock-in, stock-out, adjustments, and when to use each.",
  "inventory-actions-guide-title": "Inventory Movement Actions Guide",
  "inventory-actions-guide-subtitle": "Choose the appropriate action based on the actual reason for the inventory movement.",
  "inventory-actions-guide-stock-in-title": "Stock In",
  "inventory-actions-guide-stock-in-desc": "Manually increases inventory quantity and value for exceptional cases.",
  "inventory-actions-guide-stock-in-use1": "Discovering unrecorded physical stock.",
  "inventory-actions-guide-stock-in-use2": "Exceptional receipt outside the purchasing cycle.",
  "inventory-actions-guide-stock-in-use3": "Correcting a proven warehouse surplus.",
  "inventory-actions-guide-stock-in-effect": "Increases item balance and inventory value.",
  "inventory-actions-guide-stock-in-warning": "Do not use as a replacement for normal purchase invoices.",
  "inventory-actions-guide-stock-out-title": "Stock Out",
  "inventory-actions-guide-stock-out-desc": "Manually decreases inventory quantity and value without a sales invoice.",
  "inventory-actions-guide-stock-out-use1": "Damaged or spoiled goods.",
  "inventory-actions-guide-stock-out-use2": "Lost items.",
  "inventory-actions-guide-stock-out-use3": "Internal usage.",
  "inventory-actions-guide-stock-out-use4": "Free samples.",
  "inventory-actions-guide-stock-out-use5": "Operational consumption.",
  "inventory-actions-guide-stock-out-effect": "Decreases item balance and inventory value.",
  "inventory-actions-guide-stock-out-warning": "Do not use as a replacement for sales invoices.",
  "inventory-actions-guide-adjustment-title": "Inventory Adjustment",
  "inventory-actions-guide-adjustment-desc": "Corrects the difference between actual warehouse stock and system records.",
  "inventory-actions-guide-adjustment-use1": "Physical count result.",
  "inventory-actions-guide-adjustment-use2": "Discovering a shortage or surplus.",
  "inventory-actions-guide-adjustment-use3": "Correcting a proven stock discrepancy.",
  "inventory-actions-guide-adjustment-effect": "Quantity may increase or decrease based on the adjustment result.",
  "inventory-actions-guide-adjustment-warning": "A clear reason must be written to maintain an understandable audit log.",
  "inventory-actions-guide-important-title": "⚠️ Important",
  "inventory-actions-guide-important-desc": "Normal inventory activity should flow through purchases, sales, and returns. Use manual inventory actions only for exceptional cases, corrections, and physical-count adjustments.",
  "inventory-actions-guide-stock-in-inline": "Manually increases inventory quantity and value.",
  "inventory-actions-guide-stock-out-inline": "Manually decreases inventory quantity and value.",
  "inventory-actions-guide-adjustment-inline": "Corrects balance based on physical count or discrepancy.",
  "inventory-actions-guide-stock-in-tooltip": "Manually add quantity to inventory in exceptional cases.",
  "inventory-actions-guide-stock-out-tooltip": "Manually remove quantity due to damage, internal use, or similar reasons.",
  "inventory-actions-guide-adjustment-tooltip": "Correct the balance according to the actual quantity in the warehouse."
};

const arData = JSON.parse(fs.readFileSync(arPath, 'utf8'));
const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));

Object.assign(arData, arKeys);
Object.assign(enData, enKeys);

fs.writeFileSync(arPath, JSON.stringify(arData, null, 2));
fs.writeFileSync(enPath, JSON.stringify(enData, null, 2));
console.log('Translations updated.');
