export const PAYROLL_PERMISSIONS = {
  view: 'payroll.periods.view',
  create: 'payroll.periods.create',
  calculate: 'payroll.periods.calculate',
  approve: 'payroll.periods.approve',
  reopen: 'payroll.periods.reopen',
  pay: 'payroll.periods.pay',
  delete: 'payroll.periods.delete'
} as const;

export const PAYROLL_VIEW_PERMISSIONS = [PAYROLL_PERMISSIONS.view] as const;

export const PAYROLL_PAGE_SIZE = 10;

export const PAYROLL_PERIOD_STATUS = {
  Draft: 1,
  Calculated: 2,
  Approved: 3,
  Paid: 4
} as const;

export const PAYROLL_PERIOD_STATUS_OPTIONS = [
  { value: PAYROLL_PERIOD_STATUS.Draft, labelId: 'payroll-period-status-draft' },
  { value: PAYROLL_PERIOD_STATUS.Calculated, labelId: 'payroll-period-status-calculated' },
  { value: PAYROLL_PERIOD_STATUS.Approved, labelId: 'payroll-period-status-approved' },
  { value: PAYROLL_PERIOD_STATUS.Paid, labelId: 'payroll-period-status-paid' }
] as const;
