# Stripe Payment Integration

**Status**: ✅ **Production Ready** - Complete e-commerce checkout flow

## Overview

OpticWorks uses Stripe for secure payment processing with an on-site checkout experience. The integration supports card payments, Apple Pay, Google Pay, automatic tax calculation, and email notifications.

### Key Features
- **On-site Checkout** - No redirects to external payment pages
- **Multiple Payment Methods** - Cards, Apple Pay, Google Pay
- **Automatic Tax Calculation** - Integrated with Stripe Tax API
- **Customer Management** - Automatic customer creation and retrieval
- **Email Notifications** - Order confirmation via React Email + Resend
- **Webhook Processing** - Real-time payment status updates
- **Mobile Optimized** - Responsive design with touch support
- **Custom Typography** - Colfax font integration with CORS-configured R2 CDN

## Architecture

### Payment Flow
```
CartPage → Customer Info → Shipping Address → PaymentForm → Success Page
    ↓            ↓              ↓               ↓           ↓
 Zustand → Form Validation → CheckoutWrapper → Stripe → Database
```

### Component Structure
```
src/components/checkout/
├── CheckoutWrapper.tsx    # Stripe Elements provider, payment intent creation
├── PaymentForm.tsx        # Payment UI, form handling, success/error states
└── PaymentFormProps       # TypeScript interfaces

src/app/api/stripe/
├── create-payment-intent/route.ts  # Payment intent API
└── webhook/route.ts                 # Webhook event processing

src/app/store/cart/success/page.tsx  # Payment success page
```

### Data Flow
1. **Cart Management**: Zustand store manages cart items and quantities
2. **Customer Info**: CartPage collects customer email, name, shipping address
3. **Payment Intent**: API creates Stripe PaymentIntent with tax calculation
4. **Payment Processing**: Stripe Elements handles secure payment submission
5. **Webhook Events**: Real-time processing of payment success/failure
6. **Order Creation**: Database entries via Supabase integration

## Quick Start

### 1. Environment Setup
```bash
# Required Stripe Environment Variables
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Optional: Email notifications
RESEND_API_KEY=your_resend_api_key
NEXT_PUBLIC_FROM_EMAIL=orders@yourdomain.com
```

### 2. Stripe Dashboard Configuration
1. **API Keys**: Copy publishable and secret keys to environment
2. **Webhook Endpoint**: Add `https://yourdomain.com/api/stripe/webhook`
3. **Webhook Events**: Enable `payment_intent.succeeded`, `payment_intent.payment_failed`
4. **Tax Settings**: Enable Stripe Tax for automatic calculation (optional)

### 3. Development Testing
```bash
# Terminal 1: Start development server
pnpm run dev

# Terminal 2: Forward webhooks to local development
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## API Reference

### POST /api/stripe/create-payment-intent

Creates a Stripe PaymentIntent with automatic tax calculation and customer management.

**Request Body:**
```typescript
{
  items: Array<{
    id: string
    name: string
    price: number
    quantity: number
  }>
  customerInfo: {
    email: string
    name: string
  }
  shippingAddress: {
    line1: string
    line2?: string
    city: string
    state: string
    postal_code: string
    country: string
  }
}
```

**Response:**
```typescript
{
  clientSecret: string        // For Stripe Elements
  paymentIntentId: string     // Stripe PaymentIntent ID
  customerId: string          // Stripe Customer ID
  totals: {
    subtotal: number         // Items total
    shipping: number         // Shipping cost (free over $200)
    tax: number             // Calculated tax amount
    total: number           // Final total
  }
}
```

### POST /api/stripe/webhook

Processes Stripe webhook events for real-time payment status updates.

**Supported Events:**
- `payment_intent.succeeded` - Payment successful, create order, send email
- `payment_intent.payment_failed` - Payment failed, log error, notify customer

## Components

### CheckoutWrapper

Manages Stripe Elements initialization and payment intent creation with custom font integration.

```typescript
import CheckoutWrapper from '@/components/checkout/CheckoutWrapper'

<CheckoutWrapper
  customerInfo={{ email: "user@email.com", name: "John Doe" }}
  shippingAddress={{ line1: "123 Main St", city: "City", ... }}
  onSuccess={(paymentIntentId) => console.log('Payment successful')}
  onError={(error) => console.error('Payment failed', error)}
/>
```

**Font Configuration:**
- Colfax font files hosted on Cloudflare R2 CDN
- CORS configured to allow `https://js.stripe.com` access
- CustomFontSource approach for direct font file loading

### PaymentForm

Stripe Elements payment form with card, Apple Pay, and Google Pay support.

**Features:**
- Real-time payment processing
- Automatic redirect on success to `/store/cart/success`
- Customer and shipping info display
- Order summary with calculated totals
- Error handling with user-friendly messages

## Testing

### Test Cards
```bash
# Success
4242424242424242

# Decline
4000000000000002  

# Requires 3D Secure
4000002760003184

# All test cards use:
# Expiry: Any future date
# CVC: Any 3 digits
# ZIP: Any valid postal code
```

### Webhook Testing
```bash
# Start webhook forwarding
stripe listen --forward-to https://yourdomain.com/api/stripe/webhook

# Test specific events
stripe trigger payment_intent.succeeded
stripe trigger payment_intent.payment_failed
```

### Debugging
1. **Payment Intent Issues**: Check browser network tab for API errors
2. **Webhook Failures**: Monitor Stripe Dashboard → Webhooks → Event logs
3. **Component Errors**: Check React DevTools and browser console
4. **Environment Variables**: Ensure all required env vars are set

## Environment Variables

### Required
```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY  # Client-side Stripe key
STRIPE_SECRET_KEY                   # Server-side Stripe key  
STRIPE_WEBHOOK_SECRET              # Webhook endpoint verification
```

### Optional
```bash
RESEND_API_KEY                     # Email service integration
NEXT_PUBLIC_FROM_EMAIL            # Order confirmation sender email
```

### Development vs Production
- **Development**: Use Stripe test keys (pk_test_*, sk_test_*)
- **Production**: Use live keys (pk_live_*, sk_live_*)
- **Webhooks**: Different endpoints for dev/prod environments

## Troubleshooting

### Common Issues

**"Loading payment form..." stuck**
- ✅ Fixed: Ensure `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` has correct prefix
- Check browser console for JavaScript errors

**Payment succeeds but no redirect**  
- ✅ Fixed: PaymentForm now automatically redirects to success page
- Verify `/store/cart/success` page exists

**Tax calculation mismatch**
- ✅ Fixed: CartPage shows "Calculated at checkout" instead of hardcoded tax
- Enable Stripe Tax in dashboard for automatic calculation

**Webhook 401 Unauthorized**
- Verify `STRIPE_WEBHOOK_SECRET` matches Stripe dashboard
- Check webhook endpoint URL is accessible

**TypeScript Errors**
- Ensure all interfaces in `src/types/checkout.ts` are properly imported
- Run `pnpm run build` to check for compilation errors

### Error Codes

| Error | Cause | Solution |
|-------|-------|----------|
| `missing_required_fields` | API request missing data | Check all required fields in request body |
| `payment_intent_authentication_failure` | 3D Secure failed | User should retry with different card |
| `card_declined` | Bank declined payment | User should try different payment method |
| `webhook_signature_verification_failed` | Invalid webhook secret | Update `STRIPE_WEBHOOK_SECRET` environment variable |

## Production Deployment

### Pre-deployment Checklist
- [ ] Switch to live Stripe keys (`pk_live_*`, `sk_live_*`)
- [ ] Update webhook endpoint to production URL
- [ ] Configure Resend API key for email notifications
- [ ] Test end-to-end flow in production environment
- [ ] Monitor Stripe Dashboard for successful transactions

### Monitoring
- **Stripe Dashboard**: Monitor payment volume, success rates, failed payments
- **Webhook Events**: Ensure all events are processing successfully
- **Error Tracking**: Monitor application logs for payment-related errors
- **Email Delivery**: Verify order confirmations are being sent

## Custom Font Integration
TBD

### R2 CDN Setup

**Font Files Hosted:**
- `ColfaxWebRegular-ffe8279204a8eb350c1a8320336a8e1a.woff2` (400 weight)
- `ColfaxWebMedium-5cd963f45f4bd8647a4e41a58ca9c4d3.woff2` (500 weight)
- `colfax-fonts.css` (CSS definitions)

**CORS Configuration:**
```json
{
  "CORSRules": [
    {
      "AllowedOrigins": ["https://js.stripe.com"],
      "AllowedMethods": ["GET"],
      "AllowedHeaders": ["*"],
      "MaxAgeSeconds": 3600
    }
  ]
}
```

**Applied via AWS CLI:**
```bash
aws s3api put-bucket-cors \
  --bucket opticworks-public \
  --cors-configuration file://cors.json \
  --endpoint-url=https://39f8fd4a5b0c7558aed585facd57ec3b.r2.cloudflarestorage.com
```

### Font Loading Methods

**Method 1: CustomFontSource (Current)**
- Direct font file URLs
- More reliable for cross-origin access
- Individual font weight configuration

**Method 2: CssFontSource (Alternative)**
- Single CSS file with @font-face definitions
- May require additional CSP configuration

### Troubleshooting Font Issues

**CORS Errors:**
```
Access to font at '...' from origin 'https://js.stripe.com' 
has been blocked by CORS policy
```
**Solution:** Verify R2 bucket CORS configuration includes `https://js.stripe.com`

**Font Not Loading:**
- Check browser Network tab for 404/403 errors on font requests
- Verify font files are publicly accessible via R2 public URLs
- Clear browser cache and hard refresh

---

**Integration Status**: Complete and production-ready with full e-commerce functionality and custom typography.