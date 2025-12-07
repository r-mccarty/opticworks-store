import { NextRequest, NextResponse } from 'next/server';
import {
  getShippingRates,
  stripeToEasyPostAddress,
  type ShippingRate as EasyPostRate,
  type AddressInput,
} from '@/lib/api/easypost';
import { calculateCombinedParcel, isDigitalOnlyOrder } from '@/lib/products-dimensions';
import {
  checkRateLimit,
  getClientIP,
  rateLimitHeaders,
  RATE_LIMITS,
} from '@/lib/rate-limit';

/**
 * Request body for shipping rates API
 */
export interface ShippingRateRequest {
  address: {
    name?: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country?: string;
  };
  items: Array<{
    sku: string;
    quantity: number;
  }>;
  subtotal?: number;
}

/**
 * Shipping rate returned to frontend
 */
export interface ShippingRateResponse {
  id: string;
  carrier: string;
  service: string;
  serviceName: string;  // Human-readable name
  rate: number;
  currency: string;
  estimatedDays: number | null;
  estimatedDelivery: string;  // e.g., "3-5 business days"
  guaranteed: boolean;
  badges?: string[];  // e.g., ["Fastest", "Best Value"]
}

/**
 * API response
 */
export interface ShippingRatesApiResponse {
  success: boolean;
  shipmentId: string;
  rates: ShippingRateResponse[];
  isDigitalOnly: boolean;
  freeShippingEligible: boolean;
  freeShippingThreshold: number;
  errors?: string[];
}

/**
 * Format service name for display
 */
function formatServiceName(carrier: string, service: string): string {
  const serviceMap: Record<string, string> = {
    // USPS
    'GroundAdvantage': 'USPS Ground Advantage',
    'Priority': 'USPS Priority Mail',
    'Express': 'USPS Express Mail',
    'First': 'USPS First Class',
    'ParcelSelect': 'USPS Parcel Select',
    // FedEx
    'FEDEX_GROUND': 'FedEx Ground',
    'FEDEX_HOME_DELIVERY': 'FedEx Home Delivery',
    'FEDEX_2_DAY': 'FedEx 2Day',
    'FEDEX_2_DAY_AM': 'FedEx 2Day AM',
    'FEDEX_EXPRESS_SAVER': 'FedEx Express Saver',
    'FEDEX_STANDARD_OVERNIGHT': 'FedEx Standard Overnight',
    'FEDEX_PRIORITY_OVERNIGHT': 'FedEx Priority Overnight',
    'FEDEX_FIRST_OVERNIGHT': 'FedEx First Overnight',
    // UPS
    'Ground': 'UPS Ground',
    '3DaySelect': 'UPS 3 Day Select',
    '2ndDayAir': 'UPS 2nd Day Air',
    'NextDayAir': 'UPS Next Day Air',
  };

  return serviceMap[service] || `${carrier} ${service}`;
}

/**
 * Format estimated delivery string
 */
function formatEstimatedDelivery(days: number | null, guaranteed: boolean): string {
  if (days === null) {
    return 'Varies';
  }
  if (days === 1) {
    return guaranteed ? 'Next business day' : '1-2 business days';
  }
  if (days === 2) {
    return guaranteed ? '2 business days' : '2-3 business days';
  }
  // Add buffer for non-guaranteed
  const maxDays = guaranteed ? days : days + 2;
  return `${days}-${maxDays} business days`;
}

/**
 * Assign badges to rates
 */
function assignBadges(rates: EasyPostRate[]): Map<string, string[]> {
  const badges = new Map<string, string[]>();

  if (rates.length === 0) return badges;

  // Find cheapest and fastest
  const cheapest = rates.reduce((a, b) => a.rate < b.rate ? a : b);
  const withDays = rates.filter(r => r.deliveryDays !== null);
  const fastest = withDays.length > 0
    ? withDays.reduce((a, b) => (a.deliveryDays || 99) < (b.deliveryDays || 99) ? a : b)
    : null;

  // Assign badges
  badges.set(cheapest.id, ['Best Value']);
  if (fastest && fastest.id !== cheapest.id) {
    badges.set(fastest.id, ['Fastest']);
  }

  return badges;
}

/**
 * POST /api/shipping/rates
 *
 * Calculate real-time shipping rates using EasyPost
 *
 * Rate limited to 20 requests per minute per IP to prevent abuse
 * and reduce costs from EasyPost API calls.
 */
export async function POST(request: NextRequest) {
  // Rate limiting check
  const clientIP = getClientIP(request);
  const rateLimitResult = checkRateLimit(clientIP, RATE_LIMITS.shipping);

  if (!rateLimitResult.success) {
    console.warn(`📦 Rate limit exceeded for IP: ${clientIP}`);
    return NextResponse.json<ShippingRatesApiResponse>(
      {
        success: false,
        shipmentId: '',
        rates: [],
        isDigitalOnly: false,
        freeShippingEligible: false,
        freeShippingThreshold: 200,
        errors: ['Too many requests. Please wait a moment and try again.'],
      },
      {
        status: 429,
        headers: rateLimitHeaders(rateLimitResult),
      }
    );
  }

  try {
    const body = await request.json() as ShippingRateRequest;
    const { address, items, subtotal = 0 } = body;

    // Validate required fields
    if (!address || !items || items.length === 0) {
      return NextResponse.json<ShippingRatesApiResponse>(
        {
          success: false,
          shipmentId: '',
          rates: [],
          isDigitalOnly: false,
          freeShippingEligible: false,
          freeShippingThreshold: 200,
          errors: ['Missing required fields: address, items'],
        },
        { status: 400 }
      );
    }

    // Check for digital-only order
    if (isDigitalOnlyOrder(items)) {
      return NextResponse.json<ShippingRatesApiResponse>({
        success: true,
        shipmentId: '',
        rates: [],
        isDigitalOnly: true,
        freeShippingEligible: true,
        freeShippingThreshold: 200,
      });
    }

    console.log('📦 Shipping rates requested:', {
      city: address.city,
      state: address.state,
      postal_code: address.postal_code,
      itemCount: items.length,
      subtotal,
    });

    // Convert address to EasyPost format
    const easypostAddress: AddressInput = stripeToEasyPostAddress(address);

    // Calculate combined parcel dimensions
    const parcel = calculateCombinedParcel(items);

    // Get rates from EasyPost
    // Filter to USPS and FedEx only
    const ratesResponse = await getShippingRates(easypostAddress, parcel, ['USPS', 'FedEx']);

    if (!ratesResponse.success) {
      return NextResponse.json<ShippingRatesApiResponse>(
        {
          success: false,
          shipmentId: '',
          rates: [],
          isDigitalOnly: false,
          freeShippingEligible: false,
          freeShippingThreshold: 200,
          errors: ratesResponse.errors,
        },
        { status: 500 }
      );
    }

    // Assign badges (Best Value, Fastest)
    const badges = assignBadges(ratesResponse.rates);

    // Free shipping threshold
    const freeShippingThreshold = 200;
    const freeShippingEligible = subtotal >= freeShippingThreshold;

    // Transform rates for frontend
    const rates: ShippingRateResponse[] = ratesResponse.rates.map((rate) => ({
      id: rate.id,
      carrier: rate.carrier,
      service: rate.service,
      serviceName: formatServiceName(rate.carrier, rate.service),
      // Apply free shipping to cheapest option if eligible
      rate: freeShippingEligible && badges.get(rate.id)?.includes('Best Value')
        ? 0
        : rate.rate,
      currency: rate.currency,
      estimatedDays: rate.deliveryDays,
      estimatedDelivery: formatEstimatedDelivery(rate.deliveryDays, rate.deliveryDateGuaranteed),
      guaranteed: rate.deliveryDateGuaranteed,
      badges: badges.get(rate.id),
    }));

    console.log('📦 Returning', rates.length, 'shipping rates');

    return NextResponse.json<ShippingRatesApiResponse>({
      success: true,
      shipmentId: ratesResponse.shipmentId,
      rates,
      isDigitalOnly: false,
      freeShippingEligible,
      freeShippingThreshold,
    });

  } catch (error) {
    console.error('Shipping rates API error:', error);
    return NextResponse.json<ShippingRatesApiResponse>(
      {
        success: false,
        shipmentId: '',
        rates: [],
        isDigitalOnly: false,
        freeShippingEligible: false,
        freeShippingThreshold: 200,
        errors: [error instanceof Error ? error.message : 'Failed to calculate shipping rates'],
      },
      { status: 500 }
    );
  }
}

// Handle preflight requests for CORS
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}
