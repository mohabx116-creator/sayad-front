export const MONTHLY_MOVEMENTS_PERMISSIONS = {
  view: 'labor.monthly-movements.view',
  create: 'labor.monthly-movements.create',
  edit: 'labor.monthly-movements.edit',
  delete: 'labor.monthly-movements.delete',
  approve: 'labor.monthly-movements.approve',
  reject: 'labor.monthly-movements.reject'
} as const;

export const MONTHLY_MOVEMENTS_VIEW_PERMISSIONS = [MONTHLY_MOVEMENTS_PERMISSIONS.view] as const;

export const MONTHLY_MOVEMENTS_PAGE_SIZE = 10;
export const MONTHLY_MOVEMENTS_MAX_PAGE_SIZE = 100;

export const MONTHLY_MOVEMENT_TYPE_OPTIONS = [
  { value: '1', labelId: 'monthly-movement-type-absence' },
  { value: '2', labelId: 'monthly-movement-type-overtime' },
  { value: '3', labelId: 'monthly-movement-type-night-work' },
  { value: '4', labelId: 'monthly-movement-type-deduction' },
  { value: '5', labelId: 'monthly-movement-type-bonus' }
] as const;

export const MONTHLY_MOVEMENT_STATUS_OPTIONS = [
  { value: '1', labelId: 'monthly-movement-status-draft' },
  { value: '2', labelId: 'monthly-movement-status-approved' },
  { value: '3', labelId: 'monthly-movement-status-rejected' }
] as const;
