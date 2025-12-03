import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

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

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  console.log('🚢 Shipping rates webhook received');

  if (!signature) {
    console.error('❌ No Stripe signature provided');
    return NextResponse.json(
      { error: 'No signature provided' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    // Check if request is coming from Hookdeck (headers use X- prefix)
    const hookdeckSignature = request.headers.get('x-hookdeck-signature');
    const hookdeckVerified = request.headers.get('x-hookdeck-verified');

    if (hookdeckSignature || hookdeckVerified === 'true') {
      // Request from Hookdeck - skip Stripe signature verification since Hookdeck already validated
      console.log('📡 Shipping webhook from Hookdeck detected, skipping Stripe signature verification');
      event = JSON.parse(body) as Stripe.Event;
      console.log(`✅ Hookdeck shipping event processed: ${event.type} (ID: ${event.id})`);
    } else {
      // Direct from Stripe - verify signature using async method with Web Crypto API
      const webhookSecret = process.env.NODE_ENV === 'development'
        ? process.env.STRIPE_SHIPPING_WEBHOOK_SECRET_DEV // From Stripe CLI
        : process.env.STRIPE_SHIPPING_WEBHOOK_SECRET; // From Stripe Dashboard

      if (!webhookSecret) {
        console.error('❌ Shipping webhook secret not configured');
        throw new Error('Shipping webhook secret not configured');
      }

      // Use async constructEventAsync with SubtleCryptoProvider for Cloudflare Workers
      event = await getStripe().webhooks.constructEventAsync(
        body,
        signature,
        webhookSecret,
        undefined,
        cryptoProvider
      );
      console.log(`✅ Shipping webhook signature verified for event: ${event.type} (ID: ${event.id})`);
    }
  } catch (err) {
    console.error('❌ Shipping webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 401 }
    );
  }

  try {
    console.log(`🔄 Processing shipping webhook event: ${event.type}`);
    
    switch (event.type) {
      // TODO: Implement dynamic shipping rates when address is updated
      // case 'checkout.session.async_payment_succeeded':
      //   await handleAddressUpdated(event.data.object as Stripe.Checkout.Session);
      //   break;

      default:
        console.log(`⚠️ Unhandled shipping webhook event type: ${event.type}`);
        console.log('📝 Note: Dynamic shipping rates webhook not yet implemented');
    }

    console.log(`✅ Shipping webhook event ${event.type} processed successfully`);
    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('❌ Shipping webhook handler error:', error);
    return NextResponse.json(
      { error: 'Shipping webhook handler failed' },
      { status: 500 }
    );
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function handleAddressUpdated(session: Stripe.Checkout.Session) {
  console.log('📍 Address updated for session:', session.id);
  
  try {
    // Extract shipping address from session
    const shippingAddress = session.customer_details?.address;
    
    if (!shippingAddress) {
      console.log('⚠️ No shipping address in session, skipping shipping rate calculation');
      return;
    }

    console.log('🔍 Shipping address:', shippingAddress);

    // Get line items to calculate shipping based on weight/dimensions
    const lineItems = await getStripe().checkout.sessions.listLineItems(session.id);
    const items = lineItems.data.map(item => ({
      id: item.price?.metadata?.product_id || 'unknown',
      weight: 1, // Default weight in pounds
      dimensions: {
        length: 12,
        width: 8,
        height: 2,
      }
    }));

    // Calculate shipping rates using mock EasyPost logic
    const shippingRates = await calculateShippingRates(shippingAddress.postal_code || '', items);

    // Update the checkout session with dynamic shipping options
    await getStripe().checkout.sessions.update(session.id, {
      shipping_options: shippingRates.map(rate => ({
        shipping_rate_data: {
          type: 'fixed_amount',
          fixed_amount: {
            amount: Math.round(rate.rate * 100), // Convert to cents
            currency: 'usd',
          },
          display_name: `${rate.carrier} ${rate.service}`,
          delivery_estimate: {
            minimum: {
              unit: 'business_day',
              value: parseInt(rate.estimatedDays.split('-')[0]) || 1,
            },
            maximum: {
              unit: 'business_day',
              value: parseInt(rate.estimatedDays.split('-')[1]) || parseInt(rate.estimatedDays) || 7,
            },
          },
          metadata: {
            carrier: rate.carrier,
            service: rate.service,
            tracking_included: rate.trackingIncluded.toString(),
          },
        },
      })),
    });

    console.log(`✅ Updated session ${session.id} with ${shippingRates.length} shipping options`);

  } catch (error) {
    console.error('❌ Error handling address update:', error);
    throw error; // Re-throw to trigger webhook retry
  }
}

// Mock shipping rate calculation (replace with real EasyPost API call)
async function calculateShippingRates(zipCode: string, items: Array<{id: string; weight: number; dimensions: {length: number; width: number; height: number}}>)  {
  console.log('📦 Calculating shipping rates for:', { zipCode, itemCount: items.length });
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  const baseRate = Math.max(5.99, totalWeight * 0.75);
  
  return [
    {
      carrier: 'USPS',
      service: 'Ground Advantage',
      rate: baseRate,
      estimatedDays: '3-5',
      trackingIncluded: true
    },
    {
      carrier: 'UPS',
      service: 'Ground',
      rate: baseRate + 2.50,
      estimatedDays: '2-4',
      trackingIncluded: true
    },
    {
      carrier: 'FedEx',
      service: '2Day',
      rate: baseRate * 2.5,
      estimatedDays: '2',
      trackingIncluded: true
    },
  ];
}

// Handle preflight requests for CORS
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}