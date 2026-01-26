import axios, { AxiosError } from 'axios';

const API_BASE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
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
}

export interface BusinessRegistrationResponse {
  user_id: string;
  business_name: string;
  status: string;
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
