export const PARTIES_PERMISSIONS = {
  view: 'parties.view',
  create: 'parties.create',
  update: 'parties.update',
  activate: 'parties.activate',
  deactivate: 'parties.deactivate',
  openingBalanceView: 'parties.opening-balance.view',
  openingBalanceManage: 'parties.opening-balance.manage',
  statementView: 'parties.statement.view'
} as const;

export const PARTIES_VIEW_PERMISSIONS = [PARTIES_PERMISSIONS.view] as const;
