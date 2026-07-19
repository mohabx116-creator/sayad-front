import useSWR from 'swr';

import type { ApiResponse } from 'types/api';
import fetcher from 'utils/axios';
import type { AccountingFiscalYearDto, AccountingPeriodControlDto } from '../types/accounting-periods.types';

export function useAccountingPeriodControl() {
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<AccountingPeriodControlDto>>('/api/accounting/period-control', fetcher, {
    revalidateOnFocus: false
  });

  return {
    control: data?.data ?? null,
    error,
    isLoading,
    mutate
  };
}

export function useAccountingFiscalYears() {
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<AccountingFiscalYearDto[]>>('/api/accounting/fiscal-years', fetcher, {
    revalidateOnFocus: false
  });

  return {
    years: data?.data ?? [],
    error,
    isLoading,
    mutate
  };
}
