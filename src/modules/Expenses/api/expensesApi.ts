import { AxiosResponse } from 'axios';

import axiosServices from 'utils/axios';
import type { ApiResponse } from 'types/api';
import type {
  ExpenseCategoryDto,
  ExpenseCategoryInput,
  ExpenseCategoriesListParams,
  ExpenseDto,
  ExpenseInput,
  ExpenseListItemDto,
  ExpensesListParams
} from '../types/expense.types';

export interface PagedMeta {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

function unwrap<T>(request: Promise<AxiosResponse<ApiResponse<T>>>): Promise<T> {
  return request.then((response) => {
    const payload = response.data;
    if (!payload.success || payload.data == null) {
      throw new Error(payload.message || payload.errors[0] || 'Request failed');
    }

    return payload.data;
  });
}

function unwrapPaged<T>(request: Promise<AxiosResponse<ApiResponse<T[]>>>): Promise<{ items: T[]; meta: PagedMeta }> {
  return request.then((response) => ({
    items: response.data.data ?? [],
    meta: (response.data.meta as PagedMeta) ?? { page: 1, pageSize: 20, totalCount: 0, totalPages: 0 }
  }));
}

export function buildQuery(params: object) {
  const searchParams = new URLSearchParams();
  Object.entries(params as Record<string, unknown>).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value));
    }
  });
  return searchParams.toString();
}

// Categories
export function listExpenseCategories(params: ExpenseCategoriesListParams) {
  return unwrapPaged<ExpenseCategoryDto>(axiosServices.get('/api/expenses/categories', { params }));
}

export function getExpenseCategory(id: string) {
  return unwrap(axiosServices.get<ApiResponse<ExpenseCategoryDto>>(`/api/expenses/categories/${id}`));
}

export function createExpenseCategory(request: ExpenseCategoryInput) {
  return unwrap(axiosServices.post<ApiResponse<ExpenseCategoryDto>>('/api/expenses/categories', request));
}

export function updateExpenseCategory(id: string, request: ExpenseCategoryInput & { rowVersion: string }) {
  return unwrap(axiosServices.put<ApiResponse<ExpenseCategoryDto>>(`/api/expenses/categories/${id}`, request));
}

export function activateExpenseCategory(id: string) {
  return unwrap(axiosServices.post<ApiResponse<ExpenseCategoryDto>>(`/api/expenses/categories/${id}/activate`));
}

export function deactivateExpenseCategory(id: string) {
  return unwrap(axiosServices.post<ApiResponse<ExpenseCategoryDto>>(`/api/expenses/categories/${id}/deactivate`));
}

// Expenses
export function listExpenses(params: ExpensesListParams) {
  return unwrapPaged<ExpenseListItemDto>(axiosServices.get('/api/expenses', { params }));
}

export function getExpense(id: string) {
  return unwrap(axiosServices.get<ApiResponse<ExpenseDto>>(`/api/expenses/${id}`));
}

export function createExpense(request: ExpenseInput) {
  return unwrap(axiosServices.post<ApiResponse<ExpenseDto>>('/api/expenses', request));
}

export function updateExpense(id: string, request: ExpenseInput & { rowVersion: string }) {
  return unwrap(axiosServices.put<ApiResponse<ExpenseDto>>(`/api/expenses/${id}`, request));
}

export function postExpense(id: string, rowVersion: string) {
  return unwrap(axiosServices.post<ApiResponse<ExpenseDto>>(`/api/expenses/${id}/post`, { rowVersion }));
}

export function cancelExpense(id: string, request: { reason: string; rowVersion: string }) {
  return unwrap(axiosServices.post<ApiResponse<ExpenseDto>>(`/api/expenses/${id}/cancel`, request));
}
