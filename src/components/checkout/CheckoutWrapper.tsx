'use client';

import { useState, useEffect, useCallback } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import PaymentForm from './PaymentForm';
import { useCart } from '@/hooks/useCart';
import { Loader2 } from 'lucide-react';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface CheckoutWrapperProps {
  customerInfo: {
    email: string;
    name: string;
  };
  shippingAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
}

export default function CheckoutWrapper({
  customerInfo,
  shippingAddress,
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

  const createPaymentIntent = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Convert cart items to payment intent format
      const paymentItems = items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      }));

      const response = await fetch('/api/stripe/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: paymentItems,
          customerInfo,
          shippingAddress,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create payment intent');
      }

      const data = await response.json();
      setClientSecret(data.clientSecret);
      setTotals(data.totals);
      setIsLoading(false);

    } catch (err) {
      console.error('Payment intent creation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize payment');
      setIsLoading(false);
      onError(err instanceof Error ? err.message : 'Failed to initialize payment');
    }
  }, [items, customerInfo, shippingAddress, onError]);

  useEffect(() => {
    if (items.length === 0) {
      setError('Your cart is empty');
      setIsLoading(false);
      return;
    }

    createPaymentIntent();
  }, [items, customerInfo, shippingAddress, createPaymentIntent]);

  const handlePaymentSuccess = (paymentIntentId: string) => {
    onSuccess(paymentIntentId);
  };

  const handlePaymentError = (error: string) => {
    setError(error);
    onError(error);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin mb-4" />
        <p className="text-lg">Preparing your checkout...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <h3 className="text-lg font-semibold text-red-800 mb-2">Payment Error</h3>
        <p className="text-red-700 mb-4">{error}</p>
        <button
          onClick={createPaymentIntent}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Try Again
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
        customerInfo={customerInfo}
        shippingAddress={shippingAddress}
        totals={totals}
      />
    </Elements>
  );
}