export interface ValidationErrors {
  [key: string]: string | undefined;
}

/**
 * Supported metro regions for user registration.
 * Users must have an address that geocodes to one of these areas.
 */
export const SUPPORTED_REGIONS = [
  { code: 'sf', name: 'San Francisco Bay Area' },
  { code: 'nyc', name: 'New York City Metro' },
  { code: 'la', name: 'Los Angeles Metro' },
] as const;

export const SUPPORTED_REGIONS_TEXT =
  'San Francisco, New York City, and Los Angeles';

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Enhanced email validation that more closely matches backend RFC 5322 validation.
 * This catches more edge cases than the simple regex.
 */
export function isValidEmailStrict(email: string): boolean {
  if (!email) return false;

  // Basic format check
  const basicRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!basicRegex.test(email)) return false;

  // Additional checks
  const [local, domain] = email.split('@');

  // Local part checks
  if (local.length > 64) return false;
  if (local.startsWith('.') || local.endsWith('.')) return false;
  if (local.includes('..')) return false;

  // Domain checks
  if (domain.length > 253) return false;
  if (domain.startsWith('-') || domain.endsWith('-')) return false;
  if (!/^[a-zA-Z0-9.-]+$/.test(domain)) return false;

  return true;
}

export function isValidPhone(phone: string): boolean {
  // Remove formatting characters and check for at least 10 digits
  const digits = phone.replace(/[\s\-\(\)\+\.]/g, '');
  return /^\d{10,}$/.test(digits);
}

export function isValidPassword(password: string): boolean {
  return password.length >= 8;
}

export function isValidUrl(url: string): boolean {
  if (!url) return true; // Optional field
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function isNotEmpty(value: string): boolean {
  return value.trim().length > 0;
}

export function isMinLength(value: string, min: number): boolean {
  return value.trim().length >= min;
}

type FormStep = 'business' | 'contact' | 'credentials';

export function validateBusinessForm(
  data: Record<string, string | undefined>,
  step: FormStep
): ValidationErrors {
  const errors: ValidationErrors = {};

  if (step === 'business') {
    // Business name: 2-255 chars (matching backend validation)
    if (!data.business_name || !isMinLength(data.business_name, 2)) {
      errors.business_name = 'Business name must be at least 2 characters';
    } else if (data.business_name.length > 255) {
      errors.business_name = 'Business name must be less than 255 characters';
    }
    if (!data.business_address_street || !isNotEmpty(data.business_address_street)) {
      errors.business_address_street = 'Street address is required';
    }
    if (!data.business_address_city || !isNotEmpty(data.business_address_city)) {
      errors.business_address_city = 'City is required';
    }
    if (!data.business_address_state || !isNotEmpty(data.business_address_state)) {
      errors.business_address_state = 'State is required';
    }
    if (!data.business_address_postal_code || !isNotEmpty(data.business_address_postal_code)) {
      errors.business_address_postal_code = 'ZIP code is required';
    }
    if (!data.business_phone || !isValidPhone(data.business_phone)) {
      errors.business_phone = 'Valid phone number is required (at least 10 digits)';
    }
    if (data.business_website && !isValidUrl(data.business_website)) {
      errors.business_website = 'Please enter a valid URL';
    }
  }

  if (step === 'contact') {
    if (!data.contact_name || !isNotEmpty(data.contact_name)) {
      errors.contact_name = 'Your name is required';
    }
    if (!data.contact_email || !isValidEmail(data.contact_email)) {
      errors.contact_email = 'Valid email address is required';
    }
  }

  if (step === 'credentials') {
    if (!data.password || !isValidPassword(data.password)) {
      errors.password = 'Password must be at least 8 characters';
    }
    if (data.password !== data.password_confirm) {
      errors.password_confirm = 'Passwords do not match';
    }
  }

  return errors;
}
