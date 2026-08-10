import { useMemo } from 'react';
import useSWR from 'swr';

import { fetcher } from 'utils/axios';
import type { ApiResponse } from 'types/api';
import type { CustomerMaterialConversionDto, CustomerMaterialConversionListItemDto, CustomerMaterialIntakeDto, CustomerMaterialIntakeListItemDto } from '../types/customerMaterials.types';
import type { ListMeta } from '../types/inventory.types';
import { buildCustomerMaterialsQuery } from '../api/customerMaterialsApi';

function toListResult<T>(data?: { items: T[]; meta: ListMeta }) {
  return {
    items: data?.items ?? [],
    meta: data?.meta ?? { page: 1, pageSize: 20, totalCount: 0, totalPages: 0 }
  };
}

export function useCustomerMaterialIntakes(params: Record<string, string | number | boolean | undefined | null> = { page: 1, pageSize: 20 }) {
  const key = `/api/inventory/customer-material-intakes?${buildCustomerMaterialsQuery(params)}`;
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<CustomerMaterialIntakeListItemDto[]>>(key, fetcher);

  return useMemo(() => ({ ...toListResult({ items: data?.data ?? [], meta: (data?.meta as ListMeta) ?? { page: 1, pageSize: 20, totalCount: 0, totalPages: 0 } }), error, isLoading, mutate, key }), [data, error, isLoading, key, mutate]);
}

export function useCustomerMaterialIntake(id?: string) {
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<CustomerMaterialIntakeDto>>(id ? `/api/inventory/customer-material-intakes/${id}` : null, fetcher);
  return useMemo(() => ({ intake: data?.data ?? null, error, isLoading, mutate }), [data, error, isLoading, mutate]);
}

export function useCustomerMaterialConversions(params: Record<string, string | number | boolean | undefined | null> = { page: 1, pageSize: 20 }) {
  const key = `/api/inventory/customer-material-conversions?${buildCustomerMaterialsQuery(params)}`;
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<CustomerMaterialConversionListItemDto[]>>(key, fetcher);

  return useMemo(() => ({ ...toListResult({ items: data?.data ?? [], meta: (data?.meta as ListMeta) ?? { page: 1, pageSize: 20, totalCount: 0, totalPages: 0 } }), error, isLoading, mutate, key }), [data, error, isLoading, key, mutate]);
}

export function useCustomerMaterialConversion(id?: string) {
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<CustomerMaterialConversionDto>>(id ? `/api/inventory/customer-material-conversions/${id}` : null, fetcher);
  return useMemo(() => ({ conversion: data?.data ?? null, error, isLoading, mutate }), [data, error, isLoading, mutate]);
}
