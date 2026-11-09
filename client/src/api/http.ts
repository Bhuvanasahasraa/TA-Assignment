const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/api${path}`, {
      ...init,
      headers: { Accept: 'application/json', ...init.headers },
    });
  } catch {
    throw new ApiError(0, 'Unable to reach the server. Please check your connection and try again.');
  }

  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      body && typeof body === 'object' && 'error' in body && typeof body.error === 'string'
        ? body.error
        : `Request failed with status ${response.status}`;
    throw new ApiError(response.status, message);
  }
  return body as T;
}

export function get<T>(path: string): Promise<T> {
  return request<T>(path);
}

export function post<T>(path: string, payload: unknown): Promise<T> {
  return request<T>(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}
