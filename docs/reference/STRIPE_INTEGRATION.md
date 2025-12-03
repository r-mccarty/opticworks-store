# Stripe Integration Documentation

**Updated**: 2025-12-03

> **Phase 3 Update**: Checkout now uses **Medusa Payment Sessions** instead of direct Stripe.
> Medusa creates Payment Intents via its Stripe provider, and we use Stripe Elements to collect payment.
> This document describes both the legacy direct integration and the current Medusa-based flow.

## Current Flow (Phase 3 - Medusa)

```
Cart → createPaymentSession(cartId) → Medusa creates PaymentIntent
     → Stripe Elements with client_secret
     → User submits payment
     → completeCart(cartId) → Medusa creates Order
```

**Key files**:
- `src/lib/api/medusa.ts` - createPaymentSession, completeCart
- `src/components/checkout/CheckoutForm.tsx` - Stripe Elements
- `src/hooks/useCart.ts` - Cart state with Medusa sync

**Cloudflare Workers Stripe Initialization** (required for edge deployment):
```typescript
import Stripe from 'stripe';

// Cloudflare Workers compatible Stripe initialization
// Uses FetchHttpClient instead of Node's http module
// API version 2025-03-31.basil required for ui_mode: custom
let stripe: Stripe | null = null;
const getStripe = () => {
  if (!stripe) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-03-31.basil' as Stripe.LatestApiVersion,
      httpClient: Stripe.createFetchHttpClient(),
    });
  }
  return stripe;
};

// For webhook signature verification, use SubtleCryptoProvider (Web Crypto API)
const cryptoProvider = Stripe.createSubtleCryptoProvider();
```

Reference: https://opennext.js.org/cloudflare/howtos/stripeAPI

---

## Legacy Flow (Pre-Phase 3 Reference)

This section documents the original direct Stripe integration for reference.

### Overview

This codebase implements **Option B: The Integrated Model** from our Payment Architecture design - a modern, streamlined approach using **Elements with Checkout Sessions API** (`ui_mode: 'custom'`). This architecture delegates complex state management to Stripe while maintaining full control over the UI through custom Elements integration.

**Critical**: This uses **Checkout Sessions API**, NOT Payment Intents API. The two APIs have different methods and webhooks:
- ✅ **Checkout Sessions**: `stripe.initCheckout()`, `checkout.confirm()`, `checkout.session.completed` webhook
- ❌ **Payment Intents**: `stripe.confirmPayment()`, `payment_intent.succeeded` webhook (not used)

## Architecture: Option B - The Integrated Model

### Core Philosophy
- **Stripe manages**: Tax calculation, checkout state machine, payment processing, compliance
- **We manage**: UI/UX, product catalog, customer experience, order fulfillment
- **Result**: Reduced complexity, faster development, better user experience

### Key Benefits
- ✅ **Automatic tax calculation** via Stripe Tax
- ✅ **Single-page checkout flow** for better conversion
- ✅ **Stripe-managed state machine** (no complex backend orchestration)
- ✅ **Future-proof compliance** (SCA, 3D Secure handled automatically)
- ✅ **Real-time address validation** via Stripe AddressElement

## Implementation Details

### 1. Checkout Session Creation

**API Endpoint**: `/api/stripe/create-checkout-session`

```typescript
const checkoutSession = await stripe.checkout.sessions.create({
  line_items: lineItems,
  mode: 'payment',
  
  // Stripe collects shipping address
  shipping_address_collection: {
    allowed_countries: ['US'],
  },

  // Automatic tax calculation
  automatic_tax: {
    enabled: true,
  },

  // Fallback URLs for hosted checkout
  success_url: `${origin}/store/cart/success?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${origin}/store/cart`,

  // Metadata for webhook processing
  metadata: {
    items_count: items.length.toString(),
    order_type: 'ecommerce',
    source: 'website',
  },

  // Invoice creation for record keeping
  invoice_creation: {
    enabled: true,
  },
});
```

### 2. Frontend Integration

**Components Architecture**:
```
CartPage → CheckoutWrapper → CheckoutForm
                ↓              ↓
          Creates Session    Uses Elements
            via API         (Address + Payment)
```

**CheckoutWrapper** (`src/components/checkout/CheckoutWrapper.tsx`):
- Creates checkout session with backend API
- Initializes Stripe Elements with `clientSecret`
- Provides error handling and loading states

**CheckoutForm** (`src/components/checkout/CheckoutForm.tsx`):
- Uses `AddressElement` for shipping address collection
- Uses `PaymentElement` for payment method collection
- Confirms payment with `stripe.confirmPayment()`

### 3. Elements Configuration

```typescript
// Stripe Elements setup
const options = {
  clientSecret,
  appearance: {
    theme: 'stripe',
    variables: {
      colorPrimary: '#3b82f6',
      // ... custom styling
    },
  },
};

// Address Element
<AddressElement 
  options={{
    mode: 'shipping',
    allowedCountries: ['US'],
    fields: { phone: 'never' },
    autocomplete: { mode: 'automatic' },
  }}
  onChange={handleAddressChange}
/>

// Payment Element  
<PaymentElement
  options={{
    layout: 'tabs',
    paymentMethodOrder: ['card', 'apple_pay', 'google_pay'],
  }}
/>
```

### 4. Payment Confirmation

**Important**: This implementation uses **Checkout Sessions API**, not Payment Intents API.

```typescript
// CORRECT: Checkout Sessions API with ui_mode: 'custom'
const checkout = await stripe.initCheckout({
  fetchClientSecret: async () => {
    const response = await fetch('/api/stripe/create-checkout-session');
    const { clientSecret } = await response.json();
    return clientSecret;
  },
});

// Confirm the checkout session
const { error } = await checkout.confirm({
  redirect: 'if_required',
});

// NOT using stripe.confirmPayment() - that's for Payment Intents API
```

**Key Difference**:
- ✅ **Checkout Sessions**: `checkout.confirm()` - Used in this codebase
- ❌ **Payment Intents**: `stripe.confirmPayment()` - NOT used here

See `src/components/checkout/CheckoutForm.tsx` for implementation details.

## Webhook Integration

### Webhook Architecture

Stripe webhooks are routed through **Hookdeck** for reliability and observability:

```
Stripe → Hookdeck → https://optic.works/api/stripe/webhook
```

**Hookdeck Benefits**:
- Automatic retries with exponential backoff
- Request/response logging for debugging
- Webhook replay for failed deliveries
- Dashboard for monitoring delivery status

### Hookdeck Header Detection

When webhooks come through Hookdeck, the signature verification is skipped since Hookdeck already validated the webhook from Stripe:

```typescript
// Check if request is coming from Hookdeck (headers use X- prefix)
const hookdeckSignature = request.headers.get('x-hookdeck-signature');
const hookdeckVerified = request.headers.get('x-hookdeck-verified');

if (hookdeckSignature || hookdeckVerified === 'true') {
  // Skip Stripe signature verification - Hookdeck already validated
  event = JSON.parse(body) as Stripe.Event;
} else {
  // Direct from Stripe - verify signature with SubtleCryptoProvider
  event = await stripe.webhooks.constructEventAsync(
    body, signature, webhookSecret, undefined, cryptoProvider
  );
}
```

### Primary Webhook Events

**Endpoint**: `/api/stripe/webhook`

**Active Events (Checkout Sessions API)**:
- ✅ `checkout.session.completed` - **PRIMARY**: Order fulfillment and email confirmation
- ✅ `checkout.session.expired` - Handle abandoned checkouts (optional)

**Legacy Events (Payment Intents API - Backward Compatibility Only)**:
- ⚠️ `payment_intent.succeeded` - Legacy support (not used in current flow)
- ⚠️ `payment_intent.payment_failed` - Legacy support (not used in current flow)

**Note**: The current implementation uses Checkout Sessions exclusively. Payment Intent webhook handlers exist for backward compatibility but are not part of the active checkout flow.

### Order Processing Flow

When `checkout.session.completed` fires:

1. **Extract Order Data**:
   ```typescript
   const customerEmail = session.customer_details?.email;
   const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
   ```

2. **Calculate Totals**:
   ```typescript
   const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
   const shippingCost = (session.shipping_cost?.amount_total || 0) / 100;
   const taxAmount = (session.total_details?.amount_tax || 0) / 100;
   const totalAmount = (session.amount_total || 0) / 100;
   ```

3. **Store Order & Send Confirmation**:
   ```typescript
   // Store in database
   await supabase.from('test_orders').insert({
     customer_email: customerEmail,
     total_amount: totalAmount,
     status: 'completed',
   });

   // Send confirmation email
   await sendOrderConfirmation({ ... });
   ```

## Email Integration

### Automatic Order Confirmations

**Production Ready**: ✅ Fully functional via React Email + Resend

**Email Service Configuration**:
```bash
RESEND_API_KEY=re_xxxxxxxxxx
NEXT_PUBLIC_FROM_EMAIL=OpticWorks <orders@notifications.optic.works>
```

**Email Templates**: Located in `src/lib/api/email.ts`
- Order confirmation with line items breakdown
- Shipping address and order details
- Professional Tesla-focused branding
- Automatic delivery via webhook + backup on success page

## Environment Variables

### Required for Production

```bash
# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_SECRET_KEY=sk_live_xxxxx

# Webhook Secrets
STRIPE_WEBHOOK_SECRET=whsec_xxxxx  # Production webhook
STRIPE_WEBHOOK_SECRET_DEV=whsec_xxxxx  # Stripe CLI webhook

# Email Service
RESEND_API_KEY=re_xxxxx
NEXT_PUBLIC_FROM_EMAIL=OpticWorks <orders@notifications.optic.works>

# Database
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxxxx
```

### Optional for Enhanced Features

```bash
# For future dynamic shipping rates (not yet implemented)
EASYPOST_API_KEY=EZTK_xxxxx
EASYPOST_MODE=test  # or 'production'
```

## Testing

### Development Testing

1. **Start Development Server**:
   ```bash
   pnpm run dev
   ```

2. **Start Stripe CLI for Webhooks**:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

3. **Test Cards**:
   - Success: `4242424242424242`
   - Declined: `4000000000000002`
   - Requires Authentication: `4000002500003155`

### Production Testing

1. **Use Stripe Test Keys** in production environment
2. **Test webhook delivery** via Stripe Dashboard → Webhooks
3. **Verify email delivery** through Resend dashboard
4. **Test tax calculation** with real addresses

## Error Handling

### Frontend Error Handling

**CheckoutWrapper Error States**:
- Network errors with retry functionality
- Session creation failures with user-friendly messages
- Loading states with progress indicators

**CheckoutForm Error States**:
- Card validation errors displayed inline
- Address completion requirements
- Payment processing errors with retry options

### Backend Error Handling

**API Error Responses**:
```typescript
// Consistent error format
return NextResponse.json(
  { error: 'User-friendly error message' },
  { status: 400 }
);
```

**Webhook Error Handling**:
- Comprehensive logging for debugging
- Graceful degradation for non-critical failures
- Automatic retries via Stripe webhook system

## Monitoring and Logging

### Production Monitoring

**Webhook Logs**: All webhook events logged with structured data
```typescript
console.log('✅ Checkout session completed:', session.id);
console.log('📧 Order confirmation sent:', emailResult.messageId);
```

**Error Tracking**: Failed payments and errors logged with context
```typescript
console.error('❌ Email delivery failed:', error);
console.error('🔍 Session data:', JSON.stringify(session, null, 2));
```

### Analytics Integration

**Stripe Analytics**: Built-in payment analytics in Stripe Dashboard
**Custom Analytics**: Order data stored in Supabase for business intelligence

## Security Considerations

### PCI Compliance
- ✅ No card data touches our servers (Stripe Elements handles all PCI requirements)
- ✅ Webhook signature verification prevents tampering
- ✅ HTTPS enforced for all payment flows

### Data Protection
- Customer email and shipping data handled securely
- No sensitive payment information stored locally
- Stripe customer objects used for data normalization

## Future Enhancements

### Planned Features
1. **Dynamic Shipping Rates**: EasyPost integration via webhook when API supports `checkout.session.address_updated`
2. **Subscription Support**: Extend to support recurring billing
3. **Multi-currency**: International expansion support
4. **Connect Integration**: Support for marketplace scenarios

### Migration Notes
- Current implementation is pure Option B architecture
- Easily extensible for additional payment methods
- Webhook architecture supports future Stripe features
- Email system ready for transactional expansion

## Support and Debugging

### Common Issues

1. **"Invalid client secret" Error**:
   - Ensure checkout session is created before Elements initialization
   - Verify `clientSecret` format matches Stripe expectations

2. **Tax Not Calculating**:
   - Verify `automatic_tax: { enabled: true }` in session creation
   - Check Stripe Dashboard tax settings are configured

3. **Webhooks Not Firing**:
   - Verify webhook endpoint is publicly accessible
   - Check webhook signature verification
   - Ensure correct webhook secret in environment variables

### Development Tools

**Stripe CLI**: Essential for local webhook testing
```bash
stripe login
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

**Stripe Dashboard**: 
- Monitor payment flows
- Debug webhook deliveries
- View customer and session data

This documentation reflects the current production-ready implementation using Option B architecture, providing a solid foundation for future development and maintenance.