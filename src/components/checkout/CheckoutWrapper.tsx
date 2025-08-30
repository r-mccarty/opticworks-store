'use client';

import PaymentForm from './PaymentForm';

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
  totals: {
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
  };
}

export default function CheckoutWrapper({
  customerAddress,
  onSuccess,
  onError,
  totals
}: CheckoutWrapperProps) {

  return (
    <PaymentForm
      onSuccess={onSuccess}
      onError={onError}
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