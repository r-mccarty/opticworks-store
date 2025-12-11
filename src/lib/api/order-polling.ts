/**
 * Order Polling Utility
 *
 * When cart completion fails but payment succeeded, the order may be created
 * asynchronously via Stripe webhook. This utility polls for the order to appear.
 *
 * @see Phase 3 of Architecture Audit - replaces 2-second blind redirect
 */

import { getCart, type MedusaCart } from './medusa';

export interface PollForOrderOptions {
  /** Maximum number of polling attempts (default: 10) */
  maxAttempts?: number;
  /** Interval between polls in milliseconds (default: 3000) */
  intervalMs?: number;
  /** Callback for progress updates */
  onProgress?: (attempt: number, maxAttempts: number) => void;
}

export interface PollForOrderResult {
  /** Whether an order was found */
  found: boolean;
  /** The order ID if found */
  orderId?: string;
  /** The order display ID if found */
  displayId?: number;
  /** Error message if polling failed */
  error?: string;
}

/**
 * Poll for order creation after payment completion.
 *
 * When completeCart() fails but Stripe payment succeeded, the webhook will
 * create the order asynchronously. This function polls the cart to check
 * if it has been converted to an order (completed_at is set).
 *
 * @param cartId - The cart ID to check
 * @param _paymentIntentId - The Stripe PaymentIntent ID (for logging/future use)
 * @param options - Polling configuration options
 * @returns Promise with the poll result
 */
export async function pollForOrder(
  cartId: string,
  _paymentIntentId: string,
  options: PollForOrderOptions = {}
): Promise<PollForOrderResult> {
  const {
    maxAttempts = 10,
    intervalMs = 3000,
    onProgress,
  } = options;

  console.log('[order-polling] Starting poll for order creation', {
    cartId,
    maxAttempts,
    intervalMs,
  });

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    onProgress?.(attempt, maxAttempts);
    console.log(`[order-polling] Attempt ${attempt}/${maxAttempts}`);

    try {
      // Check if the cart has been completed (converted to order)
      const cart = await getCart(cartId) as MedusaCart & {
        completed_at?: string;
        order_id?: string;
        order?: { id: string; display_id?: number };
      };

      // If cart has completed_at, it was converted to an order
      if (cart.completed_at) {
        const orderId = cart.order_id || cart.order?.id;
        const displayId = cart.order?.display_id;

        console.log('[order-polling] Order found!', { orderId, displayId });

        return {
          found: true,
          orderId,
          displayId,
        };
      }

      // Wait before next attempt
      if (attempt < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, intervalMs));
      }
    } catch (error) {
      console.warn(`[order-polling] Attempt ${attempt} failed:`, error);

      // If cart not found (404), it might have been deleted after order creation
      // This could indicate success - check for order via other means
      if (error instanceof Error && error.message.includes('404')) {
        console.log('[order-polling] Cart not found - may have been converted to order');
        // In this case, we can't confirm the order, but we shouldn't treat it as failure
        // The user should check their email for confirmation
        return {
          found: false,
          error: 'Cart was processed. Please check your email for order confirmation.',
        };
      }

      // Wait before retry
      if (attempt < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, intervalMs));
      }
    }
  }

  // Polling timed out
  console.warn('[order-polling] Polling timed out after', maxAttempts, 'attempts');
  return {
    found: false,
    error: 'Order is still being processed. You will receive an email confirmation shortly.',
  };
}

/**
 * Helper to create a user-friendly message based on polling result
 */
export function getPollingResultMessage(result: PollForOrderResult): string {
  if (result.found) {
    return `Order #${result.displayId || result.orderId} confirmed!`;
  }
  return result.error || 'Your order is being processed. Please check your email for confirmation.';
}
