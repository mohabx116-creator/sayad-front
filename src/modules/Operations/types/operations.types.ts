import type { WorkerListItemDto } from 'modules/Workers/types/workers.types';

export type WorkerOperationListItemDto = {
  id: string;
  operationDate: string;
  workerId: string;
  workerCode: string;
  workerName: string;
  operationalJobId: string;
  operationalJobCode: string;
  operationalJobName: string;
  completedQuantity: number;
  notes: string | null;
  createdAtUtc: string;
  updatedAtUtc: string | null;
  clientRequestId: string | null;
};

export type WorkerOperationDto = WorkerOperationListItemDto & {
  rowVersion: string;
};

export type WorkerOperationListParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  workerId?: string;
  operationalJobId?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc' | '';
};

export type WorkerOperationRequest = {
  workerId: string;
  operationDate: string;
  completedQuantity: number;
  notes?: string | null;
  clientRequestId?: string | null;
};

export type UpdateWorkerOperationRequest = WorkerOperationRequest & {
  rowVersion: string;
};

export type WorkerOperationWorkerOption = WorkerListItemDto;
export type WorkerOperationListItem = WorkerOperationListItemDto;
