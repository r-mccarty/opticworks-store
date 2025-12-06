'use client';

import { useState, useEffect, useCallback } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import type { Stripe, StripeElementsOptions } from '@stripe/stripe-js';
import { useCart } from '@/hooks/useCart';
import { Loader2 } from 'lucide-react';
import CheckoutForm from './CheckoutForm';
import type { ShippingRateResponse } from '@/hooks/useShippingRates';
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

  // Handle shipping rate change - update payment intent with new shipping cost
  const handleShippingChange = useCallback(async (rate: ShippingRateResponse | null, shipmentId: string) => {
    if (!cartId || !rate) return;

    console.log('[checkout] Shipping rate selected:', {
      carrier: rate.carrier,
      service: rate.service,
      rate: rate.rate,
      shipmentId,
    });

    // Call API to update the cart shipping and refresh payment intent
    try {
      const response = await fetch('/api/checkout/update-shipping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartId,
          shippingRate: rate,
          shipmentId,
        }),
      });

      const data = await response.json();

      if (data.success && data.clientSecret) {
        // Update client secret if payment intent was recreated
        setClientSecret(data.clientSecret);
        console.log('[checkout] Payment intent updated with shipping');
      } else if (!data.success) {
        console.warn('[checkout] Failed to update shipping:', data.error);
      }
    } catch (err) {
      console.error('[checkout] Error updating shipping:', err);
      // Don't block checkout - shipping will be added to metadata
    }
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
