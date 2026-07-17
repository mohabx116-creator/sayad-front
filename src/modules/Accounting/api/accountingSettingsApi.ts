import { AxiosResponse } from 'axios';

import axiosServices from 'utils/axios';
import type { ApiResponse } from 'types/api';
import type { AccountingSettingMappingDto, AccountingSettingMappingInput } from '../types/accounting-settings.types';

function unwrap<T>(request: Promise<AxiosResponse<ApiResponse<T>>>): Promise<T> {
  return request.then((response) => {
    const payload = response.data;
    if (!payload.success || payload.data == null) {
      throw new Error(payload.message || payload.errors[0] || 'Request failed');
    }

    return payload.data;
  });
}

export function getAccountingSettingsMappings() {
  return unwrap(axiosServices.get<ApiResponse<AccountingSettingMappingDto[]>>('/api/accounting/settings/mappings'));
}

export function updateAccountingSettingsMappings(mappings: AccountingSettingMappingInput[]) {
  return unwrap(axiosServices.put<ApiResponse<AccountingSettingMappingDto[]>>('/api/accounting/settings/mappings', { mappings }));
}
