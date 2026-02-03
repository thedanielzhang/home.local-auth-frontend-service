import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

const FORGOT_PASSWORD_SHEETS_URL =
  'https://script.google.com/macros/s/AKfycbzbYymPR8akLEF5Zg8bdi6fhcSP18ASR3H2xYRiNtL4QLM_aq4feP490TN-pDztkws-JQ/exec';

async function submitForgotPassword(email: string): Promise<boolean> {
  try {
    await fetch(FORGOT_PASSWORD_SHEETS_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        source: 'auth-frontend-forgot-password',
        timestamp: new Date().toISOString(),
      }),
    });
    return true;
  } catch {
    return false;
  }
}

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    const success = await submitForgotPassword(email.trim());
    setIsSubmitting(false);

    if (success) {
      setIsSubmitted(true);
    } else {
      setError('Something went wrong. Please try again or email us directly.');
    }
  };

  return (
    <div className="page page--forgot-password">
      <div className="page__container">
        <Card className="forgot-password-card">
          {isSubmitted ? (
            <div className="forgot-password-success">
              <div className="forgot-password-success__icon">✓</div>
              <h1 className="forgot-password-success__title">Request Submitted</h1>
              <p className="forgot-password-success__message">
                We've received your password reset request. Our team will reach out shortly.
              </p>
              <p className="forgot-password-success__urgent">
                If this is urgent, please email{' '}
                <a href="mailto:daniel@useiriai.com">daniel@useiriai.com</a> directly.
              </p>
              <Link to="/login" className="forgot-password__back-link">
                ← Back to login
              </Link>
            </div>
          ) : (
            <div className="forgot-password-form">
              <h1 className="forgot-password-form__title">Reset Password</h1>
              <p className="forgot-password-form__description">
                Enter your email address and we'll help you regain access to your account.
              </p>

              <form onSubmit={handleSubmit} className="forgot-password-form__form">
                {error && <div className="login-form__error">{error}</div>}

                <Input
                  label="Email Address"
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />

                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isSubmitting}
                  className="forgot-password-form__submit"
                >
                  Submit
                </Button>
              </form>

              <Link to="/login" className="forgot-password__back-link">
                ← Back to login
              </Link>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
