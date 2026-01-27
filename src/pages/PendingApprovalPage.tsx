import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useOAuthFlow } from '../hooks/useOAuthFlow';

export function PendingApprovalPage() {
  const { status } = useOAuthFlow();

  // Determine which status we're showing
  const isPending = status === 'pending_approval' || !status;
  const isRejected = status === 'rejected';
  const isSuspended = status === 'suspended';

  const handleLogout = () => {
    // Redirect to logout page, which will clear session
    window.location.href = '/logout';
  };

  return (
    <div className="page page--pending-approval">
      <div className="page__container">
        <Card className="pending-card">
          {isPending && (
            <div className="pending-content pending-content--pending">
              <div className="pending-icon pending-icon--pending">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12,6 12,12 16,14" />
                </svg>
              </div>
              <h1 className="pending-title">Account Pending Approval</h1>
              <p className="pending-message">
                Your business account is still being reviewed.
              </p>
              <p className="pending-details">
                You'll receive an email once your account has been approved. This
                typically takes 1-2 business days.
              </p>
            </div>
          )}

          {isRejected && (
            <div className="pending-content pending-content--rejected">
              <div className="pending-icon pending-icon--rejected">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
              </div>
              <h1 className="pending-title">Account Not Approved</h1>
              <p className="pending-message">
                Unfortunately, your business account application was not
                approved.
              </p>
              <p className="pending-details">
                If you believe this was in error, please contact our support team
                for more information.
              </p>
            </div>
          )}

          {isSuspended && (
            <div className="pending-content pending-content--suspended">
              <div className="pending-icon pending-icon--suspended">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <h1 className="pending-title">Account Suspended</h1>
              <p className="pending-message">
                Your business account has been suspended.
              </p>
              <p className="pending-details">
                Please contact our support team for more information about your
                account status.
              </p>
            </div>
          )}

          <div className="pending-support">
            <p>
              Questions? Contact{' '}
              <a
                href="mailto:support@homelocal.com"
                className="pending-support__link"
              >
                support@homelocal.com
              </a>
            </p>
          </div>

          <Button
            variant="secondary"
            onClick={handleLogout}
            className="pending-logout"
          >
            Log Out
          </Button>
        </Card>
      </div>
    </div>
  );
}
