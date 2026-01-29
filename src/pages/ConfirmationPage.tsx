import { useEffect, useState, useCallback } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { Card, Button } from '../components/ui';
import { validateReturnUrl } from '../services/api';

interface LocationState {
  userId: string;
  businessName: string;
  returnUrl?: string;
}

type RedirectState =
  | { status: 'idle' }  // Initial state, or no returnUrl provided
  | { status: 'validating' }
  | { status: 'counting_down'; secondsRemaining: number; validatedUrl: string }
  | { status: 'redirecting'; validatedUrl: string }
  | { status: 'manual'; validatedUrl: string }  // User cancelled, show button
  | { status: 'invalid' };  // URL failed validation, no button shown

const COUNTDOWN_SECONDS = 3;

export function ConfirmationPage() {
  const location = useLocation();
  const state = location.state as LocationState | null;
  const [redirectState, setRedirectState] = useState<RedirectState>({ status: 'idle' });

  // Redirect if no state (user navigated directly)
  if (!state?.businessName) {
    return <Navigate to="/business/signup" replace />;
  }

  const { businessName, returnUrl } = state;

  // Validate URL and start countdown on mount
  useEffect(() => {
    let mounted = true;

    async function initializeRedirect() {
      // No return URL provided - just show confirmation
      if (!returnUrl) {
        setRedirectState({ status: 'idle' });
        return;
      }

      setRedirectState({ status: 'validating' });

      // Validate the URL against the allowlist
      const result = await validateReturnUrl(returnUrl);

      if (!mounted) return;

      if (result.valid) {
        // Start countdown
        setRedirectState({
          status: 'counting_down',
          secondsRemaining: COUNTDOWN_SECONDS,
          validatedUrl: returnUrl
        });
      } else {
        // URL is not in allowlist - don't show redirect option
        console.log('Return URL validation failed:', result.reason);
        setRedirectState({ status: 'invalid' });
      }
    }

    initializeRedirect();

    return () => {
      mounted = false;
    };
  }, [returnUrl]);

  // Countdown timer
  useEffect(() => {
    if (redirectState.status !== 'counting_down') return;

    const timer = setInterval(() => {
      setRedirectState((prev) => {
        if (prev.status !== 'counting_down') return prev;

        if (prev.secondsRemaining <= 1) {
          // Time's up - redirect
          return { status: 'redirecting', validatedUrl: prev.validatedUrl };
        }

        return { ...prev, secondsRemaining: prev.secondsRemaining - 1 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [redirectState.status]);

  // Perform redirect
  useEffect(() => {
    if (redirectState.status === 'redirecting') {
      window.location.href = redirectState.validatedUrl;
    }
  }, [redirectState]);

  // Cancel auto-redirect and show manual button
  const cancelRedirect = useCallback(() => {
    if (redirectState.status === 'counting_down') {
      setRedirectState({
        status: 'manual',
        validatedUrl: redirectState.validatedUrl
      });
    }
  }, [redirectState]);

  // Render redirect status section
  const renderRedirectStatus = () => {
    switch (redirectState.status) {
      case 'idle':
      case 'invalid':
        // No redirect - just show confirmation message
        return null;

      case 'validating':
        return (
          <div className="confirmation-redirect-status">
            <p className="text-muted">Preparing redirect...</p>
          </div>
        );

      case 'counting_down':
        return (
          <div className="confirmation-redirect-status">
            <p className="redirect-countdown">
              Redirecting in {redirectState.secondsRemaining}...
            </p>
            <Button
              variant="secondary"
              onClick={cancelRedirect}
            >
              Stay on this page
            </Button>
          </div>
        );

      case 'redirecting':
        return (
          <div className="confirmation-redirect-status">
            <p>Redirecting...</p>
          </div>
        );

      case 'manual':
        // User cancelled - show manual button
        try {
          const hostname = new URL(redirectState.validatedUrl).hostname;
          return (
            <div className="confirmation-actions">
              <a href={redirectState.validatedUrl} className="btn btn-primary">
                Return to {hostname}
              </a>
            </div>
          );
        } catch {
          return null;
        }
    }
  };

  return (
    <div className="page page--confirmation">
      <div className="page__container">
        <Card className="confirmation-card">
          <div className="confirmation-icon">&#x2713;</div>
          <h1>Application Submitted!</h1>
          <p className="confirmation-lead">
            Thank you for registering <strong>{businessName}</strong> with Iriai.
          </p>

          <div className="confirmation-steps">
            <h2>What happens next?</h2>
            <ol>
              <li>
                <strong>Review:</strong> Our team will review your application within 1-2 business days
              </li>
              <li>
                <strong>Notification:</strong> You'll receive an email when your account is approved
              </li>
              <li>
                <strong>Get Started:</strong> Once approved, you can sign in to any Iriai app
              </li>
            </ol>
          </div>

          <p className="confirmation-note">
            A confirmation email has been sent to your registered email address.
          </p>

          {renderRedirectStatus()}
        </Card>
      </div>
    </div>
  );
}
