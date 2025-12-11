/**
 * Server-Only Cart Cookie Management
 *
 * This file contains server-only functions that use next/headers.
 * Only import this file in Server Components!
 *
 * @see Phase 4 of Architecture Audit
 */

import { cookies } from 'next/headers';

const CART_ID_COOKIE = 'medusa_cart_id';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

/**
 * Get cart ID from cookie (server-side only)
 * @returns Cart ID or null if not set
 */
export async function getCartIdFromCookie(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    return cookieStore.get(CART_ID_COOKIE)?.value ?? null;
  } catch {
    // cookies() throws in non-request contexts (e.g., during build)
    return null;
  }
}

/**
 * Set cart ID cookie (server-side only)
 * @param cartId - The Medusa cart ID to store
 */
export async function setCartIdCookie(cartId: string): Promise<void> {
  try {
    const cookieStore = await cookies();
    cookieStore.set(CART_ID_COOKIE, cartId, {
      httpOnly: false, // Client needs to read for Zustand sync
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: COOKIE_MAX_AGE,
      path: '/',
    });
  } catch (error) {
    console.warn('[cart-cookies] Failed to set cart ID cookie:', error);
  }
}

/**
 * Clear cart ID cookie (server-side only)
 */
export async function clearCartIdCookie(): Promise<void> {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(CART_ID_COOKIE);
  } catch (error) {
    console.warn('[cart-cookies] Failed to clear cart ID cookie:', error);
  }
}
