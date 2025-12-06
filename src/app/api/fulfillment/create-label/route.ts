import { NextRequest, NextResponse } from 'next/server';
import { purchaseLabel, type PurchasedLabel } from '@/lib/api/easypost';

/**
 * Request body for label creation
 */
export interface CreateLabelRequest {
  shipmentId: string;
  rateId: string;
  orderId?: string;  // Medusa order ID for tracking
}

/**
 * Response from label creation
 */
export interface CreateLabelResponse {
  success: boolean;
  label?: PurchasedLabel;
  orderId?: string;
  errors?: string[];
}

/**
 * POST /api/fulfillment/create-label
 *
 * Purchase a shipping label for an order using EasyPost.
 *
 * This endpoint should be called when fulfilling an order:
 * 1. During checkout, shipping rates are fetched and shipmentId is stored
 * 2. Customer selects a rate (rateId)
 * 3. After payment, admin fulfills order by calling this endpoint
 * 4. Label is generated and tracking info returned
 *
 * The tracking code and label URL should be:
 * - Stored in Medusa order metadata
 * - Sent to customer via tracking email
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as CreateLabelRequest;
    const { shipmentId, rateId, orderId } = body;

    // Validate required fields
    if (!shipmentId || !rateId) {
      return NextResponse.json<CreateLabelResponse>(
        {
          success: false,
          errors: ['Missing required fields: shipmentId, rateId'],
        },
        { status: 400 }
      );
    }

    // Check for mock shipment (development without EasyPost key)
    if (shipmentId.startsWith('mock_')) {
      console.log('📦 Creating mock label for development');
      return NextResponse.json<CreateLabelResponse>({
        success: true,
        label: {
          trackingCode: `MOCK${Date.now()}`,
          trackingUrl: 'https://example.com/track/mock',
          labelUrl: 'https://example.com/label/mock.pdf',
          labelFormat: 'PDF',
          carrier: 'MockCarrier',
          service: 'MockService',
          shipmentId: shipmentId,
        },
        orderId,
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

    return NextResponse.json<CreateLabelResponse>({
      success: true,
      label: result.label,
      orderId,
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
