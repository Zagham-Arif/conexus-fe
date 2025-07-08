export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  updatedAt: string;
}

export interface Entry {
  id: string;
  title: string;
  type: 'movie' | 'tv-show';
  director: string;
  duration: number;
  year: number;
  genre?: string;
  rating?: number;
  description?: string;
  posterUrl?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEntryData {
  title: string;
  type: 'movie' | 'tv-show';
  director: string;
  duration: number;
  year: number;
  genre?: string;
  rating?: number;
  description?: string;
  posterUrl?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface PaginatedResponse<T> {
  message: string;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  message: string;
  data: T;
}

export interface ErrorResponse {
  message: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}