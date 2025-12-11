/**
 * Client-Side Cart Cookie Management
 *
 * This file contains client-safe functions that use document.cookie directly.
 * Can be imported in both client and server components (but server should use cookies.server.ts).
 *
 * @see Phase 4 of Architecture Audit
 */

const CART_ID_COOKIE = 'medusa_cart_id';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

/**
 * Get cart ID from cookie on the client side
 * Uses document.cookie directly
 * @returns Cart ID or null if not set
 */
export function getCartIdFromCookieClient(): string | null {
  if (typeof document === 'undefined') return null;

  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === CART_ID_COOKIE) {
      return value || null;
    }
  }
  return null;
}

/**
 * Set cart ID cookie on the client side
 * Uses document.cookie directly
 * @param cartId - The Medusa cart ID to store
 */
export function setCartIdCookieClient(cartId: string): void {
  if (typeof document === 'undefined') return;

  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  document.cookie = `${CART_ID_COOKIE}=${cartId}; Path=/; Max-Age=${COOKIE_MAX_AGE}; SameSite=Lax${secure}`;
}

/**
 * Clear cart ID cookie on the client side
 */
export function clearCartIdCookieClient(): void {
  if (typeof document === 'undefined') return;

  document.cookie = `${CART_ID_COOKIE}=; Path=/; Max-Age=0`;
}
