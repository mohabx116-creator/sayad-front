import { lazy } from 'react';

import Loadable from 'ui-component/Loadable';

const SalesInvoicesListPage = Loadable(lazy(() => import('../pages/SalesInvoicesListPage')));
const SalesInvoiceDetailsPage = Loadable(lazy(() => import('../pages/SalesInvoiceDetailsPage')));
const SalesInvoiceFormPage = Loadable(lazy(() => import('../pages/SalesInvoiceFormPage')));
const SalesReturnsListPage = Loadable(lazy(() => import('../pages/SalesReturnsListPage')));
const SalesReturnDetailsPage = Loadable(lazy(() => import('../pages/SalesReturnDetailsPage')));
const SalesReturnFormPage = Loadable(lazy(() => import('../pages/SalesReturnFormPage')));

const SalesInvoicesReportPage = Loadable(lazy(() => import('../pages/SalesInvoicesReportPage')));

export const salesRoutes = [
  { path: 'sales/reports/invoices', element: <SalesInvoicesReportPage /> },
  { path: 'sales/invoices', element: <SalesInvoicesListPage /> },
  { path: 'sales/invoices/new', element: <SalesInvoiceFormPage /> },
  { path: 'sales/invoices/:id', element: <SalesInvoiceDetailsPage /> },
  { path: 'sales/invoices/:id/edit', element: <SalesInvoiceFormPage /> },
  { path: 'sales/returns', element: <SalesReturnsListPage /> },
  { path: 'sales/returns/new', element: <SalesReturnFormPage /> },
  { path: 'sales/returns/:id', element: <SalesReturnDetailsPage /> },
  { path: 'sales/returns/:id/edit', element: <SalesReturnFormPage /> }
];
