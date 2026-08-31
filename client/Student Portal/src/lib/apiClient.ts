const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api';

const ACCESS_TOKEN_KEY = 'rms-student-token';

export class ApiError extends Error {
  status: number;
  errors: unknown;

  constructor(message: string, status: number, errors: unknown = null) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

export function getToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  token?: string | null;
  isFormData?: boolean;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const {
    method = 'GET', body, token = getToken(), isFormData = false,
  } = options;

  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (!isFormData && body !== undefined) headers['Content-Type'] = 'application/json';

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : (isFormData ? (body as FormData) : JSON.stringify(body)),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok || !payload?.success) {
    throw new ApiError(payload?.message ?? 'Request failed', response.status, payload?.errors ?? null);
  }

  return payload.data as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown, token?: string) => request<T>(path, { method: 'POST', body, token }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PATCH', body }),
  postForm: <T>(path: string, form: FormData) => request<T>(path, { method: 'POST', body: form, isFormData: true }),
};
