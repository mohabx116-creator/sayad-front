import useSWR from 'swr';

import type { ApiResponse } from 'types/api';
import { fetcher } from 'utils/axios';
import type { FiscalYearRolloverHistoryItemDto, FiscalYearRolloverPreviewDto } from '../types/fiscal-year-rollover.types';

export function useFiscalYearRolloverPreview(fiscalYearId?: string | null) {
  const key = fiscalYearId ? `/api/accounting/fiscal-years/${encodeURIComponent(fiscalYearId)}/rollover/preview` : null;
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<FiscalYearRolloverPreviewDto>>(key, fetcher, {
    revalidateOnFocus: false
  });

  return {
    preview: data?.data ?? null,
    error,
    isLoading,
    mutate
  };
}

export function useFiscalYearRolloverHistory(fiscalYearId?: string | null) {
  const key = fiscalYearId ? `/api/accounting/fiscal-years/${encodeURIComponent(fiscalYearId)}/rollover/history` : null;
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<FiscalYearRolloverHistoryItemDto[]>>(key, fetcher, {
    revalidateOnFocus: false
  });

  return {
    history: data?.data ?? [],
    error,
    isLoading,
    mutate
  };
}
