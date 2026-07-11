import axios from 'axios';

import type { ApiResponse } from 'types/api';

export function getHttpErrorMessage(error: unknown, fallback = 'Request failed'): string {
  if (axios.isAxiosError(error)) {
    const apiError = error.response?.data as ApiResponse<unknown> | undefined;
    if (apiError?.message) {
      return apiError.message;
    }

    if (apiError?.errors?.length) {
      return apiError.errors[0];
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}
