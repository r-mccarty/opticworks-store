'use client';

import { useState, useEffect, useCallback } from 'react';
import PaymentForm from './PaymentForm';
import { useCart } from '@/hooks/useCart';
import { Loader2 } from 'lucide-react';
import { useElements, useStripe } from '@stripe/react-stripe-js';

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
  onSuccess: (paymentIntentId: string) => void;
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
  const stripe = useStripe();
  const elements = useElements();

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
  }, [items, customerAddress, onError]);

  useEffect(() => {
    if (items.length === 0) {
      setError('Your cart is empty');
      setIsLoading(false);
      return;
    }

    createPaymentIntent();
  }, [items, createPaymentIntent]);

  const handlePaymentSuccess = (paymentIntentId: string) => {
    onSuccess(paymentIntentId);
  };

  const handlePaymentError = (error: string) => {
    setError(error);
    onError(error);
  };

  useEffect(() => {
    if (!stripe || !elements || !clientSecret) {
      return;
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
    elements.update({
      clientSecret,
      appearance,
    });
  }, [stripe, elements, clientSecret]);

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

  return (
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
  );
}