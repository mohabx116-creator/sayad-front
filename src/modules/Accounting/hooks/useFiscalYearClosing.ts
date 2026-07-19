import useSWR from 'swr';

import type { ApiResponse } from 'types/api';
import { fetcher } from 'utils/axios';
import type { FiscalYearClosingOverviewDto } from '../types/fiscal-year-closing.types';

export function useFiscalYearClosingOverview(fiscalYearId?: string | null) {
  const key = fiscalYearId ? `/api/accounting/year-end-closing?fiscalYearId=${encodeURIComponent(fiscalYearId)}` : null;
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<FiscalYearClosingOverviewDto>>(key, fetcher, {
    revalidateOnFocus: false
  });

  return {
    overview: data?.data ?? null,
    error,
    isLoading,
    mutate,
    key
  };
}
