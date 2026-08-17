import type { HttpClient } from '@/api/http';
import { localStorageTokenStore } from '@/api/tokenStore';

export function isAuthenticated(): boolean {
  return localStorageTokenStore.get() !== null;
}

export async function login(
  http: HttpClient,
  username: string,
  password: string,
  mfaCode?: string,
): Promise<void> {
  const form: Record<string, string> = { grant_type: 'password', username, password };
  if (mfaCode) form.mfa_code = mfaCode;
  const response = await http.post<{ access_token: string }>('/user/token', {
    form,
    auth: false,
  });
  localStorageTokenStore.set(response.access_token);
}

export function logout(): void {
  localStorageTokenStore.clear();
}
