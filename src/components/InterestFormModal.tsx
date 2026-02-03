import React, { useState, useEffect, useCallback } from 'react';
import { submitInterestForm, InterestFormData } from '../services/googleSheets';

// Inline the TabId type to avoid importing from deploy-console
type TabId = 'home' | 'developers' | 'businesses' | string;

interface InterestFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceTab: TabId;
}

type InterestType = 'general' | 'developer' | 'business';

interface FormData {
  email: string;
  name: string;
  phone: string;
  businessName: string;
  zipCode: string;
  interestType: InterestType;
}

interface FormErrors {
  email?: string;
  name?: string;
  zipCode?: string;
  submit?: string;
}

const getDefaultInterestType = (tab: TabId): InterestType => {
  switch (tab) {
    case 'developers':
      return 'developer';
    case 'businesses':
      return 'business';
    default:
      return 'general';
  }
};

export const InterestFormModal: React.FC<InterestFormModalProps> = ({
  isOpen,
  onClose,
  sourceTab,
}) => {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    name: '',
    phone: '',
    businessName: '',
    zipCode: '',
    interestType: getDefaultInterestType(sourceTab),
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Reset form when modal opens with new source tab
  useEffect(() => {
    if (isOpen) {
      setFormData((prev) => ({
        ...prev,
        interestType: getDefaultInterestType(sourceTab),
      }));
      setErrors({});
      setIsSuccess(false);
    }
  }, [isOpen, sourceTab]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, isSubmitting, onClose]);

  // Auto-close after success
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        onClose();
        // Reset form state after close animation
        setTimeout(() => {
          setIsSuccess(false);
          setFormData({
            email: '',
            name: '',
            phone: '',
            businessName: '',
            zipCode: '',
            interestType: 'general',
          });
        }, 300);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, onClose]);

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    // Zip code validation (optional, but must be valid if provided)
    if (formData.zipCode && !/^\d{5}$/.test(formData.zipCode)) {
      newErrors.zipCode = 'Zip code must be 5 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const submissionData: InterestFormData = {
        email: formData.email.trim(),
        name: formData.name.trim(),
        phone: formData.phone.trim() || undefined,
        businessName: formData.businessName.trim() || undefined,
        zipCode: formData.zipCode.trim() || undefined,
        interestType: formData.interestType,
        sourceTab: sourceTab,
      };

      const result = await submitInterestForm(submissionData);

      if (result.success) {
        setIsSuccess(true);
      } else {
        setErrors({ submit: result.message || 'Something went wrong. Please try again.' });
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setErrors({ submit: 'Something went wrong. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleInterestTypeChange = (type: InterestType) => {
    setFormData((prev) => ({ ...prev, interestType: type }));
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="interest-modal-overlay"
      onClick={isSubmitting ? undefined : onClose}
    >
      <div
        className="interest-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="interest-modal-title"
      >
        <header className="interest-modal-header">
          <h2 id="interest-modal-title" className="interest-modal-title">
            {isSuccess ? '🎉' : 'Get Connected'}
          </h2>
          {!isSubmitting && (
            <button
              className="interest-modal-close"
              onClick={onClose}
              aria-label="Close modal"
            >
              ✕
            </button>
          )}
        </header>

        <div className="interest-modal-body">
          {isSuccess ? (
            <div className="interest-success">
              <div className="interest-success-icon">🌱</div>
              <h3 className="interest-success-title">You're on the list!</h3>
              <p className="interest-success-message">
                We'll be in touch soon.
              </p>
            </div>
          ) : (
            <form className="interest-form" onSubmit={handleSubmit}>
              {/* General error */}
              {errors.submit && (
                <div className="interest-form-error" style={{ marginBottom: '8px' }}>
                  {errors.submit}
                </div>
              )}

              {/* Email */}
              <div className="interest-form-group">
                <label className="interest-form-label" htmlFor="interest-email">
                  Email <span className="required">*</span>
                </label>
                <input
                  id="interest-email"
                  type="email"
                  className={`interest-form-input ${errors.email ? 'error' : ''}`}
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  placeholder="you@example.com"
                  autoComplete="email"
                  disabled={isSubmitting}
                />
                {errors.email && (
                  <span className="interest-form-error">{errors.email}</span>
                )}
              </div>

              {/* Name */}
              <div className="interest-form-group">
                <label className="interest-form-label" htmlFor="interest-name">
                  Name <span className="required">*</span>
                </label>
                <input
                  id="interest-name"
                  type="text"
                  className={`interest-form-input ${errors.name ? 'error' : ''}`}
                  value={formData.name}
                  onChange={handleInputChange('name')}
                  placeholder="Your name"
                  autoComplete="name"
                  disabled={isSubmitting}
                />
                {errors.name && (
                  <span className="interest-form-error">{errors.name}</span>
                )}
              </div>

              {/* Interest Type Toggle */}
              <div className="interest-form-group">
                <label className="interest-form-label">I'm a...</label>
                <div className="interest-type-toggle">
                  <button
                    type="button"
                    className={`interest-type-option ${
                      formData.interestType === 'general' ? 'active' : ''
                    }`}
                    onClick={() => handleInterestTypeChange('general')}
                    disabled={isSubmitting}
                  >
                    Neighbor
                  </button>
                  <button
                    type="button"
                    className={`interest-type-option ${
                      formData.interestType === 'developer' ? 'active' : ''
                    }`}
                    onClick={() => handleInterestTypeChange('developer')}
                    disabled={isSubmitting}
                  >
                    Developer
                  </button>
                  <button
                    type="button"
                    className={`interest-type-option ${
                      formData.interestType === 'business' ? 'active' : ''
                    }`}
                    onClick={() => handleInterestTypeChange('business')}
                    disabled={isSubmitting}
                  >
                    Business
                  </button>
                </div>
              </div>

              {/* Phone (optional) */}
              <div className="interest-form-group">
                <label className="interest-form-label" htmlFor="interest-phone">
                  Phone
                </label>
                <input
                  id="interest-phone"
                  type="tel"
                  className="interest-form-input"
                  value={formData.phone}
                  onChange={handleInputChange('phone')}
                  placeholder="(555) 123-4567"
                  autoComplete="tel"
                  disabled={isSubmitting}
                />
              </div>

              {/* Business Name (optional, shown for business interest) */}
              {formData.interestType === 'business' && (
                <div className="interest-form-group">
                  <label
                    className="interest-form-label"
                    htmlFor="interest-business"
                  >
                    Business Name
                  </label>
                  <input
                    id="interest-business"
                    type="text"
                    className="interest-form-input"
                    value={formData.businessName}
                    onChange={handleInputChange('businessName')}
                    placeholder="Your business name"
                    autoComplete="organization"
                    disabled={isSubmitting}
                  />
                </div>
              )}

              {/* Zip Code (optional) */}
              <div className="interest-form-group">
                <label className="interest-form-label" htmlFor="interest-zip">
                  Zip Code
                </label>
                <input
                  id="interest-zip"
                  type="text"
                  className={`interest-form-input ${errors.zipCode ? 'error' : ''}`}
                  value={formData.zipCode}
                  onChange={handleInputChange('zipCode')}
                  placeholder="94110"
                  autoComplete="postal-code"
                  maxLength={5}
                  disabled={isSubmitting}
                />
                {errors.zipCode && (
                  <span className="interest-form-error">{errors.zipCode}</span>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="interest-form-submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Connecting...' : 'Get Connected'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
