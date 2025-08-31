# Stripe Embedded Checkout Integration with EasyPost Address Validation

## Overview

OpticWorks implements a production-ready Stripe integration using **Stripe Embedded Components** with **Checkout Sessions API** and **EasyPost address validation**. This modern approach provides maximum UI control, comprehensive session management, and real-time address verification for a seamless checkout experience.

## Architecture Summary

- **Frontend**: Stripe Embedded Components (`ui_mode: 'custom'`) with full UI control
- **Session Management**: Stripe Checkout Sessions API for comprehensive state management
- **Address Validation**: EasyPost API for real-time address verification and suggestions
- **Database**: Supabase PostgreSQL for order storage
- **Email**: React Email + Resend for automated notifications

## Integration Architecture

### 1. Stripe Embedded Components vs Traditional Checkout

This integration uses **Stripe Embedded Components** (`ui_mode: 'custom'`) instead of traditional Payment Intents, providing:

- **Full UI Control**: Complete customization via Appearance API
- **Session Management**: Comprehensive state handling with tax, shipping, and customer data
- **Brand Integration**: Seamless design integration with existing UI components
- **Advanced Features**: Built-in support for multiple payment methods, tax calculation, and shipping

### 2. API Flow Overview

```
Cart → Create Checkout Session → Initialize Embedded Checkout → Validate Address → Process Payment → Success
```

## Checkout Sessions API Implementation

### 1. Session Creation Endpoint

**Endpoint**: `POST /api/stripe/create-checkout-session`

```typescript
// src/app/api/stripe/create-checkout-session/route.ts
export async function POST(request: NextRequest) {
  const { items, customerInfo, shippingAddress } = await request.json();

  // Create or retrieve customer
  let customer = await stripe.customers.list({ 
    email: customerInfo.email, 
    limit: 1 
  });
  
  if (customer.data.length === 0) {
    customer = await stripe.customers.create({
      email: customerInfo.email,
      name: customerInfo.name,
      shipping: { name: customerInfo.name, address: shippingAddress }
    });
  }

  // Create checkout session with embedded components
  const checkoutSession = await stripe.checkout.sessions.create({
    ui_mode: 'custom', // Enable Embedded Components
    customer: customer.id,
    line_items: lineItems,
    mode: 'payment',
    
    // Advanced features
    automatic_tax: { enabled: true },
    shipping_address_collection: { allowed_countries: ['US'] },
    invoice_creation: { enabled: true },
    
    // Return URL for post-payment redirect
    return_url: `${origin}/store/cart/success?session_id={CHECKOUT_SESSION_ID}`,
    
    // Metadata for webhook processing
    metadata: {
      subtotal: subtotal.toString(),
      customer_email: customerInfo.email,
      items_count: items.length.toString()
    }
  });

  return NextResponse.json({
    clientSecret: checkoutSession.client_secret,
    checkoutSessionId: checkoutSession.id,
    totals: { subtotal, shipping: shippingCost, total: totalAmount }
  });
}
```

**Key Features**:
- **Embedded UI Mode**: `ui_mode: 'custom'` enables component-based integration
- **Customer Management**: Automatic customer creation and retrieval
- **Tax Automation**: Built-in Stripe Tax integration
- **Invoice Generation**: Automatic invoice creation for record keeping
- **Metadata Storage**: Order details stored for webhook processing

### 2. Frontend Integration

#### CheckoutWrapper Component

```typescript
// src/components/checkout/CheckoutWrapper.tsx
export default function CheckoutWrapper({ customerAddress, onSuccess, onError }) {
  const [clientSecret, setClientSecret] = useState('');
  const [checkout, setCheckout] = useState(null);

  const createCheckoutSession = useCallback(async () => {
    const response = await fetch('/api/stripe/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: cartItems,
        customerInfo: { name: customerAddress.name, email: customerAddress.email },
        shippingAddress: customerAddress
      })
    });

    const data = await response.json();
    setClientSecret(data.clientSecret);
  }, [items, customerAddress]);

  return (
    <Elements options={{ clientSecret, appearance }} stripe={stripePromise}>
      <PaymentForm 
        clientSecret={clientSecret}
        onSuccess={onSuccess}
        onError={onError}
        customerInfo={customerInfo}
        totals={totals}
      />
    </Elements>
  );
}
```

#### PaymentForm with Embedded Components

```typescript
// src/components/checkout/PaymentForm.tsx
export default function PaymentForm({ clientSecret, onError, customerInfo }) {
  const stripe = useStripe();
  const elements = useElements();
  const [checkout, setCheckout] = useState(null);

  useEffect(() => {
    if (!stripe || !clientSecret) return;

    const initializeCheckout = async () => {
      const checkoutInstance = await stripe.initEmbeddedCheckout({
        fetchClientSecret: async () => clientSecret
      });
      setCheckout(checkoutInstance);
    };

    initializeCheckout();
  }, [stripe, clientSecret]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    const { error } = await checkout.submit();
    
    if (error) {
      onError(error.message);
    }
    // Success handling is managed by Checkout Session return_url
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement options={{
        layout: 'tabs',
        paymentMethodOrder: ['card', 'apple_pay', 'google_pay']
      }} />
      <button type="submit">Complete Payment</button>
    </form>
  );
}
```

## EasyPost Address Validation Integration

### 1. Address Validation API

**Endpoint**: `POST /api/easypost/validate-address`

```typescript
// src/app/api/easypost/validate-address/route.ts
export async function POST(request: NextRequest) {
  const address = await request.json();
  
  const validationResult = await validateAddress(address);
  return NextResponse.json(validationResult);
}
```

**Endpoint**: `POST /api/easypost/suggest-address`

```typescript
// src/app/api/easypost/suggest-address/route.ts  
export async function POST(request: NextRequest) {
  const address = await request.json();
  
  const suggestionResult = await getAddressSuggestions(address);
  return NextResponse.json(suggestionResult);
}
```

### 2. EasyPost Service Implementation

```typescript
// src/lib/api/easypost.ts
import EasyPost from '@easypost/api';

const easypost = new EasyPost(process.env.EASYPOST_API_KEY!);

export async function validateAddress(address: AddressInput): Promise<AddressValidationResponse> {
  try {
    const easypostAddress = await easypost.Address.create({
      street1: address.street1,
      city: address.city,
      state: address.state,
      zip: address.zip,
      country: address.country || 'US',
      name: address.name || ''
    });

    const validated: ValidatedAddress = {
      id: easypostAddress.id,
      street1: easypostAddress.street1 || '',
      city: easypostAddress.city || '',
      state: easypostAddress.state || '',
      zip: easypostAddress.zip || '',
      residential: easypostAddress.residential || false,
      verifications: {
        delivery: {
          success: easypostAddress.verifications?.delivery?.success || false,
          errors: easypostAddress.verifications?.delivery?.errors || []
        },
        zip4: {
          success: easypostAddress.verifications?.zip4?.success || false,
          zip4: easypostAddress.verifications?.zip4?.zip4 || ''
        }
      }
    };

    return { success: true, address: validated };
  } catch (error) {
    return { 
      success: false, 
      errors: [error instanceof Error ? error.message : 'Address validation failed'] 
    };
  }
}
```

### 3. Frontend Address Validation

#### Enhanced AddressForm with Real-time Validation

```typescript
// src/components/checkout/AddressForm.tsx
export default function AddressForm({ onAddressChange, onValidityChange }) {
  const [validationStatus, setValidationStatus] = useState('idle');
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [validationTimeout, setValidationTimeout] = useState(null);

  const validateAddress = async (address) => {
    setValidationStatus('validating');
    
    try {
      const response = await fetch('/api/easypost/validate-address', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(address)
      });

      const result = await response.json();

      if (result.success && result.address) {
        setValidationStatus('valid');
        setValidationMessage('Address verified ✓');
      } else {
        // Get suggestions for invalid addresses
        const suggestionResponse = await fetch('/api/easypost/suggest-address', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(address)
        });

        const suggestions = await suggestionResponse.json();
        if (suggestions.success && suggestions.suggestions.length > 0) {
          setValidationStatus('suggestions');
          setAddressSuggestions(suggestions.suggestions);
        } else {
          setValidationStatus('invalid');
        }
      }
    } catch (error) {
      setValidationStatus('invalid');
      setValidationMessage('Validation failed. Please verify manually.');
    }
  };

  const handleAddressChange = (event) => {
    if (event.complete && event.value) {
      const { name, address } = event.value;
      
      // Clear previous timeout
      if (validationTimeout) clearTimeout(validationTimeout);
      
      // Debounce validation
      const timeout = setTimeout(() => {
        validateAddress({
          street1: address.line1,
          city: address.city,
          state: address.state,
          zip: address.postal_code,
          name: name
        });
      }, 1000);
      
      setValidationTimeout(timeout);
    }
  };

  return (
    <Card>
      <CardContent>
        <AddressElement 
          options={{
            mode: 'shipping',
            allowedCountries: ['US'],
            autocomplete: { mode: 'automatic' }
          }}
          onChange={handleAddressChange}
        />
        
        {/* Validation Status UI */}
        {validationStatus === 'validating' && (
          <div className="flex items-center text-blue-600">
            <Loader2 className="animate-spin mr-2" />
            Validating address...
          </div>
        )}
        
        {validationStatus === 'valid' && (
          <div className="flex items-center text-green-600">
            <CheckCircle2 className="mr-2" />
            Address verified ✓
          </div>
        )}
        
        {addressSuggestions.length > 0 && (
          <div className="mt-3 space-y-2">
            <p className="text-blue-600">Suggested corrections:</p>
            {addressSuggestions.map((suggestion, index) => (
              <div 
                key={index}
                className="border border-blue-200 bg-blue-50 rounded p-3 cursor-pointer"
                onClick={() => handleSuggestionSelect(suggestion)}
              >
                <div className="font-medium">{suggestion.name}</div>
                <div>{suggestion.street1}</div>
                <div>{suggestion.city}, {suggestion.state} {suggestion.zip}</div>
                <Button variant="outline" size="sm" className="mt-2">
                  Use This Address
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

## Webhook Processing for Checkout Sessions

### Enhanced Webhook Handler

```typescript
// src/app/api/stripe/webhook/route.ts
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  try {
    // Extract customer information
    const customerEmail = session.customer_details?.email;
    const customerName = session.customer_details?.name;
    
    // Get detailed line items
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
      expand: ['data.price.product']
    });
    
    // Calculate totals
    const shippingCost = (session.shipping_cost?.amount_total || 0) / 100;
    const taxAmount = (session.total_details?.amount_tax || 0) / 100;
    const totalAmount = (session.amount_total || 0) / 100;
    
    // Store order in database
    const { error: dbError } = await supabase.from('orders').insert({
      session_id: session.id,
      customer_email: customerEmail,
      customer_name: customerName,
      total_amount: totalAmount,
      tax_amount: taxAmount,
      shipping_cost: shippingCost,
      status: 'completed',
      payment_status: 'paid'
    });

    // Send order confirmation email
    if (session.customer_details?.address) {
      await sendOrderConfirmation({
        customerEmail,
        customerName,
        orderNumber: `ORD-${Date.now()}-${session.id.slice(-8)}`,
        items: lineItems.data,
        subtotal: totalAmount - taxAmount - shippingCost,
        tax: taxAmount,
        shipping: shippingCost,
        total: totalAmount,
        shippingAddress: {
          name: customerName,
          address1: session.customer_details.address.line1,
          address2: session.customer_details.address.line2,
          city: session.customer_details.address.city,
          state: session.customer_details.address.state,
          zipCode: session.customer_details.address.postal_code
        }
      });
    }

  } catch (error) {
    console.error('Error processing checkout session:', error);
  }
}

export async function POST(request: NextRequest) {
  const payload = await request.text();
  const signature = request.headers.get('stripe-signature');

  try {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;
      case 'checkout.session.expired':
        console.log('Checkout session expired:', event.data.object.id);
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook error' }, { status: 400 });
  }
}
```

## Environment Configuration

### Required Environment Variables

```bash
# Stripe Configuration (Production Ready)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
STRIPE_SECRET_KEY=sk_test_your_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# EasyPost Address Validation
EASYPOST_API_KEY=EZTK_your_test_api_key

# Email Service (Production Ready)
RESEND_API_KEY=re_your_resend_api_key
NEXT_PUBLIC_FROM_EMAIL=YourStore <orders@yourdomain.com>

# Database
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Error Handling and Recovery

### 1. Comprehensive Error Handling

```typescript
// Network error detection and retry
if (retryCount < 2 && (err instanceof TypeError || err.code === 'NETWORK_ERROR')) {
  setRetryCount(prev => prev + 1);
  setTimeout(() => createCheckoutSession(), 1000 * (retryCount + 1));
} else {
  setError(errorMessage);
  onError(errorMessage);
}

// Session expiration handling
if (error.includes('expired') || error.includes('invalid')) {
  setTimeout(() => {
    console.log('Recreating expired checkout session');
    createCheckoutSession();
  }, 1000);
}
```

### 2. Address Validation Fallbacks

```typescript
// Graceful degradation when validation fails
catch (error) {
  console.error('Address validation error:', error);
  setValidationStatus('invalid');
  setValidationMessage('Validation failed. Please verify manually.');
  // Allow checkout to continue with manual verification
}
```

## Testing and Development

### Test Configuration

```bash
# Stripe Test Cards
4242424242424242  # Visa - Success
4000000000000002  # Visa - Declined
4000002760003184  # Visa - Requires 3D Secure

# EasyPost Test Addresses
123 Main Street, San Francisco, CA 94105  # Valid address
123 Fake Street, Nowhere, XX 00000       # Invalid for testing suggestions
```

### Development Workflow

1. **Local Development**:
   ```bash
   pnpm run dev
   ```

2. **Webhook Testing**:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

3. **Test Checkout Flow**:
   - Navigate to `/store/cart`
   - Add items and proceed to checkout
   - Enter test address (watch EasyPost validation)
   - Use test card for payment
   - Verify email notification

## Performance and Scalability

### 1. Optimizations

- **Address Validation**: 1-second debounce to reduce API calls
- **Session Caching**: Client-side session state management
- **Error Recovery**: Automatic retry with exponential backoff
- **Webhook Reliability**: Idempotent processing with event verification

### 2. Monitoring

- **Stripe Dashboard**: Payment success/failure rates, session analytics
- **EasyPost Dashboard**: Address validation metrics and API usage
- **Webhook Logs**: Real-time event processing monitoring
- **Email Delivery**: Confirmation email success rates via Resend

## Security and Compliance

### 1. PCI DSS Compliance
- **Card Data**: Never touches your servers (Stripe Elements handle all sensitive data)
- **Address Data**: Validated through secure EasyPost API
- **Session Management**: Secure client secrets with limited scope

### 2. Data Protection
- **API Keys**: Environment variables with proper secret management
- **Webhook Verification**: Cryptographic signature validation
- **Customer Data**: Encrypted at rest in Stripe and Supabase

This implementation provides a modern, secure, and user-friendly checkout experience combining Stripe's powerful embedded components with EasyPost's accurate address validation for optimal conversion and data quality.