/**
 * User Management Models
 * Epic E10: Minimal RBAC (User Management)
 * Tasks T021: Create user.model.ts
 */

/**
 * User response from backend
 */
export interface UserResponse {
  id: number;
  username: string;
  email: string;
  fullName: string;
  phone?: string;
  roles: string[];
  isActive: boolean;
  lastLogin?: string; // ISO 8601 date-time
  createdAt: string;
  updatedAt: string;
}

/**
 * Create user request payload
 */
export interface CreateUserRequest {
  username: string;
  email: string;
  fullName: string;
  phone?: string;
  password: string;
  roles: string[];
  isActive: boolean;
}

/**
 * Update user request payload
 */
export interface UpdateUserRequest {
  email?: string;
  fullName?: string;
  phone?: string;
  roles?: string[];
  isActive?: boolean;
}

/**
 * Reset password request payload
 */
export interface ResetPasswordRequest {
  newPassword: string;
}

/**
 * User roles enum
 */
export enum UserRole {
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
  AGENT = 'AGENT'
}

/**
 * User list query parameters
 */
export interface UserListParams {
  page?: number;
  size?: number;
  sort?: string;
  direction?: 'asc' | 'desc';
  search?: string;
}

/**
 * Paginated user list response
 */
export interface UserListResponse {
  content: UserResponse[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
