#!/usr/bin/env tsx
/**
 * Medusa Health Check Utility
 *
 * Verifies that all infrastructure components are accessible and healthy.
 * Uses retry logic to handle transient connection issues.
 *
 * Checks:
 * - PostgreSQL connectivity
 * - Redis connectivity
 * - Medusa Admin API
 * - Medusa Store API
 *
 * Usage:
 *   pnpm run health:check
 *   pnpm run health:check --wait  # Wait for services to become ready
 *
 * Exit codes:
 *   0 - All checks passed
 *   1 - One or more checks failed
 */

import { retryFetch, waitForService } from './utils/retry.js';

interface HealthCheck {
  name: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  message: string;
  duration: number;
}

const checks: HealthCheck[] = [];

/**
 * Check PostgreSQL connection
 */
async function checkPostgres(): Promise<HealthCheck> {
  const start = Date.now();

  if (!process.env.DATABASE_URL) {
    return {
      name: 'PostgreSQL',
      status: 'unhealthy',
      message: 'DATABASE_URL not configured',
      duration: Date.now() - start,
    };
  }

  try {
    const { Client } = await import('pg');
    const client = new Client({ connectionString: process.env.DATABASE_URL });

    await client.connect();
    const result = await client.query('SELECT version()');
    await client.end();

    const version = result.rows[0].version.split(' ')[1];

    return {
      name: 'PostgreSQL',
      status: 'healthy',
      message: `Connected (v${version})`,
      duration: Date.now() - start,
    };
  } catch (error) {
    return {
      name: 'PostgreSQL',
      status: 'unhealthy',
      message: error instanceof Error ? error.message : 'Connection failed',
      duration: Date.now() - start,
    };
  }
}

/**
 * Check Redis connection
 */
async function checkRedis(): Promise<HealthCheck> {
  const start = Date.now();

  if (!process.env.REDIS_URL) {
    return {
      name: 'Redis',
      status: 'degraded',
      message: 'REDIS_URL not configured (optional)',
      duration: Date.now() - start,
    };
  }

  try {
    const { createClient } = await import('redis');
    const client = createClient({ url: process.env.REDIS_URL });

    await client.connect();
    const pong = await client.ping();
    const info = await client.info('server');
    await client.quit();

    // Extract Redis version from info
    const versionMatch = info.match(/redis_version:([^\r\n]+)/);
    const version = versionMatch ? versionMatch[1] : 'unknown';

    return {
      name: 'Redis',
      status: 'healthy',
      message: `Connected (v${version})`,
      duration: Date.now() - start,
    };
  } catch (error) {
    return {
      name: 'Redis',
      status: 'unhealthy',
      message: error instanceof Error ? error.message : 'Connection failed',
      duration: Date.now() - start,
    };
  }
}

/**
 * Check Medusa Admin API
 */
async function checkAdminAPI(): Promise<HealthCheck> {
  const start = Date.now();
  const baseUrl = process.env.MEDUSA_ADMIN_URL || process.env.MEDUSA_BACKEND_URL || 'http://localhost:9000';
  const healthUrl = `${baseUrl}/health`;

  try {
    const response = await retryFetch(healthUrl, {}, {
      maxAttempts: 3,
      initialDelay: 500,
      onRetry: (attempt, error, delay) => {
        console.log(`  Retry ${attempt}: ${error.message} (waiting ${delay}ms)`);
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return {
      name: 'Admin API',
      status: 'healthy',
      message: `Accessible at ${baseUrl}`,
      duration: Date.now() - start,
    };
  } catch (error) {
    return {
      name: 'Admin API',
      status: 'unhealthy',
      message: error instanceof Error ? error.message : 'Not accessible',
      duration: Date.now() - start,
    };
  }
}

/**
 * Check Medusa Store API
 */
async function checkStoreAPI(): Promise<HealthCheck> {
  const start = Date.now();
  const baseUrl = process.env.MEDUSA_BACKEND_URL || 'http://localhost:9000';
  const storeUrl = `${baseUrl}/store/products`;

  try {
    const response = await retryFetch(storeUrl, {
      headers: process.env.MEDUSA_PUBLISHABLE_KEY
        ? { 'x-publishable-api-key': process.env.MEDUSA_PUBLISHABLE_KEY }
        : {},
    }, {
      maxAttempts: 3,
      initialDelay: 500,
      onRetry: (attempt, error, delay) => {
        console.log(`  Retry ${attempt}: ${error.message} (waiting ${delay}ms)`);
      },
    });

    if (response.status === 401) {
      return {
        name: 'Store API',
        status: 'degraded',
        message: 'Accessible but requires publishable key',
        duration: Date.now() - start,
      };
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const productCount = data.products?.length ?? 0;

    return {
      name: 'Store API',
      status: 'healthy',
      message: `Accessible (${productCount} products)`,
      duration: Date.now() - start,
    };
  } catch (error) {
    return {
      name: 'Store API',
      status: 'unhealthy',
      message: error instanceof Error ? error.message : 'Not accessible',
      duration: Date.now() - start,
    };
  }
}

/**
 * Display health check results
 */
function displayResults(checks: HealthCheck[]): void {
  console.log('\n🏥 Medusa Health Check Results\n');
  console.log('='.repeat(70));

  for (const check of checks) {
    const icon =
      check.status === 'healthy' ? '✓' :
      check.status === 'degraded' ? '⚠' : '✗';
    const color =
      check.status === 'healthy' ? '\x1b[32m' :
      check.status === 'degraded' ? '\x1b[33m' : '\x1b[31m';
    const reset = '\x1b[0m';

    console.log(`${color}${icon}${reset} ${check.name.padEnd(20)} ${check.message} (${check.duration}ms)`);
  }

  console.log('='.repeat(70));

  const healthy = checks.filter(c => c.status === 'healthy').length;
  const degraded = checks.filter(c => c.status === 'degraded').length;
  const unhealthy = checks.filter(c => c.status === 'unhealthy').length;

  console.log(`\nSummary: ${healthy} healthy, ${degraded} degraded, ${unhealthy} unhealthy\n`);

  if (unhealthy > 0) {
    console.log('❌ Health check failed. Please address the issues above.\n');
    process.exit(1);
  } else if (degraded > 0) {
    console.log('⚠️  Health check passed with warnings.\n');
    process.exit(0);
  } else {
    console.log('✅ All services are healthy.\n');
    process.exit(0);
  }
}

/**
 * Wait for all services to become ready
 */
async function waitForServices(): Promise<void> {
  console.log('⏳ Waiting for services to become ready...\n');

  const baseUrl = process.env.MEDUSA_BACKEND_URL || 'http://localhost:9000';

  try {
    await waitForService(
      async () => {
        try {
          const response = await fetch(`${baseUrl}/health`, {
            signal: AbortSignal.timeout(5000),
          });
          return response.ok;
        } catch {
          return false;
        }
      },
      {
        maxAttempts: 30,
        initialDelay: 2000,
        onRetry: (attempt, error, delay) => {
          console.log(`  Attempt ${attempt}: Service not ready, retrying in ${Math.round(delay / 1000)}s...`);
        },
      }
    );

    console.log('✓ Services are ready!\n');
  } catch (error) {
    console.error('✗ Services did not become ready in time\n');
    process.exit(1);
  }
}

/**
 * Main execution
 */
async function main() {
  // Load .env file
  try {
    const dotenv = await import('dotenv');
    dotenv.config();
  } catch {
    // dotenv not available
  }

  const args = process.argv.slice(2);
  const shouldWait = args.includes('--wait');

  if (shouldWait) {
    await waitForServices();
  }

  console.log('Running health checks...');

  // Run all checks in parallel
  const [postgres, redis, admin, store] = await Promise.all([
    checkPostgres(),
    checkRedis(),
    checkAdminAPI(),
    checkStoreAPI(),
  ]);

  checks.push(postgres, redis, admin, store);

  displayResults(checks);
}

main().catch((error) => {
  console.error('\n❌ Health check error:', error);
  process.exit(1);
});
