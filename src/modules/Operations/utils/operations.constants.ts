export const OPERATIONS_PERMISSIONS = {
  view: 'labor.operations.view',
  create: 'labor.operations.create'
} as const;

export const OPERATIONS_VIEW_PERMISSIONS = [OPERATIONS_PERMISSIONS.view] as const;

export const OPERATIONS_PAGE_SIZE = 10;
