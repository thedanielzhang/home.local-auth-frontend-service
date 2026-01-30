import { useEffect, useState, useCallback } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { Card, Button } from '../components/ui';
import { validateReturnUrl } from '../services/api';
import { getClientForDomain } from '../config/clients';
import { AUTH_SERVICE_URL } from '../config/env';

/**
 * Build an OAuth authorize URL that will redirect the user through the OAuth flow.
 * Since the user now has a session cookie (set during registration), OAuth will
 * auto-approve for first-party clients and redirect them with tokens.
 *
 * The state parameter now only contains type identifier and timestamp for validation.
 * The welcome modal is triggered by the show_welcome claim in the JWT token (server-side flag).
 *
 * @param returnUrl - The final destination URL after OAuth completes
 * @param clientId - The OAuth client ID for the destination app
 * @returns The OAuth authorize URL
 */
function buildOAuthAuthorizeUrl(returnUrl: string, clientId: string): string {
  const url = new URL(`${AUTH_SERVICE_URL}/oauth/authorize`);
  url.searchParams.set('client_id', clientId);

  // Determine the callback URL based on the return URL's origin
  const returnOrigin = new URL(returnUrl).origin;
  url.searchParams.set('redirect_uri', `${returnOrigin}/auth/callback`);

  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', 'openid profile');

  // Simplified state: just identifies this as a registration flow with timestamp for expiry
  // The welcome modal is now triggered by the show_welcome claim in the JWT token
  const registrationState = {
    type: 'registration',
    returnUrl,
    ts: Date.now(),
  };
  url.searchParams.set('state', btoa(JSON.stringify(registrationState)));

  return url.toString();
}

interface LocationState {
  userId: string;
  businessName: string;
  status: 'pending_approval' | 'approved';
  returnUrl?: string;
}

type RedirectState =
  | { status: 'idle' } // Initial state, or no returnUrl provided
  | { status: 'validating' }
  | { status: 'counting_down'; secondsRemaining: number; redirectUrl: string; appName: string }
  | { status: 'redirecting'; redirectUrl: string }
  | { status: 'manual'; redirectUrl: string; appName: string } // User cancelled, show button
  | { status: 'invalid' }; // URL failed validation, no button shown

const COUNTDOWN_SECONDS = 3;

export function ConfirmationPage() {
  const location = useLocation();
  const state = location.state as LocationState | null;
  const [redirectState, setRedirectState] = useState<RedirectState>({ status: 'idle' });

  // Redirect if no state (user navigated directly)
  if (!state?.businessName) {
    return <Navigate to="/business/signup" replace />;
  }

  const { businessName, status: registrationStatus, returnUrl } = state;
  const isApproved = registrationStatus === 'approved';

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
        // Get the client config for this return URL
        const clientConfig = getClientForDomain(new URL(returnUrl).hostname);

        if (clientConfig) {
          // Build OAuth authorize URL - the session cookie (set during registration)
          // will allow OAuth to auto-approve for first-party clients
          // The welcome modal is triggered by the show_welcome claim in the JWT token
          const redirectUrl = buildOAuthAuthorizeUrl(returnUrl, clientConfig.clientId);

          setRedirectState({
            status: 'counting_down',
            secondsRemaining: COUNTDOWN_SECONDS,
            redirectUrl: redirectUrl,
            appName: clientConfig.name,
          });
        } else {
          // Unknown client - don't redirect through OAuth
          console.log('No client config found for return URL:', returnUrl);
          setRedirectState({ status: 'invalid' });
          return;
        }
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
          return { status: 'redirecting', redirectUrl: prev.redirectUrl };
        }

        return { ...prev, secondsRemaining: prev.secondsRemaining - 1 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [redirectState.status]);

  // Perform redirect
  useEffect(() => {
    if (redirectState.status === 'redirecting') {
      window.location.href = redirectState.redirectUrl;
    }
  }, [redirectState]);

  // Cancel auto-redirect and show manual button
  const cancelRedirect = useCallback(() => {
    if (redirectState.status === 'counting_down') {
      setRedirectState({
        status: 'manual',
        redirectUrl: redirectState.redirectUrl,
        appName: redirectState.appName,
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
              Redirecting to {redirectState.appName} in {redirectState.secondsRemaining}...
            </p>
            <Button variant="secondary" onClick={cancelRedirect}>
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
        return (
          <div className="confirmation-actions">
            <a href={redirectState.redirectUrl} className="btn btn-primary">
              Continue to {redirectState.appName}
            </a>
          </div>
        );
    }
  };

  return (
    <div className="page page--confirmation">
      <div className="page__container">
        <Card className="confirmation-card">
          <div className="confirmation-icon">&#x2713;</div>
          <h1>{isApproved ? 'Welcome to Iriai!' : 'Application Submitted!'}</h1>
          <p className="confirmation-lead">
            Thank you for registering <strong>{businessName}</strong> with Iriai.
          </p>

          {isApproved ? (
            <div className="confirmation-steps">
              <h2>You're all set!</h2>
              <p>
                Your business account has been approved. You can now sign in to any Iriai app and
                start creating your directory listing.
              </p>
            </div>
          ) : (
            <div className="confirmation-steps">
              <h2>What happens next?</h2>
              <ol>
                <li>
                  <strong>Review:</strong> Our team will review your application within 1-2 business
                  days
                </li>
                <li>
                  <strong>Notification:</strong> You'll receive an email when your account is
                  approved
                </li>
                <li>
                  <strong>Get Started:</strong> In the meantime, you can create your directory
                  listing
                </li>
              </ol>
            </div>
          )}

          <p className="confirmation-note">
            A confirmation email has been sent to your registered email address.
          </p>

          {renderRedirectStatus()}
        </Card>
      </div>
    </div>
  );
}
