'use client';

import { useState, useEffect } from 'react';
import { 
  useStripe, 
  useElements, 
  PaymentElement,
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import type { PaymentFormProps } from '@/types/checkout';

export default function PaymentForm({
  clientSecret,
  onSuccess,
  onError,
  customerInfo,
  shippingAddress,
  totals
}: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!stripe) return;

    // Only check for succeeded/processing states on initial load
    // Don't show error messages until user actually attempts payment
    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      switch (paymentIntent?.status) {
        case 'succeeded':
          setMessage('Payment succeeded!');
          onSuccess(paymentIntent.id);
          // Redirect to success page
          window.location.href = '/store/cart/success';
          break;
        case 'processing':
          setMessage('Your payment is processing.');
          break;
        case 'requires_payment_method':
          // Don't show error message on initial load - this is the expected state
          setMessage(null);
          break;
        default:
          // Only show generic error for truly unexpected states
          setMessage('Something went wrong.');
          break;
      }
    });
  }, [stripe, clientSecret, onSuccess]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setMessage(null);

    // Confirm payment with Stripe
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/store/cart/success`,
        receipt_email: customerInfo.email,
      },
      redirect: 'if_required', // Prevent automatic redirect
    });

    if (error) {
      if (error.type === 'card_error' || error.type === 'validation_error') {
        setMessage(error.message || 'Payment failed');
        onError(error.message || 'Payment failed');
      } else {
        setMessage('An unexpected error occurred.');
        onError('An unexpected error occurred.');
      }
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      setMessage('Payment succeeded!');
      onSuccess(paymentIntent.id);
      // Redirect to success page
      window.location.href = '/store/cart/success';
    }

    setIsProcessing(false);
  };

  if (!stripe || !elements) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading payment form...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Customer Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Customer & Shipping Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium">Customer:</span> {customerInfo.name} ({customerInfo.email})
            </div>
            <div>
              <span className="font-medium">Shipping to:</span>
              <div className="ml-2">
                {shippingAddress.line1}
                {shippingAddress.line2 && <div>{shippingAddress.line2}</div>}
                <div>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.postal_code}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
        </CardHeader>
        <CardContent>
          <PaymentElement
            options={{
              layout: 'tabs',
              paymentMethodOrder: ['card', 'apple_pay', 'google_pay'],
            }}
          />
        </CardContent>
      </Card>

      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>${totals.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping:</span>
              <span>${totals.shipping.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax:</span>
              <span>${totals.tax.toFixed(2)}</span>
            </div>
            <hr className="my-2" />
            <div className="flex justify-between font-bold text-lg">
              <span>Total:</span>
              <span>${totals.total.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Message */}
      {message && (
        <div className={`p-4 rounded-md ${
          message.includes('succeeded') 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message}
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isProcessing || !stripe || !elements}
        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 text-xl shadow-lg hover:shadow-xl transition-all duration-200"
        size="lg"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Processing Payment...
          </>
        ) : (
          `Complete Payment • $${totals.total.toFixed(2)}`
        )}
      </Button>

      {/* Security Notice */}
      <p className="text-sm text-gray-600 text-center">
        🔒 Your payment information is secure and encrypted. We never store your card details.
      </p>
    </form>
  );
}