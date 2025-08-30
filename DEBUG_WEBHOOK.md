# Webhook Debug Information

## What the Debug Logs Will Show

The webhook handler now has comprehensive debug logging that will reveal:

### 1. Event Reception
- ✅ Full webhook event JSON structure
- ✅ Event type being processed
- ✅ Event ID and timestamp

### 2. PaymentIntent Data Deep Dive
- ✅ Complete PaymentIntent object structure  
- ✅ All possible email sources:
  - `paymentIntent.receipt_email` 
  - `paymentIntent.customer` (and retrieved customer object)
  - `paymentIntent.metadata.customer_email`
- ✅ Shipping information and address
- ✅ All metadata fields

### 3. Email Extraction Chain
- ✅ Step-by-step email extraction attempts
- ✅ Which email source was successful (if any)
- ✅ Final email address used for sending

### 4. Email Service Calls
- ✅ Detailed Resend API call information
- ✅ Environment variable validation
- ✅ Template rendering status
- ✅ Resend API response/error details

## Expected Debug Output

When a payment succeeds, you should see logs like:

```
🔔 Stripe webhook received
✅ Webhook signature verified for event: payment_intent.succeeded (ID: pi_xxx)
🔄 Processing webhook event: payment_intent.succeeded
🔍 Full event data: { ... complete event JSON ... }
💳 Payment succeeded: pi_xxx
🔍 FULL PaymentIntent object: { ... complete payment intent JSON ... }
🔍 DEBUG: Checking all email sources...
🔍 paymentIntent.receipt_email: null
🔍 paymentIntent.customer: cus_xxx
🔍 DEBUG: receipt_email is null, trying customer object...
🔍 DEBUG: Retrieved customer object: { ... customer data ... }
🔍 DEBUG: Customer email from customer object: customer@example.com
✅ DEBUG: Final customerEmail to use: customer@example.com
📧 DEBUG: Attempting to send order confirmation email...
📧 Attempting to send order-confirmation email to customer@example.com
📧 Email details: { to: '...', subject: '...', template: '...', from: '...' }
🔧 Rendering order-confirmation template...
📤 Calling Resend API to send email to customer@example.com...
✅ Email sent successfully via Resend, messageId: xxx
```

## What to Look For

1. **If no webhook received**: Check Stripe Dashboard webhook configuration
2. **If signature fails**: Check `STRIPE_WEBHOOK_SECRET` environment variable
3. **If email is null everywhere**: PaymentIntent missing customer data - check payment flow
4. **If Resend fails**: Check `RESEND_API_KEY` and `NEXT_PUBLIC_FROM_EMAIL` 
5. **If template fails**: Check React Email template imports

## Testing Steps

1. **Start dev server**: `npm run dev`
2. **Forward webhooks**: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
3. **Trigger test**: `stripe trigger payment_intent.succeeded`
4. **Check logs**: Look for the debug output chain above

The debug logs will show exactly where the failure occurs in the email delivery pipeline.