import axios, { AxiosResponse } from 'axios';
import { User, Entry, LoginData, RegisterData, PaginatedResponse } from '../types';

const API_BASE_URL = 'http://localhost:5001/api';
// Auth API
const routes = {
  login: '/auth/login',
  register: '/auth/register',
  me: '/auth/me',
  logout: '/auth/logout',
  entries: '/entries',
  entryById: (id: string) => `/entries/${id}`,
  entryStats: '/entries/stats/summary', 
  deleteEntry: (id: string) => `/entries/${id}`,
}
// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);


export const authApi = {
  login: async (data: LoginData): Promise<{ user: User; token: string }> => {
    const response: AxiosResponse = await apiClient.post(routes.login, data);
    return response.data.data || response.data;
  },

  register: async (data: RegisterData): Promise<{ user: User; token: string }> => {
    const response: AxiosResponse = await apiClient.post(routes.register, data);
    return response.data.data || response.data;
  },

  me: async (): Promise<{ user: User }> => {
    const response: AxiosResponse = await apiClient.get(routes.me);
    return response.data.data || response.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post(routes.logout);
  },
};

// Entries API
export const entriesApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    type?: string;
    sortBy?: string;
    sortOrder?: string;
  }): Promise<PaginatedResponse<Entry>> => {
    const response: AxiosResponse = await apiClient.get(routes.entries, { params });
    return response.data;
  },

  getById: async (id: string): Promise<Entry> => {
    const response: AxiosResponse = await apiClient.get(routes.entryById(id));
    return response.data.data;
  },

  create: async (data: Omit<Entry, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Entry> => {
    const response: AxiosResponse = await apiClient.post(routes.entries, data);
    return response.data.data;
  },

  update: async (id: string, data: Partial<Omit<Entry, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>): Promise<Entry> => {
    const response: AxiosResponse = await apiClient.put(routes.entryById(id), data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(routes.deleteEntry(id));
  },

  getStatistics: async (): Promise<{
    totalEntries: number;
    movieCount: number;
    tvShowCount: number;
    averageRating: number;
  }> => {
    const response: AxiosResponse = await apiClient.get(routes.entryStats);
    return response.data.data;
  },
};

export default apiClient;