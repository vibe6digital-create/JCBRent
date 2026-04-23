import { auth } from '../config/firebase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

async function getToken(): Promise<string | null> {
  if (!auth.currentUser) return null;
  return auth.currentUser.getIdToken();
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Request failed: ${res.status}`);
  return data as T;
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export const getDashboardStats = () => request('/admin/dashboard');

// ─── Users ───────────────────────────────────────────────────────────────────

export const getUsers = (params?: { role?: string; page?: number; limit?: number }) => {
  const qs = new URLSearchParams();
  if (params?.role) qs.set('role', params.role);
  if (params?.page) qs.set('page', String(params.page));
  if (params?.limit) qs.set('limit', String(params.limit));
  return request(`/admin/users?${qs.toString()}`);
};

export const toggleUserStatus = (uid: string, _isActive: boolean) =>
  request(`/admin/users/${uid}/toggle-status`, { method: 'PATCH' });

export const verifyVendor = (uid: string, status: 'verified' | 'rejected' | 'pending', rejectionReason?: string) =>
  request(`/admin/users/${uid}/verify`, {
    method: 'PATCH',
    body: JSON.stringify({ status, ...(rejectionReason ? { rejectionReason } : {}) }),
  });

// ─── Machines ────────────────────────────────────────────────────────────────

export const getMachines = (params?: { status?: string; page?: number; limit?: number }) => {
  const qs = new URLSearchParams();
  if (params?.status) qs.set('status', params.status);
  if (params?.page) qs.set('page', String(params.page));
  if (params?.limit) qs.set('limit', String(params.limit));
  return request(`/admin/machines?${qs.toString()}`);
};

export const approveMachine = (id: string) =>
  request(`/admin/machines/${id}/approve`, { method: 'PATCH', body: JSON.stringify({ approvalStatus: 'approved' }) });

export const rejectMachine = (id: string) =>
  request(`/admin/machines/${id}/approve`, { method: 'PATCH', body: JSON.stringify({ approvalStatus: 'rejected' }) });

export const deleteMachine = (id: string) =>
  request(`/admin/machines/${id}`, { method: 'DELETE' });

// ─── Bookings ────────────────────────────────────────────────────────────────

export const getBookings = (params?: { status?: string; page?: number; limit?: number }) => {
  const qs = new URLSearchParams();
  if (params?.status) qs.set('status', params.status);
  if (params?.page) qs.set('page', String(params.page));
  if (params?.limit) qs.set('limit', String(params.limit));
  return request(`/admin/bookings?${qs.toString()}`);
};

export const adminCancelBooking = (id: string, reason: string) =>
  request(`/bookings/${id}/cancel`, { method: 'PATCH', body: JSON.stringify({ reason }) });

// ─── Estimates ───────────────────────────────────────────────────────────────

export const getEstimates = () => request('/admin/estimates');

// ─── Notifications ───────────────────────────────────────────────────────────

export const getBroadcastHistory = () => request('/admin/notifications');

export const broadcastNotification = (body: {
  title: string;
  body: string;
  target: 'all' | 'customers' | 'vendors' | 'user';
  userId?: string;
}) => request('/admin/notifications/broadcast', { method: 'POST', body: JSON.stringify(body) });

// ─── Categories ──────────────────────────────────────────────────────────────

export const getCategories = () => request('/admin/categories');

export const createCategory = (body: { name: string; icon?: string }) =>
  request('/admin/categories', { method: 'POST', body: JSON.stringify(body) });

export const updateCategory = (id: string, body: { name?: string; icon?: string; isActive?: boolean }) =>
  request(`/admin/categories/${id}`, { method: 'PUT', body: JSON.stringify(body) });

export const deleteCategory = (id: string) =>
  request(`/admin/categories/${id}`, { method: 'DELETE' });

// ─── Service Areas ───────────────────────────────────────────────────────────

export const getServiceAreas = () => request('/admin/service-areas');

export const createServiceArea = (body: { city: string; state: string }) =>
  request('/admin/service-areas', { method: 'POST', body: JSON.stringify(body) });

export const updateServiceArea = (id: string, body: { isActive?: boolean; city?: string; state?: string }) =>
  request(`/admin/service-areas/${id}`, { method: 'PUT', body: JSON.stringify(body) });

export const deleteServiceArea = (id: string) =>
  request(`/admin/service-areas/${id}`, { method: 'DELETE' });

// ─── Machine Models ──────────────────────────────────────────────────────────

export const getMachineModels = () => request('/admin/models');

export const createMachineModel = (body: { name: string; category: string }) =>
  request('/admin/models', { method: 'POST', body: JSON.stringify(body) });

export const updateMachineModel = (id: string, body: { name?: string; category?: string; isActive?: boolean }) =>
  request(`/admin/models/${id}`, { method: 'PUT', body: JSON.stringify(body) });

export const deleteMachineModel = (id: string) =>
  request(`/admin/models/${id}`, { method: 'DELETE' });

// ─── Coupons ──────────────────────────────────────────────────────────────────

export const getCoupons = () => request('/admin/coupons');

export const createCoupon = (body: {
  code: string;
  discountType: 'percent' | 'flat';
  discountValue: number;
  description?: string;
  expiryDate?: string;
  maxUses?: number;
  minBookingAmount?: number;
  maxDiscount?: number;
}) => request('/admin/coupons', { method: 'POST', body: JSON.stringify(body) });

export const updateCoupon = (id: string, body: Partial<{
  isActive: boolean;
  description: string;
  expiryDate: string;
  maxUses: number;
  minBookingAmount: number;
}>) => request(`/admin/coupons/${id}`, { method: 'PATCH', body: JSON.stringify(body) });

export const deleteCoupon = (id: string) =>
  request(`/admin/coupons/${id}`, { method: 'DELETE' });

// ─── Vendor Earnings Drill-down ───────────────────────────────────────────────

export const getVendorEarningsAdmin = (uid: string) =>
  request(`/admin/vendors/${uid}/earnings`);

// ─── Reports ─────────────────────────────────────────────────────────────────

export const getReports = (status?: string) => {
  const qs = status ? `?status=${status}` : '';
  return request(`/admin/reports${qs}`);
};

export const resolveReport = (id: string, action: 'dismissed' | 'machine_rejected') =>
  request(`/admin/reports/${id}`, { method: 'PATCH', body: JSON.stringify({ action }) });
