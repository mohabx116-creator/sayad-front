import { useMemo } from 'react';
import useSWR from 'swr';

import { fetcher } from 'utils/axios';
import type { ApiResponse } from 'types/api';
import type {
  ExpenseCategoryDto,
  ExpenseCategoriesListParams,
  ExpenseDto,
  ExpenseListItemDto,
  ExpensesListParams
} from '../types/expense.types';
import { buildQuery, type PagedMeta } from '../api/expensesApi';

function toListResult<T>(data?: ApiResponse<T[]>) {
  return {
    items: data?.data ?? [],
    meta: (data?.meta as PagedMeta) ?? { page: 1, pageSize: 20, totalCount: 0, totalPages: 0 }
  };
}

export function useExpenseCategories(params: ExpenseCategoriesListParams) {
  const key = `/api/expenses/categories?${buildQuery(params)}`;
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<ExpenseCategoryDto[]>>(key, fetcher);
  return useMemo(() => ({ ...toListResult(data), error, isLoading, mutate, key }), [data, error, isLoading, key, mutate]);
}

export function useExpenseCategory(id?: string) {
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<ExpenseCategoryDto>>(id ? `/api/expenses/categories/${id}` : null, fetcher);
  return useMemo(() => ({ category: data?.data ?? null, error, isLoading, mutate }), [data, error, isLoading, mutate]);
}

export function useExpenses(params: ExpensesListParams) {
  const key = `/api/expenses?${buildQuery(params)}`;
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<ExpenseListItemDto[]>>(key, fetcher);
  return useMemo(() => ({ ...toListResult(data), error, isLoading, mutate, key }), [data, error, isLoading, key, mutate]);
}

export function useExpense(id?: string) {
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<ExpenseDto>>(id ? `/api/expenses/${id}` : null, fetcher);
  return useMemo(() => ({ expense: data?.data ?? null, error, isLoading, mutate }), [data, error, isLoading, mutate]);
}
