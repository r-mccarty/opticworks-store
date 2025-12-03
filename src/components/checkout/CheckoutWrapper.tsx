'use client';

import { useState, useEffect, useCallback } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import type { Stripe } from '@stripe/stripe-js';
import { useCart } from '@/hooks/useCart';
import { Loader2 } from 'lucide-react';
import CheckoutForm from './CheckoutForm';
import { createMedusaPaymentSession } from '@/lib/api/medusa';
import type { StripeCheckoutInstance, StripeWithCheckout } from '@/types/stripe-checkout';

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise: Promise<Stripe | null> = publishableKey ? loadStripe(publishableKey) : Promise.resolve(null);

interface CheckoutWrapperProps {
  onSuccess: (sessionId: string) => void;
  onError: (error: string) => void;
}

export default function CheckoutWrapper({
  onSuccess,
  onError
}: CheckoutWrapperProps) {
  const { items, getCartId, initializeCart } = useCart();
  const [checkout, setCheckout] = useState<StripeCheckoutInstance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Validate environment variables
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
      const envError = 'Stripe publishable key not configured. Please check your environment variables.';
      setError(envError);
      setIsLoading(false);
      onError(envError);
      return;
    }
  }, [onError]);

  const fetchClientSecret = useCallback(async (): Promise<string> => {
    if (items.length === 0) {
      throw new Error('Your cart is empty');
    }

    console.log('[checkout] Creating Medusa payment session for items:', items.map(item => ({ id: item.id, name: item.name, quantity: item.quantity })));

    // Get or initialize Medusa cart
    let cartId = getCartId();
    if (!cartId) {
      console.log('[checkout] No cart ID found, initializing cart...');
      await initializeCart();
      cartId = getCartId();
    }

    if (!cartId) {
      throw new Error('Failed to initialize cart. Please try again.');
    }

    console.log('[checkout] Using Medusa cart:', cartId);

    // Create payment session via Medusa (Stripe provider)
    const session = await createMedusaPaymentSession(cartId);

    if (!session.clientSecret) {
      throw new Error('Payment session did not return a client secret. Please try again.');
    }

    console.log(`[checkout] Received ${session.provider} client secret`);
    return session.clientSecret;
  }, [items, getCartId, initializeCart]);

  useEffect(() => {
    const initializeCheckout = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const stripe = await stripePromise;
        if (!stripe) {
          throw new Error('Failed to load Stripe');
        }

        const stripeWithCheckout = stripe as StripeWithCheckout;
        if (typeof stripeWithCheckout.initCheckout !== 'function') {
          throw new Error(
            'stripe.initCheckout is not available. Ensure Stripe.js is updated with Custom Checkout support.'
          );
        }

        const checkoutInstance = await stripeWithCheckout.initCheckout({
          fetchClientSecret,
          elementsOptions: {
            fonts: [
              {
                family: 'Colfax',
                src: 'url(https://pub-e97850e2b6554798b4b0ec23548c975d.r2.dev/fonts/ColfaxWebRegular-ffe8279204a8eb350c1a8320336a8e1a.woff2)',
                weight: '400',
                style: 'normal',
                display: 'swap',
              },
              {
                family: 'Colfax',
                src: 'url(https://pub-e97850e2b6554798b4b0ec23548c975d.r2.dev/fonts/ColfaxWebMedium-5cd963f45f4bd8647a4e41a58ca9c4d3.woff2)',
                weight: '500',
                style: 'normal',
                display: 'swap',
              }
            ],
            appearance: {
              theme: 'stripe',
              variables: {
                fontFamily: '"Colfax",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,"Noto Sans",sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji"',
              },
            },
          }
        });

        setCheckout(checkoutInstance);
        setIsLoading(false);

      } catch (err) {
        console.error('Checkout initialization error:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to initialize checkout';
        setError(errorMessage);
        setIsLoading(false);
        onError(errorMessage);
      }
    };

    // Only initialize if we have items, environment is configured, and checkout is not already initialized
    if (items.length > 0 && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY && !checkout) {
      void initializeCheckout();
    }
  }, [items, fetchClientSecret, onError, checkout]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin mb-4" />
        <p className="text-lg">Preparing your checkout...</p>
        <p className="text-sm text-gray-500 mt-2">Loading Stripe checkout components...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
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

  if (!checkout) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <p className="text-yellow-800">
          Unable to initialize payment. This usually means there&apos;s a configuration issue.
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

  return (
    <CheckoutForm 
      checkout={checkout}
      onSuccess={onSuccess}
      onError={onError}
    />
  );
}
