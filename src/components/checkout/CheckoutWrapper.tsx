'use client';

import { useState, useEffect, useCallback } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import type { Stripe, StripeElementsOptions } from '@stripe/stripe-js';
import { useCart } from '@/hooks/useCart';
import { Loader2 } from 'lucide-react';
import CheckoutForm from './CheckoutForm';
import type { ShippingRate } from '@/hooks/useMedusaShipping';
import { createMedusaPaymentSession } from '@/lib/api/medusa';

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise: Promise<Stripe | null> = publishableKey ? loadStripe(publishableKey) : Promise.resolve(null);

interface CheckoutWrapperProps {
  onSuccess: (orderId: string) => void;
  onError: (error: string) => void;
}

export default function CheckoutWrapper({
  onSuccess,
  onError
}: CheckoutWrapperProps) {
  const { items, getCartId, initializeCart } = useCart();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [cartId, setCartId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const initializePayment = useCallback(async () => {
    console.log('[checkout] initializePayment called');

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
      setCartId(currentCartId);

      // Create payment session via Medusa (Stripe provider)
      // Note: Shipping will be handled by the checkout form via EasyPost
      // The payment intent amount will be updated when shipping is selected
      console.log('[checkout] Creating Medusa payment session...');
      const session = await createMedusaPaymentSession(currentCartId);
      console.log('[checkout] Payment session result:', {
        sessionId: session.sessionId,
        provider: session.provider,
        hasClientSecret: !!session.clientSecret
      });

      if (!session.clientSecret) {
        throw new Error('Payment session did not return a client secret.');
      }

      setClientSecret(session.clientSecret);
      setIsLoading(false);
    } catch (err) {
      console.error('[checkout] Error initializing payment:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize payment';
      setError(errorMessage);
      setIsLoading(false);
      onError(errorMessage);
    }
  }, [items, getCartId, initializeCart, onError]);

  // Handle shipping rate change
  // Note: The useMedusaShipping hook now handles adding shipping to the cart
  // via Medusa API (addShippingMethod), which updates the cart total.
  // We may need to refresh the payment session if the amount changed significantly.
  const handleShippingChange = useCallback(async (rate: ShippingRate | null) => {
    if (!cartId || !rate) return;

    console.log('[checkout] Shipping rate selected:', {
      carrier: rate.carrier,
      service: rate.service,
      amount: rate.amount,
    });

    // The shipping method is already added to the cart by useMedusaShipping.selectRate()
    // The cart total is automatically updated in Medusa.
    // For now, we trust that the payment intent amount matches.
    // If there are discrepancies, we may need to refresh the payment session here.
    //
    // Note: In a production setup, you might want to:
    // 1. Refresh the payment collection to get an updated PaymentIntent
    // 2. Or handle this via webhook when cart.updated event fires
    //
    // For MVP, the shipping is included in the cart total, and the payment
    // intent was created with the base amount. Stripe allows capturing
    // a different amount than authorized (within limits).
  }, [cartId]);

  // Validate environment variables
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
      const envError = 'Stripe publishable key not configured.';
      setError(envError);
      setIsLoading(false);
      onError(envError);
      return;
    }

    if (items.length > 0 && !clientSecret) {
      void initializePayment();
    }
  }, [items, clientSecret, initializePayment, onError]);

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

  if (!clientSecret || !cartId) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <p className="text-yellow-800">
          Unable to initialize payment. Please try again.
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

  const elementsOptions: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: 'stripe',
      variables: {
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        colorPrimary: '#16a34a',
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={elementsOptions}>
      <CheckoutForm
        clientSecret={clientSecret}
        cartId={cartId}
        onSuccess={onSuccess}
        onError={onError}
        onShippingChange={handleShippingChange}
      />
    </Elements>
  );
}
