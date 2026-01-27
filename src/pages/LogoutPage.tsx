import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:8000';

export function LogoutPage() {
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  // Get redirect_uri from query params (where to go after logout)
  const redirectUri = searchParams.get('redirect_uri');

  const performLogout = () => {
    try {
      // Create and submit form to auth-service logout endpoint
      // Using form submission ensures proper cookie handling and redirects
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = `${AUTH_SERVICE_URL}/auth/logout`;

      // Add redirect_uri if provided
      if (redirectUri) {
        const redirectInput = document.createElement('input');
        redirectInput.type = 'hidden';
        redirectInput.name = 'redirect_uri';
        redirectInput.value = redirectUri;
        form.appendChild(redirectInput);
      }

      document.body.appendChild(form);
      form.submit();
    } catch (err) {
      setError('Failed to log out. Please try again.');
    }
  };

  useEffect(() => {
    // Automatically trigger logout on page load
    performLogout();
  }, []);

  // Error state - show retry option
  if (error) {
    return (
      <div className="page page--logout">
        <div className="page__container">
          <Card className="logout-card">
            <div className="logout-error">
              <h1 className="logout-error__title">Logout Error</h1>
              <p className="logout-error__message">{error}</p>
              <Button variant="primary" onClick={performLogout}>
                Try Again
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Normal state - show loading while form submits
  return (
    <div className="page page--logout">
      <div className="page__container">
        <Card className="logout-card">
          <div className="logout-loading">
            <div className="logout-loading__spinner" />
            <p className="logout-loading__text">Logging out...</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
