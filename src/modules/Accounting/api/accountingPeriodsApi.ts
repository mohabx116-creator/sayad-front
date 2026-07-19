import { AxiosResponse } from 'axios';

import axiosServices from 'utils/axios';
import type { ApiResponse } from 'types/api';
import type {
  AccountingFiscalYearDto,
  AccountingFiscalYearInput,
  AccountingPeriodControlDto,
  AccountingPeriodControlInput
} from '../types/accounting-periods.types';

function unwrap<T>(request: Promise<AxiosResponse<ApiResponse<T>>>): Promise<T> {
  return request.then((response) => {
    const payload = response.data;
    if (!payload.success || payload.data == null) {
      throw new Error(payload.message || payload.errors[0] || 'Request failed');
    }

    return payload.data;
  });
}

export function getAccountingPeriodControl() {
  return unwrap(axiosServices.get<ApiResponse<AccountingPeriodControlDto>>('/api/accounting/period-control'));
}

export function updateAccountingPeriodControl(request: AccountingPeriodControlInput) {
  return unwrap(axiosServices.put<ApiResponse<AccountingPeriodControlDto>>('/api/accounting/period-control', request));
}

export function listAccountingFiscalYears() {
  return unwrap(axiosServices.get<ApiResponse<AccountingFiscalYearDto[]>>('/api/accounting/fiscal-years'));
}

export function createAccountingFiscalYear(request: AccountingFiscalYearInput) {
  return unwrap(axiosServices.post<ApiResponse<AccountingFiscalYearDto>>('/api/accounting/fiscal-years', request));
}

export function closeAccountingPeriod(id: string, rowVersion: string) {
  return unwrap(axiosServices.post<ApiResponse<object>>(`/api/accounting/periods/${id}/close`, { rowVersion }));
}

export function reopenAccountingPeriod(id: string, rowVersion: string) {
  return unwrap(axiosServices.post<ApiResponse<object>>(`/api/accounting/periods/${id}/reopen`, { rowVersion }));
}
