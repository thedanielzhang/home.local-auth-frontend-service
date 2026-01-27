import axios from 'axios';

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:8000';

/**
 * Axios client for auth-service API calls.
 * Uses withCredentials to send/receive session cookies.
 */
export const authApiClient = axios.create({
  baseURL: AUTH_SERVICE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // Required for session cookie handling
});

// ============================================================================
// Request/Response Types
// ============================================================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  user: {
    id: string;
    email: string;
    name: string;
    home_geo_region: string;
  };
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  home_address: {
    street: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
}

export interface ConsentInfo {
  client_name: string;
  client_description: string | null;
  scopes: Array<{
    scope: string;
    description: string;
  }>;
  redirect_uri: string;
}

// ============================================================================
// API Functions
// ============================================================================

export const authApi = {
  /**
   * Log in with email and password.
   * On success, auth-service sets session cookie automatically.
   */
  login: (data: LoginRequest) =>
    authApiClient.post<LoginResponse>('/auth/login', data),

  /**
   * Register a new user account.
   * On success, auth-service creates account and sets session cookie.
   */
  register: (data: RegisterRequest) =>
    authApiClient.post<LoginResponse>('/auth/register', data),

  /**
   * Get consent information for displaying on consent page.
   */
  getConsentInfo: (token: string) =>
    authApiClient.get<ConsentInfo>(`/oauth/consent-info?token=${token}`),
};
