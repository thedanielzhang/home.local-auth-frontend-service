import { useSearchParams } from 'react-router-dom';

/**
 * Hook for managing OAuth flow state across auth pages.
 *
 * Handles:
 * - returnTo parameter (OAuth authorize URL to return to after login/register)
 * - token parameter (consent token for consent page)
 * - status parameter (business status for pending-approval page)
 */
export function useOAuthFlow() {
  const [searchParams] = useSearchParams();

  // Extract OAuth flow parameters
  const returnTo = searchParams.get('returnTo');
  const consentToken = searchParams.get('token');
  const status = searchParams.get('status');

  /**
   * Build a URL preserving the returnTo parameter.
   * Used for navigation between login/register pages.
   */
  const buildUrl = (path: string): string => {
    const params = new URLSearchParams();
    if (returnTo) {
      params.set('returnTo', returnTo);
    }
    const queryString = params.toString();
    return queryString ? `${path}?${queryString}` : path;
  };

  /**
   * Redirect after successful authentication.
   * Goes to returnTo URL if present, otherwise to a default page.
   */
  const redirectAfterAuth = (): void => {
    if (returnTo) {
      // Return to the OAuth authorize URL to continue the flow
      window.location.href = returnTo;
    } else {
      // No OAuth flow - redirect to a default location
      // This shouldn't happen normally in OAuth flow
      window.location.href = '/';
    }
  };

  return {
    returnTo,
    consentToken,
    status,
    buildUrl,
    redirectAfterAuth,
  };
}
