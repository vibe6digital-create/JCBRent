import { auth } from '../config/firebase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

async function getHeaders(includeAuth = true): Promise<HeadersInit> {
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (includeAuth && auth.currentUser) {
    const token = await auth.currentUser.getIdToken();
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function request<T>(path: string, options: RequestInit = {}, includeAuth = true): Promise<T> {
  const headers = await getHeaders(includeAuth);
  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Request failed: ${res.status}`);
  return data as T;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const registerUser = (body: { name: string; role: string; email?: string; city?: string; state?: string; profileType?: string; referralCode?: string }) =>
  request('/auth/register', { method: 'POST', body: JSON.stringify(body) });

export const getProfile = () =>
  request('/auth/profile');

export const updateProfile = (body: { name?: string; email?: string; city?: string; state?: string; profileType?: string; isOnline?: boolean }) =>
  request('/auth/profile', { method: 'PATCH', body: JSON.stringify(body) });

export const updateOnlineStatus = (isOnline: boolean) =>
  request('/auth/online-status', { method: 'PATCH', body: JSON.stringify({ isOnline }) });

export const validateCoupon = (code: string, machineId: string) =>
  request('/bookings/validate-coupon', { method: 'POST', body: JSON.stringify({ code, machineId }) });

// ─── Machines (public) ────────────────────────────────────────────────────────

export const searchMachines = (params: { city?: string; category?: string; sortBy?: string }) => {
  const qs = new URLSearchParams();
  if (params.city) qs.set('city', params.city);
  if (params.category) qs.set('category', params.category);
  if (params.sortBy) qs.set('sortBy', params.sortBy);
  return request(`/machines?${qs.toString()}`, {}, false);
};

export const getMachineById = (id: string) =>
  request(`/machines/${id}`, {}, false);

export const getMachineReviews = (id: string) =>
  request(`/machines/${id}/reviews`, {}, false);

export const getCategories = () =>
  request('/machines/meta/categories', {}, false);

export const getServiceAreas = () =>
  request('/machines/meta/service-areas', {}, false);

// ─── Machines (vendor) ────────────────────────────────────────────────────────

export const getMyMachines = () =>
  request('/machines/vendor/my-machines');

export const createMachine = (body: {
  category: string;
  model: string;
  description: string;
  hourlyRate: number;
  dailyRate: number;
  weeklyRate?: number;
  monthlyRate?: number;
  machineYear?: number;
  location: { city: string; state: string; latitude: number; longitude: number };
  serviceAreas: string[];
  isAvailable?: boolean;
  images?: string[];
}) => request('/machines', { method: 'POST', body: JSON.stringify(body) });

export const updateMachine = (id: string, body: Partial<{
  model: string;
  description: string;
  hourlyRate: number;
  dailyRate: number;
  weeklyRate: number;
  monthlyRate: number;
  machineYear: number;
  serviceAreas: string[];
  isAvailable: boolean;
}>) => request(`/machines/${id}`, { method: 'PUT', body: JSON.stringify(body) });

export const deleteMachine = (id: string) =>
  request(`/machines/${id}`, { method: 'DELETE' });

export const toggleMachineAvailability = (id: string, isAvailable: boolean) =>
  request(`/machines/${id}/availability`, { method: 'PATCH', body: JSON.stringify({ isAvailable }) });

// ─── Bookings (customer) ──────────────────────────────────────────────────────

export const createBooking = (body: {
  machineId: string;
  startDate: string;
  endDate: string;
  startTime?: string;
  rateType: string;
  bookingType?: string;
  workLocation: object;
  notes?: string;
  couponCode?: string;
}) => request('/bookings', { method: 'POST', body: JSON.stringify(body) });

export const getCustomerBookings = () =>
  request('/bookings/customer');

export const getBookingById = (id: string) =>
  request(`/bookings/${id}`);

// ─── Bookings (vendor) ────────────────────────────────────────────────────────

export const getVendorBookings = () =>
  request('/bookings/vendor');

export const updateBookingStatus = (id: string, status: string) =>
  request(`/bookings/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });

export const getVendorEarnings = () =>
  request('/bookings/vendor/earnings');

export const markArrived = (id: string) =>
  request(`/bookings/${id}/arrive`, { method: 'PATCH' });

export const verifyStartOtp = (id: string, otp: string) =>
  request(`/bookings/${id}/verify-otp`, { method: 'PATCH', body: JSON.stringify({ otp }) });

export const rateBooking = (id: string, body: { rating: number; review?: string }) =>
  request(`/bookings/${id}/rate`, { method: 'PATCH', body: JSON.stringify(body) });

export const cancelBooking = (id: string, reason: string) =>
  request(`/bookings/${id}/cancel`, { method: 'PATCH', body: JSON.stringify({ reason }) });

// ─── Estimates ────────────────────────────────────────────────────────────────

export const createEstimate = (body: {
  workType: string;
  areaSize: string;
  soilType: string;
  photoUrls: string[];
  machineCategory?: string;
}) => request('/estimates', { method: 'POST', body: JSON.stringify(body) });

export const getMyEstimates = () =>
  request('/estimates/customer/my-estimates');

export const getEstimateById = (id: string) =>
  request(`/estimates/${id}`);

// ─── Notifications ────────────────────────────────────────────────────────────

export const getNotifications = () =>
  request('/notifications');

export const markNotificationRead = (id: string) =>
  request(`/notifications/${id}/read`, { method: 'PATCH' });
