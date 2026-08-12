import { clearToken, getToken, http, setToken } from '@/api/http';

export function isAuthenticated(): boolean {
  return getToken() !== null;
}

export async function login(username: string, password: string, mfaCode?: string): Promise<void> {
  const form: Record<string, string> = { grant_type: 'password', username, password };
  if (mfaCode) form.mfa_code = mfaCode;
  const response = await http.post<{ access_token: string }>('/user/token', {
    form,
    auth: false,
  });
  setToken(response.access_token);
}

export function logout(): void {
  clearToken();
}
