import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { authApi } from '../services/authApi';
import { useOAuthFlow } from '../hooks/useOAuthFlow';

// Human-readable scope descriptions
const SCOPE_DESCRIPTIONS: Record<string, string> = {
  openid: 'Verify your identity',
  profile: 'View your basic profile (name, neighborhood)',
  email: 'View your email address',
  address: 'View your home address',
  offline_access: "Stay signed in (access your data while you're away)",
};

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:8000';

export function ConsentPage() {
  const navigate = useNavigate();
  const { consentToken } = useOAuthFlow();

  // Redirect if no consent token provided
  useEffect(() => {
    if (!consentToken) {
      navigate('/login');
    }
  }, [consentToken, navigate]);

  // Fetch consent info from auth-service
  const {
    data: consentInfo,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['consent-info', consentToken],
    queryFn: () => authApi.getConsentInfo(consentToken!),
    enabled: !!consentToken,
    select: (response) => response.data,
    retry: false, // Don't retry on 404 (expired token)
  });

  /**
   * Submit form to approve/deny endpoint.
   * Using form submission ensures proper redirect handling by the browser.
   */
  const submitConsentDecision = (action: 'approve' | 'deny') => {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = `${AUTH_SERVICE_URL}/oauth/authorize/${action}`;

    const tokenInput = document.createElement('input');
    tokenInput.type = 'hidden';
    tokenInput.name = 'consent_token';
    tokenInput.value = consentToken!;
    form.appendChild(tokenInput);

    document.body.appendChild(form);
    form.submit();
  };

  const handleApprove = () => {
    submitConsentDecision('approve');
  };

  const handleDeny = () => {
    submitConsentDecision('deny');
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="page page--consent">
        <div className="page__container">
          <Card className="consent-card">
            <div className="consent-loading">
              <p>Loading authorization request...</p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Error state (expired or invalid token)
  if (error || !consentInfo) {
    return (
      <div className="page page--consent">
        <div className="page__container">
          <Card className="consent-card">
            <div className="consent-error">
              <h1 className="consent-error__title">Authorization Error</h1>
              <p className="consent-error__message">
                This authorization request has expired or is invalid. Please try
                again.
              </p>
              <Button variant="secondary" onClick={() => window.history.back()}>
                Go Back
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="page page--consent">
      <div className="page__container">
        <Card className="consent-card">
          <div className="consent-content">
            <h1 className="consent-content__title">Authorize Application</h1>

            <div className="consent-app">
              <p className="consent-app__name">{consentInfo.client_name}</p>
              {consentInfo.client_description && (
                <p className="consent-app__description">
                  {consentInfo.client_description}
                </p>
              )}
              <p className="consent-app__request">
                wants to access your Iriai account
              </p>
            </div>

            <div className="consent-scopes">
              <p className="consent-scopes__label">
                This will allow the application to:
              </p>
              <ul className="consent-scopes__list">
                {consentInfo.scopes.map((scope) => (
                  <li key={scope.scope} className="consent-scopes__item">
                    <span className="consent-scopes__check">✓</span>
                    <span className="consent-scopes__text">
                      {SCOPE_DESCRIPTIONS[scope.scope] || scope.description}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="consent-actions">
              <Button
                variant="secondary"
                onClick={handleDeny}
                className="consent-actions__btn"
              >
                Deny
              </Button>
              <Button
                variant="primary"
                onClick={handleApprove}
                className="consent-actions__btn"
              >
                Authorize
              </Button>
            </div>

            <p className="consent-redirect-info">
              Authorizing will redirect you to
              <br />
              <span className="consent-redirect-info__uri">
                {consentInfo.redirect_uri}
              </span>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
