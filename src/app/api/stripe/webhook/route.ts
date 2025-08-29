import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { sendOrderConfirmation, sendPaymentFailed } from '@/lib/api/email';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
});

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature provided' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    // Get webhook secret based on environment
    const webhookSecret = process.env.NODE_ENV === 'development'
      ? process.env.STRIPE_WEBHOOK_SECRET_DEV // From Stripe CLI
      : process.env.STRIPE_WEBHOOK_SECRET; // From Stripe Dashboard


    if (!webhookSecret) {
      throw new Error('Webhook secret not configured');
    }

    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 401 }
    );
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      case 'customer.created':
        console.log('New customer created:', event.data.object.id);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log('Payment succeeded:', paymentIntent.id);

  try {
    // Extract order data from metadata
    const items = JSON.parse(paymentIntent.metadata.items || '[]') as Array<{
      id: string;
      name: string;
      quantity: number;
      price: number;
    }>;
    const subtotal = parseFloat(paymentIntent.metadata.subtotal || '0');
    const shipping = parseFloat(paymentIntent.metadata.shipping || '0');
    const tax = 0; // TODO: Implement tax calculation when API supports it
    const total = paymentIntent.amount / 100;

    // Get customer details
    const customer = await stripe.customers.retrieve(paymentIntent.customer as string) as Stripe.Customer;
    const customerEmail = customer.email!;
    const customerName = customer.name || 'Customer';

    // Generate order number
    const orderNumber = `ORD-${Date.now()}`;

    // Insert into test_orders table (extend existing table structure)
    const { error: dbError } = await supabase
      .from('test_orders')
      .insert({
        customer_email: customerEmail,
        total_amount: total,
        status: 'completed',
        // Note: test_orders table may need to be extended to include more fields
        // or create a new orders table with full schema
      });

    if (dbError) {
      console.error('Database error:', dbError);
      // Don't fail webhook - payment was successful
    }

    // Send order confirmation email
    const shippingAddress = customer.shipping?.address || paymentIntent.shipping?.address;
    if (shippingAddress) {
      console.log(`📧 Attempting to send order confirmation email for ${orderNumber} to ${customerEmail}`);
      
      try {
        const emailResult = await sendOrderConfirmation({
          customerEmail,
          customerName,
          orderNumber,
          items: items.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
          })),
          subtotal,
          tax,
          shipping,
          total,
          shippingAddress: {
            name: shippingAddress.line1 ? customerName : 'No address provided',
            address1: shippingAddress.line1 || 'Address not provided',
            address2: shippingAddress.line2 || undefined,
            city: shippingAddress.city || 'City not provided',
            state: shippingAddress.state || 'State not provided',
            zipCode: shippingAddress.postal_code || 'Zip not provided',
          },
        });

        if (emailResult.success) {
          console.log(`✅ Order confirmation email sent successfully to ${customerEmail}, messageId: ${emailResult.messageId}`);
        } else {
          console.error(`❌ Failed to send order confirmation email to ${customerEmail}: ${emailResult.error}`);
        }
      } catch (emailError) {
        console.error('❌ Exception while sending order confirmation email:', emailError);
        // Don't fail the webhook - payment was successful
      }
    } else {
      console.warn(`⚠️ No shipping address found for payment ${paymentIntent.id}, skipping order confirmation email`);
    }

    console.log(`Order ${orderNumber} created successfully for ${customerEmail}`);

  } catch (error) {
    console.error('Error processing successful payment:', error);
    // Don't throw - payment was successful, just log the error
  }
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log('Payment failed:', paymentIntent.id);

  try {
    // Get customer details
    const customer = await stripe.customers.retrieve(paymentIntent.customer as string) as Stripe.Customer;
    const customerEmail = customer.email!;
    const customerName = customer.name || 'Customer';

    // Generate retry URL (would link back to checkout page)
    const retryUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.mccarty.ventures'}/store/cart?retry=${paymentIntent.id}`;

    // Send payment failed notification
    await sendPaymentFailed({
      customerEmail,
      customerName,
      orderNumber: `PI-${paymentIntent.id.slice(-8)}`,
      amount: paymentIntent.amount / 100,
      retryUrl,
    });

    console.log(`Payment failed notification sent to ${customerEmail}`);

  } catch (error) {
    console.error('Error processing failed payment:', error);
    // Don't throw - this is a best-effort notification
  }
}

// Handle preflight requests for CORS
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}