import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('layali_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors gracefully
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If 401 on protected admin route, clear token
      if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
        localStorage.removeItem('layali_auth_token');
        localStorage.removeItem('layali_auth_user');
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

// Authentication
export const authService = {
  login: async (email, password) => {
    const response = await api.post('/api/auth/login', { email, password });
    return response.data;
  },
  getMe: async () => {
    const response = await api.get('/api/auth/me');
    return response.data;
  },
};

// Menu Management
export const menuService = {
  getCategories: async () => {
    const response = await api.get('/api/menu/categories');
    return response.data;
  },
  getItems: async (params = {}) => {
    const response = await api.get('/api/menu/items', { params });
    return response.data;
  },
  adminGetCategories: async () => {
    const response = await api.get('/api/menu/admin/all-categories');
    return response.data;
  },
  createCategory: async (data) => {
    const response = await api.post('/api/menu/categories', data);
    return response.data;
  },
  updateCategory: async (id, data) => {
    const response = await api.put(`/api/menu/categories/${id}`, data);
    return response.data;
  },
  deleteCategory: async (id) => {
    const response = await api.delete(`/api/menu/categories/${id}`);
    return response.data;
  },
  adminGetItems: async (params = {}) => {
    const response = await api.get('/api/menu/admin/all-items', { params });
    return response.data;
  },
  createItem: async (data) => {
    const response = await api.post('/api/menu/items', data);
    return response.data;
  },
  updateItem: async (id, data) => {
    const response = await api.put(`/api/menu/items/${id}`, data);
    return response.data;
  },
  deleteItem: async (id) => {
    const response = await api.delete(`/api/menu/items/${id}`);
    return response.data;
  },
};

// Table Management
export const tableService = {
  getTables: async () => {
    const response = await api.get('/api/tables');
    return response.data;
  },
  createTable: async (data) => {
    const response = await api.post('/api/tables', data);
    return response.data;
  },
  updateTable: async (id, data) => {
    const response = await api.put(`/api/tables/${id}`, data);
    return response.data;
  },
  deleteTable: async (id) => {
    const response = await api.delete(`/api/tables/${id}`);
    return response.data;
  },
};

// Table Availability
export const availabilityService = {
  checkAvailability: async (date, guestCount, seatingPreference = 'Any') => {
    const response = await api.get('/api/availability/check', {
      params: {
        reservation_date: date,
        guest_count: guestCount,
        seating_preference: seatingPreference,
      },
    });
    return response.data;
  },
};

// Reservations
export const reservationService = {
  createReservation: async (data) => {
    const response = await api.post('/api/reservations', data);
    return response.data;
  },
  lookupReservation: async (bookingReference, contact) => {
    const response = await api.get('/api/reservations/lookup', {
      params: {
        booking_reference: bookingReference,
        contact: contact,
      },
    });
    return response.data;
  },
  cancelReservation: async (bookingReference, customerEmail, cancellationReason = 'Customer requested cancellation') => {
    const response = await api.post(`/api/reservations/${bookingReference}/cancel`, {
      customer_email: customerEmail,
      cancellation_reason: cancellationReason,
    });
    return response.data;
  },
  adminGetReservations: async (params = {}) => {
    const response = await api.get('/api/reservations', { params });
    return response.data;
  },
  adminGetReservation: async (id) => {
    const response = await api.get(`/api/reservations/${id}`);
    return response.data;
  },
  adminUpdateReservationStatus: async (id, data) => {
    const response = await api.patch(`/api/reservations/${id}/status`, data);
    return response.data;
  },
  adminDeleteReservation: async (id) => {
    const response = await api.delete(`/api/reservations/${id}`);
    return response.data;
  },
};

// Customer Enquiries
export const enquiryService = {
  submitEnquiry: async (data) => {
    const response = await api.post('/api/enquiries', data);
    return response.data;
  },
  adminGetEnquiries: async (statusFilter = null) => {
    const response = await api.get('/api/enquiries', {
      params: statusFilter ? { status: statusFilter } : {},
    });
    return response.data;
  },
  adminUpdateEnquiry: async (id, data) => {
    const response = await api.patch(`/api/enquiries/${id}`, data);
    return response.data;
  },
  adminDeleteEnquiry: async (id) => {
    const response = await api.delete(`/api/enquiries/${id}`);
    return response.data;
  },
};

// Admin Dashboard
export const dashboardService = {
  getStats: async () => {
    const response = await api.get('/api/dashboard/stats');
    return response.data;
  },
};

// Restaurant Settings
export const settingsService = {
  getSettings: async () => {
    const response = await api.get('/api/settings');
    return response.data;
  },
  adminUpdateSettings: async (data) => {
    const response = await api.put('/api/settings', data);
    return response.data;
  },
};

export default api;
