'use client';

import { useState, FormEvent } from 'react';
import {
  PaymentElement,
  AddressElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { completeCart, updateCart, type MedusaAddress } from '@/lib/api/medusa';

interface CheckoutFormProps {
  clientSecret: string;
  onSuccess: (orderId: string) => void;
  onError: (error: string) => void;
}

export default function CheckoutForm({ clientSecret, onSuccess, onError }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { items, getTotalPrice, getCartId, clearCart } = useCart();

  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [email, setEmail] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!stripe || !elements) {
      setMessage('Payment form is not ready. Please wait...');
      return;
    }

    if (!email) {
      setMessage('Please enter your email address.');
      return;
    }

    const cartId = getCartId();
    if (!cartId) {
      setMessage('Cart not found. Please try again.');
      return;
    }

    console.log('[checkout] Starting payment confirmation...');
    setIsProcessing(true);
    setMessage(null);

    try {
      // Get the shipping address from Stripe AddressElement
      const addressElement = elements.getElement('address');
      let shippingAddress: MedusaAddress | undefined;

      if (addressElement) {
        const { complete, value } = await addressElement.getValue();
        console.log('[checkout] Address element complete:', complete, 'value:', value);

        if (complete && value?.address) {
          shippingAddress = {
            first_name: value.firstName || value.name?.split(' ')[0] || 'Customer',
            last_name: value.lastName || value.name?.split(' ').slice(1).join(' ') || '',
            address_1: value.address.line1 || '',
            address_2: value.address.line2 || '',
            city: value.address.city || '',
            province: value.address.state || '',
            postal_code: value.address.postal_code || '',
            country_code: (value.address.country || 'US').toLowerCase(),
            phone: value.phone || '',
          };
        }
      }

      // Update cart with email and shipping address
      console.log('[checkout] Updating cart with email and shipping address...');
      await updateCart(cartId, { email, shipping_address: shippingAddress });

      // Note: Shipping method is already added in CheckoutWrapper before payment session is created
      // We just update the shipping address here with the real customer address
      // This doesn't change the cart total, so the Payment Intent remains valid

      // Confirm the payment with Stripe
      console.log('[checkout] Confirming payment with Stripe...');
      const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/store/cart/success`,
          receipt_email: email,
        },
        redirect: 'if_required',
      });

      if (stripeError) {
        console.error('[checkout] Stripe error:', stripeError);
        const errorMessage = stripeError.message || 'Payment failed. Please try again.';
        setMessage(errorMessage);
        onError(errorMessage);
        return;
      }

      console.log('[checkout] Payment intent status:', paymentIntent?.status);

      if (paymentIntent?.status === 'succeeded' || paymentIntent?.status === 'requires_capture') {
        // Payment successful, complete the Medusa cart
        console.log('[checkout] Payment confirmed, completing Medusa cart...');

        try {
          const { order } = await completeCart(cartId);
          console.log('[checkout] Order created:', order.id, 'Display ID:', order.display_id);

          // Clear the local cart
          clearCart();

          // Success!
          onSuccess(order.id);
        } catch (completeError) {
          console.error('[checkout] Error completing cart:', completeError);
          // Payment succeeded but order creation failed
          // The order should be created by webhook, so redirect anyway
          setMessage('Payment successful! Finalizing your order...');
          setTimeout(() => {
            window.location.href = `/store/cart/success?payment_intent=${paymentIntent.id}`;
          }, 2000);
        }
      } else if (paymentIntent?.status === 'processing') {
        setMessage('Payment is processing. You will receive confirmation shortly.');
      } else {
        setMessage('Payment status: ' + paymentIntent?.status);
      }
    } catch (error) {
      console.error('[checkout] Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setMessage(errorMessage);
      onError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" data-testid="checkout-form">
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
            data-testid="checkout-email-input"
          />
        </CardContent>
      </Card>

      {/* Shipping Address */}
      <Card>
        <CardHeader>
          <CardTitle>Shipping Address</CardTitle>
        </CardHeader>
        <CardContent>
          <AddressElement
            options={{
              mode: 'shipping',
              allowedCountries: ['US'],
              defaultValues: {
                address: {
                  country: 'US',
                },
              },
            }}
          />
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
            }}
          />
        </CardContent>
      </Card>

      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span>{item.name} x {item.quantity}</span>
              <span>${(item.price * item.quantity).toLocaleString()}</span>
            </div>
          ))}
          <div className="border-t pt-2 mt-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>${getTotalPrice().toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <div className="flex justify-between font-semibold mt-2">
              <span>Total</span>
              <span>${getTotalPrice().toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error/Status Message */}
      {message && (
        <div
          className={`p-4 rounded-md ${
            message.includes('successful') || message.includes('processing')
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
          data-testid="checkout-message"
        >
          {message}
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isProcessing || !stripe || !elements}
        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 text-xl shadow-lg hover:shadow-xl transition-all duration-200"
        size="lg"
        data-testid="pay-button"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Processing Payment...
          </>
        ) : (
          `Pay $${getTotalPrice().toLocaleString()}`
        )}
      </Button>

      {/* Security Notice */}
      <p className="text-sm text-gray-600 text-center">
        Your payment is secured by Stripe. We never store your card details.
      </p>
    </form>
  );
}
