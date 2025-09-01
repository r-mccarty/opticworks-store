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

export interface CreatePaymentIntentRequest {
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
    const body = await request.json() as CreatePaymentIntentRequest;
    const { items, customerInfo, shippingAddress } = body;

    // Validate required fields
    if (!items || !items.length || !customerInfo || !shippingAddress) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Calculate subtotal
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Calculate shipping (flat rate for now)
    const shippingCost = subtotal > 200 ? 0 : 15.99; // Free shipping over $200

    // Create or retrieve customer
    let customer: Stripe.Customer;
    const existingCustomers = await getStripe().customers.list({
      email: customerInfo.email,
      limit: 1,
    });

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
    } else {
      customer = await getStripe().customers.create({
        email: customerInfo.email,
        name: customerInfo.name,
        shipping: {
          name: customerInfo.name,
          address: shippingAddress,
        },
      });
    }

    // Create payment intent with automatic tax calculation
    const paymentIntent = await getStripe().paymentIntents.create({
      amount: Math.round((subtotal + shippingCost) * 100), // Amount in cents
      currency: 'usd',
      customer: customer.id,
      automatic_payment_methods: {
        enabled: true,
      },
      shipping: {
        name: customerInfo.name,
        address: shippingAddress,
      },
      metadata: {
        subtotal: subtotal.toString(),
        shipping: shippingCost.toString(),
        items: JSON.stringify(items.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        }))),
      },
    });

    // Calculate final totals (including any tax calculated by Stripe)
    const totalAmount = paymentIntent.amount / 100;
    const taxAmount = 0; // TODO: Implement tax calculation when API supports it

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      customerId: customer.id,
      totals: {
        subtotal,
        shipping: shippingCost,
        tax: taxAmount,
        total: totalAmount,
      },
    });

  } catch (error) {
    console.error('Stripe Payment Intent creation error:', error);
    
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}

// Handle preflight requests for CORS
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}