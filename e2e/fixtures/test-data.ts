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

/**
 * Hookdeck configuration for webhook event verification in E2E tests.
 * Hookdeck buffers and logs webhook events, allowing verification that
 * inbound webhooks were received and delivered.
 *
 * Required environment variables:
 * - HOOKDECK_API_KEY: Hookdeck Admin API key for querying events
 *
 * @see https://hookdeck.com/docs/api
 */
export const hookdeckConfig = {
  apiKey: process.env.HOOKDECK_API_KEY || '',
  baseUrl: 'https://api.hookdeck.com/2024-03-01',
};

/**
 * EasyPost magic tracking codes for testing.
 * In test mode, these codes automatically cycle through tracking statuses.
 *
 * @see https://www.easypost.com/docs/api#trackers
 */
export const easypostMagicCodes = {
  /** Automatically transitions to delivered */
  delivered: 'EZ1000000001',
  /** Automatically transitions to in_transit */
  inTransit: 'EZ2000000002',
  /** Automatically transitions to failure */
  failure: 'EZ3000000003',
  /** Stays in pre_transit */
  preTransit: 'EZ4000000004',
  /** Automatically transitions to out_for_delivery */
  outForDelivery: 'EZ5000000005',
};
