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
  movementsPost: 'inventory.movements.post',
  movementsReverse: 'inventory.movements.reverse',
  partyItemsView: 'inventory.party-items.view',
  partyItemsManage: 'inventory.party-items.manage',
  alertsView: 'inventory.alerts.view'
} as const;

export const INVENTORY_VIEW_PERMISSIONS = [
  INVENTORY_PERMISSIONS.view,
  INVENTORY_PERMISSIONS.itemsView,
  INVENTORY_PERMISSIONS.categoriesView,
  INVENTORY_PERMISSIONS.unitsView,
  INVENTORY_PERMISSIONS.movementsView,
  INVENTORY_PERMISSIONS.alertsView
] as const;

export const ITEM_TYPES = ['RawMaterial', 'FinishedGood', 'PackagingMaterial', 'OperationalSupply', 'Other'] as const;
