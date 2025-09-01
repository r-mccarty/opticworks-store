// This file is no longer used in Option B implementation.
// Option B uses Stripe's Embedded Checkout which handles the entire payment UI.
// The checkout is now handled by CheckoutWrapper.tsx using stripe.initEmbeddedCheckout()

export default function PaymentForm() {
  return (
    <div className="text-center py-8">
      <p className="text-gray-600">
        This component has been replaced by Stripe Embedded Checkout.
        Please use CheckoutWrapper instead.
      </p>
    </div>
  );
}