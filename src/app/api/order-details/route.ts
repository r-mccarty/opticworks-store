import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Define the structure of the successful order data response
interface OrderData {
  orderId: string;
  customerName: string | null;
  customerEmail: string | null;
  total: number;
}

// Initialize Stripe with the secret key from environment variables.
// The exclamation mark (!) asserts that the environment variable is non-null.
// This is safe because the server should not start if the key is missing.
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
  typescript: true,
});

export async function GET(request: NextRequest) {
  // Extract the 'payment_intent' ID from the request's URL search parameters.
  const searchParams = request.nextUrl.searchParams;
  const paymentIntentId = searchParams.get('payment_intent');

  // If the paymentIntentId is missing, return a 400 Bad Request response.
  if (!paymentIntentId) {
    return NextResponse.json(
      { error: 'Bad Request: The "payment_intent" query parameter is required.' },
      { status: 400 }
    );
  }

  try {
    // Query Stripe for checkout sessions associated with the given payment_intent.
    // We expand 'customer' to ensure we get full customer details if needed,
    // though `customer_details` is typically sufficient.
    const sessions = await stripe.checkout.sessions.list({
      payment_intent: paymentIntentId,
      expand: ['customer'],
    });

    // The query should return exactly one session. If not, the order is not found.
    if (sessions.data.length !== 1) {
      return NextResponse.json(
        { error: 'Not Found: No matching order found for the provided payment intent.' },
        { status: 404 }
      );
    }

    const session = sessions.data[0];

    // Ensure the necessary session details are present before constructing the response.
    if (session.amount_total === null || !session.customer_details) {
       return NextResponse.json(
        { error: 'Not Found: Order data is incomplete.' },
        { status: 404 }
      );
    }

    // Construct the final order data object.
    const orderData: OrderData = {
      orderId: session.id,
      customerName: session.customer_details.name,
      customerEmail: session.customer_details.email,
      // Convert the 'amount_total' from cents to a dollar value.
      total: session.amount_total / 100,
    };

    // Return the successfully retrieved and formatted order data.
    return NextResponse.json(orderData, { status: 200 });

  } catch (error) {
    // Log the error for server-side debugging.
    console.error('Error fetching order details from Stripe:', error);

    // For Stripe-specific errors, log additional details.
    if (error instanceof Stripe.errors.StripeError) {
      console.error(`Stripe Error (${error.type}): ${error.message}`);
    }

    // Return a generic 500 Internal Server Error to the client.
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
