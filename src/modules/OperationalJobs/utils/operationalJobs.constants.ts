export const OPERATIONAL_JOBS_PERMISSIONS = {
  view: 'labor.operational-jobs.view',
  create: 'labor.operational-jobs.create',
  edit: 'labor.operational-jobs.edit',
  delete: 'labor.operational-jobs.delete',
  changeStatus: 'labor.operational-jobs.change-status'
} as const;

export const OPERATIONAL_JOBS_VIEW_PERMISSIONS = [OPERATIONAL_JOBS_PERMISSIONS.view] as const;

export const OPERATIONAL_JOBS_PAGE_SIZE = 10;
