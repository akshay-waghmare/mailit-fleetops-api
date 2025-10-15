/**
 * Shared Validation Constants
 * Contains reusable validation patterns and rules
 */

/**
 * Password validation pattern:
 * - At least 8 characters
 * - At least one lowercase letter
 * - At least one uppercase letter
 * - At least one digit
 * - At least one special character
 */
export const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

/**
 * Password validation requirements message
 */
export const PASSWORD_REQUIREMENTS = 
  'Password must be at least 8 characters and include uppercase, lowercase, number, and special character';

/**
 * Email validation pattern
 */
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Phone number validation pattern (basic international format)
 */
export const PHONE_PATTERN = /^\+?[\d\s\-()]+$/;

/**
 * Username validation pattern (alphanumeric, underscore, hyphen)
 */
export const USERNAME_PATTERN = /^[a-zA-Z0-9_-]{3,20}$/;
