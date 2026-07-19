import { AxiosResponse } from 'axios';

import axiosServices from 'utils/axios';
import type { ApiResponse } from 'types/api';
import type {
  FiscalYearRolloverActionInput,
  FiscalYearRolloverHistoryItemDto,
  FiscalYearRolloverPreviewDto
} from '../types/fiscal-year-rollover.types';

function unwrap<T>(request: Promise<AxiosResponse<ApiResponse<T>>>): Promise<T> {
  return request.then((response) => {
    const payload = response.data;
    if (!payload.success || payload.data == null) {
      throw new Error(payload.message || payload.errors[0] || 'Request failed');
    }

    return payload.data;
  });
}

export function getFiscalYearRolloverPreview(fiscalYearId: string) {
  return unwrap(axiosServices.get<ApiResponse<FiscalYearRolloverPreviewDto>>(`/api/accounting/fiscal-years/${fiscalYearId}/rollover/preview`));
}

export function getFiscalYearRolloverHistory(fiscalYearId: string) {
  return unwrap(axiosServices.get<ApiResponse<FiscalYearRolloverHistoryItemDto[]>>(`/api/accounting/fiscal-years/${fiscalYearId}/rollover/history`));
}

export function createFiscalYearRollover(fiscalYearId: string, request: FiscalYearRolloverActionInput) {
  return unwrap(axiosServices.post<ApiResponse<FiscalYearRolloverPreviewDto>>(`/api/accounting/fiscal-years/${fiscalYearId}/rollover`, request));
}

export function rollbackFiscalYearRollover(fiscalYearId: string, request: FiscalYearRolloverActionInput) {
  return unwrap(axiosServices.post<ApiResponse<FiscalYearRolloverPreviewDto>>(`/api/accounting/fiscal-years/${fiscalYearId}/rollover/rollback`, request));
}
