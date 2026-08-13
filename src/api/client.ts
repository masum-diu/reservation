import { getAdminPassword } from './adminAuth';

export const API_BASE_URL = 'https://meetspace-backend-umbw.onrender.com/api';

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  admin?: boolean;
};

export async function verifyAdminPassword(password: string): Promise<boolean> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}/admin/verify`, {
      method: 'GET',
      headers: { 'X-Admin-Password': password, Accept: 'application/json' },
    });
  } catch {
    throw new ApiError(0, 'Could not reach the server. Check your connection and try again.');
  }
  if (res.status === 403) return false;
  if (!res.ok) throw new ApiError(res.status, `Request failed (${res.status})`);
  return true;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  if (options.admin) {
    const password = getAdminPassword();
    if (password) headers['X-Admin-Password'] = password;
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method: options.method ?? 'GET',
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    throw new ApiError(0, 'Could not reach the server. Check your connection and try again.');
  }

  if (res.status === 204) return undefined as T;

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const message = data?.message ?? `Request failed (${res.status})`;
    throw new ApiError(res.status, message);
  }

  return data as T;
}
