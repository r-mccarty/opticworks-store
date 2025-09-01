'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

// Using unknown for Stripe types to avoid conflicts with official types
type StripeElement = unknown;
type StripeCheckout = unknown;

interface CheckoutFormProps {
  checkout: StripeCheckout | null;
  onSuccess: (sessionId: string) => void;
  onError: (error: string) => void;
}

export default function CheckoutForm({ checkout, onSuccess, onError }: CheckoutFormProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [elementsReady, setElementsReady] = useState(false);
  const [paymentElement, setPaymentElement] = useState<StripeElement | null>(null);
  const [addressElement, setAddressElement] = useState<StripeElement | null>(null);
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (!checkout || elementsReady) return; // Prevent duplicate initialization

    const initializeElements = async () => {
      try {
        console.log('🔄 Initializing checkout elements...');
        console.log('🔍 Checkout object:', checkout);
        console.log('🔍 Checkout methods:', Object.keys(checkout || {}));

        // Create Shipping Address Element using correct method
        console.log('🏠 Creating shipping address element...');
        const addressEl = (checkout as any).createShippingAddressElement();

        // Create Payment Element using correct method
        console.log('💳 Creating payment element...');
        const paymentEl = (checkout as any).createPaymentElement();

        // Mount elements
        (addressEl as any).mount('#address-element');
        (paymentEl as any).mount('#payment-element');

        setAddressElement(addressEl);
        setPaymentElement(paymentEl);
        setElementsReady(true);

        console.log('✅ Elements mounted successfully');

      } catch (error) {
        console.error('❌ Error initializing elements:', error);
        onError('Failed to initialize payment elements');
      }
    };

    initializeElements();
  }, [checkout, onError, elementsReady]);

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
          <div id="address-element" className="border rounded-md p-3">
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
          <div id="payment-element">
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