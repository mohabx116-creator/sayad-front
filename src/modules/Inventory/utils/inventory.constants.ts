import type { IntlShape } from 'react-intl';

export const INVENTORY_PERMISSIONS = {
  view: 'inventory.view',
  itemsView: 'inventory.items.view',
  itemsCreate: 'inventory.items.create',
  itemsUpdate: 'inventory.items.update',
  itemsActivate: 'inventory.items.activate',
  itemsDeactivate: 'inventory.items.deactivate',
  categoriesView: 'inventory.categories.view',
  categoriesManage: 'inventory.categories.manage',
  unitsView: 'inventory.units.view',
  unitsManage: 'inventory.units.manage',
  openingStockView: 'inventory.opening-stock.view',
  openingStockManage: 'inventory.opening-stock.manage',
  movementsView: 'inventory.movements.view',
  movementsStockIn: 'inventory.movements.stock-in',
  movementsStockOut: 'inventory.movements.stock-out',
  movementsAdjust: 'inventory.movements.adjust',
  movementsReverse: 'inventory.movements.reverse',
  partyItemsView: 'inventory.party-items.view',
  partyItemsManage: 'inventory.party-items.manage',
  alertsView: 'inventory.alerts.view',
  customerMaterialIntakesView: 'inventory.customer-material-intakes.view',
  customerMaterialIntakesCreate: 'inventory.customer-material-intakes.create',
  customerMaterialIntakesUpdate: 'inventory.customer-material-intakes.update',
  customerMaterialIntakesPost: 'inventory.customer-material-intakes.post',
  customerMaterialIntakesCancel: 'inventory.customer-material-intakes.cancel',
  customerMaterialConversionsView: 'inventory.customer-material-conversions.view',
  customerMaterialConversionsCreate: 'inventory.customer-material-conversions.create',
  customerMaterialConversionsUpdate: 'inventory.customer-material-conversions.update',
  customerMaterialConversionsPost: 'inventory.customer-material-conversions.post',
  customerMaterialConversionsCancel: 'inventory.customer-material-conversions.cancel'
} as const;

export const INVENTORY_VIEW_PERMISSIONS = [
  INVENTORY_PERMISSIONS.view,
  INVENTORY_PERMISSIONS.itemsView,
  INVENTORY_PERMISSIONS.categoriesView,
  INVENTORY_PERMISSIONS.unitsView,
  INVENTORY_PERMISSIONS.partyItemsView,
  INVENTORY_PERMISSIONS.movementsView,
  INVENTORY_PERMISSIONS.alertsView,
  INVENTORY_PERMISSIONS.customerMaterialIntakesView,
  INVENTORY_PERMISSIONS.customerMaterialConversionsView
] as const;

export const ITEM_TYPES = ['RawMaterial', 'FinishedGood', 'PackagingMaterial', 'OperationalSupply', 'Other'] as const;

export function getItemTypeLabel(intl: IntlShape, itemType: string) {
  const isArabic = intl.locale.toLowerCase().startsWith('ar');

  switch (itemType) {
    case 'RawMaterial':
      return isArabic ? 'مواد خام' : 'Raw Material';
    case 'FinishedGood':
      return isArabic ? 'منتج نهائي' : 'Finished Good';
    case 'PackagingMaterial':
      return isArabic ? 'مواد تعبئة وتغليف' : 'Packaging Material';
    case 'OperationalSupply':
      return isArabic ? 'مستلزمات تشغيل' : 'Operational Supply';
    default:
      return isArabic ? 'أخرى' : 'Other';
  }
}
