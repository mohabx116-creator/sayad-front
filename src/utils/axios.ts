import axios, { AxiosRequestConfig } from 'axios';

import { clearAccessToken, getAccessToken, refreshSession } from './auth-session';
import { getHttpErrorMessage } from './http-error';

const axiosServices = axios.create({
  baseURL: import.meta.env.VITE_APP_API_URL || 'http://127.0.0.1:5000/',
  withCredentials: true
});

axiosServices.interceptors.request.use(
  async (config) => {
    const accessToken = getAccessToken();
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }

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
        originalRequest.headers = {
          ...(originalRequest.headers ?? {}),
          Authorization: `Bearer ${session.accessToken}`
        };
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
