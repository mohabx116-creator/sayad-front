import axios from 'axios';

import type { ApiResponse } from 'types/api';

export function getHttpErrorMessage(error: unknown, fallback = 'Request failed'): string {
  if (axios.isAxiosError(error)) {
    const apiError = error.response?.data as ApiResponse<unknown> | undefined;
    if (apiError?.errors?.length) {
      if (!apiError.message || apiError.message === 'Validation failed') {
        return apiError.errors[0];
      }

      return apiError.message;
    }

    if (apiError?.message) {
      return apiError.message;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}
