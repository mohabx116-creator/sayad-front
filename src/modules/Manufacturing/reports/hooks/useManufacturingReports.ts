import useSWR from 'swr';
import { manufacturingReportsApi } from '../api/manufacturingReportsApi';

export function useManufacturingDashboard() {
  const { data, error, isLoading, mutate } = useSWR('/manufacturing/reports/dashboard', () =>
    manufacturingReportsApi.getDashboard()
  );

  return {
    dashboard: data,
    isLoading,
    error,
    mutate
  };
}

export function useManufacturingWipReport() {
  const { data, error, isLoading, mutate } = useSWR('/manufacturing/reports/wip', () =>
    manufacturingReportsApi.getWipReport()
  );

  return {
    wipReport: data,
    isLoading,
    error,
    mutate
  };
}

export function useProductionCostAnalysis(params?: { dateFrom?: string; dateTo?: string; finishedGoodItemId?: string }) {
  const key = ['/manufacturing/reports/cost-analysis', params?.dateFrom, params?.dateTo, params?.finishedGoodItemId];
  const { data, error, isLoading, mutate } = useSWR(key, () =>
    manufacturingReportsApi.getCostAnalysis(params)
  );

  return {
    costAnalysis: data,
    isLoading,
    error,
    mutate
  };
}

export function useManufacturingCostVariance(params?: { dateFrom?: string; dateTo?: string; finishedGoodItemId?: string }) {
  const key = ['/manufacturing/reports/cost-variance', params?.dateFrom, params?.dateTo, params?.finishedGoodItemId];
  const { data, error, isLoading, mutate } = useSWR(key, () =>
    manufacturingReportsApi.getCostVariance(params)
  );

  return {
    varianceReport: data,
    isLoading,
    error,
    mutate
  };
}
