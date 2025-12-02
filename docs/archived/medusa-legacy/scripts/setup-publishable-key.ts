#!/usr/bin/env tsx
/**
 * Publishable Key Setup Automation
 *
 * Creates and configures a publishable API key for the Medusa Store API.
 * Addresses RFD-004 Issue #4: Missing publishable key + sales channel wiring.
 * Updated for RFD-005: Prefers Medusa secret API key auth with JWT fallback.
 *
 * This script:
 * 1. Authenticates to the Admin API using the secret API key (JWT fallback)
 * 2. Retrieves or creates the default sales channel
 * 3. Creates a new publishable API key
 * 4. Associates the key with the sales channel
 * 5. Outputs the key for use in the storefront .env
 *
 * Prerequisites:
 * - Medusa service must be running
 * - MEDUSA_SECRET_KEY (preferred) or MEDUSA_ADMIN_EMAIL and MEDUSA_ADMIN_PASSWORD set in .env
 * - MEDUSA_ADMIN_URL (or MEDUSA_BACKEND_URL) must be set
 *
 * Usage:
 *   pnpm run setup:keys
 *   pnpm run setup:keys --title "Production Store"
 */

import { retryFetch } from './utils/retry.js';
import { getAdminAuthHeader, type AdminAuthHeader } from './utils/auth.js';

interface SalesChannel {
  id: string;
  name: string;
  description: string | null;
  is_disabled: boolean;
}

interface PublishableApiKey {
  id: string;
  token: string;
  title: string;
  type: string;
  created_at: string;
}

/**
 * Get admin API base URL
 */
function getAdminUrl(): string {
  const url = process.env.MEDUSA_ADMIN_URL || process.env.MEDUSA_BACKEND_URL || 'http://localhost:9000';
  return url.replace(/\/$/, ''); // Remove trailing slash
}

let authContext: AdminAuthHeader | null = null;

/**
 * Resolve admin authentication method (secret API key preferred, JWT fallback)
 */
async function resolveAuth(): Promise<AdminAuthHeader> {
  if (authContext) {
    return authContext;
  }

  console.log('🔐 Resolving admin authentication...');
  const context = await getAdminAuthHeader(getAdminUrl());

  if (context.type === 'secret') {
    console.log('✓ Using Medusa secret API key\n');
  } else {
    console.log('✓ Authentication successful (JWT)\n');
  }

  authContext = context;
  return context;
}

/**
 * Get the default sales channel
 */
async function getDefaultSalesChannel(auth: AdminAuthHeader): Promise<SalesChannel> {
  const adminUrl = getAdminUrl();

  console.log('📡 Fetching default sales channel...');

  try {
    const response = await retryFetch(
      `${adminUrl}/admin/sales-channels`,
      {
        headers: {
          'Authorization': auth.header,
          'Content-Type': 'application/json',
        },
      },
      {
        maxAttempts: 3,
        onRetry: (attempt, error, delay) => {
          console.log(`  Retry ${attempt}: ${error.message} (waiting ${Math.round(delay / 1000)}s)`);
        },
      }
    );

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Failed to fetch sales channels: HTTP ${response.status} - ${text}`);
    }

    const data = await response.json();
    const salesChannels = data.sales_channels || [];

    if (salesChannels.length === 0) {
      throw new Error('No sales channels found. Please create one in the Medusa admin dashboard.');
    }

    // Find the default channel (usually named "Default Sales Channel")
    const defaultChannel = salesChannels.find((sc: SalesChannel) =>
      sc.name.toLowerCase().includes('default')
    ) || salesChannels[0];

    console.log(`✓ Found sales channel: "${defaultChannel.name}" (${defaultChannel.id})`);

    return defaultChannel;
  } catch (error) {
    console.error('✗ Failed to fetch sales channel:', error instanceof Error ? error.message : error);
    throw error;
  }
}

/**
 * Create a new publishable API key
 */
async function createPublishableKey(title: string, auth: AdminAuthHeader): Promise<PublishableApiKey> {
  const adminUrl = getAdminUrl();

  console.log(`🔑 Creating publishable API key: "${title}"...`);

  try {
    const response = await retryFetch(
      `${adminUrl}/admin/api-keys`,
      {
        method: 'POST',
        headers: {
          'Authorization': auth.header,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, type: 'publishable' }),
      },
      {
        maxAttempts: 3,
        onRetry: (attempt, error, delay) => {
          console.log(`  Retry ${attempt}: ${error.message} (waiting ${Math.round(delay / 1000)}s)`);
        },
      }
    );

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Failed to create publishable key: HTTP ${response.status} - ${text}`);
    }

    const data = await response.json();
    const apiKey = data.api_key;

    console.log(`✓ Created publishable API key: ${apiKey.id}`);
    console.log(`  Token: ${apiKey.token}`);

    return apiKey;
  } catch (error) {
    console.error('✗ Failed to create publishable key:', error instanceof Error ? error.message : error);
    throw error;
  }
}

/**
 * Associate publishable key with sales channel
 */
async function associateKeyWithChannel(keyId: string, channelId: string, auth: AdminAuthHeader): Promise<void> {
  const adminUrl = getAdminUrl();

  console.log('🔗 Associating key with sales channel...');

  try {
    const response = await retryFetch(
      `${adminUrl}/admin/api-keys/${keyId}/sales-channels`,
      {
        method: 'POST',
        headers: {
          'Authorization': auth.header,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          add: [channelId],
        }),
      },
      {
        maxAttempts: 3,
        onRetry: (attempt, error, delay) => {
          console.log(`  Retry ${attempt}: ${error.message} (waiting ${Math.round(delay / 1000)}s)`);
        },
      }
    );

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Failed to associate key: HTTP ${response.status} - ${text}`);
    }

    console.log('✓ Successfully associated key with sales channel');
  } catch (error) {
    console.error('✗ Failed to associate key:', error instanceof Error ? error.message : error);
    throw error;
  }
}

/**
 * Display setup results
 */
function displayResults(apiKey: PublishableApiKey, salesChannel: SalesChannel): void {
  console.log('\n' + '='.repeat(70));
  console.log('✅ Publishable API Key Setup Complete!');
  console.log('='.repeat(70));
  console.log(`
Key ID:            ${apiKey.id}
Token:             ${apiKey.token}
Title:             ${apiKey.title}
Type:              ${apiKey.type}
Sales Channel:     ${salesChannel.name} (${salesChannel.id})
Created:           ${new Date(apiKey.created_at).toLocaleString()}

📋 Next Steps:

1. Add this key to your storefront .env file:

   NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=${apiKey.token}

2. Include the key in all Store API requests:

   fetch('http://localhost:9000/store/products', {
     headers: {
       'x-publishable-api-key': '${apiKey.token}'
     }
   })

3. Store this key in Infisical for production deployment:
   - Environment: development
   - Path: /
   - Variable: NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
   - Value: ${apiKey.token}

⚠️  Security Note:
   This key is safe to expose in client-side code, but it should still be
   managed as a configuration secret across environments.
`);
  console.log('='.repeat(70) + '\n');
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Medusa Publishable API Key Setup\n');

  // Load .env file
  try {
    const dotenv = await import('dotenv');
    dotenv.config();
  } catch {
    console.warn('⚠️  dotenv not available, using existing environment variables');
  }

  // Parse arguments
  const args = process.argv.slice(2);
  const titleArg = args.find(arg => arg.startsWith('--title='));
  const title = titleArg ? titleArg.split('=')[1] : 'Storefront';

  try {
    // Step 0: Resolve authentication strategy
    const auth = await resolveAuth();

    // Step 1: Get default sales channel
    const salesChannel = await getDefaultSalesChannel(auth);

    // Step 2: Create publishable API key
    const apiKey = await createPublishableKey(title, auth);

    // Step 3: Associate key with sales channel
    await associateKeyWithChannel(apiKey.id, salesChannel.id, auth);

    // Step 4: Display results
    displayResults(apiKey, salesChannel);

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Setup failed:', error instanceof Error ? error.message : error);
    console.error('\nTroubleshooting:');
    console.error('- Ensure Medusa service is running: pnpm run dev');
    console.error('- Provide MEDUSA_SECRET_KEY via Infisical or ensure MEDUSA_ADMIN_EMAIL and MEDUSA_ADMIN_PASSWORD are set in .env');
    console.error('- Verify MEDUSA_ADMIN_URL is correct');
    console.error('- Run health check: pnpm run health:check');
    console.error('- See RFD-005 for authentication details: docs/RFD-005.md\n');
    process.exit(1);
  }
}

main();
