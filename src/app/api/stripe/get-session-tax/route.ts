import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

interface TaxBreakdownItem {
  jurisdiction?: { display_name?: string };
  tax_rate_details?: { percentage_decimal?: number };
  tax_amount?: number;
}

let stripe: Stripe | null = null;
const getStripe = () => {
  if (!stripe) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-07-30.basil',
    });
  }
  return stripe;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, shippingAddress } = body;

    if (!items || !items.length || !shippingAddress) {
      return NextResponse.json(
        { error: 'Missing required fields: items and shippingAddress' },
        { status: 400 }
      );
    }

    console.log('💰 Calculating tax using Stripe Tax API for address:', shippingAddress);

    // Convert items to Stripe Tax line items
    const lineItems = items.map((item: { id: string; price: number; quantity: number }) => ({
      amount: Math.round(item.price * item.quantity * 100), // Convert to cents
      reference: item.id,
      tax_behavior: 'exclusive' as const,
      tax_code: 'txcd_99999999', // General - Tangible Goods
    }));

    // Use Stripe Tax API for calculation
    const calculation = await getStripe().tax.calculations.create({
      currency: 'usd',
      line_items: lineItems,
      customer_details: {
        address: {
          line1: shippingAddress.line1 || '123 Main St',
          city: shippingAddress.city,
          state: shippingAddress.state,
          postal_code: shippingAddress.postal_code,
          country: shippingAddress.country || 'US',
        },
        address_source: 'shipping',
      },
      shipping_cost: {
        amount: 0, // Free shipping
        tax_behavior: 'exclusive',
      },
    });

    console.log('📊 Stripe Tax calculation result:', calculation);

    // Extract tax information
    const taxAmount = calculation.tax_amount_exclusive ? 
      calculation.tax_amount_exclusive / 100 : 0; // Convert from cents

    const subtotal = calculation.amount_total ? 
      (calculation.amount_total - calculation.tax_amount_exclusive) / 100 : 0;

    const total = calculation.amount_total ? 
      calculation.amount_total / 100 : 0;

    return NextResponse.json({
      success: true,
      taxAmount,
      subtotal,
      total,
      taxBreakdown: calculation.tax_breakdown?.map(breakdown => {
        const item = breakdown as unknown as TaxBreakdownItem;
        return {
          jurisdiction: item.jurisdiction?.display_name || 'Unknown',
          rate: item.tax_rate_details?.percentage_decimal || 0,
          taxAmount: item.tax_amount ? item.tax_amount / 100 : 0,
        };
      }),
      calculationId: calculation.id,
    });

  } catch (error) {
    console.error('❌ Error retrieving session tax:', error);
    
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to retrieve session tax information' },
      { status: 500 }
    );
  }
}

// Handle preflight requests for CORS
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}