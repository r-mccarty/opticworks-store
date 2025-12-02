'use client';

import { useState, useEffect, useCallback, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useCheckoutState } from '@/hooks/useCheckoutState';
import { medusaConfig, completeCart, updateCart } from '@/lib/api/medusa';
import type {
  StripeCheckoutInstance,
  StripeCheckoutPaymentElement,
  StripeCheckoutAddressElement,
  StripeCheckoutAddress,
  StripeCheckoutAddressChangeEvent,
} from '@/types/stripe-checkout';
import type { ShippingAddress as CheckoutShippingAddress } from '@/types/checkout';

interface CheckoutFormProps {
  checkout: StripeCheckoutInstance | null;
  onSuccess: (sessionId: string) => void;
  onError: (error: string) => void;
}

interface TaxCalculationResponse {
  taxAmount?: number;
}

export default function CheckoutForm({ checkout, onSuccess, onError }: CheckoutFormProps) {
  const { items, getTotalPrice, getCartId } = useCart();
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
  const [paymentElement, setPaymentElement] = useState<StripeCheckoutPaymentElement | null>(null);
  const [addressElement, setAddressElement] = useState<StripeCheckoutAddressElement | null>(null);
  const [email, setEmail] = useState('');

  const normalizeAddress = useCallback((address: StripeCheckoutAddress): CheckoutShippingAddress | null => {
    if (!address.line1 || !address.city || !address.state || !address.postal_code) {
      return null;
    }

    return {
      line1: address.line1,
      city: address.city,
      state: address.state,
      postal_code: address.postal_code,
      country: address.country ?? 'US',
    };
  }, []);

  const calculateTax = useCallback(async (address: StripeCheckoutAddress) => {
    if (!address || !address.state || !address.postal_code) {
      return;
    }
    
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
            line1: address.line1 ?? '123 Main St',
            city: address.city ?? '',
            state: address.state,
            postal_code: address.postal_code,
            country: address.country ?? 'US',
          },
        }),
      });

      if (response.ok) {
        const data = await response.json() as TaxCalculationResponse;
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

  useEffect(() => {
    setSubtotal(getTotalPrice());
  }, [items, getTotalPrice, setSubtotal]);

  useEffect(() => {
    if (!checkout || elementsReady) return;

    const initializeElements = async () => {
      try {
        console.log('🔄 Initializing checkout elements...');
        const addressEl = checkout.createShippingAddressElement();
        const paymentEl = checkout.createPaymentElement();

        addressEl.mount('#address-element');
        paymentEl.mount('#payment-element');

        const handleAddressChange = (event: StripeCheckoutAddressChangeEvent) => {
          console.log('📍 Address changed:', event);
          const address = event.value?.address;
          if (event.complete && address) {
            const normalized = normalizeAddress(address);
            if (normalized) {
              setShippingAddress(normalized);
              void calculateTax(address);
            }
          }
        };

        addressEl.on('change', handleAddressChange);

        setAddressElement(addressEl);
        setPaymentElement(paymentEl);
        setElementsReady(true);

        console.log('✅ Elements mounted successfully with event listeners');

      } catch (error) {
        console.error('❌ Error initializing elements:', error);
        onError('Failed to initialize payment elements');
      }
    };

    void initializeElements();
  }, [checkout, elementsReady, calculateTax, normalizeAddress, onError, setShippingAddress]);

  useEffect(() => {
    return () => {
      if (addressElement) {
        try {
          addressElement.unmount();
        } catch {
          console.log('Address element already unmounted');
        }
      }
      if (paymentElement) {
        try {
          paymentElement.unmount();
        } catch {
          console.log('Payment element already unmounted');
        }
      }
    };
  }, [addressElement, paymentElement]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
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
      await checkout.updateEmail(email);

      const result = await checkout.confirm({
        redirect: 'if_required',
        returnUrl: `${window.location.origin}/store/cart/success`,
      });

      console.log('📊 Confirmation result:', result);

      if (result.error) {
        console.error('❌ Confirmation error:', result.error);
        const errorMessage = result.error.message || 'Payment confirmation failed';
        setMessage(errorMessage);
        onError(errorMessage);
      } else {
        console.log('✅ Payment confirmed successfully');

        // Complete the Medusa cart to create the order
        if (medusaConfig.enabled) {
          const cartId = getCartId();
          if (cartId) {
            try {
              console.log('🔄 Completing Medusa cart:', cartId);

              // Update cart with email before completing
              await updateCart(cartId, { email });

              // Complete the cart to create the order
              const { order } = await completeCart(cartId);
              console.log('✅ Order created:', order.id, 'Display ID:', order.display_id);

              // Use order ID for success redirect
              onSuccess(order.id);
              return;
            } catch (completeError) {
              console.error('❌ Failed to complete Medusa cart:', completeError);
              // Continue with session-based success if cart completion fails
            }
          }
        }

        // Fallback to session-based success
        if (result.session) {
          console.log('🎯 Session ID:', result.session.id);
          onSuccess(result.session.id);
        } else {
          console.log('🔄 Payment processing, redirect may occur...');
          setMessage('Payment is being processed...');
        }
      }
    } catch (error) {
      console.error('❌ Payment error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setMessage(errorMessage);
      onError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
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
