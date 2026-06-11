const BASE_URL = '/api';

function getToken(): string | null {
  return localStorage.getItem('auth_token');
}

function setToken(token: string | null) {
  if (token) localStorage.setItem('auth_token', token);
  else localStorage.removeItem('auth_token');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };
  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

// Auth
export const authApi = {
  login: (email: string, password: string) =>
    request<{ token: string; user: import('@/types').User }>('/auth/login', {
      method: 'POST', body: JSON.stringify({ email, password }),
    }).then(data => { setToken(data.token); return data; }),

  register: (name: string, email: string, phone: string, password: string) =>
    request<{ token: string; user: import('@/types').User }>('/auth/register', {
      method: 'POST', body: JSON.stringify({ name, email, phone, password }),
    }).then(data => { setToken(data.token); return data; }),

  me: () => request<import('@/types').User>('/auth/me'),

  logout: () => setToken(null),

  updateMe: (data: { name: string; phone: string }) =>
    request<import('@/types').User>('/auth/me', { method: 'PUT', body: JSON.stringify(data) }),
};

// Products
export const productsApi = {
  list: (params: Record<string, string> = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request<{ products: import('@/types').Product[]; total: number }>(`/products${qs ? `?${qs}` : ''}`);
  },
  get: (id: string) => request<import('@/types').Product>(`/products/${id}`),
  create: (data: Partial<import('@/types').Product>) =>
    request<import('@/types').Product>('/products', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<import('@/types').Product>) =>
    request<import('@/types').Product>(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => request<{ success: boolean }>(`/products/${id}`, { method: 'DELETE' }),
  reviews: (id: string) => request<import('@/types').Review[]>(`/products/${id}/reviews`),
};

// Categories
export const categoriesApi = {
  list: () => request<import('@/types').Category[]>('/categories'),
};

// Orders
export const ordersApi = {
  list: (status?: string) => {
    const qs = status && status !== 'all' ? `?status=${status}` : '';
    return request<import('@/types').Order[]>(`/orders${qs}`);
  },
  myOrders: () => request<import('@/types').Order[]>('/orders/my'),
  create: (data: object) => request<import('@/types').Order>('/orders', { method: 'POST', body: JSON.stringify(data) }),
  updateStatus: (id: string, status: string) =>
    request<import('@/types').Order>(`/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
};

// Users
export const usersApi = {
  list: () => request<import('@/types').User[]>('/users'),
};

// Blog
export const blogApi = {
  list: () => request<import('@/types').BlogPost[]>('/blog'),
  get: (slug: string) => request<import('@/types').BlogPost>(`/blog/${slug}`),
};

// Upload
export const uploadApi = {
  uploadImage: async (file: File): Promise<string> => {
    const token = getToken();
    const formData = new FormData();
    formData.append('image', file);
    const res = await fetch(`${BASE_URL}/upload/image`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    if (!res.ok) throw new Error('Upload failed');
    const data = await res.json();
    return data.url as string;
  },

  uploadImages: async (files: File[]): Promise<string[]> => {
    const token = getToken();
    const formData = new FormData();
    files.forEach(f => formData.append('images', f));
    const res = await fetch(`${BASE_URL}/upload/images`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    if (!res.ok) throw new Error('Upload failed');
    const data = await res.json();
    return data.urls as string[];
  },
};

export { getToken, setToken };