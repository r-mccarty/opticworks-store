'use client';

import { useState, useCallback, useEffect, FormEvent } from 'react';
import {
  PaymentElement,
  AddressElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import type { StripeAddressElementChangeEvent } from '@stripe/stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useCheckoutState } from '@/hooks/useCheckoutState';
import { completeCart, updateCart, createMedusaPaymentSession, type MedusaAddress } from '@/lib/api/medusa';
import { ShippingSelector } from './ShippingSelector';
import { useMedusaShipping, type ShippingAddress, type ShippingRate } from '@/hooks/useMedusaShipping';

interface CheckoutFormProps {
  cartId: string;
  /** Initial cart amount in cents (from CheckoutWrapper) */
  initialAmount: number;
  onSuccess: (orderId: string) => void;
  onError: (error: string) => void;
  /** Called when shipping rate changes for logging/tracking */
  onShippingChange?: (rate: ShippingRate | null) => void;
}

/**
 * CheckoutForm - Uses Stripe's Deferred Intent Pattern
 *
 * With this pattern:
 * 1. Elements is initialized with mode/amount/currency (no clientSecret)
 * 2. When shipping changes, we call elements.update({amount}) to update displayed amount
 * 3. At submit time, we call elements.submit() to validate, then create the PaymentIntent
 * 4. Finally, we call stripe.confirmPayment() with the clientSecret from step 3
 *
 * This prevents form state loss when the cart total changes (e.g., shipping selected).
 *
 * @see https://docs.stripe.com/payments/accept-a-payment-deferred
 */
export default function CheckoutForm({
  cartId,
  initialAmount: _initialAmount, // Used by Elements in CheckoutWrapper, kept for type consistency
  onSuccess,
  onError,
  onShippingChange,
}: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { items, getTotalPrice, clearCart } = useCart();
  const { setTaxAmount: setGlobalTaxAmount, setIsCalculatingTax } = useCheckoutState();

  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress | null>(null);

  // Calculate subtotal first (needed for handleSelectRate)
  const subtotal = getTotalPrice();

  // Use Medusa shipping hook (fetches from backend EasyPost provider)
  // Also returns taxAmount after shipping selection
  const {
    rates,
    selectedRate,
    isLoading: ratesLoading,
    error: ratesError,
    isDigitalOnly,
    taxAmount,
    selectRate,
  } = useMedusaShipping({
    cartId,
    address: shippingAddress,
  });

  // Update global checkout state when tax changes (for CartPage display)
  useEffect(() => {
    setGlobalTaxAmount(taxAmount);
  }, [taxAmount, setGlobalTaxAmount]);

  // Set calculating tax when loading shipping (tax is calculated with shipping)
  useEffect(() => {
    setIsCalculatingTax(ratesLoading);
  }, [ratesLoading, setIsCalculatingTax]);

  // Handle shipping rate selection - update Elements amount without remounting
  const handleSelectRate = useCallback(async (rate: ShippingRate) => {
    await selectRate(rate);

    // Update Elements with new total (subtotal + shipping + tax) in cents
    // Tax is now included in the total after selectRate updates it
    // Note: We use taxAmount from state which may not be updated yet,
    // so we'll update Elements again after tax is calculated
    if (elements) {
      const newAmount = Math.round((subtotal + rate.amount + taxAmount) * 100);
      elements.update({ amount: newAmount });
      console.log('[checkout] Updated Elements amount to:', newAmount, 'cents (tax:', taxAmount, ')');
    }

    onShippingChange?.(rate);
  }, [selectRate, onShippingChange, elements, subtotal, taxAmount]);

  // Update Elements amount when tax changes
  useEffect(() => {
    if (elements && selectedRate && taxAmount > 0) {
      const newAmount = Math.round((subtotal + selectedRate.amount + taxAmount) * 100);
      elements.update({ amount: newAmount });
      console.log('[checkout] Updated Elements amount with tax:', newAmount, 'cents');
    }
  }, [elements, subtotal, selectedRate, taxAmount]);

  // Handle address element changes
  const handleAddressChange = useCallback((event: StripeAddressElementChangeEvent) => {
    if (event.complete && event.value?.address) {
      const addr = event.value.address;
      setShippingAddress({
        name: event.value.name,
        line1: addr.line1 || '',
        line2: addr.line2 || undefined,
        city: addr.city || '',
        state: addr.state || '',
        postal_code: addr.postal_code || '',
        country: addr.country || 'US',
      });
    } else {
      // Address incomplete - clear shipping address
      setShippingAddress(null);
    }
  }, []);

  // Calculate total including shipping and tax
  const shippingCost = selectedRate?.amount ?? 0;
  const total = subtotal + shippingCost + taxAmount;

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

    if (!cartId) {
      setMessage('Cart not found. Please try again.');
      return;
    }

    // Require shipping selection for physical products
    if (!isDigitalOnly && !selectedRate) {
      setMessage('Please select a shipping method.');
      return;
    }

    console.log('[checkout] Starting payment confirmation (deferred intent pattern)...');
    setIsProcessing(true);
    setMessage(null);

    try {
      // Step 1: Validate form using elements.submit()
      // This triggers Stripe's form validation and collects payment method details
      console.log('[checkout] Step 1: Validating form with elements.submit()...');
      const { error: submitError } = await elements.submit();
      if (submitError) {
        console.error('[checkout] Form validation failed:', submitError);
        setMessage(submitError.message || 'Please check your payment details.');
        return;
      }
      console.log('[checkout] Form validation passed');

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

      // Step 2: Update cart with email and shipping address
      console.log('[checkout] Step 2: Updating cart with email and shipping address...');
      await updateCart(cartId, { email, shipping_address: shippingAddress });

      // Step 3: Create PaymentIntent NOW (deferred intent pattern)
      // This creates the PaymentIntent with the final cart amount (including shipping)
      console.log('[checkout] Step 3: Creating PaymentIntent with final amount...');
      const session = await createMedusaPaymentSession(cartId, true);

      if (!session.clientSecret) {
        throw new Error('Failed to create payment session. Please try again.');
      }
      console.log('[checkout] PaymentIntent created successfully');

      // Step 4: Confirm the payment with the clientSecret from step 3
      console.log('[checkout] Step 4: Confirming payment with Stripe...');
      const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret: session.clientSecret, // Pass clientSecret here, not to Elements
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
            onChange={handleAddressChange}
          />
        </CardContent>
      </Card>

      {/* Shipping Method */}
      <ShippingSelector
        rates={rates}
        selectedRate={selectedRate}
        onSelectRate={handleSelectRate}
        isLoading={ratesLoading}
        error={ratesError}
        isDigitalOnly={isDigitalOnly}
        subtotal={subtotal}
        freeShippingThreshold={200}
      />

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
            <div className="flex justify-between text-sm" data-testid="order-summary-subtotal">
              <span>Subtotal</span>
              <span data-testid="subtotal-amount">${subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm" data-testid="order-summary-shipping">
              <span>Shipping</span>
              {isDigitalOnly ? (
                <span className="text-green-600" data-testid="shipping-digital">Digital Delivery</span>
              ) : selectedRate ? (
                <span className={shippingCost === 0 ? 'text-green-600' : ''} data-testid="shipping-amount">
                  {shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}
                </span>
              ) : (
                <span className="text-gray-400" data-testid="shipping-pending">Select shipping</span>
              )}
            </div>
            <div className="flex justify-between text-sm" data-testid="order-summary-tax">
              <span>Tax</span>
              {ratesLoading ? (
                <span className="text-gray-400" data-testid="tax-calculating">Calculating...</span>
              ) : taxAmount > 0 ? (
                <span data-testid="tax-amount">${taxAmount.toFixed(2)}</span>
              ) : selectedRate ? (
                <span className="text-gray-400" data-testid="tax-zero">$0.00</span>
              ) : (
                <span className="text-gray-400" data-testid="tax-pending">Enter address</span>
              )}
            </div>
            <div className="flex justify-between font-semibold mt-2" data-testid="order-summary-total">
              <span>Total</span>
              <span data-testid="total-amount">${total.toFixed(2)}</span>
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
        disabled={isProcessing || !stripe || !elements || (!isDigitalOnly && !selectedRate)}
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
          `Pay $${total.toFixed(2)}`
        )}
      </Button>

      {/* Security Notice */}
      <p className="text-sm text-gray-600 text-center">
        Your payment is secured by Stripe. We never store your card details.
      </p>
    </form>
  );
}
