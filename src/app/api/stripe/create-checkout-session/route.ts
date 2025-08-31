import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
});

export interface CreateCheckoutSessionRequest {
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  customerInfo: {
    email: string;
    name: string;
  };
  shippingAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as CreateCheckoutSessionRequest;
    const { items, customerInfo, shippingAddress } = body;

    // Validate required fields
    if (!items || !items.length || !customerInfo || !shippingAddress) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create or retrieve customer
    let customer: Stripe.Customer;
    const existingCustomers = await stripe.customers.list({
      email: customerInfo.email,
      limit: 1,
    });

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
      
      // Update customer info and shipping address
      await stripe.customers.update(customer.id, {
        name: customerInfo.name,
        shipping: {
          name: customerInfo.name,
          address: shippingAddress,
        },
      });
    } else {
      customer = await stripe.customers.create({
        email: customerInfo.email,
        name: customerInfo.name,
        shipping: {
          name: customerInfo.name,
          address: shippingAddress,
        },
      });
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

    // Calculate shipping cost (free over $200)
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shippingCost = subtotal > 200 ? 0 : 15.99;

    // Add shipping as line item if not free
    if (shippingCost > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Shipping',
            description: 'Standard shipping (Free over $200)',
          },
          unit_amount: Math.round(shippingCost * 100),
        },
        quantity: 1,
      });
    }

    // Create checkout session with embedded components
    const checkoutSession = await stripe.checkout.sessions.create({
      ui_mode: 'custom', // This enables Embedded Components
      customer: customer.id,
      line_items: lineItems,
      mode: 'payment',
      currency: 'usd',
      
      // Shipping configuration
      shipping_address_collection: {
        allowed_countries: ['US'],
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: {
              amount: Math.round(shippingCost * 100),
              currency: 'usd',
            },
            display_name: subtotal > 200 ? 'Free Shipping' : 'Standard Shipping',
            delivery_estimate: {
              minimum: {
                unit: 'business_day',
                value: 3,
              },
              maximum: {
                unit: 'business_day',
                value: 7,
              },
            },
          },
        },
      ],

      // Tax calculation
      automatic_tax: {
        enabled: true,
      },

      // Return URL for post-payment redirect
      return_url: `${request.headers.get('origin')}/store/cart/success?session_id={CHECKOUT_SESSION_ID}`,

      // Additional metadata
      metadata: {
        subtotal: subtotal.toString(),
        shipping_cost: shippingCost.toString(),
        items_count: items.length.toString(),
        customer_email: customerInfo.email,
        customer_name: customerInfo.name,
      },

      // Custom fields for additional order information
      custom_fields: [
        {
          key: 'order_notes',
          label: {
            type: 'custom',
            custom: 'Order Notes (Optional)',
          },
          type: 'text',
          optional: true,
        },
      ],

      // Payment method configuration
      payment_method_configuration: undefined, // Use account defaults
      payment_method_types: ['card', 'us_bank_account'], // Add bank transfers
      
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

    // Calculate final totals for response
    const totalAmount = subtotal + shippingCost;

    return NextResponse.json({
      clientSecret: checkoutSession.client_secret,
      checkoutSessionId: checkoutSession.id,
      customerId: customer.id,
      totals: {
        subtotal: subtotal,
        shipping: shippingCost,
        tax: 0, // Will be calculated by Stripe Tax
        total: totalAmount, // Base total, tax will be added by Stripe
      },
      sessionDetails: {
        mode: checkoutSession.mode,
        currency: checkoutSession.currency,
        customer_email: customerInfo.email,
        return_url: checkoutSession.return_url,
      },
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