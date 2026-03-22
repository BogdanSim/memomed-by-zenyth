import type { Treatment, IntakeLog } from '@/types/treatment';
import type { ZenythProduct } from '@/data/zenythProducts';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

type RequestOptions = RequestInit & { token?: string };

export class ApiError extends Error {
  status: number;
  payload: unknown;

  constructor(message: string, status: number, payload: unknown) {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}

const request = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
  const { token, headers, body, ...rest } = options;
  const endpoint = path.startsWith('http') ? path : `${API_BASE}${path}`;
  const finalHeaders = new Headers(headers || {});
  if (body && !finalHeaders.has('Content-Type')) {
    finalHeaders.set('Content-Type', 'application/json');
  }
  if (token) {
    finalHeaders.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(endpoint, {
    ...rest,
    headers: finalHeaders,
    body,
  });

  const text = await response.text();
  const data = text ? (() => { try { return JSON.parse(text); } catch { return text; } })() : null;

  if (!response.ok) {
    throw new ApiError('API request failed', response.status, data);
  }

  return data as T;
};

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    createdAt: string;
  };
}

export interface OrderDto {
  id: string;
  productId: string;
  quantity: number;
  status: string;
  createdAt: string;
}

export type TreatmentPayload = Omit<Treatment, 'id' | 'userId'>;

export const api = {
  login: (payload: { email: string; password: string }) =>
    request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getTreatments: (token: string) =>
    request<Treatment[]>('/api/treatments', { token }),

  createTreatment: (token: string, payload: TreatmentPayload) =>
    request<Treatment>('/api/treatments', {
      method: 'POST',
      token,
      body: JSON.stringify(payload),
    }),

  updateTreatment: (token: string, id: string, payload: Partial<TreatmentPayload>) =>
    request<Treatment>(`/api/treatments/${id}`, {
      method: 'PUT',
      token,
      body: JSON.stringify(payload),
    }),

  deleteTreatment: (token: string, id: string) =>
    request<void>(`/api/treatments/${id}`, {
      method: 'DELETE',
      token,
    }),

  getIntakeLogs: (token: string, date?: string) => {
    const qs = date ? `?date=${encodeURIComponent(date)}` : '';
    return request<IntakeLog[]>(`/api/intake-logs${qs}`, { token });
  },

  updateIntakeLog: (token: string, id: string, payload: Partial<Pick<IntakeLog, 'status' | 'confirmedAt'>>) =>
    request<IntakeLog>(`/api/intake-logs/${id}`, {
      method: 'PATCH',
      token,
      body: JSON.stringify(payload),
    }),

  getProducts: (token: string) =>
    request<ZenythProduct[]>('/api/products', { token }),

  createOrder: (token: string, payload: { productId: string; quantity: number }) =>
    request<OrderDto>('/api/orders', {
      method: 'POST',
      token,
      body: JSON.stringify(payload),
    }),

  getOrders: (token: string) =>
    request<OrderDto[]>('/api/orders', { token }),
};
