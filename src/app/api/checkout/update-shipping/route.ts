import { NextRequest, NextResponse } from 'next/server';
import { updateCart, getShippingOptions, addShippingMethod, createMedusaPaymentSession } from '@/lib/api/medusa';
import type { ShippingRateResponse } from '@/hooks/useShippingRates';

/**
 * Request body for update-shipping API
 */
interface UpdateShippingRequest {
  cartId: string;
  shippingRate: ShippingRateResponse;
  shipmentId: string;
}

/**
 * Response from update-shipping API
 */
interface UpdateShippingResponse {
  success: boolean;
  clientSecret?: string;
  error?: string;
}

/**
 * POST /api/checkout/update-shipping
 *
 * Updates the cart with the selected shipping rate and refreshes the payment session.
 * This ensures the Stripe Payment Intent has the correct total including shipping.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as UpdateShippingRequest;
    const { cartId, shippingRate, shipmentId } = body;

    if (!cartId || !shippingRate) {
      return NextResponse.json<UpdateShippingResponse>(
        { success: false, error: 'Missing required fields: cartId, shippingRate' },
        { status: 400 }
      );
    }

    console.log('[update-shipping] Updating cart:', cartId, 'with rate:', {
      carrier: shippingRate.carrier,
      service: shippingRate.service,
      rate: shippingRate.rate,
    });

    // Get available Medusa shipping options
    const shippingOptions = await getShippingOptions(cartId);
    console.log('[update-shipping] Available Medusa shipping options:', shippingOptions.length);

    if (shippingOptions.length === 0) {
      return NextResponse.json<UpdateShippingResponse>(
        { success: false, error: 'No shipping options available for this cart' },
        { status: 400 }
      );
    }

    // Use the first shipping option (our manual fulfillment provider)
    // The actual shipping rate from EasyPost will be stored in metadata
    const shippingOptionId = shippingOptions[0].id;

    // Add shipping method to cart
    await addShippingMethod(cartId, shippingOptionId);
    console.log('[update-shipping] Shipping method added to cart');

    // Store EasyPost shipping details in cart metadata
    // This preserves the real shipping rate and shipment ID for later label generation
    await updateCart(cartId, {
      metadata: {
        easypost_shipment_id: shipmentId,
        easypost_rate_id: shippingRate.id,
        shipping_carrier: shippingRate.carrier,
        shipping_service: shippingRate.service,
        shipping_rate: shippingRate.rate,
        shipping_currency: shippingRate.currency,
        shipping_estimated_days: shippingRate.estimatedDays,
      },
    });
    console.log('[update-shipping] Cart metadata updated with EasyPost details');

    // Create a new payment session to get updated total
    // Note: Medusa's payment session includes the cart total which now has shipping
    const session = await createMedusaPaymentSession(cartId);

    if (!session.clientSecret) {
      return NextResponse.json<UpdateShippingResponse>(
        { success: false, error: 'Failed to refresh payment session' },
        { status: 500 }
      );
    }

    console.log('[update-shipping] Payment session refreshed');

    return NextResponse.json<UpdateShippingResponse>({
      success: true,
      clientSecret: session.clientSecret,
    });

  } catch (error) {
    console.error('[update-shipping] Error:', error);
    return NextResponse.json<UpdateShippingResponse>(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update shipping',
      },
      { status: 500 }
    );
  }
}
