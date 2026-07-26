export const PAYROLL_PERMISSIONS = {
  view: 'payroll.periods.view',
  create: 'payroll.periods.create',
  calculate: 'payroll.periods.calculate',
  approve: 'payroll.periods.approve',
  delete: 'payroll.periods.delete'
} as const;

export const PAYROLL_VIEW_PERMISSIONS = [PAYROLL_PERMISSIONS.view] as const;

export const PAYROLL_PAGE_SIZE = 10;

export const PAYROLL_PERIOD_STATUS = {
  Draft: 1,
  Calculated: 2,
  Approved: 3
} as const;

export const PAYROLL_PERIOD_STATUS_OPTIONS = [
  { value: PAYROLL_PERIOD_STATUS.Draft, labelId: 'payroll-period-status-draft' },
  { value: PAYROLL_PERIOD_STATUS.Calculated, labelId: 'payroll-period-status-calculated' },
  { value: PAYROLL_PERIOD_STATUS.Approved, labelId: 'payroll-period-status-approved' }
] as const;
