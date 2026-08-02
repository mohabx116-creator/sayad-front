import axios, { AxiosHeaders, AxiosResponse } from 'axios';

import type { ApiResponse } from 'types/api';
import type { UserProfile } from 'types/user-profile';
import { authTokenStore } from './auth-token';
import { getHttpErrorMessage } from './http-error';

export type AuthSessionDto = {
  accessToken: string;
  accessTokenExpiresAtUtc: string;
  user: UserProfile;
};

type LoginRequest = {
  email: string;
  password: string;
};

type UpdateCurrentUserRequest = {
  displayName: string;
};

type ChangePasswordRequest = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

const authClient = axios.create({
  baseURL: import.meta.env.VITE_APP_API_URL || 'http://127.0.0.1:5000/',
  withCredentials: true
});

authClient.interceptors.request.use((config) => {
  const accessToken = authTokenStore.getToken();
  const headers = AxiosHeaders.from(config.headers);

  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  config.headers = headers;
  return config;
});

async function unwrap<T>(request: Promise<AxiosResponse<ApiResponse<T>>>): Promise<T> {
  try {
    const response = await request;
    const payload = response.data;

    if (!payload.success || payload.data == null) {
      throw new Error(payload.message || payload.errors[0] || 'Authentication failed');
    }

    return payload.data;
  } catch (error) {
    const message = getHttpErrorMessage(error, 'Authentication failed');
    throw new Error(message);
  }
}

export function login(email: string, password: string): Promise<AuthSessionDto> {
  return unwrap<AuthSessionDto>(authClient.post<ApiResponse<AuthSessionDto>>('/api/auth/login', { email, password } satisfies LoginRequest));
}

export function refresh(): Promise<AuthSessionDto> {
  return unwrap<AuthSessionDto>(authClient.post<ApiResponse<AuthSessionDto>>('/api/auth/refresh', {}));
}

export function logout(): Promise<void> {
  return authClient
    .post<ApiResponse<void>>('/api/auth/logout', {})
    .then(() => undefined)
    .catch((error) => {
      const message = getHttpErrorMessage(error, 'Authentication failed');
      throw new Error(message);
    });
}

export function me(): Promise<UserProfile> {
  return unwrap<UserProfile>(authClient.get<ApiResponse<UserProfile>>('/api/auth/me'));
}

export function updateCurrentUser(displayName: string): Promise<UserProfile> {
  return unwrap<UserProfile>(authClient.put<ApiResponse<UserProfile>>('/api/auth/me', { displayName } satisfies UpdateCurrentUserRequest));
}

export function changePassword(currentPassword: string, newPassword: string, confirmPassword: string): Promise<AuthSessionDto> {
  return unwrap<AuthSessionDto>(
    authClient.post<ApiResponse<AuthSessionDto>>('/api/auth/change-password', {
      currentPassword,
      newPassword,
      confirmPassword
    } satisfies ChangePasswordRequest)
  );
}
