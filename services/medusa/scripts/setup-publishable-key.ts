#!/usr/bin/env tsx
/**
 * Publishable Key Setup Automation
 *
 * Creates and configures a publishable API key for the Medusa Store API.
 * Addresses RFD-004 Issue #4: Missing publishable key + sales channel wiring.
 *
 * This script:
 * 1. Authenticates to the Admin API using MEDUSA_ADMIN_TOKEN
 * 2. Retrieves or creates the default sales channel
 * 3. Creates a new publishable API key
 * 4. Associates the key with the sales channel
 * 5. Outputs the key for use in the storefront .env
 *
 * Prerequisites:
 * - Medusa service must be running
 * - MEDUSA_ADMIN_TOKEN must be set in .env
 * - MEDUSA_ADMIN_URL (or MEDUSA_BACKEND_URL) must be set
 *
 * Usage:
 *   pnpm run setup:keys
 *   pnpm run setup:keys --title "Production Store"
 */

import { retryFetch } from './utils/retry.js';

interface SalesChannel {
  id: string;
  name: string;
  description: string | null;
  is_disabled: boolean;
}

interface PublishableApiKey {
  id: string;
  title: string;
  created_at: string;
}

/**
 * Get admin API base URL
 */
function getAdminUrl(): string {
  const url = process.env.MEDUSA_ADMIN_URL || process.env.MEDUSA_BACKEND_URL || 'http://localhost:9000';
  return url.replace(/\/$/, ''); // Remove trailing slash
}

/**
 * Get admin authentication token
 */
function getAdminToken(): string {
  const token = process.env.MEDUSA_ADMIN_TOKEN;
  if (!token) {
    throw new Error(
      'MEDUSA_ADMIN_TOKEN not found in environment. ' +
      'Generate one with: pnpm run generate:secrets'
    );
  }
  return token;
}

/**
 * Get the default sales channel
 */
async function getDefaultSalesChannel(): Promise<SalesChannel> {
  const adminUrl = getAdminUrl();
  const token = getAdminToken();

  console.log('📡 Fetching default sales channel...');

  try {
    const response = await retryFetch(
      `${adminUrl}/admin/sales-channels`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
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
async function createPublishableKey(title: string): Promise<PublishableApiKey> {
  const adminUrl = getAdminUrl();
  const token = getAdminToken();

  console.log(`🔑 Creating publishable API key: "${title}"...`);

  try {
    const response = await retryFetch(
      `${adminUrl}/admin/publishable-api-keys`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title }),
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
    const apiKey = data.publishable_api_key;

    console.log(`✓ Created publishable API key: ${apiKey.id}`);

    return apiKey;
  } catch (error) {
    console.error('✗ Failed to create publishable key:', error instanceof Error ? error.message : error);
    throw error;
  }
}

/**
 * Associate publishable key with sales channel
 */
async function associateKeyWithChannel(keyId: string, channelId: string): Promise<void> {
  const adminUrl = getAdminUrl();
  const token = getAdminToken();

  console.log('🔗 Associating key with sales channel...');

  try {
    const response = await retryFetch(
      `${adminUrl}/admin/publishable-api-keys/${keyId}/sales-channels`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sales_channel_id: channelId,
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
Title:             ${apiKey.title}
Sales Channel:     ${salesChannel.name} (${salesChannel.id})
Created:           ${new Date(apiKey.created_at).toLocaleString()}

📋 Next Steps:

1. Add this key to your storefront .env file:

   NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=${apiKey.id}

2. Include the key in all Store API requests:

   fetch('http://localhost:9000/store/products', {
     headers: {
       'x-publishable-api-key': '${apiKey.id}'
     }
   })

3. Store this key in Infisical for production deployment

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
    // Step 1: Get default sales channel
    const salesChannel = await getDefaultSalesChannel();

    // Step 2: Create publishable API key
    const apiKey = await createPublishableKey(title);

    // Step 3: Associate key with sales channel
    await associateKeyWithChannel(apiKey.id, salesChannel.id);

    // Step 4: Display results
    displayResults(apiKey, salesChannel);

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Setup failed:', error instanceof Error ? error.message : error);
    console.error('\nTroubleshooting:');
    console.error('- Ensure Medusa service is running: pnpm run dev');
    console.error('- Check MEDUSA_ADMIN_TOKEN is set in .env');
    console.error('- Verify MEDUSA_ADMIN_URL is correct');
    console.error('- Run health check: pnpm run health:check\n');
    process.exit(1);
  }
}

main();
