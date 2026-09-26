export const PARTIES_PERMISSIONS = {
  view: 'parties.view',
  create: 'parties.create',
  update: 'parties.update',
  activate: 'parties.activate',
  deactivate: 'parties.deactivate',
  delete: 'parties.delete',
  openingBalanceView: 'parties.opening-balance.view',
  openingBalanceManage: 'parties.opening-balance.manage',
  statementView: 'parties.statement.view',
  adjustmentsManage: 'parties.adjustments.manage'
} as const;

export const PARTIES_VIEW_PERMISSIONS = [PARTIES_PERMISSIONS.view] as const;
