import { NextRequest, NextResponse } from 'next/server';
import { purchaseLabel, type PurchasedLabel } from '@/lib/api/easypost';

// Medusa Admin API configuration
const MEDUSA_ADMIN_URL = process.env.MEDUSA_SSR_BASE_URL || process.env.NEXT_PUBLIC_MEDUSA_BASE_URL;
const MEDUSA_ADMIN_API_KEY = process.env.MEDUSA_ADMIN_API_KEY;

/**
 * Request body for label creation
 */
export interface CreateLabelRequest {
  shipmentId: string;
  rateId: string;
  orderId: string;  // Medusa order ID (required for fulfillment)
}

/**
 * Response from label creation
 */
export interface CreateLabelResponse {
  success: boolean;
  label?: PurchasedLabel;
  orderId?: string;
  fulfillmentCreated?: boolean;
  errors?: string[];
}

/**
 * Update Medusa order metadata with shipping/tracking information
 */
async function updateOrderMetadata(
  orderId: string,
  label: PurchasedLabel
): Promise<boolean> {
  if (!MEDUSA_ADMIN_URL || !MEDUSA_ADMIN_API_KEY) {
    console.warn('[create-label] Medusa admin API not configured, skipping metadata update');
    return false;
  }

  try {
    const response = await fetch(`${MEDUSA_ADMIN_URL}/admin/orders/${orderId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-medusa-access-token': MEDUSA_ADMIN_API_KEY,
      },
      body: JSON.stringify({
        metadata: {
          shipping_label_url: label.labelUrl,
          tracking_number: label.trackingCode,
          tracking_url: label.trackingUrl,
          carrier: label.carrier,
          service: label.service,
          label_format: label.labelFormat,
          label_created_at: new Date().toISOString(),
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[create-label] Failed to update order metadata:', error);
      return false;
    }

    console.log('[create-label] Order metadata updated with tracking info');
    return true;
  } catch (error) {
    console.error('[create-label] Error updating order metadata:', error);
    return false;
  }
}

/**
 * Create a fulfillment in Medusa (triggers order.shipped notification)
 */
async function createFulfillment(
  orderId: string,
  label: PurchasedLabel
): Promise<boolean> {
  if (!MEDUSA_ADMIN_URL || !MEDUSA_ADMIN_API_KEY) {
    console.warn('[create-label] Medusa admin API not configured, skipping fulfillment creation');
    return false;
  }

  try {
    // First, get the order to find fulfillable items
    const orderResponse = await fetch(`${MEDUSA_ADMIN_URL}/admin/orders/${orderId}`, {
      headers: {
        'x-medusa-access-token': MEDUSA_ADMIN_API_KEY,
      },
    });

    if (!orderResponse.ok) {
      console.error('[create-label] Failed to fetch order for fulfillment');
      return false;
    }

    const { order } = await orderResponse.json();

    // Build items array for fulfillment
    const items = order.items?.map((item: { id: string; quantity: number }) => ({
      id: item.id,
      quantity: item.quantity,
    })) || [];

    if (items.length === 0) {
      console.warn('[create-label] No items found for fulfillment');
      return false;
    }

    // Create fulfillment
    const fulfillmentResponse = await fetch(
      `${MEDUSA_ADMIN_URL}/admin/orders/${orderId}/fulfillments`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-medusa-access-token': MEDUSA_ADMIN_API_KEY,
        },
        body: JSON.stringify({
          items,
          metadata: {
            tracking_number: label.trackingCode,
            tracking_url: label.trackingUrl,
            carrier: label.carrier,
          },
        }),
      }
    );

    if (!fulfillmentResponse.ok) {
      const error = await fulfillmentResponse.text();
      console.error('[create-label] Failed to create fulfillment:', error);
      return false;
    }

    console.log('[create-label] Fulfillment created (order.shipped email will be triggered)');
    return true;
  } catch (error) {
    console.error('[create-label] Error creating fulfillment:', error);
    return false;
  }
}

/**
 * POST /api/fulfillment/create-label
 *
 * Purchase a shipping label for an order using EasyPost.
 *
 * This endpoint should be called when fulfilling an order:
 * 1. During checkout, shipping rates are fetched and shipmentId is stored in cart metadata
 * 2. Customer selects a rate (rateId) and completes payment
 * 3. Admin fulfills order by calling this endpoint with orderId
 * 4. Label is generated, tracking info stored in order metadata
 * 5. Fulfillment is created which triggers the order.shipped email
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as CreateLabelRequest;
    const { shipmentId, rateId, orderId } = body;

    // Validate required fields
    if (!shipmentId || !rateId || !orderId) {
      return NextResponse.json<CreateLabelResponse>(
        {
          success: false,
          errors: ['Missing required fields: shipmentId, rateId, orderId'],
        },
        { status: 400 }
      );
    }

    // Check for mock shipment (development without EasyPost key)
    if (shipmentId.startsWith('mock_')) {
      console.log('📦 Creating mock label for development');
      const mockLabel: PurchasedLabel = {
        trackingCode: `MOCK${Date.now()}`,
        trackingUrl: 'https://example.com/track/mock',
        labelUrl: 'https://example.com/label/mock.pdf',
        labelFormat: 'PDF',
        carrier: 'MockCarrier',
        service: 'MockService',
        shipmentId: shipmentId,
      };

      // Still attempt to update metadata and create fulfillment even for mock
      await updateOrderMetadata(orderId, mockLabel);
      const fulfillmentCreated = await createFulfillment(orderId, mockLabel);

      return NextResponse.json<CreateLabelResponse>({
        success: true,
        label: mockLabel,
        orderId,
        fulfillmentCreated,
      });
    }

    console.log('📦 Purchasing label:', { shipmentId, rateId, orderId });

    // Purchase the label
    const result = await purchaseLabel(shipmentId, rateId);

    if (!result.success || !result.label) {
      return NextResponse.json<CreateLabelResponse>(
        {
          success: false,
          errors: result.errors || ['Failed to purchase label'],
        },
        { status: 500 }
      );
    }

    console.log('📦 Label purchased:', {
      trackingCode: result.label.trackingCode,
      carrier: result.label.carrier,
      service: result.label.service,
    });

    // Update order metadata with tracking info
    await updateOrderMetadata(orderId, result.label);

    // Create fulfillment (triggers order.shipped email via Medusa notification system)
    const fulfillmentCreated = await createFulfillment(orderId, result.label);

    return NextResponse.json<CreateLabelResponse>({
      success: true,
      label: result.label,
      orderId,
      fulfillmentCreated,
    });

  } catch (error) {
    console.error('Label creation error:', error);
    return NextResponse.json<CreateLabelResponse>(
      {
        success: false,
        errors: [error instanceof Error ? error.message : 'Failed to create label'],
      },
      { status: 500 }
    );
  }
}

// Handle preflight requests for CORS
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}
