/**
 * QStash client for background job processing and webhook signature verification
 *
 * QStash is used for:
 * - Background cache warming for shipping rates
 * - Retry logic for failed API calls
 * - Rate limiting external API requests
 *
 * Environment variables required:
 * - QSTASH_URL: QStash API URL (https://qstash.upstash.io)
 * - QSTASH_TOKEN: QStash authentication token
 * - QSTASH_CURRENT_SIGNING_KEY: Current webhook signature key
 * - QSTASH_NEXT_SIGNING_KEY: Next rotation signing key
 */

import { Client, Receiver } from '@upstash/qstash';

// Lazy initialization to avoid errors when env vars aren't set at import time
let qstashClient: Client | null = null;
let qstashReceiver: Receiver | null = null;

/**
 * Get the QStash client instance (lazy initialization)
 */
export function getQStashClient(): Client {
  if (!qstashClient) {
    const token = process.env.QSTASH_TOKEN;
    if (!token) {
      throw new Error('QSTASH_TOKEN environment variable is not set');
    }
    qstashClient = new Client({ token });
  }
  return qstashClient;
}

/**
 * Get the QStash receiver for verifying webhook signatures
 */
export function getQStashReceiver(): Receiver {
  if (!qstashReceiver) {
    const currentSigningKey = process.env.QSTASH_CURRENT_SIGNING_KEY;
    const nextSigningKey = process.env.QSTASH_NEXT_SIGNING_KEY;

    if (!currentSigningKey || !nextSigningKey) {
      throw new Error('QSTASH_CURRENT_SIGNING_KEY and QSTASH_NEXT_SIGNING_KEY must be set');
    }

    qstashReceiver = new Receiver({
      currentSigningKey,
      nextSigningKey,
    });
  }
  return qstashReceiver;
}

/**
 * Verify a QStash webhook signature
 *
 * @param signature - The Upstash-Signature header value
 * @param body - The raw request body as string
 * @returns true if signature is valid
 * @throws Error if signature is invalid
 */
export async function verifyQStashSignature(
  signature: string,
  body: string
): Promise<boolean> {
  const receiver = getQStashReceiver();
  return receiver.verify({
    signature,
    body,
  });
}

/**
 * Check if QStash is configured
 */
export function isQStashConfigured(): boolean {
  return !!(
    process.env.QSTASH_TOKEN &&
    process.env.QSTASH_CURRENT_SIGNING_KEY &&
    process.env.QSTASH_NEXT_SIGNING_KEY
  );
}

/**
 * Rate limit configuration for external APIs
 */
export const RATE_LIMITS = {
  easypost: {
    requestsPerSecond: 2,
    burstLimit: 5,
  },
} as const;
