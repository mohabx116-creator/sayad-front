import axios from 'axios';

export function getHttpErrorMessage(error: unknown, fallback = 'Request failed'): string {
  if (axios.isAxiosError(error)) {
    const apiError = error.response?.data as any;

    if (apiError && apiError.errors) {
      if (Array.isArray(apiError.errors) && apiError.errors.length > 0) {
        const msg = apiError.message;
        if (!msg || msg === 'Validation failed' || msg === 'Validation failed.') {
          return apiError.errors[0];
        }
        return msg;
      }

      if (typeof apiError.errors === 'object' && !Array.isArray(apiError.errors)) {
        const keys = Object.keys(apiError.errors);
        if (keys.length > 0 && Array.isArray(apiError.errors[keys[0]]) && apiError.errors[keys[0]].length > 0) {
          return apiError.errors[keys[0]][0];
        }
      }
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
