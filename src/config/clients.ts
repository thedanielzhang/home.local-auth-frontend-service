/**
 * First-party OAuth client configuration.
 *
 * This maps domain patterns to OAuth client IDs, enabling the confirmation page
 * to redirect users through the OAuth flow after registration.
 */

export interface ClientConfig {
  clientId: string;
  name: string;
  domainPattern: RegExp;
}

export const FIRST_PARTY_CLIENTS: Record<string, ClientConfig> = {
  'directory-app': {
    clientId: 'directory-app',
    name: 'Directory',
    domainPattern: /directory\..+\.iriai\.app/,
  },
  'dev-console': {
    clientId: 'dev-console',
    name: 'Developer Console',
    domainPattern: /dev\.iriai\.app/,
  },
};

// Development overrides - matches localhost ports
const DEV_CLIENT_PATTERNS: Array<{ pattern: RegExp; clientId: string; name: string }> = [
  { pattern: /localhost:5173/, clientId: 'directory-app', name: 'Directory' },
  { pattern: /localhost:3000/, clientId: 'dev-console', name: 'Developer Console' },
];

/**
 * Get the OAuth client config for a given hostname.
 *
 * @param hostname - The hostname to match (e.g., 'directory.japantown.iriai.app')
 * @returns The client config if matched, null otherwise
 */
export function getClientForDomain(hostname: string): ClientConfig | null {
  // Check development patterns first
  for (const dev of DEV_CLIENT_PATTERNS) {
    if (dev.pattern.test(hostname)) {
      return { clientId: dev.clientId, name: dev.name, domainPattern: dev.pattern };
    }
  }

  // Check production patterns
  for (const [, config] of Object.entries(FIRST_PARTY_CLIENTS)) {
    if (config.domainPattern.test(hostname)) {
      return config;
    }
  }

  return null;
}

/**
 * Build a direct return URL with registration info appended as query params.
 *
 * This is simpler than OAuth state because it avoids cross-origin state issues.
 * The destination app should handle the welcome/registered query params.
 *
 * @param returnUrl - The URL to return to
 * @param registered - The registration status ('pending' or 'approved')
 * @returns The return URL with welcome params appended
 */
export function buildReturnUrlWithRegistration(
  returnUrl: string,
  registered: string
): string {
  try {
    const url = new URL(returnUrl);
    url.searchParams.set('registered', registered);
    url.searchParams.set('welcome', 'true');
    return url.toString();
  } catch (error) {
    console.error('Failed to build return URL:', error);
    return returnUrl;
  }
}
