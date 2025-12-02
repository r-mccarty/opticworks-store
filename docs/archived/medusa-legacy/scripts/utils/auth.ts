/**
 * Admin Authentication Utility
 *
 * Handles Medusa admin authentication for automation scripts.
 * Prefers secret API keys (Basic auth) with JWT fallback per RFD-005.
 *
 * @see /docs/RFD-005.md for technical background and decisions
 */

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface AuthToken {
  token: string;
  expiresAt?: string;
}

export interface AdminAuthHeader {
  type: 'secret' | 'jwt';
  header: string;
  token?: string;
}

/**
 * Authenticate and obtain JWT token from Medusa Admin API
 *
 * @param adminUrl - Base URL of the Medusa admin API (e.g., https://api.optic.works or http://localhost:9000)
 * @param credentials - Admin email and password
 * @returns JWT token string
 * @throws Error if authentication fails
 *
 * @example
 * ```typescript
 * const token = await getAdminToken('https://api.optic.works', {
 *   email: 'admin@optic.works',
 *   password: 'secure-password'
 * });
 * ```
 */
export async function getAdminToken(
  adminUrl: string,
  credentials: AuthCredentials
): Promise<string> {
  try {
    const response = await fetch(`${adminUrl}/auth/admin/emailpass`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(
        `Admin authentication failed: HTTP ${response.status} - ${text}\n` +
          `Ensure admin user exists: pnpm medusa user -e ${credentials.email} -p <password>`
      );
    }

    const data = (await response.json()) as AuthToken;

    if (!data.token) {
      throw new Error('Authentication response missing token field');
    }

    return data.token;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(
        `Failed to obtain admin token: ${error.message}\n\n` +
          `Troubleshooting:\n` +
          `- Ensure admin user exists: pnpm medusa user -e ${credentials.email} -p <password>\n` +
          `- Verify MEDUSA_ADMIN_EMAIL and MEDUSA_ADMIN_PASSWORD in .env\n` +
          `- Check Medusa is running: curl ${adminUrl}/health\n` +
          `- See RFD-005 for authentication details: docs/RFD-005.md`
      );
    }
    throw error;
  }
}

/**
 * Get admin credentials from environment variables
 *
 * @returns Admin credentials object
 * @throws Error if required environment variables are missing
 *
 * @example
 * ```typescript
 * const credentials = getAdminCredentials();
 * const token = await getAdminToken('https://api.optic.works', credentials);
 * ```
 */
export function getAdminCredentials(): AuthCredentials {
  const email = process.env.MEDUSA_ADMIN_EMAIL || 'admin@optic.works';
  const password = process.env.MEDUSA_ADMIN_PASSWORD;

  if (!password) {
    throw new Error(
      'MEDUSA_ADMIN_PASSWORD not set in environment.\n\n' +
        'Add to .env or Infisical:\n' +
        '  MEDUSA_ADMIN_EMAIL=admin@optic.works\n' +
        '  MEDUSA_ADMIN_PASSWORD=<your-password>\n\n' +
        'If using Infisical, run: pnpm run secrets:pull'
    );
  }

  return { email, password };
}

/**
 * Get Medusa secret API key from environment (if configured)
 */
export function getSecretApiKey(): string | undefined {
  return process.env.MEDUSA_SECRET_KEY || process.env.MEDUSA_SECRET_API_KEY;
}

/**
 * Resolve the appropriate Authorization header for admin API calls.
 * Prefers Secret API Keys (Basic auth) and falls back to JWT if unavailable.
 */
export async function getAdminAuthHeader(adminUrl: string): Promise<AdminAuthHeader> {
  const secretKey = getSecretApiKey();

  if (secretKey) {
    return {
      type: 'secret',
      header: `Basic ${secretKey}`,
    };
  }

  const credentials = getAdminCredentials();
  const token = await getAdminToken(adminUrl, credentials);

  return {
    type: 'jwt',
    header: `Bearer ${token}`,
    token,
  };
}
