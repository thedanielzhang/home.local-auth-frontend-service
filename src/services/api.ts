import axios, { AxiosError } from 'axios';
import { AUTH_SERVICE_URL } from '../config/env';

const apiClient = axios.create({
  baseURL: AUTH_SERVICE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Allow cookies to be set/sent for session management
});

export interface BusinessRegistrationData {
  business_name: string;
  business_address_street: string;
  business_address_city: string;
  business_address_state: string;
  business_address_postal_code: string;
  business_address_country?: string;
  business_phone: string;
  business_website?: string;
  contact_name: string;
  contact_email: string;
  contact_role?: string;
  password: string;
  bypass_code?: string;
}

export interface BusinessRegistrationResponse {
  user_id: string;
  business_name: string;
  account_type: string;
  status: 'pending_approval' | 'approved';
  message: string;
}

export interface ApiError {
  detail: string;
}

export async function registerBusiness(
  data: BusinessRegistrationData
): Promise<BusinessRegistrationResponse> {
  try {
    const response = await apiClient.post<BusinessRegistrationResponse>(
      '/business/register',
      data
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiError>;
      throw new Error(axiosError.response?.data?.detail || 'Registration failed');
    }
    throw error;
  }
}

export interface BusinessStatus {
  id: string;
  business_name: string;
  business_address_city: string | null;
  business_address_state: string | null;
  business_address_neighborhood: string | null;
  business_status: string;
  created_at: string;
}

export async function getBusinessStatus(userId: string): Promise<BusinessStatus> {
  const response = await apiClient.get<BusinessStatus>(`/business/status/${userId}`);
  return response.data;
}

export interface ValidateReturnUrlResponse {
  valid: boolean;
  reason?: string;
}

/**
 * Validate a return URL against the auth service allowlist.
 * Used to prevent open redirect vulnerabilities in the business signup flow.
 */
export async function validateReturnUrl(returnUrl: string): Promise<ValidateReturnUrlResponse> {
  try {
    const response = await apiClient.get<ValidateReturnUrlResponse>(
      '/business/validate-return-url',
      { params: { return_url: returnUrl } }
    );
    return response.data;
  } catch (error) {
    console.warn('Failed to validate return URL:', error);
    // Fail closed - if validation fails, don't allow redirect
    return { valid: false, reason: 'Validation service unavailable' };
  }
}
