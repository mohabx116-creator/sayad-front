import useSWR from 'swr';

import type { ApiResponse } from 'types/api';
import { fetcher } from 'utils/axios';
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
  TrialBalanceParams,
  TrialBalanceReportDto
} from '../types/report.types';

function buildQuery(params: Record<string, string | number | boolean | undefined | null>) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, String(value));
    }
  });

  return search.toString();
}

export function useGeneralLedgerReport(params?: GeneralLedgerParams | null) {
  const key = params?.accountId ? `/api/accounting/reports/general-ledger?${buildQuery(params)}` : null;
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<GeneralLedgerReportDto>>(key, fetcher, {
    revalidateOnFocus: false
  });

  return {
    report: data?.data ?? null,
    error,
    isLoading,
    mutate,
    key
  };
}

export function useTrialBalanceReport(params: TrialBalanceParams) {
  const key = `/api/accounting/reports/trial-balance?${buildQuery(params)}`;
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<TrialBalanceReportDto>>(key, fetcher, {
    revalidateOnFocus: false
  });

  return {
    report: data?.data ?? null,
    error,
    isLoading,
    mutate,
    key
  };
}

export function useBalanceSheetReport(params: BalanceSheetParams) {
  const key = `/api/accounting/reports/balance-sheet?${buildQuery(params)}`;
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<BalanceSheetReportDto>>(key, fetcher, {
    revalidateOnFocus: false
  });

  return {
    report: data?.data ?? null,
    error,
    isLoading,
    mutate,
    key
  };
}

export function useCashFlowReport(params: CashFlowParams) {
  const key = `/api/accounting/reports/cash-flow?${buildQuery(params)}`;
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<CashFlowReportDto>>(key, fetcher, {
    revalidateOnFocus: false
  });

  return {
    report: data?.data ?? null,
    error,
    isLoading,
    mutate,
    key
  };
}

export function useInventoryGlReconciliationReport(params?: InventoryGlReconciliationParams | null) {
  const key = params ? `/api/accounting/reports/inventory-gl-reconciliation?${buildQuery(params)}` : null;
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<InventoryGlReconciliationReportDto>>(key, fetcher, {
    revalidateOnFocus: false
  });

  return {
    report: data?.data ?? null,
    error,
    isLoading,
    mutate,
    key
  };
}

export function useTreasuryGlReconciliationReport(params?: TreasuryGlReconciliationParams | null) {
  const key = params ? `/api/accounting/reports/treasury-gl-reconciliation?${buildQuery(params)}` : null;
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<TreasuryGlReconciliationReportDto>>(key, fetcher, {
    revalidateOnFocus: false
  });

  return {
    report: data?.data ?? null,
    error,
    isLoading,
    mutate,
    key
  };
}

export function useCustomerReceivablesAgingReport(params?: CustomerReceivablesAgingParams | null) {
  const key = params ? `/api/accounting/reports/customer-receivables-aging?${buildQuery(params)}` : null;
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<CustomerReceivablesAgingReportDto>>(key, fetcher, {
    revalidateOnFocus: false
  });

  return {
    report: data?.data ?? null,
    error,
    isLoading,
    mutate,
    key
  };
}

export function useSupplierPayablesAgingReport(params?: SupplierPayablesAgingParams | null) {
  const key = params ? `/api/accounting/reports/supplier-payables-aging?${buildQuery(params)}` : null;
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<SupplierPayablesAgingReportDto>>(key, fetcher, {
    revalidateOnFocus: false
  });

  return {
    report: data?.data ?? null,
    error,
    isLoading,
    mutate,
    key
  };
}

export function useIncomeStatementReport(params: IncomeStatementParams) {
  const key = `/api/accounting/reports/income-statement?${buildQuery(params)}`;
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<IncomeStatementReportDto>>(key, fetcher, {
    revalidateOnFocus: false
  });

  return {
    report: data?.data ?? null,
    error,
    isLoading,
    mutate,
    key
  };
}

export function usePurchaseInvoicesReport(params: PurchaseInvoicesReportQuery) {
  const key = `/api/reports/purchases/invoices?${buildQuery(params)}`;
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<PurchaseInvoicesReportResponse>>(key, fetcher, {
    revalidateOnFocus: false
  });

  return {
    report: data?.data ?? null,
    error,
    isLoading,
    mutate,
    key
  };
}
