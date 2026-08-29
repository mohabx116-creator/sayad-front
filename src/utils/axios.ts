import axios, { AxiosHeaders, AxiosRequestConfig } from 'axios';

import { clearAccessToken, getAccessToken, refreshSession } from './auth-session';
import { getHttpErrorMessage } from './http-error';

function getRequestLocale() {
  try {
    const rawConfig = localStorage.getItem('berry-config-vite-ts');
    if (!rawConfig) {
      return 'en';
    }

    const parsed = JSON.parse(rawConfig) as { i18n?: string } | null;
    return parsed?.i18n === 'ar' ? 'ar' : 'en';
  } catch {
    return 'en';
  }
}

const axiosServices = axios.create({
  baseURL: import.meta.env.VITE_APP_API_URL || 'http://127.0.0.1:5000/',
  withCredentials: true
});

axiosServices.interceptors.request.use(
  async (config) => {
    const accessToken = getAccessToken();
    const headers = new AxiosHeaders(config.headers as any);

    if (accessToken) {
      headers.set('Authorization', `Bearer ${accessToken}`);
    }

    headers.set('Accept-Language', getRequestLocale());
    config.headers = headers;

    return config;
  },
  (error) => Promise.reject(error)
);

axiosServices.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as (AxiosRequestConfig & { _retry?: boolean }) | undefined;
    const status = error.response?.status;
    const requestUrl = originalRequest?.url ?? '';
    const isAuthRequest = requestUrl.includes('/api/auth/');

    if (status === 401 && originalRequest && !originalRequest._retry && !isAuthRequest) {
      originalRequest._retry = true;

      try {
        const session = await refreshSession();
        const headers = new AxiosHeaders(originalRequest.headers as any);
        headers.set('Authorization', `Bearer ${session.accessToken}`);
        headers.set('Accept-Language', getRequestLocale());
        originalRequest.headers = headers;
        return axiosServices(originalRequest);
      } catch {
        clearAccessToken();
      }
    }

    if (status === 401 && !window.location.pathname.startsWith('/login') && !isAuthRequest) {
      window.location.pathname = '/login';
    }

    const message = getHttpErrorMessage(error, 'Wrong Services');
    if (error && typeof error === 'object') {
      (error as { message?: string }).message = message;
      return Promise.reject(error);
    }

    return Promise.reject(new Error(message));
  }
);

export default axiosServices;

export async function fetcher(args: string | [string, AxiosRequestConfig]) {
  const [url, config] = Array.isArray(args) ? args : [args];

  const res = await axiosServices.get(url, { ...config });

  return res.data;
}
