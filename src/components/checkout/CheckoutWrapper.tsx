'use client';

import { useState, useEffect, useCallback } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { useCart } from '@/hooks/useCart';
import { Loader2 } from 'lucide-react';
import CheckoutForm from './CheckoutForm';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// Using unknown for Stripe types to avoid conflicts with official types
type StripeCheckout = unknown;

interface CheckoutWrapperProps {
  onSuccess: (sessionId: string) => void;
  onError: (error: string) => void;
}

export default function CheckoutWrapper({
  onSuccess,
  onError
}: CheckoutWrapperProps) {
  const { items } = useCart();
  const [checkout, setCheckout] = useState<StripeCheckout | null>(null);
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

  const fetchClientSecret = useCallback(async () => {
    if (items.length === 0) {
      throw new Error('Your cart is empty');
    }

    console.log('Creating checkout session with items:', items.map(item => ({ id: item.id, name: item.name, quantity: item.quantity })));

    // Convert cart items to checkout session format
    const paymentItems = items.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
    }));

    // Create checkout session
    const response = await fetch('/api/stripe/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: paymentItems,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create checkout session');
    }

    const { clientSecret } = await response.json();
    console.log('Received client secret format:', clientSecret?.substring(0, 10) + '...');
    
    return clientSecret;
  }, [items]);

  useEffect(() => {
    const initializeCheckout = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const stripe = await stripePromise;
        if (!stripe) {
          throw new Error('Failed to load Stripe');
        }

        console.log('🔍 About to call stripe.initCheckout...');
        console.log('🔍 Stripe object:', stripe);
        console.log('🔍 Available methods:', Object.keys(stripe));
        
        // Check if initCheckout exists
        if (typeof stripe.initCheckout !== 'function') {
          console.error('❌ stripe.initCheckout is not a function!');
          console.log('🔍 Available stripe methods:', Object.getOwnPropertyNames(stripe));
          throw new Error('stripe.initCheckout is not available. This might indicate a Stripe.js version issue or incorrect API usage.');
        }
        
        // Initialize checkout using the new approach for Elements with Checkout Sessions
        console.log('✅ Calling stripe.initCheckout...');
        const checkoutInstance = await stripe.initCheckout({
          fetchClientSecret: fetchClientSecret
        });
        
        console.log('✅ initCheckout returned:', checkoutInstance);
        console.log('🔍 Checkout instance methods:', Object.keys(checkoutInstance || {}));
        
        // Type assertion for the checkout instance
        const typedCheckout = checkoutInstance as StripeCheckout;

        setCheckout(typedCheckout);
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
      initializeCheckout();
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