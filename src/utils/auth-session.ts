import type { UserProfile } from 'types/user-profile';
import { authTokenStore } from './auth-token';
import { login as loginRequest, logout as logoutRequest, me as meRequest, refresh as refreshRequest, type AuthSessionDto } from './auth-client';

let refreshPromise: Promise<AuthSessionDto> | null = null;

export function getAccessToken(): string | null {
  return authTokenStore.getToken();
}

export function setAccessToken(accessToken: string | null): void {
  authTokenStore.setToken(accessToken);
}

export function clearAccessToken(): void {
  authTokenStore.clearToken();
}

export async function signIn(email: string, password: string): Promise<AuthSessionDto> {
  const session = await loginRequest(email, password);
  authTokenStore.setToken(session.accessToken);
  return session;
}

export async function refreshSession(): Promise<AuthSessionDto> {
  if (!refreshPromise) {
    refreshPromise = refreshRequest()
      .then((session) => {
        authTokenStore.setToken(session.accessToken);
        return session;
      })
      .catch((error) => {
        authTokenStore.clearToken();
        throw error;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

export async function loadCurrentUser(): Promise<UserProfile> {
  return meRequest();
}

export async function signOut(): Promise<void> {
  try {
    await logoutRequest();
  } finally {
    authTokenStore.clearToken();
  }
}
