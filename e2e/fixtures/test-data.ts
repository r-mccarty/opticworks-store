/**
 * Test data for E2E checkout flow testing.
 */

export const testProducts = {
  flagship: {
    slug: 'bed-presence-sensor-kit',
    name: 'Bed Presence Sensor Kit',
    price: 239,
  },
  duo: {
    slug: 'presence-sensor-duo-pack',
    name: 'Presence Sensor Duo Pack',
    price: 449,
  },
  prism: {
    slug: 'optic-1x-prism',
    name: 'Optic 1x Prism',
    price: 149,
  },
};

export const testCustomer = {
  email: `e2e-test-${Date.now()}@optic.works`,
  firstName: 'E2E',
  lastName: 'Test',
};

/**
 * Test user credentials for authentication tests.
 * Note: These accounts need to be pre-created in Medusa for login tests.
 * For registration tests, use generateTestEmail() to create unique accounts.
 */
export const testAuthCredentials = {
  // Password used for all test accounts
  password: 'TestPassword123!',
  // Weak password for validation tests
  weakPassword: '123',
  // Invalid credentials for error testing
  invalidEmail: 'nonexistent@optic.works',
  invalidPassword: 'wrongpassword',
};

export const testAddress = {
  name: 'E2E Test Customer',
  line1: '123 Test Street',
  line2: 'Suite 100',
  city: 'San Francisco',
  state: 'CA',
  postalCode: '94102',
  country: 'US',
};

/**
 * Stripe test cards.
 * @see https://docs.stripe.com/testing#cards
 */
export const testCards = {
  // Successful payment
  success: {
    number: '4242424242424242',
    expMonth: '12',
    expYear: '2030',
    cvc: '123',
  },
  // Card declined
  decline: {
    number: '4000000000000002',
    expMonth: '12',
    expYear: '2030',
    cvc: '123',
  },
  // Requires authentication (3D Secure)
  requires3DS: {
    number: '4000002500003155',
    expMonth: '12',
    expYear: '2030',
    cvc: '123',
  },
  // Insufficient funds
  insufficientFunds: {
    number: '4000000000009995',
    expMonth: '12',
    expYear: '2030',
    cvc: '123',
  },
};

/**
 * Generate a unique test email for each run.
 */
export function generateTestEmail(): string {
  return `e2e-test-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@optic.works`;
}

/**
 * Mailosaur configuration for email testing.
 * Mailosaur captures emails sent to its test domains, allowing verification in E2E tests.
 *
 * Required environment variables:
 * - MAILOSAUR_API_KEY: Your Mailosaur API key
 * - MAILOSAUR_SERVER_ID: Your Mailosaur server ID (also used in email domain)
 *
 * @see https://mailosaur.com/docs
 */
export const mailosaurConfig = {
  apiKey: process.env.MAILOSAUR_API_KEY || '',
  serverId: process.env.MAILOSAUR_SERVER_ID || '',
  /**
   * Generate a unique email address that routes to Mailosaur for testing.
   * Format: {unique-id}@{server-id}.mailosaur.net
   */
  generateEmail: (): string => {
    const serverId = process.env.MAILOSAUR_SERVER_ID;
    if (!serverId) {
      console.warn('[Mailosaur] MAILOSAUR_SERVER_ID not set, falling back to optic.works domain');
      return generateTestEmail();
    }
    const uniqueId = `e2e-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    return `${uniqueId}@${serverId}.mailosaur.net`;
  },
};
