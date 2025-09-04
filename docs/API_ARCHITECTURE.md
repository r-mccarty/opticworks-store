# API Architecture - HTTP Routes vs Service Layer

This document explains the **two-tier API architecture** used in the OpticWorks platform, clarifying the critical distinction between HTTP API endpoints and service layer functions.

## Overview

The OpticWorks platform uses a **dual-layer API architecture** that separates external communication from internal business logic:

1. **HTTP API Routes** (`/src/app/api/`) - External HTTP endpoints
2. **Service Layer APIs** (`/src/lib/api/`) - Internal TypeScript functions

Understanding this distinction is crucial for effective development and system integration.

---

## 🌐 HTTP API Routes (`/src/app/api/`)

### What They Are
**Next.js API routes** that create actual HTTP endpoints accessible via URLs.

### Key Characteristics
- ✅ **HTTP Endpoints**: Create real URLs (`https://yoursite.com/api/endpoint`)
- ✅ **External Access**: Called by frontend, webhooks, other services
- ✅ **Request/Response**: Handle HTTP requests and return HTTP responses
- ✅ **Network Communication**: Cross-service and client-server communication
- ✅ **Language Agnostic**: Any HTTP client can call them

### File Structure
```
src/app/api/
├── stripe/
│   ├── webhook/route.ts           # POST /api/stripe/webhook
│   ├── create-checkout-session/   # POST /api/stripe/create-checkout-session
│   └── get-session-tax/           # POST /api/stripe/get-session-tax
├── email/
│   └── send/route.ts              # POST /api/email/send
└── shipping/
    └── rates/route.ts             # POST /api/shipping/rates
```

### Implementation Pattern
```typescript
// src/app/api/email/send/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // 1. Parse HTTP request
    const body = await request.json();
    const { to, subject, template, data } = body;
    
    // 2. Validate input
    if (!to || !subject || !template) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // 3. Process business logic
    const result = await processEmail(to, subject, template, data);
    
    // 4. Return HTTP response
    return NextResponse.json({
      success: true,
      messageId: result.id
    });
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}
```

### Usage Examples
```typescript
// Frontend JavaScript/TypeScript
const response = await fetch('/api/email/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    to: 'customer@example.com',
    subject: 'Order Confirmation',
    template: 'order-confirmation',
    data: { orderNumber: 'OP-2024-001' }
  })
});

// External webhook (e.g., Stripe)
// POST https://yoursite.com/api/stripe/webhook
// Body: Stripe event payload

// cURL command
curl -X POST https://yoursite.com/api/shipping/rates \
  -H "Content-Type: application/json" \
  -d '{"items": [...], "address": {...}}'
```

---

## 🔧 Service Layer APIs (`/src/lib/api/`)

### What They Are
**TypeScript functions** that contain business logic and can be imported and called directly within the application.

### Key Characteristics
- ✅ **TypeScript Functions**: Regular functions with full type safety
- ✅ **Internal Access**: Called by other parts of the same application
- ✅ **Direct Invocation**: No HTTP overhead, direct function calls
- ✅ **Business Logic**: Focused on domain-specific operations
- ✅ **Reusable**: Can be called from multiple places (API routes, webhooks, etc.)

### File Structure
```
src/lib/api/
├── email.ts              # Email service functions
├── orders.ts             # Order management functions  
├── billing.ts            # Invoice and payment functions
├── tintingLaws.ts        # Legal compliance functions
└── compatibility.ts      # Vehicle compatibility functions
```

### Implementation Pattern
```typescript
// src/lib/api/email.ts
import { Resend } from 'resend';
import { render } from '@react-email/render';
import OrderConfirmation from '@/lib/email/templates/OrderConfirmation';

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export async function sendOrderConfirmation(orderDetails: {
  customerEmail: string;
  customerName: string;
  orderNumber: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
}): Promise<EmailResult> {
  try {
    // Business logic implementation
    const resend = new Resend(process.env.RESEND_API_KEY);
    const template = render(<OrderConfirmation {...orderDetails} />);
    
    const result = await resend.emails.send({
      from: 'OpticWorks <orders@notifications.optic.works>',
      to: orderDetails.customerEmail,
      subject: `Order Confirmation - ${orderDetails.orderNumber}`,
      html: template
    });
    
    return {
      success: true,
      messageId: result.data?.id
    };
    
  } catch (error) {
    console.error('Email send error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}
```

### Usage Examples
```typescript
// Import and call directly in webhook handler
import { sendOrderConfirmation } from '@/lib/api/email';

export async function POST(request: NextRequest) {
  // ... webhook processing
  
  // Direct function call - no HTTP request
  const emailResult = await sendOrderConfirmation({
    customerEmail: session.customer_details?.email,
    customerName: session.customer_details?.name,
    orderNumber: generateOrderNumber(),
    items: orderItems,
    total: session.amount_total / 100
  });
  
  if (emailResult.success) {
    console.log('Order confirmation sent');
  }
}

// Call from another service function
import { sendOrderConfirmation, sendShippingNotification } from '@/lib/api/email';

export async function processOrderShipment(orderId: string) {
  const order = await getOrder(orderId);
  
  // Multiple service layer calls
  await updateOrderStatus(orderId, 'shipped');
  await sendShippingNotification(order.trackingDetails);
  await logOrderEvent(orderId, 'SHIPPED');
}
```

---

## 🏗️ Architectural Patterns

### Pattern 1: HTTP Route → Service Layer
**Most common pattern**: HTTP routes delegate to service layer functions

```typescript
// HTTP API Route
export async function POST(request: NextRequest) {
  const body = await request.json();
  
  // Delegate to service layer
  const result = await sendOrderConfirmation(body);
  
  return NextResponse.json(result);
}
```

### Pattern 2: Direct Service Layer Usage
**Internal operations**: Service functions call other service functions directly

```typescript
// Webhook handler using service layer directly
export async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  // Store order
  await storeOrder(session);
  
  // Send confirmation email
  await sendOrderConfirmation(extractOrderDetails(session));
  
  // Update inventory
  await updateInventory(session.line_items);
}
```

### Pattern 3: Service Layer Composition
**Complex workflows**: Combining multiple service functions

```typescript
export async function processFullOrder(orderData: OrderData) {
  // Validate order
  const validation = await validateOrder(orderData);
  if (!validation.valid) throw new Error(validation.error);
  
  // Process payment
  const payment = await processPayment(orderData.payment);
  
  // Send confirmation
  await sendOrderConfirmation(orderData.customer);
  
  // Schedule fulfillment
  await scheduleFulfillment(orderData.items);
  
  return { orderId: payment.orderId, status: 'processing' };
}
```

---

## 🎯 When to Use Which Layer

### Use HTTP API Routes When:
- ✅ **Frontend integration** - Forms, user actions, data fetching
- ✅ **External webhooks** - Stripe, payment processors, shipping providers  
- ✅ **Third-party integrations** - External services need to call your API
- ✅ **Microservice communication** - If you split into multiple services
- ✅ **Mobile apps** - React Native or other mobile clients
- ✅ **Cross-origin requests** - Different domains or subdomains

### Use Service Layer When:
- ✅ **Internal business logic** - Complex workflows, data processing
- ✅ **Webhook handlers** - Processing external events (Stripe, etc.)
- ✅ **Background jobs** - Scheduled tasks, email sending, data cleanup
- ✅ **Reusable operations** - Functions used in multiple places
- ✅ **Type safety** - Full TypeScript integration and validation
- ✅ **Performance critical** - No HTTP overhead, direct function calls

---

## 📋 Current Implementation Analysis

### Active HTTP API Routes (13 endpoints)
```typescript
// Production-ready routes
✅ /api/stripe/webhook              // Stripe payment events
✅ /api/stripe/create-checkout-session  // Payment initialization  
✅ /api/stripe/get-session-tax      // Real-time tax calculation
✅ /api/email/send                  // Generic email sending

// Development stubs  
🔄 /api/shipping/rates              // Multi-carrier shipping quotes
🔄 /api/inventory/check             // Stock availability
🔄 /api/analytics/events            // User behavior tracking
🔄 /api/easypost/validate-address   // Address validation
// ... and 5 more stub endpoints
```

### Active Service Layer Functions (6 modules)
```typescript
✅ email.ts         // Email templates and delivery
✅ orders.ts        // Order management and tracking
✅ billing.ts       // Invoice generation and payments  
✅ tintingLaws.ts   // Legal compliance checking
🔄 compatibility.ts // Vehicle compatibility (stub)
🔄 shipping.ts      // Shipping calculations (stub)
```

---

## 🚀 Best Practices

### HTTP API Route Guidelines
1. **Keep routes thin** - Delegate complex logic to service layer
2. **Validate early** - Check inputs at the HTTP boundary
3. **Handle errors gracefully** - Return appropriate HTTP status codes
4. **Use TypeScript interfaces** - Define request/response shapes
5. **Add CORS headers** - If needed for frontend integration

```typescript
export async function POST(request: NextRequest) {
  try {
    // 1. Parse and validate
    const body = await request.json();
    const validatedData = ValidationSchema.parse(body);
    
    // 2. Delegate to service layer
    const result = await serviceFunction(validatedData);
    
    // 3. Return structured response
    return NextResponse.json(result, { status: result.success ? 200 : 400 });
    
  } catch (error) {
    // 4. Handle errors appropriately
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Service Layer Guidelines
1. **Pure business logic** - No HTTP-specific code
2. **Strong typing** - Use interfaces for all parameters and returns
3. **Error handling** - Return structured error objects, don't throw
4. **Composable functions** - Design for reuse and combination
5. **Single responsibility** - Each function should have one clear purpose

```typescript
export interface ServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function processBusinessOperation(
  input: BusinessOperationInput
): Promise<ServiceResult<BusinessOperationOutput>> {
  try {
    // Validate business rules
    const validation = validateBusinessRules(input);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }
    
    // Execute operation
    const result = await executeOperation(input);
    
    return { success: true, data: result };
    
  } catch (error) {
    console.error('Business operation error:', error);
    return { success: false, error: 'Operation failed' };
  }
}
```

---

## 🔍 Real-World Examples

### Example 1: Order Processing Flow

```typescript
// HTTP API Route - External trigger
// POST /api/stripe/webhook
export async function POST(request: NextRequest) {
  const event = parseStripeWebhook(request);
  
  switch (event.type) {
    case 'checkout.session.completed':
      // Delegate to service layer
      await handleOrderCompletion(event.data.object);
      break;
  }
  
  return NextResponse.json({ received: true });
}

// Service Layer - Business logic
async function handleOrderCompletion(session: Stripe.Checkout.Session) {
  // Multiple service layer operations
  const order = await storeOrder(extractOrderDetails(session));
  await sendOrderConfirmation(order);
  await updateInventory(order.items);
  await scheduleShippingLabel(order);
  
  console.log(`Order ${order.number} processed successfully`);
}
```

### Example 2: Email System Architecture

```typescript
// Service Layer - Core email functions
export async function sendOrderConfirmation(orderDetails: OrderDetails) {
  return await sendEmail({
    to: orderDetails.customerEmail,
    template: 'order-confirmation',
    data: orderDetails
  });
}

// HTTP API Route - External email interface  
export async function POST(request: NextRequest) {
  const { to, template, data } = await request.json();
  
  // Route to appropriate service function
  switch (template) {
    case 'order-confirmation':
      return NextResponse.json(await sendOrderConfirmation(data));
    case 'shipping-notification':  
      return NextResponse.json(await sendShippingNotification(data));
  }
}

// Usage in webhook (service layer)
await sendOrderConfirmation(orderDetails);

// Usage from frontend (HTTP API)
fetch('/api/email/send', {
  method: 'POST',
  body: JSON.stringify({ to, template, data })
});
```

### Example 3: Tax Calculation System

```typescript
// Service Layer - Tax calculation logic
export async function calculateTax(items: CartItem[], address: Address): Promise<TaxResult> {
  // Complex tax logic
  const rates = await getStateTaxRates(address.state);
  const taxableAmount = items.filter(item => item.taxable).reduce(...);
  
  return {
    amount: taxableAmount * rates.combined,
    breakdown: generateTaxBreakdown(rates, taxableAmount)
  };
}

// HTTP API Route - Real-time tax calculation
export async function POST(request: NextRequest) {
  const { items, shippingAddress } = await request.json();
  
  // Use Stripe Tax API for production accuracy
  const calculation = await stripe.tax.calculations.create({
    currency: 'usd',
    line_items: items.map(item => ({...})),
    customer_details: { address: shippingAddress }
  });
  
  return NextResponse.json({
    taxAmount: calculation.tax_amount_exclusive / 100,
    total: calculation.amount_total / 100
  });
}
```

---

## 🎯 Summary

### Key Takeaways

1. **HTTP Routes** = External interfaces, handle HTTP requests/responses
2. **Service Layer** = Internal functions, contain business logic  
3. **Best Practice**: HTTP routes should be thin and delegate to service layer
4. **Performance**: Service layer is faster (no HTTP overhead)
5. **Flexibility**: HTTP routes provide external access when needed

### Architecture Benefits

- **Separation of Concerns**: Network handling vs business logic
- **Reusability**: Service functions used by multiple routes
- **Testability**: Easy to unit test service layer functions
- **Performance**: Direct function calls avoid HTTP overhead
- **Type Safety**: Full TypeScript integration in service layer
- **Maintainability**: Clear boundaries between external APIs and internal logic

This two-tier architecture provides the flexibility to expose functionality externally via HTTP when needed, while keeping internal operations fast and type-safe through direct service layer calls.