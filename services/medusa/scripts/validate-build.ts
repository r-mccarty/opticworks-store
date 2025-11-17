#!/usr/bin/env tsx
/**
 * Build Validation Script for Medusa
 *
 * Validates that all prerequisites are met before starting the Medusa service.
 * Should be run as a prestart hook to catch configuration issues early.
 *
 * Checks:
 * - Admin dashboard is built
 * - Required environment variables are set
 * - Database connection is available
 * - Redis connection is available
 *
 * Usage:
 *   pnpm run validate:build
 *   pnpm run prestart  # Automatically runs this script
 */

import { existsSync } from 'fs';
import { join } from 'path';

interface ValidationResult {
  name: string;
  passed: boolean;
  message: string;
  critical: boolean;
}

const results: ValidationResult[] = [];

/**
 * Check if admin dashboard is built
 */
function checkAdminBuild(): ValidationResult {
  const adminIndexPath = join(__dirname, '..', '.medusa', 'client', 'index.html');
  const exists = existsSync(adminIndexPath);

  return {
    name: 'Admin Dashboard Build',
    passed: exists,
    message: exists
      ? 'Admin dashboard is built'
      : 'Admin dashboard not built. Run: pnpm run build',
    critical: true,
  };
}

/**
 * Check required environment variables
 */
function checkEnvironmentVariables(): ValidationResult {
  const required = [
    'DATABASE_URL',
    'JWT_SECRET',
    'COOKIE_SECRET',
  ];

  const recommended = [
    'REDIS_URL',
    'MEDUSA_ADMIN_TOKEN',
    'STRIPE_API_KEY',
  ];

  const missing = required.filter(key => !process.env[key]);
  const missingRecommended = recommended.filter(key => !process.env[key]);

  if (missing.length > 0) {
    return {
      name: 'Environment Variables',
      passed: false,
      message: `Missing required variables: ${missing.join(', ')}`,
      critical: true,
    };
  }

  if (missingRecommended.length > 0) {
    return {
      name: 'Environment Variables',
      passed: true,
      message: `⚠️  Missing recommended variables: ${missingRecommended.join(', ')}`,
      critical: false,
    };
  }

  return {
    name: 'Environment Variables',
    passed: true,
    message: 'All required environment variables are set',
    critical: false,
  };
}

/**
 * Check database connection
 */
async function checkDatabaseConnection(): Promise<ValidationResult> {
  if (!process.env.DATABASE_URL) {
    return {
      name: 'Database Connection',
      passed: false,
      message: 'DATABASE_URL not set',
      critical: true,
    };
  }

  try {
    // Try to connect using pg
    const { Client } = await import('pg');
    const client = new Client({ connectionString: process.env.DATABASE_URL });

    await client.connect();
    await client.query('SELECT 1');
    await client.end();

    return {
      name: 'Database Connection',
      passed: true,
      message: 'Database connection successful',
      critical: true,
    };
  } catch (error) {
    return {
      name: 'Database Connection',
      passed: false,
      message: `Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      critical: true,
    };
  }
}

/**
 * Check Redis connection
 */
async function checkRedisConnection(): Promise<ValidationResult> {
  if (!process.env.REDIS_URL) {
    return {
      name: 'Redis Connection',
      passed: true,
      message: '⚠️  REDIS_URL not set (optional)',
      critical: false,
    };
  }

  try {
    const { createClient } = await import('redis');
    const client = createClient({ url: process.env.REDIS_URL });

    await client.connect();
    await client.ping();
    await client.quit();

    return {
      name: 'Redis Connection',
      passed: true,
      message: 'Redis connection successful',
      critical: false,
    };
  } catch (error) {
    return {
      name: 'Redis Connection',
      passed: false,
      message: `Redis connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      critical: false,
    };
  }
}

/**
 * Display validation results
 */
function displayResults(results: ValidationResult[]): void {
  console.log('\n🔍 Medusa Build Validation\n');
  console.log('='.repeat(60));

  let hasErrors = false;
  let hasWarnings = false;

  for (const result of results) {
    const icon = result.passed ? '✓' : (result.critical ? '✗' : '⚠');
    const color = result.passed ? '\x1b[32m' : (result.critical ? '\x1b[31m' : '\x1b[33m');
    const reset = '\x1b[0m';

    console.log(`${color}${icon}${reset} ${result.name}`);
    console.log(`  ${result.message}\n`);

    if (!result.passed && result.critical) {
      hasErrors = true;
    } else if (!result.passed && !result.critical) {
      hasWarnings = true;
    }
  }

  console.log('='.repeat(60));

  if (hasErrors) {
    console.log('\n❌ Validation failed. Please fix the errors above before starting.\n');
    process.exit(1);
  } else if (hasWarnings) {
    console.log('\n⚠️  Validation passed with warnings. Consider addressing the warnings.\n');
    process.exit(0);
  } else {
    console.log('\n✅ All validations passed. Service is ready to start.\n');
    process.exit(0);
  }
}

/**
 * Main execution
 */
async function main() {
  // Load .env file if exists
  try {
    const dotenv = await import('dotenv');
    dotenv.config();
  } catch {
    // dotenv not available, environment variables should be set externally
  }

  console.log('Starting validation checks...');

  // Run synchronous checks
  results.push(checkAdminBuild());
  results.push(checkEnvironmentVariables());

  // Run async checks
  results.push(await checkDatabaseConnection());
  results.push(await checkRedisConnection());

  // Display results
  displayResults(results);
}

main().catch((error) => {
  console.error('\n❌ Validation error:', error);
  process.exit(1);
});
