import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { authApi, RegisterRequest } from '../services/authApi';
import { useOAuthFlow } from '../hooks/useOAuthFlow';

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  name?: string;
  street?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  general?: string;
}

const initialFormData: FormData = {
  email: '',
  password: '',
  confirmPassword: '',
  name: '',
  street: '',
  city: '',
  state: '',
  postal_code: '',
  country: 'USA',
};

export function RegisterPage() {
  const { buildUrl, redirectAfterAuth } = useOAuthFlow();

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    // Account validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.name) {
      newErrors.name = 'Name is required';
    }

    // Address validation
    if (!formData.street) newErrors.street = 'Street address is required';
    if (!formData.city) newErrors.city = 'City is required';
    if (!formData.state) newErrors.state = 'State is required';
    if (!formData.postal_code) newErrors.postal_code = 'Postal code is required';
    if (!formData.country) newErrors.country = 'Country is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const registerMutation = useMutation({
    mutationFn: (data: RegisterRequest) => authApi.register(data),
    onSuccess: () => {
      // Registration successful - user is automatically logged in
      // Redirect back to OAuth flow
      redirectAfterAuth();
    },
    onError: (err: any) => {
      const detail =
        err.response?.data?.message ||
        err.response?.data?.detail ||
        '';

      // Provide user-friendly error messages for common backend errors
      if (detail.includes('not in supported region') || detail.includes('Supported:')) {
        setErrors({
          city: "We're currently only available in San Francisco, New York City, and Los Angeles metro areas. We're expanding soon!",
        });
      } else if (detail.includes('Email already registered')) {
        setErrors({
          email: 'This email is already registered. Try signing in instead.',
        });
      } else {
        setErrors({
          general: detail || 'Registration failed. Please try again.',
        });
      }
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    registerMutation.mutate({
      email: formData.email,
      password: formData.password,
      name: formData.name,
      home_address: {
        street: formData.street,
        city: formData.city,
        state: formData.state,
        postal_code: formData.postal_code,
        country: formData.country,
      },
    });
  };

  const handleChange =
    (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
      // Clear field error when user starts typing
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    };

  return (
    <div className="page page--register">
      <div className="page__container">
        <Card className="register-card">
          <h1 className="register-form__title">Create your Iriai account</h1>

          <form onSubmit={handleSubmit} className="register-form">
            {errors.general && (
              <div className="register-form__error">{errors.general}</div>
            )}

            {/* Account Information Section */}
            <div className="register-form__section">
              <h2 className="register-form__section-title">
                Account Information
              </h2>

              <Input
                label="Full Name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange('name')}
                placeholder="Jane Doe"
                error={errors.name}
                autoComplete="name"
                required
              />

              <Input
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange('email')}
                placeholder="you@example.com"
                error={errors.email}
                autoComplete="email"
                required
              />

              <Input
                label="Password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange('password')}
                placeholder="At least 8 characters"
                error={errors.password}
                autoComplete="new-password"
                required
              />

              <Input
                label="Confirm Password"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange('confirmPassword')}
                placeholder="Re-enter your password"
                error={errors.confirmPassword}
                autoComplete="new-password"
                required
              />
            </div>

            {/* Home Address Section */}
            <div className="register-form__section">
              <h2 className="register-form__section-title">Home Address</h2>
              <p className="register-form__section-description">
                Your address is used to determine your neighborhood. It will not
                be shared without your permission.
              </p>

              {/* Region availability notice */}
              <div className="region-notice">
                <svg
                  className="region-notice__icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4M12 8h.01" />
                </svg>
                <p className="region-notice__text">
                  <strong>Currently available in:</strong> San Francisco Bay
                  Area, New York City Metro, and Los Angeles Metro. We're
                  expanding to more cities soon!
                </p>
              </div>

              <Input
                label="Street Address"
                type="text"
                name="street"
                value={formData.street}
                onChange={handleChange('street')}
                placeholder="123 Main St"
                error={errors.street}
                autoComplete="street-address"
                required
              />

              <div className="register-form__row">
                <Input
                  label="City"
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange('city')}
                  placeholder="San Francisco"
                  error={errors.city}
                  autoComplete="address-level2"
                  required
                />

                <Input
                  label="State"
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange('state')}
                  placeholder="CA"
                  error={errors.state}
                  autoComplete="address-level1"
                  required
                />
              </div>

              <div className="register-form__row">
                <Input
                  label="Postal Code"
                  type="text"
                  name="postal_code"
                  value={formData.postal_code}
                  onChange={handleChange('postal_code')}
                  placeholder="94102"
                  error={errors.postal_code}
                  autoComplete="postal-code"
                  required
                />

                <Input
                  label="Country"
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange('country')}
                  placeholder="USA"
                  error={errors.country}
                  autoComplete="country-name"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              isLoading={registerMutation.isPending}
              className="register-form__submit"
            >
              Create Account
            </Button>
          </form>

          <div className="register-form__footer">
            <p>
              Already have an account?{' '}
              <Link to={buildUrl('/login')} className="register-form__link">
                Sign in
              </Link>
            </p>
            <p>
              Registering a business?{' '}
              <Link
                to={buildUrl('/business/signup')}
                className="register-form__link"
              >
                Sign up here
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
