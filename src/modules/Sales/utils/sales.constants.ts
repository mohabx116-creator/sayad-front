export const SALES_PERMISSIONS = {
  view: 'sales.view',
  invoicesView: 'sales.invoices.view',
  invoicesCreate: 'sales.invoices.create',
  invoicesUpdate: 'sales.invoices.update',
  invoicesPost: 'sales.invoices.post',
  invoicesCancel: 'sales.invoices.cancel',
  returnsView: 'sales.returns.view',
  returnsCreate: 'sales.returns.create',
  returnsUpdate: 'sales.returns.update',
  returnsPost: 'sales.returns.post',
  returnsCancel: 'sales.returns.cancel'
} as const;

export const SALES_VIEW_PERMISSIONS = [
  SALES_PERMISSIONS.view,
  SALES_PERMISSIONS.invoicesView,
  SALES_PERMISSIONS.returnsView
] as const;
