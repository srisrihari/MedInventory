/**
 * API Configuration and HTTP Client for MedInventory
 * Connects React frontend to FastAPI backend
 */

import axios from 'axios';

// Use environment variable for API URL, fallback to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

console.log('🌐 API Base URL:', API_BASE_URL);

// Create the main API client
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API Endpoints configuration
export const API_ENDPOINTS = {
  inventory: {
    list: '/api/inventory/items',
    create: '/api/inventory/items',
    update: (id: string) => `/api/inventory/items/${id}`,
    delete: (id: string) => `/api/inventory/items/${id}`,
    addStock: (id: string) => `/api/inventory/items/${id}/add-stock`,
    subtractStock: (id: string) => `/api/inventory/items/${id}/subtract-stock`,
    overview: '/api/inventory/overview',
    expiry: '/api/inventory/expiry',
    expiryAlerts: '/api/inventory/expiry/alerts',
  },
  suppliers: {
    list: '/api/suppliers',
    create: '/api/suppliers',
    update: (id: string) => `/api/suppliers/${id}`,
    delete: (id: string) => `/api/suppliers/${id}`,
    performance: (id: string) => `/api/suppliers/${id}/performance`,
  },
  bidding: {
    requests: '/api/bidding/requests',
    createRequest: '/api/bidding/requests',
    decideBid: (id: string) => `/api/bidding/requests/${id}/decide`,
    suppliers: '/api/bidding/suppliers',
  },
  equipment: {
    list: '/api/equipment',
    create: '/api/equipment',
    update: (id: string) => `/api/equipment/${id}`,
    delete: (id: string) => `/api/equipment/${id}`,
  },
  ai: {
    health: '/api/ai/health',
    forecast: {
      demand: '/api/ai/forecast/demand',
      regenerate: '/api/ai/forecast/regenerate',
      history: '/api/ai/forecast/history',
    },
  },
  auth: {
    login: '/api/auth/login',
    logout: '/api/auth/logout',
    me: '/api/auth/me',
  },
};

// Type definitions
export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  batch_number: string;
  expiry_date: string;
  quantity: number;
  supplier: string;
  location: string;
  alert_days: number;
  alert_enabled: boolean;
  extended_date?: string;
  notes?: string;
  expiry_status: "expired" | "expiring-soon" | "ok";
  days_until_expiry: number;
  days_text: string;
  price?: number;
  reorder_level?: number;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface InventoryItemsResponse {
  items: InventoryItem[];
  total: number;
  skip: number;
  limit: number;
}

export interface Supplier {
  id: string;
  name: string;
  contact_person: string;
  email: string;
  phone: string;
  address: string;
  rating: number;
  performance_score: number;
  total_orders: number;
  on_time_delivery_rate: number;
  quality_rating: number;
  created_at: string;
  updated_at: string;
}

export interface Equipment {
  id: string;
  name: string;
  category: string;
  model: string;
  serial_number: string;
  location: string;
  status: string;
  last_maintenance: string;
  next_maintenance: string;
  supplier: string;
  purchase_date: string;
  warranty_expiry: string;
  created_at: string;
  updated_at: string;
}

export interface BidRequest {
  id: string;
  title: string;
  description: string;
  category: string;
  quantity: number;
  budget: number;
  deadline: string;
  status: string;
  supplier_id?: string;
  supplier_name?: string;
  created_at: string;
  updated_at: string;
}

// Inventory API functions
export const inventoryAPI = {
  // Get inventory items
  getItems: async (params?: any) => {
    const response = await apiClient.get(API_ENDPOINTS.inventory.list, { params });
    return response.data;
  },

  // Get expiry items
  getExpiryItems: async (params?: any) => {
    const response = await apiClient.get(API_ENDPOINTS.inventory.expiry, { params });
    return response.data;
  },

  // Get expiry alerts
  getExpiryAlerts: async () => {
    const response = await apiClient.get(API_ENDPOINTS.inventory.expiryAlerts);
    return response.data;
  },

  // Create expiry alert
  createExpiryAlert: async (alertData: any) => {
    const response = await apiClient.post(API_ENDPOINTS.inventory.expiryAlerts, alertData);
    return response.data;
  },

  // Update item expiry
  updateItemExpiry: async (itemId: string, expiryData: any) => {
    const response = await apiClient.put(`/api/inventory/items/${itemId}/expiry`, expiryData);
    return response.data;
  },
};

// AI API functions
export const aiAPI = {
  // Get AI health
  getHealth: async () => {
    const response = await apiClient.get(API_ENDPOINTS.ai.health);
    return response.data;
  },

  // Get demand forecast
  getDemandForecast: async (params?: any) => {
    const response = await apiClient.get(API_ENDPOINTS.ai.forecast.demand, { params });
    return response.data;
  },

  // Regenerate forecast
  regenerateForecast: async (params?: any) => {
    const response = await apiClient.post(API_ENDPOINTS.ai.forecast.regenerate, null, { params });
    return response.data;
  },

  // Get forecast history
  getForecastHistory: async (params?: any) => {
    const response = await apiClient.get(API_ENDPOINTS.ai.forecast.history, { params });
    return response.data;
  },
};

// Auth API functions
export const authAPI = {
  // Login
  login: async (credentials: any) => {
    const response = await apiClient.post(API_ENDPOINTS.auth.login, credentials);
    return response.data;
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await apiClient.get(API_ENDPOINTS.auth.me);
    return response.data;
  },

  // Logout
  logout: async () => {
    const response = await apiClient.post(API_ENDPOINTS.auth.logout);
    return response.data;
  },
};

// Extended API functions for expiry tracking
export const expiryAPI = {
  // Get medicines with expiry data
  getMedicines: async () => {
    const response = await apiClient.get(API_ENDPOINTS.inventory.expiry);
    return response.data.items || [];
  },

  // Get alerts
  getAlerts: async () => {
    const response = await apiClient.get(API_ENDPOINTS.inventory.expiryAlerts);
    return response.data.alerts || [];
  },

  // Create alert
  createAlert: async (medicineId: string, daysBeforeExpiry: number, notificationType: string) => {
    const alertData = {
      medicine_id: medicineId,
      days_before_expiry: daysBeforeExpiry,
      notification_type: notificationType,
      enabled: true
    };
    const response = await apiClient.post(API_ENDPOINTS.inventory.expiryAlerts, alertData);
    return response.data;
  },

  // Update alert
  updateAlert: async (alertId: string, daysBeforeExpiry: number, notificationType: string) => {
    const alertData = {
      days_before_expiry: daysBeforeExpiry,
      notification_type: notificationType,
      enabled: daysBeforeExpiry > 0
    };
    const response = await apiClient.put(`/api/inventory/expiry/alerts/${alertId}`, alertData);
    return response.data;
  },

  // Update medicine expiry date
  updateMedicine: async (medicineId: string, expiryDate: string) => {
    const expiryData = { expiry_date: expiryDate };
    const response = await apiClient.put(`/api/inventory/items/${medicineId}/expiry`, expiryData);
    return response.data;
  },

  // Extend shelf life
  extendShelfLife: async (medicineId: string, extendedDate: string, notes: string) => {
    const expiryData = { 
      extended_date: extendedDate,
      notes: notes
    };
    const response = await apiClient.put(`/api/inventory/items/${medicineId}/expiry`, expiryData);
    return response.data;
  },

  // Remove extended date
  removeExtendedDate: async (medicineId: string) => {
    const expiryData = { 
      extended_date: null,
      notes: null
    };
    const response = await apiClient.put(`/api/inventory/items/${medicineId}/expiry`, expiryData);
    return response.data;
  },
};

// Export the main api client for backward compatibility
export const api = apiClient;
export default apiClient;