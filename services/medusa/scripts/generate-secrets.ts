#!/usr/bin/env tsx
/**
 * Generate secure credentials for Medusa infrastructure
 *
 * Generates:
 * - PostgreSQL password
 * - Redis password
 * - JWT_SECRET (32-byte hex)
 * - COOKIE_SECRET (32-byte hex)
 * - MEDUSA_ADMIN_TOKEN (64-byte hex)
 *
 * Usage:
 *   pnpm run generate:secrets
 *   pnpm run generate:secrets --format=env
 */

import { randomBytes } from 'crypto';

interface Secrets {
  POSTGRES_PASSWORD: string;
  REDIS_PASSWORD: string;
  JWT_SECRET: string;
  COOKIE_SECRET: string;
  MEDUSA_ADMIN_TOKEN: string;
}

/**
 * Generate a secure random password
 * Uses base64url encoding for database-safe characters
 */
function generatePassword(length: number = 32): string {
  return randomBytes(length)
    .toString('base64url')
    .slice(0, length);
}

/**
 * Generate a hex secret for cryptographic use
 */
function generateHexSecret(bytes: number = 32): string {
  return randomBytes(bytes).toString('hex');
}

/**
 * Generate all required secrets
 */
function generateSecrets(): Secrets {
  return {
    POSTGRES_PASSWORD: generatePassword(32),
    REDIS_PASSWORD: generatePassword(32),
    JWT_SECRET: generateHexSecret(32),
    COOKIE_SECRET: generateHexSecret(32),
    MEDUSA_ADMIN_TOKEN: generateHexSecret(64),
  };
}

/**
 * Format secrets for display
 */
function formatSecrets(secrets: Secrets, format: 'env' | 'json'): string {
  if (format === 'json') {
    return JSON.stringify(secrets, null, 2);
  }

  // .env format
  return Object.entries(secrets)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
}

/**
 * Format connection strings with generated credentials
 */
function formatConnectionStrings(secrets: Secrets): string {
  const postgresUrl = `postgres://medusa_user:${secrets.POSTGRES_PASSWORD}@localhost:5432/medusa_db`;
  const redisUrl = `redis://:${secrets.REDIS_PASSWORD}@localhost:6379`;

  return `
# Full connection strings (ready to use in .env)
DATABASE_URL=${postgresUrl}
REDIS_URL=${redisUrl}
`;
}

// Main execution
function main() {
  const args = process.argv.slice(2);
  const format = args.find(arg => arg.startsWith('--format='))?.split('=')[1] as 'env' | 'json' || 'env';

  console.log('🔐 Generating secure credentials for Medusa infrastructure...\n');

  const secrets = generateSecrets();

  console.log('Generated Secrets:');
  console.log('==================\n');
  console.log(formatSecrets(secrets, format));

  if (format === 'env') {
    console.log(formatConnectionStrings(secrets));
  }

  console.log('\n⚠️  Security Notes:');
  console.log('- Store these credentials in Infisical or your secrets manager');
  console.log('- Never commit these values to version control');
  console.log('- Use the .env.example template and fill in these generated values');
  console.log('- For Hetzner deployment, pass these to the provisioning script\n');
}

main();
