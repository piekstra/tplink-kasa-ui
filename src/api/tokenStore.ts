const TOKEN_STORAGE_KEY = 'access_token';

export interface TokenStore {
  get(): string | null;
  set(token: string): void;
  clear(): void;
}

// Accepted risk: the bearer token lives in localStorage, so any script on the
// origin could read it under XSS. For this self-hosted, single-origin dashboard
// that's an accepted trade for stateless auth that survives reload; an httpOnly
// cookie would require the service to abandon the stateless bearer model. Revisit
// if this is ever exposed to untrusted origins or gains third-party scripts.
export const localStorageTokenStore: TokenStore = {
  get: () => localStorage.getItem(TOKEN_STORAGE_KEY),
  set: (token) => localStorage.setItem(TOKEN_STORAGE_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_STORAGE_KEY),
};
