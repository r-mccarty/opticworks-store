import { NextRequest, NextResponse } from 'next/server';

export interface ShippingRateRequest {
  zipCode: string;
  items: Array<{
    id: string;
    weight: number;
    dimensions: {
      length: number;
      width: number;
      height: number;
    };
  }>;
  subtotal: number;
}

export interface ShippingRate {
  carrier: string;
  service: string;
  rate: number;
  estimatedDays: string;
  trackingIncluded: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as ShippingRateRequest;
    const { zipCode, items, subtotal } = body;

    // Validate required fields
    if (!zipCode || !items || !subtotal) {
      return NextResponse.json(
        { error: 'Missing required fields: zipCode, items, subtotal' },
        { status: 400 }
      );
    }

    console.log('📦 Shipping rates requested:', {
      zipCode,
      itemCount: items.length,
      subtotal
    });

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Calculate basic shipping rates based on weight and subtotal
    const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
    const baseRate = Math.max(5.99, totalWeight * 0.5);
    
    // Free shipping over $200
    const freeShippingThreshold = subtotal >= 200;
    
    const rates: ShippingRate[] = [
      {
        carrier: 'USPS',
        service: 'Ground Advantage',
        rate: freeShippingThreshold ? 0 : baseRate,
        estimatedDays: '3-5',
        trackingIncluded: true
      },
      {
        carrier: 'UPS',
        service: 'Ground',
        rate: freeShippingThreshold ? 0 : baseRate + 2.50,
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
      {
        carrier: 'UPS',
        service: 'Next Day Air',
        rate: baseRate * 4,
        estimatedDays: '1',
        trackingIncluded: true
      }
    ];

    return NextResponse.json({
      success: true,
      rates,
      freeShippingEligible: freeShippingThreshold,
      freeShippingThreshold: 200
    });

  } catch (error) {
    console.error('Shipping rates API error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate shipping rates' },
      { status: 500 }
    );
  }
}

// Handle preflight requests for CORS
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}