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

  console.log('🔔 Stripe webhook received');

  if (!signature) {
    console.error('❌ No Stripe signature provided');
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
      console.error('❌ Webhook secret not configured');
      throw new Error('Webhook secret not configured');
    }

    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    console.log(`✅ Webhook signature verified for event: ${event.type} (ID: ${event.id})`);
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 401 }
    );
  }

  try {
    console.log(`🔄 Processing webhook event: ${event.type}`);
    console.log('🔍 Full event data:', JSON.stringify(event, null, 2));
    
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      case 'customer.created':
        console.log('👤 New customer created:', event.data.object.id);
        break;

      default:
        console.log(`⚠️ Unhandled event type: ${event.type}`);
        console.log('🔍 Unhandled event object:', JSON.stringify(event.data.object, null, 2));
    }

    console.log(`✅ Webhook event ${event.type} processed successfully`);
    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('❌ Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log('💳 Payment succeeded:', paymentIntent.id);
  console.log('🔍 FULL PaymentIntent object:', JSON.stringify(paymentIntent, null, 2));

  try {
    // Debug all possible email sources
    console.log('🔍 DEBUG: Checking all email sources...');
    console.log('🔍 paymentIntent.receipt_email:', paymentIntent.receipt_email);
    console.log('🔍 paymentIntent.customer:', paymentIntent.customer);
    console.log('🔍 paymentIntent.shipping:', paymentIntent.shipping);
    console.log('🔍 paymentIntent.metadata:', paymentIntent.metadata);

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

    console.log('🔍 DEBUG: Extracted metadata:');
    console.log('- Items:', items);
    console.log('- Subtotal:', subtotal);
    console.log('- Shipping:', shipping);
    console.log('- Total:', total);

    // Get customer details - prioritize receipt_email over customer.email
    let customerEmail = paymentIntent.receipt_email;
    console.log('🔍 DEBUG: Initial customerEmail from receipt_email:', customerEmail);
    
    // If receipt_email is null, try to get from customer object
    if (!customerEmail && paymentIntent.customer) {
      console.log('🔍 DEBUG: receipt_email is null, trying customer object...');
      try {
        const customer = await stripe.customers.retrieve(paymentIntent.customer as string) as Stripe.Customer;
        console.log('🔍 DEBUG: Retrieved customer object:', JSON.stringify(customer, null, 2));
        customerEmail = customer.email;
        console.log('🔍 DEBUG: Customer email from customer object:', customerEmail);
      } catch (error) {
        console.error('❌ DEBUG: Could not retrieve customer details:', error);
      }
    }

    // Check metadata for email as last resort
    if (!customerEmail && paymentIntent.metadata.customer_email) {
      customerEmail = paymentIntent.metadata.customer_email;
      console.log('🔍 DEBUG: Found email in metadata:', customerEmail);
    }
    
    if (!customerEmail) {
      console.error('❌ DEBUG: No customer email found anywhere in PaymentIntent');
      console.error('❌ DEBUG: Checked receipt_email, customer object, and metadata');
      console.error('❌ DEBUG: CRITICAL: Cannot send confirmation email without customer email');
      return; // Exit early - cannot send email without email address
    }

    console.log('✅ DEBUG: Final customerEmail to use:', customerEmail);

    // Get customer name from shipping info first, then customer object, then fallback
    let customerName = paymentIntent.shipping?.name || 'Customer';
    console.log('🔍 DEBUG: Initial customerName from shipping:', customerName);
    
    try {
      if (paymentIntent.customer) {
        const customer = await stripe.customers.retrieve(paymentIntent.customer as string) as Stripe.Customer;
        customerName = customer.name || paymentIntent.shipping?.name || 'Customer';
        console.log('🔍 DEBUG: Final customerName:', customerName);
      }
    } catch (error) {
      console.warn('⚠️ DEBUG: Could not retrieve customer details for name:', error);
    }

    // Generate order number
    const orderNumber = `ORD-${Date.now()}`;
    console.log('🔍 DEBUG: Generated order number:', orderNumber);

    // Insert into test_orders table
    console.log('🔍 DEBUG: Attempting database insert...');
    const { error: dbError } = await supabase
      .from('test_orders')
      .insert({
        customer_email: customerEmail,
        total_amount: total,
        status: 'completed',
      });

    if (dbError) {
      console.error('❌ DEBUG: Database error:', dbError);
    } else {
      console.log('✅ DEBUG: Database insert successful');
    }

    // Send order confirmation email
    const shippingAddress = paymentIntent.shipping?.address;
    console.log('🔍 DEBUG: Shipping address:', shippingAddress);
    
    if (shippingAddress) {
      console.log(`📧 DEBUG: Attempting to send order confirmation email for ${orderNumber} to ${customerEmail}`);
      
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

        console.log('🔍 DEBUG: Email result:', emailResult);

        if (emailResult.success) {
          console.log(`✅ DEBUG: Order confirmation email sent successfully to ${customerEmail}, messageId: ${emailResult.messageId}`);
        } else {
          console.error(`❌ DEBUG: Failed to send order confirmation email to ${customerEmail}: ${emailResult.error}`);
        }
      } catch (emailError) {
        console.error('❌ DEBUG: Exception while sending order confirmation email:', emailError);
      }
    } else {
      console.warn(`⚠️ DEBUG: No shipping address found for payment ${paymentIntent.id}, skipping order confirmation email`);
    }

    console.log(`✅ DEBUG: Order ${orderNumber} processing complete for ${customerEmail}`);

  } catch (error) {
    console.error('❌ DEBUG: Error processing successful payment:', error);
    // Log the full error stack for debugging
    if (error instanceof Error) {
      console.error('❌ DEBUG: Error stack:', error.stack);
    }
  }
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log('💸 Payment failed:', paymentIntent.id);

  try {
    // Get customer details - prioritize receipt_email over customer.email
    let customerEmail = paymentIntent.receipt_email;
    
    if (!customerEmail) {
      console.error('❌ No customer email found in failed payment intent');
      // Try to get email from customer object if available
      if (paymentIntent.customer) {
        try {
          const customer = await stripe.customers.retrieve(paymentIntent.customer as string) as Stripe.Customer;
          if (customer.email) {
            console.log('✅ Found customer email from customer object:', customer.email);
            customerEmail = customer.email;
          } else {
            console.warn('⚠️ No email found in customer object either, skipping payment failed notification');
            return;
          }
        } catch (customerError) {
          console.error('❌ Could not retrieve customer for failed payment:', customerError);
          return;
        }
      } else {
        console.warn('⚠️ No customer reference found, skipping payment failed notification');
        return;
      }
    }

    // Get customer name from shipping info first, then customer object, then fallback
    let customerName = paymentIntent.shipping?.name || 'Customer';
    
    try {
      if (paymentIntent.customer) {
        const customer = await stripe.customers.retrieve(paymentIntent.customer as string) as Stripe.Customer;
        customerName = customer.name || paymentIntent.shipping?.name || 'Customer';
      }
    } catch (error) {
      console.warn('⚠️ Could not retrieve customer details for failed payment:', error);
      // Use shipping name as fallback
    }

    // Generate retry URL (would link back to checkout page)
    const retryUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://optic.works'}/store/cart?retry=${paymentIntent.id}`;

    console.log(`📧 Sending payment failed notification to ${customerEmail}`);

    // Send payment failed notification
    try {
      const emailResult = await sendPaymentFailed({
        customerEmail,
        customerName,
        orderNumber: `PI-${paymentIntent.id.slice(-8).toUpperCase()}`,
        amount: paymentIntent.amount / 100,
        retryUrl,
      });

      if (emailResult.success) {
        console.log(`✅ Payment failed notification sent successfully to ${customerEmail}, messageId: ${emailResult.messageId}`);
      } else {
        console.error(`❌ Failed to send payment failed notification to ${customerEmail}: ${emailResult.error}`);
        // Don't throw - this is a best-effort notification
      }
    } catch (emailError) {
      console.error('❌ Exception while sending payment failed notification:', emailError);
      // Don't throw - this is a best-effort notification
    }

  } catch (error) {
    console.error('❌ Error processing failed payment:', error);
    // Don't throw - this is a best-effort notification
  }
}

// Handle preflight requests for CORS
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}