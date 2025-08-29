# API Stubs Documentation

This document catalogs all API stubs and endpoints in the OpticWorks e-commerce platform. These are development-ready implementations that simulate real backend services while the full infrastructure is being built.

## Overview

The API layer consists of two types of implementations:
1. **Next.js API Routes** (`/src/app/api/`) - HTTP endpoints for frontend integration
2. **Utility API Functions** (`/src/lib/api/`) - Service layer functions for business logic

All endpoints are **production-ready stubs** that simulate realistic delays, error handling, and data validation while returning mock data.

## Next.js API Routes

### Email Services

#### `POST /api/email/send`
**Purpose**: Send templated emails for order confirmations, support responses, etc.

**Request Body**:
```typescript
{
  to: string
  subject: string
  template: 'order-confirmation' | 'shipping-notification' | 'payment-failed' | 'support-response' | 'warranty-claim'
  data: Record<string, unknown>
}
```

**Implementation Status**: 
- ✅ **PRODUCTION READY**: Real email delivery via Resend API
- ✅ **FULLY FUNCTIONAL**: Complete React Email template integration
- ✅ **TESTED**: Verified with real email delivery to test addresses

**Features**:
- ✅ **Real Resend API integration** with `notifications.optic.works` domain
- ✅ **React Email template rendering** with professional styling
- ✅ **Template validation** and error handling
- ✅ **CORS support** for cross-origin requests
- ✅ **Development logging** for debugging
- ✅ **Production error handling** with detailed logging

---

### Analytics & Tracking

#### `POST /api/analytics/events`
**Purpose**: Track user interactions, order events, and product analytics

**Request Body** (Single or Batch):
```typescript
{
  event: string
  properties: Record<string, unknown>
  sessionId?: string
  userId?: string
  userEmail?: string
}
```

**Specialized Event Types**:
- `OrderTrackingEvent`: Order lifecycle tracking
- `ProductAnalyticsEvent`: Product interactions

**Implementation**: In-memory storage (1000 events max), auto-sessionId generation

#### `GET /api/analytics/events`
**Purpose**: Retrieve analytics data with filtering and aggregation

**Query Parameters**:
- `event`: Filter by event type
- `limit`: Max results (default: 50)
- `userId`: Filter by user
- `sessionId`: Filter by session

**Response**: Events with summary statistics and breakdown by event type

---

### Shipping Services

#### `POST /api/shipping/rates`
**Purpose**: Calculate shipping costs for cart items

**Request Body**:
```typescript
{
  zipCode: string
  items: Array<{
    id: string
    weight: number
    dimensions: { length: number; width: number; height: number }
  }>
  subtotal: number
}
```

**Features**:
- Multi-carrier rate comparison (USPS, UPS, FedEx)
- Free shipping threshold ($200+)
- Weight-based pricing
- Delivery time estimates

---

### Tax Calculation

#### `POST /api/tax/calculate`
**Purpose**: Calculate state sales tax for orders

**Request Body**:
```typescript
{
  subtotal: number
  shipping: number
  shippingAddress: {
    state: string
    zipCode: string
    city: string
  }
  items: Array<{
    id: string
    price: number
    quantity: number
    taxable: boolean
  }>
}
```

**Implementation**:
- Complete state tax rate database (50 states + DC)
- Shipping tax exemptions by state
- Taxable vs non-taxable item handling

---

### Inventory Management

#### `POST /api/inventory/check`
**Purpose**: Check stock availability for multiple products

**Request Body**:
```typescript
{
  items: Array<{
    id: string
    quantity: number
  }>
}
```

#### `GET /api/inventory/check?id={productId}`
**Purpose**: Check single product availability

**Mock Inventory**:
- Tesla Model Y/3/S/X films
- Installation kits and tools  
- Stock levels with reserved quantities
- Restock date estimates

**Status Types**: `in_stock`, `low_stock`, `out_of_stock`, `backordered`

---

### Stripe Integration

#### `POST /api/stripe/create-payment-intent`
**Purpose**: Create Stripe payment intent for checkout

**Status**: ✅ Production-ready (see `STRIPE_INTEGRATION.md`)

#### `POST /api/stripe/webhook`
**Purpose**: Handle Stripe webhook events with automatic email confirmations

**Status**: ✅ **PRODUCTION READY** with signature verification and email integration

**Enhanced Features**:
- ✅ **Automatic order confirmation emails** sent on `payment_intent.succeeded`
- ✅ **Payment failed notifications** sent on `payment_intent.payment_failed` 
- ✅ **Real email delivery** via integrated Resend API
- ✅ **Robust error handling** - webhook doesn't fail if email sending fails
- ✅ **Detailed logging** for order processing and email delivery
- ✅ **Complete order data extraction** from Stripe metadata

---

## Service Layer APIs

### Tinting Laws API (`/src/lib/api/tintingLaws.ts`)

**Purpose**: Legal compliance system for window tinting regulations

#### Core Functions:

**`fetchTintingLaws(stateCode: string)`**
- Returns complete tinting law data for state
- VLT requirements by window type
- Penalties, medical exemptions, color restrictions

**`checkTintCompliance(stateCode, vltPercentage, windowType)`**
- Validates VLT percentage against state laws
- Returns compliance status with risk level
- Provides violation details and recommendations

**`fetchAvailableStates()`**
- Returns all states with law data
- Used for state selector components

**`searchTintingLaws(searchTerm)`**
- Search states by name or code
- Used for law lookup interfaces

**Mock Data**: CA, TX, FL, NY with complete law structures

---

### Email Service (`/src/lib/api/email.ts`)

**Purpose**: Production email sending with React Email templates and Resend integration

#### Template Functions:
- `sendOrderConfirmation()` - Order receipt emails ✅ **PRODUCTION READY**
- `sendPaymentFailed()` - Failed payment notifications ✅ **PRODUCTION READY**
- `sendShippingNotification()` - Tracking information
- `sendSupportResponse()` - Customer service replies
- `sendWarrantyClaimConfirmation()` - Warranty processing

**Features**:
- ✅ **Real email delivery** via Resend API
- ✅ **React Email template rendering** with professional styling
- ✅ **Tesla-specific content** in order confirmations
- ✅ **Production error handling** with detailed logging
- ✅ **Webhook integration** for automatic order confirmations
- ✅ **Backup email system** on success page as failsafe

---

### Billing API (`/src/lib/api/billing.ts`)

**Purpose**: Invoice management and payment processing

#### Core Functions:

**`fetchInvoice(identifier, email)`**
- Lookup by order number or invoice number
- Email verification for security

**`generateInvoicePDF(invoiceNumber, email)`**
- PDF generation stub
- Returns mock download URL

**`requestRefund(orderNumber, email, details)`**
- Refund request processing
- 30-day policy validation
- Amount verification

**`retryPayment(orderNumber, email)`**
- Failed payment retry logic
- 70% success simulation

**`submitBillingDispute(orderNumber, email, details)`**
- Dispute submission with file uploads
- Evidence handling stub

**Mock Data**: 2 sample invoices with different statuses

---

### Orders API (`/src/lib/api/orders.ts`)

**Purpose**: Order management and tracking

#### Core Functions:

**`fetchOrderStatus(orderNumber, email)`**
- Complete order details with items
- Shipping/billing addresses
- Order status tracking

**`fetchShippingTracking(trackingNumber)`**
- Shipping status updates
- Location and timestamp tracking
- Multi-carrier support ready

**`requestOrderModification(orderNumber, email, modification)`**
- Address changes, item modifications, cancellations
- Status-based eligibility checks

**`getShippingEstimate(zipCode, items)`**
- Multi-tier shipping options
- Zone-based pricing

**Mock Data**: 2 sample orders with complete tracking history

---

### Compatibility API (`/src/lib/api/compatibility.ts`)

**Purpose**: Vehicle compatibility checking (Tesla focus)

*Note: File exists but content not analyzed in current scope*

---

## Implementation Patterns

### Consistent API Design

**Error Handling**:
```typescript
// Standard error response
return NextResponse.json(
  { error: 'Descriptive error message' },
  { status: 400 }
)
```

**Success Responses**:
```typescript
// Standard success response
return NextResponse.json({
  success: true,
  data: result,
  additionalInfo: metadata
})
```

**Simulated Delays**:
```typescript
// Realistic API delays (300-1200ms)
await new Promise(resolve => setTimeout(resolve, 800))
```

### Data Validation

All endpoints validate:
- Required fields presence
- Data type correctness
- Business logic constraints
- Authentication where needed (email matching)

### CORS Support

All API routes include:
```typescript
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 })
}
```

## Development vs Production

### Development Mode
- Console logging for all API calls
- Mock data responses
- No external service calls
- Email templates rendered for validation

### Production Ready
- Commented production code included
- Environment variable checks
- External service integration points identified
- Error handling for service failures

## Mock Data Quality

### Realistic Business Data
- **Products**: Tesla Model Y/3/S/X focus
- **Geography**: US states with real tax rates
- **Pricing**: Market-realistic pricing
- **Inventory**: Believable stock levels

### Complete Data Models
- Full address structures
- Payment method details
- Order lifecycle states
- Shipping tracking chains

## Future Integration Points

### Database (Supabase)
- All functions include commented Supabase query examples
- Table structure implied by stub data
- Relationship patterns established

### External Services
- **Resend**: Email delivery service
- **Tax APIs**: TaxJar/Avalara integration points
- **Shipping**: UPS/FedEx/USPS API integration
- **Analytics**: Mixpanel/Amplitude ready

### File Storage
- **Cloudflare R2**: File upload endpoints identified
- **PDF Generation**: Invoice/document generation
- **Image Processing**: Product photo management

## Security Considerations

### Authentication
- Email-based verification for sensitive operations
- Order/invoice access limited to customer email
- No exposed sensitive data in responses

### Data Protection
- No PII logging in development
- Secure mock data generation
- Production-ready error handling

### Input Validation
- All endpoints validate input thoroughly
- SQL injection prevention ready
- XSS protection through proper response handling

This comprehensive API stub layer provides a complete development environment while establishing clear integration patterns for production services.