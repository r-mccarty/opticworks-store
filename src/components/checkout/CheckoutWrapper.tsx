'use client';

import { useState, useEffect, useCallback } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import PaymentForm from './PaymentForm';
import { useCart } from '@/hooks/useCart';
import { Loader2 } from 'lucide-react';
import type { CheckoutSessionResponse } from '@/types/checkout';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface CheckoutWrapperProps {
  customerAddress: {
    name: string;
    email: string;
    line1: string;
    line2: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  onSuccess: (sessionId: string) => void;
  onError: (error: string) => void;
}

export default function CheckoutWrapper({
  customerAddress,
  onSuccess,
  onError
}: CheckoutWrapperProps) {
  const { items } = useCart();
  const [clientSecret, setClientSecret] = useState<string>('');
  const [totals, setTotals] = useState({
    subtotal: 0,
    shipping: 0,
    tax: 0,
    total: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const createCheckoutSession = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Convert cart items to checkout session format
      const paymentItems = items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      }));

      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: paymentItems,
          customerInfo: {
            name: customerAddress.name,
            email: customerAddress.email
          },
          shippingAddress: {
            line1: customerAddress.line1,
            line2: customerAddress.line2,
            city: customerAddress.city,
            state: customerAddress.state,
            postal_code: customerAddress.postal_code,
            country: customerAddress.country
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const data: CheckoutSessionResponse = await response.json();
      setClientSecret(data.clientSecret);
      setTotals(data.totals);
      setIsLoading(false);
      setRetryCount(0); // Reset retry count on success

    } catch (err) {
      console.error('Checkout session creation error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize checkout';
      
      // Add retry logic for network errors
      if (retryCount < 2 && (err instanceof TypeError || (err as Error & { code?: string })?.code === 'NETWORK_ERROR')) {
        console.log(`Retrying checkout session creation (attempt ${retryCount + 1}/3)`);
        setRetryCount(prev => prev + 1);
        setTimeout(() => {
          createCheckoutSession();
        }, 1000 * (retryCount + 1)); // Exponential backoff
      } else {
        setError(errorMessage);
        setIsLoading(false);
        onError(errorMessage);
      }
    }
  }, [items, customerAddress, onError, retryCount]);

  useEffect(() => {
    if (items.length === 0) {
      setError('Your cart is empty');
      setIsLoading(false);
      return;
    }

    createCheckoutSession();
  }, [items, createCheckoutSession]);

  const handlePaymentSuccess = (sessionId: string) => {
    // Clear any existing errors
    setError(null);
    onSuccess(sessionId);
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment error in CheckoutWrapper:', error);
    setError(error);
    onError(error);
    
    // If it's a session expired error, try to recreate the session
    if (error.includes('expired') || error.includes('invalid')) {
      setTimeout(() => {
        console.log('Attempting to recreate checkout session due to expiration');
        createCheckoutSession();
      }, 1000);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin mb-4" />
        <p className="text-lg">
          {retryCount > 0 ? `Retrying... (${retryCount}/2)` : 'Preparing your checkout...'}
        </p>
        {retryCount > 0 && (
          <p className="text-sm text-gray-600 mt-2">
            Connection issues detected, please wait...
          </p>
        )}
      </div>
    );
  }

  if (error) {
    const isNetworkError = error.includes('fetch') || error.includes('network') || error.includes('connection');
    const isServerError = error.includes('500') || error.includes('Internal Server Error');
    
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <h3 className="text-lg font-semibold text-red-800 mb-2">
          {isNetworkError ? 'Connection Error' : isServerError ? 'Server Error' : 'Payment Error'}
        </h3>
        <p className="text-red-700 mb-4">{error}</p>
        {(isNetworkError || isServerError) && (
          <p className="text-sm text-red-600 mb-4">
            {isNetworkError 
              ? 'Please check your internet connection and try again.' 
              : 'Our servers are experiencing issues. Please try again in a moment.'
            }
          </p>
        )}
        <button
          onClick={() => {
            setError(null);
            setRetryCount(0);
            createCheckoutSession();
          }}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
          disabled={isLoading}
        >
          {isLoading ? 'Retrying...' : 'Try Again'}
        </button>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <p className="text-yellow-800">Unable to initialize payment. Please try again.</p>
      </div>
    );
  }

  const appearance = {
    theme: 'stripe' as const,
    variables: {
      colorPrimary: '#3b82f6',
      colorBackground: '#ffffff',
      colorText: '#1f2937',
      colorDanger: '#ef4444',
      fontFamily: 'Colfax, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      spacingUnit: '4px',
      borderRadius: '8px',
    },
  };

  const options = {
    clientSecret,
    appearance,
    fonts: [
      {
        family: 'Colfax',
        src: 'url(https://pub-e97850e2b6554798b4b0ec23548c975d.r2.dev/fonts/ColfaxWebRegular-ffe8279204a8eb350c1a8320336a8e1a.woff2)',
        display: 'swap'
      },
      {
        family: 'Colfax',
        src: 'url(https://pub-e97850e2b6554798b4b0ec23548c975d.r2.dev/fonts/ColfaxWebMedium-5cd963f45f4bd8647a4e41a58ca9c4d3.woff2)',
        display: 'swap'
      }
    ]
  };

  return (
    <Elements options={options} stripe={stripePromise}>
      <PaymentForm
        clientSecret={clientSecret}
        onSuccess={handlePaymentSuccess}
        onError={handlePaymentError}
        customerInfo={{
          name: customerAddress.name,
          email: customerAddress.email
        }}
        shippingAddress={{
          line1: customerAddress.line1,
          line2: customerAddress.line2,
          city: customerAddress.city,
          state: customerAddress.state,
          postal_code: customerAddress.postal_code,
          country: customerAddress.country
        }}
        totals={totals}
      />
    </Elements>
  );
}