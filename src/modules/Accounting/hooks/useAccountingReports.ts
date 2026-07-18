import useSWR from 'swr';

import type { ApiResponse } from 'types/api';
import { fetcher } from 'utils/axios';
import type {
  GeneralLedgerParams,
  GeneralLedgerReportDto,
  IncomeStatementParams,
  IncomeStatementReportDto,
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
