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

type Params = Record<string, string | undefined>;

interface RequestOptions {
  method?: string;
  params?: Params;
  json?: unknown;
  form?: Record<string, string>;
  auth?: boolean;
}

export interface HttpClient {
  get<T>(path: string, params?: Params): Promise<T>;
  post<T>(path: string, options?: Omit<RequestOptions, 'method'>): Promise<T>;
  /** Register (or clear) the callback fired when an authed request gets a 401. */
  setOnUnauthorized(handler: (() => void) | null): void;
}

export interface HttpClientOptions {
  /** Supplies the bearer token per request; injected so the transport holds no ambient state. */
  getToken: () => string | null;
  rootPath?: string;
}

export function createHttpClient({
  getToken,
  rootPath = '/api/v1',
}: HttpClientOptions): HttpClient {
  let onUnauthorized: (() => void) | null = null;

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

    const response = await fetch(`${rootPath}${path}${query}`, { method, headers, body });

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
        onUnauthorized?.();
      }
      throw new ApiError(response.status, detail, payload);
    }

    return response.json() as Promise<T>;
  }

  return {
    get: (path, params) => request(path, { params }),
    post: (path, options = {}) => request(path, { ...options, method: 'POST' }),
    setOnUnauthorized: (handler) => {
      onUnauthorized = handler;
    },
  };
}
