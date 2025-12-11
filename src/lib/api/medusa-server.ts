/**
 * Server-Only Medusa Client for SSR
 *
 * This module provides server-side cart fetching for SSR.
 * Uses the SSR bypass URL when available to avoid Cloudflare tunnel overhead.
 *
 * @see Phase 4 of Architecture Audit
 */

import { getCartIdFromCookie } from '@/lib/cart/cookies.server';
import type { MedusaCart } from './medusa';

/**
 * Get base URL for server-side Medusa requests
 * Uses SSR bypass URL when available for better performance
 */
function getServerBaseUrl(): string {
  // Use SSR bypass URL if available (direct connection, bypasses Cloudflare tunnel)
  return process.env.MEDUSA_SSR_BASE_URL || process.env.NEXT_PUBLIC_MEDUSA_BASE_URL || '';
}

/**
 * Get publishable API key for Medusa requests
 */
function getPublishableKey(): string {
  return process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || '';
}

/**
 * Fetch cart for SSR (server-side only)
 *
 * @returns Cart data or null if no cart/error
 */
export async function getCartSSR(): Promise<MedusaCart | null> {
  const cartId = await getCartIdFromCookie();
  if (!cartId) {
    console.log('[medusa-server] No cart ID in cookie');
    return null;
  }

  const baseUrl = getServerBaseUrl();
  const publishableKey = getPublishableKey();

  if (!baseUrl || !publishableKey) {
    console.warn('[medusa-server] Missing configuration', { baseUrl: !!baseUrl, publishableKey: !!publishableKey });
    return null;
  }

  try {
    console.log('[medusa-server] Fetching cart for SSR:', cartId);

    const response = await fetch(`${baseUrl}/store/carts/${cartId}`, {
      headers: {
        'x-publishable-api-key': publishableKey,
        'Content-Type': 'application/json',
      },
      // Don't cache cart data - always fetch fresh
      cache: 'no-store',
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.log('[medusa-server] Cart not found:', cartId);
        return null;
      }
      console.error('[medusa-server] Failed to fetch cart:', response.status, response.statusText);
      return null;
    }

    const data = await response.json();
    console.log('[medusa-server] Cart fetched successfully, items:', data.cart?.items?.length ?? 0);

    return data.cart as MedusaCart;
  } catch (error) {
    console.error('[medusa-server] Error fetching cart:', error);
    return null;
  }
}

/**
 * Check if a cart exists and is valid (not completed) for SSR
 *
 * @returns True if cart exists and is valid
 */
export async function isValidCartSSR(): Promise<boolean> {
  const cart = await getCartSSR();
  if (!cart) return false;

  // Check if cart has been completed (converted to order)
  const completedAt = (cart as MedusaCart & { completed_at?: string }).completed_at;
  return !completedAt;
}
