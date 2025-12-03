'use client';

import { useState, useEffect, useCallback } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import type { Stripe, StripeElementsOptions } from '@stripe/stripe-js';
import { useCart } from '@/hooks/useCart';
import { Loader2 } from 'lucide-react';
import CheckoutForm from './CheckoutForm';
import { createMedusaPaymentSession, updateCart, getShippingOptions, addShippingMethod, type MedusaAddress } from '@/lib/api/medusa';

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
      let cartId = getCartId();
      console.log('[checkout] Current cart ID:', cartId);

      if (!cartId) {
        console.log('[checkout] No cart ID found, initializing cart...');
        await initializeCart();
        cartId = getCartId();
        console.log('[checkout] After initializeCart, cart ID:', cartId);
      }

      if (!cartId) {
        throw new Error('Failed to initialize cart. Please try again.');
      }

      console.log('[checkout] Using Medusa cart:', cartId);

      // IMPORTANT: Add shipping address and method BEFORE creating payment session
      // This ensures the Payment Intent has the correct total including shipping
      console.log('[checkout] Setting up default shipping address...');
      const defaultAddress: MedusaAddress = {
        first_name: 'Customer',
        last_name: '',
        address_1: 'TBD',
        address_2: '',
        city: 'TBD',
        province: 'CA',
        postal_code: '00000',
        country_code: 'us',
        phone: '',
      };

      try {
        await updateCart(cartId, { shipping_address: defaultAddress });
        console.log('[checkout] Default shipping address set');

        // Get and add shipping method
        const shippingOptions = await getShippingOptions(cartId);
        console.log('[checkout] Found', shippingOptions.length, 'shipping options');

        if (shippingOptions.length > 0) {
          await addShippingMethod(cartId, shippingOptions[0].id);
          console.log('[checkout] Default shipping method added:', shippingOptions[0].name);
        }
      } catch (shippingError) {
        console.warn('[checkout] Failed to set default shipping, continuing anyway:', shippingError);
      }

      // Create payment session via Medusa (Stripe provider)
      // NOW the cart has shipping, so the Payment Intent will have the correct total
      console.log('[checkout] Creating Medusa payment session...');
      const session = await createMedusaPaymentSession(cartId);
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

  if (!clientSecret) {
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
        onSuccess={onSuccess}
        onError={onError}
      />
    </Elements>
  );
}
