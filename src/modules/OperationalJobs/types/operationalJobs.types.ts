export type ListMeta = {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};

export type OperationalJobDto = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAtUtc: string;
  updatedAtUtc: string | null;
  rowVersion: string;
};

export type OperationalJobListItemDto = OperationalJobDto;

export type OperationalJobListParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  isActive?: boolean | '';
  sortBy?: string;
  sortDirection?: 'asc' | 'desc' | '';
};

export type OperationalJobRequest = {
  code?: string | null;
  name: string;
  description?: string | null;
  isActive: boolean;
};

export type UpdateOperationalJobRequest = OperationalJobRequest & {
  code: string;
  rowVersion: string;
};

export type OperationalJobUsageReferenceItemDto = {
  id: string;
  name: string;
  code: string | null;
};

export type OperationalJobUsageReferenceGroupDto = {
  entityType: string;
  count: number;
  items: OperationalJobUsageReferenceItemDto[];
};

export type OperationalJobUsageResponseDto = {
  operationalJobId: string;
  code: string;
  name: string;
  totalReferenceCount: number;
  canForceDelete: boolean;
  references: OperationalJobUsageReferenceGroupDto[];
};
