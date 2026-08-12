const ROOT_PATH = '/api/v1';

const TOKEN_STORAGE_KEY = 'access_token';

/** Fired on any 401 so the app can route back to login. */
export const AUTH_EXPIRED_EVENT = 'auth:expired';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly payload?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

type Params = Record<string, string | undefined>;

interface RequestOptions {
  method?: string;
  params?: Params;
  json?: unknown;
  form?: Record<string, string>;
  auth?: boolean;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', params, json, form, auth = true } = options;

  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params ?? {})) {
    if (value !== undefined && value !== '') search.set(key, value);
  }
  const query = search.size > 0 ? `?${search.toString()}` : '';

  const headers: Record<string, string> = { Accept: 'application/json' };
  const token = getToken();
  if (auth && token) headers.Authorization = `Bearer ${token}`;

  let body: string | URLSearchParams | undefined;
  if (json !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(json);
  } else if (form !== undefined) {
    body = new URLSearchParams(form);
  }

  const response = await fetch(`${ROOT_PATH}${path}${query}`, { method, headers, body });

  if (!response.ok) {
    let detail = response.statusText;
    let payload: Record<string, unknown> | undefined;
    try {
      payload = await response.json();
      if (typeof payload?.detail === 'string') detail = payload.detail;
    } catch {
      // non-JSON error body; keep the status text
    }
    if (response.status === 401 && auth) {
      window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
    }
    throw new ApiError(response.status, detail, payload);
  }

  return response.json() as Promise<T>;
}

export const http = {
  get: <T>(path: string, params?: Params) => request<T>(path, { params }),
  post: <T>(path: string, options: Omit<RequestOptions, 'method'> = {}) =>
    request<T>(path, { ...options, method: 'POST' }),
};
