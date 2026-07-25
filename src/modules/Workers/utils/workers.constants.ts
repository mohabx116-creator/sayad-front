export const WORKERS_PERMISSIONS = {
  view: 'labor.workers.view',
  create: 'labor.workers.create',
  edit: 'labor.workers.edit',
  delete: 'labor.workers.delete',
  changeStatus: 'labor.workers.change-status'
} as const;

export const WORKERS_VIEW_PERMISSIONS = [WORKERS_PERMISSIONS.view] as const;

export const WORKERS_PAGE_SIZE = 10;
export const WORKERS_MAX_PAGE_SIZE = 100;

export const WORKER_MEAL_ALLOWANCE_OPTIONS = [
  { value: '0', labelId: 'meal-allowance-none' },
  { value: '1', labelId: 'meal-allowance-fixed' },
  { value: '2', labelId: 'meal-allowance-per-day' }
] as const;

export const WORKER_OVERTIME_CALCULATION_OPTIONS = [
  { value: '0', labelId: 'overtime-calculation-none' },
  { value: '1', labelId: 'overtime-calculation-hourly-rate' },
  { value: '2', labelId: 'overtime-calculation-multiplier' }
] as const;
