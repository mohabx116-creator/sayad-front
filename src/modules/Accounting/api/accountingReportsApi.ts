import { AxiosResponse } from 'axios';

import axiosServices from 'utils/axios';
import type { ApiResponse } from 'types/api';
import type {
  BalanceSheetParams,
  BalanceSheetReportDto,
  GeneralLedgerParams,
  GeneralLedgerReportDto,
  IncomeStatementParams,
  IncomeStatementReportDto,
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

export function getIncomeStatementReport(params: IncomeStatementParams) {
  return unwrap(axiosServices.get<ApiResponse<IncomeStatementReportDto>>(`/api/accounting/reports/income-statement?${buildQuery(params)}`));
}
