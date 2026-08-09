import { AxiosResponse } from 'axios';

import axiosServices from 'utils/axios';
import type { ApiResponse } from 'types/api';
import type {
  BalanceSheetParams,
  BalanceSheetReportDto,
  CashFlowParams,
  CashFlowReportDto,
  CustomerReceivablesAgingParams,
  CustomerReceivablesAgingReportDto,
  GeneralLedgerParams,
  GeneralLedgerReportDto,
  IncomeStatementParams,
  IncomeStatementReportDto,
  InventoryGlReconciliationParams,
  InventoryGlReconciliationReportDto,
  TreasuryGlReconciliationParams,
  TreasuryGlReconciliationReportDto,
  SupplierPayablesAgingParams,
  SupplierPayablesAgingReportDto,
  PurchaseInvoicesReportQuery,
  PurchaseInvoicesReportResponse,
  ReceiptsPaymentsReportQuery,
  ReceiptsPaymentsReportResponse,
  TrialBalanceParams,
  TrialBalanceReportDto
} from '../types/report.types';

function unwrap<T>(request: Promise<AxiosResponse<ApiResponse<T>>>): Promise<T> {
  return request.then((response) => {
    if (!response.data.success) {
      throw new Error(response.data.message || response.data.errors?.[0] || 'Request failed');
    }

    return response.data.data as T;
  });
}

function buildQuery(params: Record<string, string | number | boolean | undefined | null>) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, String(value));
    }
  });

  return search.toString();
}

export function getGeneralLedgerReport(params: GeneralLedgerParams) {
  return unwrap(axiosServices.get<ApiResponse<GeneralLedgerReportDto>>(`/api/accounting/reports/general-ledger?${buildQuery(params)}`));
}

export function getTrialBalanceReport(params: TrialBalanceParams) {
  return unwrap(axiosServices.get<ApiResponse<TrialBalanceReportDto>>(`/api/accounting/reports/trial-balance?${buildQuery(params)}`));
}

export function getBalanceSheetReport(params: BalanceSheetParams) {
  return unwrap(axiosServices.get<ApiResponse<BalanceSheetReportDto>>(`/api/accounting/reports/balance-sheet?${buildQuery(params)}`));
}

export function getCashFlowReport(params: CashFlowParams) {
  return unwrap(axiosServices.get<ApiResponse<CashFlowReportDto>>(`/api/accounting/reports/cash-flow?${buildQuery(params)}`));
}

export function getInventoryGlReconciliationReport(params: InventoryGlReconciliationParams) {
  return unwrap(axiosServices.get<ApiResponse<InventoryGlReconciliationReportDto>>(`/api/accounting/reports/inventory-gl-reconciliation?${buildQuery(params)}`));
}

export function getTreasuryGlReconciliationReport(params: TreasuryGlReconciliationParams) {
  return unwrap(axiosServices.get<ApiResponse<TreasuryGlReconciliationReportDto>>(`/api/accounting/reports/treasury-gl-reconciliation?${buildQuery(params)}`));
}

export function getCustomerReceivablesAgingReport(params: CustomerReceivablesAgingParams) {
  return unwrap(axiosServices.get<ApiResponse<CustomerReceivablesAgingReportDto>>(`/api/accounting/reports/customer-receivables-aging?${buildQuery(params)}`));
}

export function getSupplierPayablesAgingReport(params: SupplierPayablesAgingParams) {
  return unwrap(axiosServices.get<ApiResponse<SupplierPayablesAgingReportDto>>(`/api/accounting/reports/supplier-payables-aging?${buildQuery(params)}`));
}

export function getIncomeStatementReport(params: IncomeStatementParams) {
  return unwrap(axiosServices.get<ApiResponse<IncomeStatementReportDto>>(`/api/accounting/reports/income-statement?${buildQuery(params)}`));
}

export function getPurchaseInvoicesReport(params: PurchaseInvoicesReportQuery) {
  return unwrap(axiosServices.get<ApiResponse<PurchaseInvoicesReportResponse>>(`/api/reports/purchases/invoices?${buildQuery(params)}`));
}

export function getReceiptsPaymentsReport(params: ReceiptsPaymentsReportQuery) {
  return unwrap(axiosServices.get<ApiResponse<ReceiptsPaymentsReportResponse>>(`/api/reports/treasury/receipts-payments?${buildQuery(params)}`));
}
