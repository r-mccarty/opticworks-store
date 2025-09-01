import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

let stripe: Stripe | null = null;
const getStripe = () => {
  if (!stripe) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-08-27.basil',
    });
  }
  return stripe;
}

export interface CreateCheckoutSessionRequest {
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as CreateCheckoutSessionRequest;
    const { items } = body;

    // Validate required fields
    if (!items || !items.length) {
      return NextResponse.json(
        { error: 'Missing required fields: items' },
        { status: 400 }
      );
    }


    // Convert cart items to Stripe line items
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
          metadata: {
            product_id: item.id,
          },
        },
        unit_amount: Math.round(item.price * 100), // Convert to cents
      },
      quantity: item.quantity,
    }));


    // Create checkout session for Option B - Elements with Checkout Sessions API
    const checkoutSession = await getStripe().checkout.sessions.create({
      ui_mode: 'custom', // Enable custom UI for Elements integration
      line_items: lineItems,
      mode: 'payment',
      
      // Shipping configuration - let Stripe collect address and trigger webhook for dynamic rates
      shipping_address_collection: {
        allowed_countries: ['US'],
      },

      // Tax calculation - automatic
      automatic_tax: {
        enabled: true,
      },

      // Note: success_url and cancel_url not allowed with ui_mode: 'custom'
      // Custom UI handles success/failure via confirmation result

      // Metadata for webhook processing
      metadata: {
        items_count: items.length.toString(),
        order_type: 'ecommerce',
        source: 'website',
        // Store item data for shipping calculation
        items_data: JSON.stringify(items.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          weight: 1, // Default weight - would come from product data in real app
        }))),
      },

      // Payment method configuration
      payment_method_types: ['card'],
      
      // Invoice creation for record keeping
      invoice_creation: {
        enabled: true,
        invoice_data: {
          description: `OpticWorks Order - ${items.length} item${items.length > 1 ? 's' : ''}`,
          metadata: {
            order_type: 'ecommerce',
            source: 'website',
          },
          custom_fields: [
            {
              name: 'Order Items',
              value: items.map(item => `${item.name} (x${item.quantity})`).join(', '),
            },
          ],
        },
      },
    });

    return NextResponse.json({
      clientSecret: checkoutSession.client_secret,
      sessionId: checkoutSession.id,
      success: true,
    });

  } catch (error) {
    console.error('Stripe Checkout Session creation error:', error);
    
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

// Handle preflight requests for CORS
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}