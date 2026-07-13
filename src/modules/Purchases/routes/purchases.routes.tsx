import { lazy } from 'react';

import Loadable from 'ui-component/Loadable';

const PurchaseInvoicesListPage = Loadable(lazy(() => import('../pages/PurchaseInvoicesListPage')));
const PurchaseInvoiceDetailsPage = Loadable(lazy(() => import('../pages/PurchaseInvoiceDetailsPage')));
const PurchaseInvoiceFormPage = Loadable(lazy(() => import('../pages/PurchaseInvoiceFormPage')));
const PurchaseReturnsListPage = Loadable(lazy(() => import('../pages/PurchaseReturnsListPage')));
const PurchaseReturnDetailsPage = Loadable(lazy(() => import('../pages/PurchaseReturnDetailsPage')));
const PurchaseReturnFormPage = Loadable(lazy(() => import('../pages/PurchaseReturnFormPage')));

export const purchasesRoutes = [
  { path: 'purchases/invoices', element: <PurchaseInvoicesListPage /> },
  { path: 'purchases/invoices/new', element: <PurchaseInvoiceFormPage /> },
  { path: 'purchases/invoices/:id', element: <PurchaseInvoiceDetailsPage /> },
  { path: 'purchases/invoices/:id/edit', element: <PurchaseInvoiceFormPage /> },
  { path: 'purchases/returns', element: <PurchaseReturnsListPage /> },
  { path: 'purchases/returns/new', element: <PurchaseReturnFormPage /> },
  { path: 'purchases/returns/:id', element: <PurchaseReturnDetailsPage /> },
  { path: 'purchases/returns/:id/edit', element: <PurchaseReturnFormPage /> }
];
