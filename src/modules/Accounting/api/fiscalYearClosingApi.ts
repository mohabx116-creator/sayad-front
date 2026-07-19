import { AxiosResponse } from 'axios';

import axiosServices from 'utils/axios';
import type { ApiResponse } from 'types/api';
import type { FiscalYearClosingActionRequest, FiscalYearClosingOverviewDto } from '../types/fiscal-year-closing.types';

function unwrap<T>(request: Promise<AxiosResponse<ApiResponse<T>>>): Promise<T> {
  return request.then((response) => {
    const payload = response.data;
    if (!payload.success || payload.data == null) {
      throw new Error(payload.message || payload.errors[0] || 'Request failed');
    }

    return payload.data;
  });
}

export function getFiscalYearClosingOverview(fiscalYearId: string) {
  return unwrap(axiosServices.get<ApiResponse<FiscalYearClosingOverviewDto>>('/api/accounting/year-end-closing', { params: { fiscalYearId } }));
}

export function closeFiscalYear(request: FiscalYearClosingActionRequest) {
  return unwrap(axiosServices.post<ApiResponse<FiscalYearClosingOverviewDto>>('/api/accounting/year-end-closing/close', request));
}

export function reopenFiscalYear(request: FiscalYearClosingActionRequest) {
  return unwrap(axiosServices.post<ApiResponse<FiscalYearClosingOverviewDto>>('/api/accounting/year-end-closing/reopen', request));
}
