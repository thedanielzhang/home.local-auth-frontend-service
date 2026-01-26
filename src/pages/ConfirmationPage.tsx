import { useLocation, Navigate } from 'react-router-dom';
import { Card, Button } from '../components/ui';

interface LocationState {
  userId: string;
  businessName: string;
  returnUrl?: string;
}

export function ConfirmationPage() {
  const location = useLocation();
  const state = location.state as LocationState | null;

  if (!state?.businessName) {
    return <Navigate to="/business/signup" replace />;
  }

  const { businessName, returnUrl } = state;

  return (
    <div className="page page--confirmation">
      <div className="page__container">
        <Card className="confirmation-card">
          <div className="confirmation-icon">&#x2713;</div>
          <h1>Application Submitted!</h1>
          <p className="confirmation-lead">
            Thank you for registering <strong>{businessName}</strong> with Home.Local.
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
                <strong>Get Started:</strong> Once approved, you can sign in to any Home.Local app
              </li>
            </ol>
          </div>

          <p className="confirmation-note">
            A confirmation email has been sent to your registered email address.
          </p>

          {returnUrl && (
            <div className="confirmation-actions">
              <a href={returnUrl} className="btn btn-primary">
                Return to {new URL(returnUrl).hostname}
              </a>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
