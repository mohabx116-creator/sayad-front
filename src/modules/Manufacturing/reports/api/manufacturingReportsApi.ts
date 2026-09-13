import { AxiosResponse } from 'axios';
import axiosServices from 'utils/axios';
import type { ApiResponse } from 'types/api';
import { 
  ManufacturingDashboardDto, 
  ManufacturingWipReportItemDto, 
  ProductionCostAnalysisDto,
  ProductionCostVarianceDto
} from '../types/manufacturingReports.types';

function unwrap<T>(request: Promise<AxiosResponse<ApiResponse<T>>>): Promise<T> {
  return request.then((response) => {
    if (response.data.success && response.data.data !== undefined) {
      return response.data.data as T;
    }
    return Promise.reject(new Error(response.data.message || 'API Error'));
  });
}

export const manufacturingReportsApi = {
  getDashboard: () => {
    return unwrap<ManufacturingDashboardDto>(axiosServices.get('/api/manufacturing/reports/dashboard'));
  },
  getWipReport: () => {
    return unwrap<ManufacturingWipReportItemDto[]>(axiosServices.get('/api/manufacturing/reports/wip'));
  },
  getCostAnalysis: (params?: { dateFrom?: string; dateTo?: string; finishedGoodItemId?: string }) => {
    return unwrap<ProductionCostAnalysisDto[]>(axiosServices.get('/api/manufacturing/reports/cost-analysis', { params }));
  },
  getCostVariance: (params?: { dateFrom?: string; dateTo?: string; finishedGoodItemId?: string }) => {
    return unwrap<ProductionCostVarianceDto[]>(axiosServices.get('/api/manufacturing/reports/cost-variance', { params }));
  }
};
