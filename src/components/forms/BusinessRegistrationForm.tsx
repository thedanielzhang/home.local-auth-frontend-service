import { useState, ChangeEvent, FormEvent } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Input, Card } from '../ui';
import { ProgressIndicator } from './ProgressIndicator';
import { registerBusiness, BusinessRegistrationData } from '../../services/api';
import { validateBusinessForm, ValidationErrors } from '../../utils/validators';

type FormStep = 'business' | 'contact' | 'credentials';

const STEPS: FormStep[] = ['business', 'contact', 'credentials'];

const STEP_TITLES: Record<FormStep, string> = {
  business: 'Business Information',
  contact: 'Contact Information',
  credentials: 'Create Your Account',
};

const STEP_DESCRIPTIONS: Record<FormStep, string> = {
  business: 'Tell us about your business',
  contact: 'How can we reach you?',
  credentials: 'Set up your login credentials',
};

interface FormData extends Partial<BusinessRegistrationData> {
  password_confirm?: string;
}

export function BusinessRegistrationForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnUrl = searchParams.get('return_url');

  const [currentStep, setCurrentStep] = useState<FormStep>('business');
  const [formData, setFormData] = useState<FormData>({});
  const [errors, setErrors] = useState<ValidationErrors>({});

  const mutation = useMutation({
    mutationFn: registerBusiness,
    onSuccess: (data) => {
      navigate('/business/confirmation', {
        state: {
          userId: data.user_id,
          businessName: data.business_name,
          returnUrl,
        },
      });
    },
    onError: (error: Error) => {
      const detail = error.message || '';

      // Provide user-friendly error messages for common backend errors
      if (detail.includes('Business name must be')) {
        setErrors({ business_name: detail });
      } else if (detail.includes('Invalid phone')) {
        setErrors({
          business_phone:
            'Please enter a valid phone number with at least 10 digits',
        });
      } else if (
        detail.includes('email') &&
        detail.toLowerCase().includes('already')
      ) {
        setErrors({
          contact_email: 'This email is already registered.',
        });
      } else if (detail.includes('email')) {
        setErrors({ contact_email: 'Please enter a valid email address' });
      } else {
        setErrors({
          _form:
            detail ||
            'Registration failed. Please check your information and try again.',
        });
      }
    },
  });

  const handleChange = (field: keyof FormData) => (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    // Clear field error on change
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateCurrentStep = (): boolean => {
    const stepErrors = validateBusinessForm(formData as Record<string, string>, currentStep);
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      const currentIndex = STEPS.indexOf(currentStep);
      if (currentIndex < STEPS.length - 1) {
        setCurrentStep(STEPS[currentIndex + 1]);
      }
    }
  };

  const handleBack = () => {
    const currentIndex = STEPS.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(STEPS[currentIndex - 1]);
      setErrors({});
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (validateCurrentStep()) {
      // Remove password_confirm before sending to API
      const { password_confirm, ...submitData } = formData;
      mutation.mutate(submitData as BusinessRegistrationData);
    }
  };

  return (
    <Card className="registration-card">
      <ProgressIndicator steps={STEPS} currentStep={currentStep} />

      <div className="form-header">
        <h2>{STEP_TITLES[currentStep]}</h2>
        <p>{STEP_DESCRIPTIONS[currentStep]}</p>
      </div>

      <form onSubmit={handleSubmit}>
        {currentStep === 'business' && (
          <div className="form-step">
            <div className="form-field-with-counter">
              <Input
                label="Business Name"
                name="business_name"
                value={formData.business_name || ''}
                onChange={handleChange('business_name')}
                error={errors.business_name}
                placeholder="e.g., Joe's Coffee Shop"
                maxLength={255}
                required
              />
              {formData.business_name && formData.business_name.length > 200 && (
                <p
                  className={`char-counter ${
                    formData.business_name.length > 240
                      ? 'char-counter--warning'
                      : ''
                  }`}
                >
                  {255 - formData.business_name.length} characters remaining
                </p>
              )}
            </div>
            <Input
              label="Street Address"
              name="business_address_street"
              value={formData.business_address_street || ''}
              onChange={handleChange('business_address_street')}
              error={errors.business_address_street}
              placeholder="123 Main Street"
              required
            />
            <div className="form-row form-row--three">
              <Input
                label="City"
                name="business_address_city"
                value={formData.business_address_city || ''}
                onChange={handleChange('business_address_city')}
                error={errors.business_address_city}
                required
              />
              <Input
                label="State"
                name="business_address_state"
                value={formData.business_address_state || ''}
                onChange={handleChange('business_address_state')}
                error={errors.business_address_state}
                placeholder="CA"
                maxLength={2}
                required
              />
              <Input
                label="ZIP Code"
                name="business_address_postal_code"
                value={formData.business_address_postal_code || ''}
                onChange={handleChange('business_address_postal_code')}
                error={errors.business_address_postal_code}
                placeholder="94102"
                required
              />
            </div>
            <Input
              label="Business Phone"
              name="business_phone"
              type="tel"
              value={formData.business_phone || ''}
              onChange={handleChange('business_phone')}
              error={errors.business_phone}
              placeholder="(415) 555-1234"
              required
            />
            <Input
              label="Business Website (optional)"
              name="business_website"
              type="url"
              value={formData.business_website || ''}
              onChange={handleChange('business_website')}
              error={errors.business_website}
              placeholder="https://www.example.com"
            />
          </div>
        )}

        {currentStep === 'contact' && (
          <div className="form-step">
            <Input
              label="Your Full Name"
              name="contact_name"
              value={formData.contact_name || ''}
              onChange={handleChange('contact_name')}
              error={errors.contact_name}
              placeholder="Jane Doe"
              required
            />
            <Input
              label="Email Address"
              name="contact_email"
              type="email"
              value={formData.contact_email || ''}
              onChange={handleChange('contact_email')}
              error={errors.contact_email}
              placeholder="jane@example.com"
              required
            />
            <Input
              label="Your Role/Title (optional)"
              name="contact_role"
              value={formData.contact_role || ''}
              onChange={handleChange('contact_role')}
              error={errors.contact_role}
              placeholder="Owner, Manager, etc."
            />
          </div>
        )}

        {currentStep === 'credentials' && (
          <div className="form-step">
            <p className="form-note">
              You'll use <strong>{formData.contact_email}</strong> and this password to sign in.
            </p>
            <Input
              label="Password"
              name="password"
              type="password"
              value={formData.password || ''}
              onChange={handleChange('password')}
              error={errors.password}
              placeholder="At least 8 characters"
              required
            />
            <Input
              label="Confirm Password"
              name="password_confirm"
              type="password"
              value={formData.password_confirm || ''}
              onChange={handleChange('password_confirm')}
              error={errors.password_confirm}
              required
            />
          </div>
        )}

        {errors._form && <div className="form-error-banner">{errors._form}</div>}

        <div className="form-actions">
          {currentStep !== 'business' && (
            <Button type="button" variant="secondary" onClick={handleBack}>
              Back
            </Button>
          )}
          <div className="form-actions__spacer" />
          {currentStep !== 'credentials' ? (
            <Button type="button" onClick={handleNext}>
              Continue
            </Button>
          ) : (
            <Button type="submit" isLoading={mutation.isPending}>
              Submit Application
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
}
