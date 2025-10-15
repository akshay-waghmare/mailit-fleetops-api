/**
 * Authentication Models
 * Epic E10: Minimal RBAC (User Management)
 * Tasks T020: Create auth.model.ts
 */

/**
 * Login request payload
 */
export interface LoginRequest {
  username: string;
  password: string;
}

/**
 * Login response from backend
 */
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // seconds until access token expires
  user: UserInfo;
}

/**
 * Refresh token request
 */
export interface RefreshTokenRequest {
  refreshToken: string;
}

/**
 * Refresh token response
 */
export interface RefreshTokenResponse {
  accessToken: string;
  expiresIn: number;
}

/**
 * User information in login response
 */
export interface UserInfo {
  id: number;
  username: string;
  email: string;
  fullName: string;
  roles: string[];
  isActive: boolean;
}

/**
 * Decoded JWT token payload
 */
export interface JwtPayload {
  userId: number;
  username: string;
  roles: string[];
  exp: number;
  iat: number;
}
