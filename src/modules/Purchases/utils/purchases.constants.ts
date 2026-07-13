export const PURCHASES_PERMISSIONS = {
  view: 'purchases.view',
  invoicesView: 'purchases.invoices.view',
  invoicesCreate: 'purchases.invoices.create',
  invoicesUpdate: 'purchases.invoices.update',
  invoicesPost: 'purchases.invoices.post',
  invoicesCancel: 'purchases.invoices.cancel',
  returnsView: 'purchases.returns.view',
  returnsCreate: 'purchases.returns.create',
  returnsUpdate: 'purchases.returns.update',
  returnsPost: 'purchases.returns.post',
  returnsCancel: 'purchases.returns.cancel'
} as const;

export const PURCHASES_VIEW_PERMISSIONS = [
  PURCHASES_PERMISSIONS.view,
  PURCHASES_PERMISSIONS.invoicesView,
  PURCHASES_PERMISSIONS.returnsView
] as const;
