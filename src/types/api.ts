/**
 * API Response Types
 * Standardized response formats for all API endpoints
 */

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiError {
  error: string;
  code?: string;
  details?: unknown;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

// Auth API responses
export interface LoginResponse {
  email: string;
  name: string;
  isAdmin: boolean;
  isNewUser?: boolean;
}

// Profile API responses
export interface ProfileResponse {
  id: string;
  userId: string;
  email: string | null;
  name: string;
  team: string | null;
  birthday: string | null;
  createdAt: string;
  updatedAt: string;
}

// Import API responses
export interface ImportResponse {
  success: boolean;
  importedCount: number;
  updatedCount: number;
  skippedCount: number;
  errors: string[];
}
