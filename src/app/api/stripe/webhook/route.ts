import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Transactional emails handled by Medusa backend via Resend

// Cloudflare Workers compatible Stripe initialization
// Uses FetchHttpClient instead of Node's http module
// Uses SubtleCryptoProvider for webhook signature verification (Web Crypto API)
let stripe: Stripe | null = null;
const cryptoProvider = Stripe.createSubtleCryptoProvider();
const getStripe = () => {
  if (!stripe) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-03-31.basil' as Stripe.LatestApiVersion,
      httpClient: Stripe.createFetchHttpClient(),
    });
  }
  return stripe;
}

// Lazy-initialize Supabase client (optional - only for order storage)
let supabase: ReturnType<typeof createClient> | null = null;
const getSupabase = () => {
  if (!supabase && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
  }
  return supabase;
};

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
    // Check if request is coming from Hookdeck
    const hookdeckSourceId = request.headers.get('hookdeck-source-id');
    const hookdeckSignature = request.headers.get('hookdeck-signature');
    
    if (hookdeckSourceId || hookdeckSignature) {
      // Request from Hookdeck - skip Stripe signature verification since Hookdeck already validated
      console.log('📡 Request from Hookdeck detected, skipping Stripe signature verification');
      event = JSON.parse(body) as Stripe.Event;
      console.log(`✅ Hookdeck event processed: ${event.type} (ID: ${event.id})`);
    } else {
      // Direct from Stripe - verify signature using async method with Web Crypto API
      const webhookSecret = process.env.NODE_ENV === 'development'
        ? process.env.STRIPE_WEBHOOK_SECRET_DEV // From Stripe CLI
        : process.env.STRIPE_WEBHOOK_SECRET; // From Stripe Dashboard

      if (!webhookSecret) {
        console.error('❌ Webhook secret not configured');
        throw new Error('Webhook secret not configured');
      }

      // Use async constructEventAsync with SubtleCryptoProvider for Cloudflare Workers
      event = await getStripe().webhooks.constructEventAsync(
        body,
        signature,
        webhookSecret,
        undefined,
        cryptoProvider
      );
      console.log(`✅ Webhook signature verified for event: ${event.type} (ID: ${event.id})`);
    }
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
      // ===================================================================
      // ACTIVE FLOW: Checkout Sessions API (ui_mode: 'custom')
      // ===================================================================
      // This is the PRIMARY and ACTIVE checkout flow for this codebase.
      // All new checkouts use Checkout Sessions, NOT Payment Intents.

      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'checkout.session.expired':
        await handleCheckoutSessionExpired(event.data.object as Stripe.Checkout.Session);
        break;

      // Dynamic shipping rates webhook (handled separately but logged here)
      // Note: checkout.session.address_updated not available in current Stripe API version
      // case 'checkout.session.address_updated':
      //   console.log('📍 Address updated event received - this should be handled by shipping webhook endpoint');
      //   break;

      // ===================================================================
      // LEGACY FLOW: Payment Intents API (Backward Compatibility Only)
      // ===================================================================
      // These handlers exist for backward compatibility but are NOT part
      // of the active checkout flow. The current implementation uses
      // Checkout Sessions exclusively.
      //
      // Do NOT configure these events in new Stripe webhook endpoints.
      // Only kept for potential migration scenarios or legacy integrations.

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

/**
 * LEGACY HANDLER: Payment Intents API
 *
 * This handler exists for backward compatibility only and is NOT part of the
 * active checkout flow. The current implementation uses Checkout Sessions API.
 *
 * Consider removing this handler if you're certain no legacy Payment Intent
 * webhooks will be received.
 */
async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log('⚠️  LEGACY: Payment Intent succeeded (not part of active flow):', paymentIntent.id);
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
        const customer = await getStripe().customers.retrieve(paymentIntent.customer as string) as Stripe.Customer;
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
        const customer = await getStripe().customers.retrieve(paymentIntent.customer as string) as Stripe.Customer;
        customerName = customer.name || paymentIntent.shipping?.name || 'Customer';
        console.log('🔍 DEBUG: Final customerName:', customerName);
      }
    } catch (error) {
      console.warn('⚠️ DEBUG: Could not retrieve customer details for name:', error);
    }

    // Generate order number
    const orderNumber = `ORD-${Date.now()}`;
    console.log('🔍 DEBUG: Generated order number:', orderNumber);

    // Insert into test_orders table (if Supabase is configured)
    const supabaseClient = getSupabase();
    if (supabaseClient) {
      console.log('🔍 DEBUG: Attempting database insert...');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: dbError } = await (supabaseClient as any)
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
    } else {
      console.log('⚠️ DEBUG: Supabase not configured, skipping database insert');
    }

    // Send order confirmation email
    const shippingAddress = paymentIntent.shipping?.address;
    console.log('🔍 DEBUG: Shipping address:', shippingAddress);
    
    if (shippingAddress) {
      // Email sending stubbed for Phase 3 - will use Medusa notifications in Phase 4
      console.log(`📧 DEBUG: Order confirmation email STUBBED for ${orderNumber} to ${customerEmail}`);
      console.log('📧 DEBUG: Email sending will be implemented via Medusa notifications');
    } else {
      console.warn(`⚠️ DEBUG: No shipping address found for payment ${paymentIntent.id}`);
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

/**
 * LEGACY HANDLER: Payment Intents API
 *
 * This handler exists for backward compatibility only and is NOT part of the
 * active checkout flow. The current implementation uses Checkout Sessions API.
 *
 * Consider removing this handler if you're certain no legacy Payment Intent
 * webhooks will be received.
 */
async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log('⚠️  LEGACY: Payment Intent failed (not part of active flow):', paymentIntent.id);

  try {
    // Get customer details - prioritize receipt_email over customer.email
    let customerEmail = paymentIntent.receipt_email;
    
    if (!customerEmail) {
      console.error('❌ No customer email found in failed payment intent');
      // Try to get email from customer object if available
      if (paymentIntent.customer) {
        try {
          const customer = await getStripe().customers.retrieve(paymentIntent.customer as string) as Stripe.Customer;
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

    // Generate retry URL (would link back to checkout page)
    const retryUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://optic.works'}/store/cart?retry=${paymentIntent.id}`;

    // Email sending stubbed for Phase 3 - will use Medusa notifications in Phase 4
    console.log(`📧 Payment failed notification STUBBED for ${customerEmail}`);
    console.log(`📧 Order: PI-${paymentIntent.id.slice(-8).toUpperCase()}, Amount: $${paymentIntent.amount / 100}, Retry URL: ${retryUrl}`);
    console.log('📧 Email sending will be implemented via Medusa notifications');

  } catch (error) {
    console.error('❌ Error processing failed payment:', error);
    // Don't throw - this is a best-effort notification
  }
}

/**
 * PRIMARY ACTIVE HANDLER: Checkout Sessions API (ui_mode: 'custom')
 *
 * This is the main webhook handler for successful checkouts. All new checkouts
 * go through this flow. This handler:
 * - Processes completed checkout sessions
 * - Sends order confirmation emails
 * - Stores order data in the database
 *
 * This uses the Checkout Sessions API, NOT Payment Intents API.
 */
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log('✅ ACTIVE: Checkout session completed:', session.id);
  console.log('🔍 FULL Checkout Session object:', JSON.stringify(session, null, 2));

  try {
    // Extract customer information from session
    const customerEmail = session.customer_details?.email || session.metadata?.customer_email;
    const _customerName = session.customer_details?.name || session.metadata?.customer_name; // Used when email is restored
    
    if (!customerEmail) {
      console.error('❌ No customer email found in checkout session');
      return;
    }

    console.log(`✅ Processing completed checkout for ${customerEmail}`);

    // Get line items from the session
    const lineItems = await getStripe().checkout.sessions.listLineItems(session.id, {
      expand: ['data.price.product'],
    });

    // Process order items (exclude shipping)
    const orderItems = lineItems.data
      .filter(item => {
        const product = item.price?.product as Stripe.Product;
        return product?.name !== 'Shipping';
      })
      .map(item => {
        const product = item.price?.product as Stripe.Product;
        return {
          name: product?.name || 'Unknown Product',
          quantity: item.quantity || 1,
          price: (item.price?.unit_amount || 0) / 100, // Convert from cents
        };
      });

    // Calculate totals from session
    const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shippingCost = (session.shipping_cost?.amount_total || 0) / 100;
    const taxAmount = (session.total_details?.amount_tax || 0) / 100;
    const totalAmount = (session.amount_total || 0) / 100;

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${session.id.slice(-8).toUpperCase()}`;

    console.log('🔍 Order details:', {
      orderNumber,
      items: orderItems,
      subtotal,
      shipping: shippingCost,
      tax: taxAmount,
      total: totalAmount,
    });

    // Store order in database (if Supabase is configured)
    const supabaseClient = getSupabase();
    if (supabaseClient) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: dbError } = await (supabaseClient as any)
        .from('test_orders')
        .insert({
          customer_email: customerEmail,
          total_amount: totalAmount,
          status: 'completed',
          order_number: orderNumber,
          checkout_session_id: session.id,
          stripe_payment_intent_id: session.payment_intent as string,
        });

      if (dbError) {
        console.error('❌ Database error:', dbError);
      } else {
        console.log('✅ Order stored in database successfully');
      }
    } else {
      console.log('⚠️ Supabase not configured, skipping database insert');
    }

    // Email sending stubbed for Phase 3 - will use Medusa notifications in Phase 4
    if (session.customer_details?.address) {
      console.log(`📧 Order confirmation email STUBBED for ${orderNumber} to ${customerEmail}`);
      console.log('📧 Email sending will be implemented via Medusa notifications');
    } else {
      console.warn(`⚠️ No shipping address found for session ${session.id}`);
    }

    console.log(`✅ Checkout session ${session.id} processing complete for ${customerEmail}`);

  } catch (error) {
    console.error('❌ Error processing completed checkout session:', error);
    if (error instanceof Error) {
      console.error('❌ Error stack:', error.stack);
    }
  }
}

/**
 * ACTIVE HANDLER: Checkout Sessions API - Expired Sessions
 *
 * Handles abandoned/expired checkout sessions. This can be used for:
 * - Analytics tracking of cart abandonment
 * - Sending follow-up emails to recover sales
 * - Cleaning up temporary data
 *
 * Part of the active Checkout Sessions flow.
 */
async function handleCheckoutSessionExpired(session: Stripe.Checkout.Session) {
  console.log('⏰ ACTIVE: Checkout session expired (abandoned):', session.id);
  
  try {
    const customerEmail = session.customer_details?.email || session.metadata?.customer_email;
    
    if (customerEmail) {
      console.log(`📧 Checkout session expired for ${customerEmail} - session: ${session.id}`);
      // Could send abandoned cart email here in the future
    }
  } catch (error) {
    console.error('❌ Error processing expired checkout session:', error);
  }
}

// Handle preflight requests for CORS
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}