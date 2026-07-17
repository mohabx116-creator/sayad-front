import { useMemo } from 'react';
import useSWR from 'swr';

import { fetcher } from 'utils/axios';
import type { ApiResponse } from 'types/api';
import type { AccountingSettingMappingDto } from '../types/accounting-settings.types';

export function useAccountingSettings() {
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<AccountingSettingMappingDto[]>>('/api/accounting/settings/mappings', fetcher, {
    revalidateOnFocus: false
  });

  return useMemo(() => ({ mappings: data?.data ?? [], error, isLoading, mutate }), [data, error, isLoading, mutate]);
}
