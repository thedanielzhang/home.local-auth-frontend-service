/**
 * Environment configuration for auth-frontend-service.
 *
 * All environment-specific URLs and settings should be accessed through this module.
 * This ensures consistent handling across the application and makes it easy to
 * configure different environments (development, staging, production).
 *
 * For Parcel, environment variables are replaced at build time via process.env.
 * Set these in your .env file or as build-time environment variables.
 */

/**
 * Auth service API URL.
 * Used for all backend API calls (registration, validation, etc.)
 *
 * @example
 * Development: http://localhost:8000
 * Staging: https://auth.staging.iriai.app
 * Production: https://auth.iriai.app
 */
export const AUTH_SERVICE_URL =
  process.env.AUTH_SERVICE_URL || 'http://localhost:8000';

/**
 * Auth frontend URL (this service).
 * Used for constructing absolute URLs when needed.
 *
 * @example
 * Development: http://localhost:1234
 * Staging: https://auth-frontend.staging.iriai.app
 * Production: https://auth.iriai.app
 */
export const AUTH_FRONTEND_URL =
  process.env.AUTH_FRONTEND_URL || 'http://localhost:1234';

/**
 * Directory app URL.
 * Used as default return URL for business registration flow.
 *
 * @example
 * Development: http://localhost:5173
 * Staging: https://directory.japantown.staging.iriai.app
 * Production: https://directory.japantown.iriai.app
 */
export const DIRECTORY_URL =
  process.env.DIRECTORY_URL || 'http://localhost:5173';

/**
 * Check if running in development mode.
 */
export const IS_DEVELOPMENT = process.env.NODE_ENV !== 'production';
