import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { authApi, LoginRequest } from '../services/authApi';
import { useOAuthFlow } from '../hooks/useOAuthFlow';

export function LoginPage() {
  const { buildUrl } = useOAuthFlow();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: () => {
      // Get returnTo directly from URL params
      const params = new URLSearchParams(window.location.search);
      const returnToUrl = params.get('returnTo');

      // Redirect to OAuth flow or default
      if (returnToUrl) {
        window.location.replace(returnToUrl);
      } else {
        window.location.replace('/');
      }
    },
    onError: (err: any) => {
      const message =
        err.response?.data?.message ||
        err.response?.data?.detail ||
        'Invalid email or password';
      setError(message);
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic validation
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    loginMutation.mutate({ email, password });
  };

  return (
    <div className="page page--login">
      <div className="page__container">
        <Card className="login-card">
          <div className="login-form">
            <h1 className="login-form__title">Sign in to Home.Local</h1>

            <form onSubmit={handleSubmit} className="login-form__form">
              {error && <div className="login-form__error">{error}</div>}

              <Input
                label="Email"
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />

              <Input
                label="Password"
                type="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />

              <Button
                type="submit"
                variant="primary"
                isLoading={loginMutation.isPending}
                className="login-form__submit"
              >
                Sign In
              </Button>
            </form>

            {/* Divider for future social login */}
            <div className="login-form__divider">
              <span>or continue with</span>
            </div>

            {/* Placeholder for future social buttons */}
            <div className="login-form__social">
              <Button
                variant="secondary"
                disabled
                className="login-form__social-btn"
              >
                Google (coming soon)
              </Button>
              <Button
                variant="secondary"
                disabled
                className="login-form__social-btn"
              >
                GitHub (coming soon)
              </Button>
            </div>

            <div className="login-form__links">
              <Link to="#" className="login-form__link">
                Forgot password?
              </Link>
            </div>

            <div className="login-form__footer">
              <p>
                Don't have an account?{' '}
                <Link
                  to={buildUrl('/register')}
                  className="login-form__link--primary"
                >
                  Sign up
                </Link>
              </p>
              <p>
                Registering a business?{' '}
                <Link
                  to={buildUrl('/business/signup')}
                  className="login-form__link--primary"
                >
                  Sign up here
                </Link>
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
