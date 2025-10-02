'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useCheckoutState } from '@/hooks/useCheckoutState';

const stripeElementAppearance = {
  theme: 'none',
  variables: {
    colorPrimary: '#16a34a',
    colorBackground: '#ffffff',
    colorText: '#0f172a',
    colorTextSecondary: '#475569',
    colorDanger: '#dc2626',
    fontFamily:
      "'Inter', 'Barlow', 'Segoe UI', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
    fontSizeBase: '15px',
    spacingUnit: '12px',
  },
  rules: {
    '.Input': {
      borderRadius: '0.375rem',
      border: '1px solid #e2e8f0',
      padding: '10px 12px',
      backgroundColor: '#ffffff',
      boxShadow: '0 1px 2px rgba(15, 23, 42, 0.05)',
      color: '#0f172a',
      transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    },
    '.Input:hover': {
      borderColor: '#cbd5e1',
    },
    '.Input:focus': {
      borderColor: '#16a34a',
      boxShadow: '0 0 0 3px rgba(22, 163, 74, 0.2)',
    },
    '.Input--invalid': {
      borderColor: '#dc2626',
      boxShadow: '0 0 0 3px rgba(220, 38, 38, 0.15)',
    },
    '.Input--disabled': {
      backgroundColor: '#f8fafc',
      color: '#94a3b8',
    },
    '.Input::placeholder': {
      color: '#94a3b8',
    },
    '.Label': {
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#334155',
    },
  },
} as const;

const createStripeElementOptions = () => ({
  appearance: stripeElementAppearance,
});

// Using unknown for Stripe types to avoid conflicts with official types
type StripeElement = unknown;
type StripeCheckout = unknown;

interface CheckoutFormProps {
  checkout: StripeCheckout | null;
  onSuccess: (sessionId: string) => void;
  onError: (error: string) => void;
}

export default function CheckoutForm({ checkout, onSuccess, onError }: CheckoutFormProps) {
  const { items, getTotalPrice } = useCart();
  const {
    taxAmount,
    isCalculatingTax,
    shippingAddress,
    setTaxAmount,
    setIsCalculatingTax,
    setShippingAddress,
    setSubtotal,
  } = useCheckoutState();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [elementsReady, setElementsReady] = useState(false);
  const [paymentElement, setPaymentElement] = useState<StripeElement | null>(null);
  const [addressElement, setAddressElement] = useState<StripeElement | null>(null);
  const [email, setEmail] = useState('');

  // Calculate tax based on address using Stripe Checkout Session
  const calculateTax = useCallback(async (address: any) => {
    if (!address || !address.state) return;
    
    setIsCalculatingTax(true);
    try {
      console.log('🔄 Calculating tax with Stripe for address:', address);
      
      const response = await fetch('/api/stripe/get-session-tax', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: items.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          })),
          shippingAddress: {
            line1: address.line1 || '123 Main St',
            city: address.city,
            state: address.state,
            postal_code: address.postal_code,
            country: address.country || 'US',
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Stripe tax calculation result:', data);
        setTaxAmount(data.taxAmount || 0);
      } else {
        console.warn('Stripe tax calculation failed, using 0 tax');
        setTaxAmount(0);
      }
    } catch (error) {
      console.warn('Stripe tax calculation error:', error);
      setTaxAmount(0);
    } finally {
      setIsCalculatingTax(false);
    }
  }, [items, setIsCalculatingTax, setTaxAmount]);

  // Update subtotal when component mounts or items change
  useEffect(() => {
    setSubtotal(getTotalPrice());
  }, [items, getTotalPrice, setSubtotal]);

  useEffect(() => {
    if (!checkout || elementsReady) return; // Prevent duplicate initialization

    const initializeElements = async () => {
      try {
        console.log('🔄 Initializing checkout elements...');
        console.log('🔍 Checkout object:', checkout);
        console.log('🔍 Checkout methods:', Object.keys(checkout || {}));

        // Create Shipping Address Element using correct method
        console.log('🏠 Creating shipping address element...');
        const addressEl = (checkout as any).createShippingAddressElement(
          createStripeElementOptions(),
        );

        // Create Payment Element using correct method
        console.log('💳 Creating payment element...');
        const paymentEl = (checkout as any).createPaymentElement(
          createStripeElementOptions(),
        );

        // Mount elements
        (addressEl as any).mount('#address-element');
        (paymentEl as any).mount('#payment-element');

        // Add address change event listener
        (addressEl as any).on('change', (event: any) => {
          console.log('📍 Address changed:', event);
          if (event.complete && event.value && event.value.address) {
            const address = event.value.address;
            setShippingAddress(address);
            calculateTax(address);
          }
        });

        setAddressElement(addressEl);
        setPaymentElement(paymentEl);
        setElementsReady(true);

        console.log('✅ Elements mounted successfully with event listeners');

      } catch (error) {
        console.error('❌ Error initializing elements:', error);
        onError('Failed to initialize payment elements');
      }
    };

    initializeElements();
  }, [checkout, onError, elementsReady, calculateTax, setShippingAddress]);

  // Separate cleanup effect
  useEffect(() => {
    return () => {
      if (addressElement) {
        try {
          (addressElement as any).unmount();
        } catch {
          console.log('Address element already unmounted');
        }
      }
      if (paymentElement) {
        try {
          (paymentElement as any).unmount();
        } catch {
          console.log('Payment element already unmounted');
        }
      }
    };
  }, [addressElement, paymentElement]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!checkout || !elementsReady) {
      setMessage('Payment form is not ready. Please wait...');
      return;
    }

    if (!email) {
      setMessage('Please enter your email address.');
      return;
    }

    console.log('🔄 Starting payment confirmation...');
    setIsProcessing(true);
    setMessage(null);

    try {
      // Update email before confirming
      await (checkout as any).updateEmail(email);

      // Confirm payment using the checkout object
      const result = await (checkout as any).confirm({
        // Optional parameters
        redirect: 'if_required', // Let Stripe handle redirects if needed
        returnUrl: `${window.location.origin}/store/cart/success`,
      });

      console.log('📊 Confirmation result:', result);

      if (result.error) {
        // Handle confirmation errors
        console.error('❌ Confirmation error:', result.error);
        setMessage(result.error.message || 'Payment confirmation failed');
        onError(result.error.message || 'Payment confirmation failed');
      } else {
        // Payment succeeded
        console.log('✅ Payment confirmed successfully');
        
        if (result.session) {
          console.log('🎯 Session ID:', result.session.id);
          onSuccess(result.session.id);
        } else {
          // Redirect might be happening
          console.log('🔄 Payment processing, redirect may occur...');
          setMessage('Payment is being processed...');
        }
      }
    } catch (error) {
      console.error('❌ Payment error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setMessage(errorMessage);
      onError(errorMessage);
    }

    setIsProcessing(false);
  };

  if (!checkout) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading checkout...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Email Address */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent>
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1"
          />
        </CardContent>
      </Card>

      {/* Shipping Address */}
      <Card>
        <CardHeader>
          <CardTitle>Shipping Address</CardTitle>
        </CardHeader>
        <CardContent>
          <div id="address-element" className="rounded-md">
            {/* AddressElement will be mounted here */}
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Shipping rates and tax will be calculated automatically based on your address.
          </p>
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
        </CardHeader>
        <CardContent>
          <div id="payment-element" className="rounded-md">
            {/* PaymentElement will be mounted here */}
          </div>
        </CardContent>
      </Card>

      {/* Loading indicator for elements */}
      {!elementsReady && (
        <div className="flex items-center justify-center py-8 text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          Loading payment form...
        </div>
      )}

      {/* Order Summary */}
      {elementsReady && (
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>${getTotalPrice().toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Tax</span>
              <span>
                {isCalculatingTax ? (
                  <div className="flex items-center">
                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    Calculating...
                  </div>
                ) : taxAmount > 0 ? (
                  `$${taxAmount.toFixed(2)}`
                ) : shippingAddress ? (
                  '$0.00'
                ) : (
                  'Enter address'
                )}
              </span>
            </div>
            <div className="border-t pt-2">
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>
                  {isCalculatingTax ? (
                    <div className="flex items-center">
                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                      Calculating...
                    </div>
                  ) : (
                    `$${(getTotalPrice() + taxAmount).toLocaleString()}`
                  )}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Message */}
      {message && (
        <div className={`p-4 rounded-md ${
          message.includes('successful') || message.includes('processing')
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message}
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isProcessing || !elementsReady}
        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 text-xl shadow-lg hover:shadow-xl transition-all duration-200"
        size="lg"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Processing Payment...
          </>
        ) : (
          'Complete Purchase'
        )}
      </Button>

      {!elementsReady && (
        <p className="text-sm text-gray-500 text-center">
          Please wait for the payment form to load completely
        </p>
      )}

      {/* Security Notice */}
      <p className="text-sm text-gray-600 text-center">
        🔒 Your payment information is secure and encrypted. We never store your card details.
      </p>
    </form>
  );
}