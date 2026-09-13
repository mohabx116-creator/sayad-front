export const MANUFACTURING_PERMISSIONS = {
  view: 'manufacturing.view',
  // BOM permissions — backend uses 'manufacturing.bom.*' (singular)
  bomsView: 'manufacturing.bom.view',
  bomsCreate: 'manufacturing.bom.create',
  bomsUpdate: 'manufacturing.bom.update',
  bomsDelete: 'manufacturing.bom.delete',
  // Orders permissions
  ordersView: 'manufacturing.orders.view',
  ordersCreate: 'manufacturing.orders.create',
  ordersUpdate: 'manufacturing.orders.update',
  ordersApprove: 'manufacturing.orders.approve',
  ordersRelease: 'manufacturing.orders.release',
  ordersCancel: 'manufacturing.orders.cancel',
  ordersClose: 'manufacturing.orders.close',
  // Issue Materials & Receive Goods use OrdersUpdate per backend controller
  ordersIssueMaterials: 'manufacturing.orders.update',
  ordersReceiveGoods: 'manufacturing.orders.update',
  // Work centers permissions
  workCentersView: 'manufacturing.workcenters.view',
  workCentersCreate: 'manufacturing.workcenters.create',
  workCentersUpdate: 'manufacturing.workcenters.update',
  workCentersDelete: 'manufacturing.workcenters.delete',
  // Reports permissions
  dashboardView: 'manufacturing.dashboard.view',
  reportsView: 'manufacturing.reports.view'
} as const;

export const MANUFACTURING_VIEW_PERMISSIONS = [
  MANUFACTURING_PERMISSIONS.view,
  MANUFACTURING_PERMISSIONS.bomsView,
  MANUFACTURING_PERMISSIONS.ordersView,
  MANUFACTURING_PERMISSIONS.workCentersView,
  MANUFACTURING_PERMISSIONS.dashboardView,
  MANUFACTURING_PERMISSIONS.reportsView
] as const;

export const WORKCENTERS_VIEW = MANUFACTURING_PERMISSIONS.workCentersView;
export const WORKCENTERS_CREATE = MANUFACTURING_PERMISSIONS.workCentersCreate;
export const WORKCENTERS_UPDATE = MANUFACTURING_PERMISSIONS.workCentersUpdate;
export const WORKCENTERS_DELETE = MANUFACTURING_PERMISSIONS.workCentersDelete;

export const PRODUCTION_ORDER_STATUSES = [
  'Draft',
  'Approved',
  'Released',
  'InProgress',
  'Completed',
  'Closed',
  'Cancelled'
] as const;

export const PRODUCTION_OWNERSHIP_TYPES = [
  'Company',
  'Customer',
  'Mixed'
] as const;

export const INVENTORY_OWNERSHIP_TYPES = [
  'Company',
  'Customer'
] as const;
