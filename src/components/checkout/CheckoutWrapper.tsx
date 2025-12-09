'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import type { Stripe, StripeElementsOptions } from '@stripe/stripe-js';
import { useCart } from '@/hooks/useCart';
import { Loader2 } from 'lucide-react';
import CheckoutForm from './CheckoutForm';
import type { ShippingRate } from '@/hooks/useMedusaShipping';

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise: Promise<Stripe | null> = publishableKey ? loadStripe(publishableKey) : Promise.resolve(null);

interface CheckoutWrapperProps {
  onSuccess: (orderId: string) => void;
  onError: (error: string) => void;
}

/**
 * CheckoutWrapper - Uses Stripe's Deferred Intent Pattern
 *
 * This component uses `mode: 'payment'` with `amount` and `currency` instead of
 * passing a `clientSecret` upfront. This allows the cart total to change (e.g.,
 * when shipping is selected) without remounting the Elements, which would destroy
 * form state.
 *
 * The PaymentIntent is created at submit time in CheckoutForm when the final
 * amount (including shipping) is known.
 *
 * @see https://docs.stripe.com/payments/accept-a-payment-deferred
 */
export default function CheckoutWrapper({
  onSuccess,
  onError
}: CheckoutWrapperProps) {
  const { items, getCartId, initializeCart, getTotalPrice } = useCart();
  const [cartId, setCartId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Calculate cart subtotal for Elements initialization (in cents)
  // This is the amount shown to users before shipping is selected
  const cartSubtotal = useMemo(() => {
    const total = getTotalPrice();
    // Convert to cents and ensure minimum of 50 cents (Stripe requirement)
    return Math.max(Math.round(total * 100), 50);
  }, [getTotalPrice]);

  const initializeCheckout = useCallback(async () => {
    console.log('[checkout] initializeCheckout called (deferred intent pattern)');

    if (items.length === 0) {
      setError('Your cart is empty');
      setIsLoading(false);
      return;
    }

    try {
      // Get or initialize Medusa cart
      let currentCartId = getCartId();
      console.log('[checkout] Current cart ID:', currentCartId);

      if (!currentCartId) {
        console.log('[checkout] No cart ID found, initializing cart...');
        await initializeCart();
        currentCartId = getCartId();
        console.log('[checkout] After initializeCart, cart ID:', currentCartId);
      }

      if (!currentCartId) {
        throw new Error('Failed to initialize cart. Please try again.');
      }

      console.log('[checkout] Using Medusa cart:', currentCartId);
      console.log('[checkout] Initial amount (cents):', cartSubtotal);
      setCartId(currentCartId);

      // With deferred intent pattern, we don't create PaymentIntent here
      // It will be created at submit time when the final amount is known
      setIsLoading(false);
    } catch (err) {
      console.error('[checkout] Error initializing checkout:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize checkout';
      setError(errorMessage);
      setIsLoading(false);
      onError(errorMessage);
    }
  }, [items, getCartId, initializeCart, onError, cartSubtotal]);

  // Handle shipping rate change - just log for debugging
  // The actual amount update happens in CheckoutForm via elements.update()
  const handleShippingChange = useCallback(async (rate: ShippingRate | null) => {
    if (!rate) return;

    console.log('[checkout] Shipping rate selected:', {
      carrier: rate.carrier,
      service: rate.service,
      amount: rate.amount,
    });

    // With deferred intent pattern, we don't need to refresh the payment session here.
    // The amount is updated via elements.update() in CheckoutForm, and the actual
    // PaymentIntent is created at submit time with the final amount.
  }, []);

  // Validate environment variables and initialize checkout
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
      const envError = 'Stripe publishable key not configured.';
      setError(envError);
      setIsLoading(false);
      onError(envError);
      return;
    }

    if (items.length > 0 && !cartId) {
      void initializeCheckout();
    }
  }, [items, cartId, initializeCheckout, onError]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12" data-testid="checkout-loading">
        <Loader2 className="h-8 w-8 animate-spin mb-4" />
        <p className="text-lg">Preparing your checkout...</p>
        <p className="text-sm text-gray-500 mt-2">Creating secure payment session...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center" data-testid="checkout-error">
        <h3 className="text-lg font-semibold text-red-800 mb-2">Checkout Error</h3>
        <p className="text-red-700 mb-4">{error}</p>
        <div className="space-x-2">
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
          <button
            onClick={() => window.history.back()}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!cartId) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <p className="text-yellow-800">
          Unable to initialize checkout. Please try again.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  // Deferred Intent Pattern: Use mode/amount/currency instead of clientSecret
  // This allows amount changes (shipping) without remounting Elements
  // PaymentIntent is created at submit time in CheckoutForm
  const elementsOptions: StripeElementsOptions = {
    mode: 'payment',
    amount: cartSubtotal,
    currency: 'usd',
    appearance: {
      theme: 'stripe',
      variables: {
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        colorPrimary: '#16a34a',
      },
    },
  };

  return (
    // NO key prop - amount changes via elements.update() don't remount
    <Elements stripe={stripePromise} options={elementsOptions}>
      <CheckoutForm
        cartId={cartId}
        initialAmount={cartSubtotal}
        onSuccess={onSuccess}
        onError={onError}
        onShippingChange={handleShippingChange}
      />
    </Elements>
  );
}
