import { NextRequest, NextResponse } from 'next/server';
import {
  getShippingRates,
  getMockShippingRates,
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
import {
  withCircuitBreaker,
  EASYPOST_CIRCUIT,
} from '@/lib/circuit-breaker';
import { getCloudflareContext } from '@opennextjs/cloudflare';

// Cache TTL in seconds (10 minutes - balance between freshness and API cost savings)
const CACHE_TTL_SECONDS = 600;

// Timeout for EasyPost API calls (3 seconds)
const API_TIMEOUT_MS = 3000;

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
 * Generate a cache key for shipping rates based on address and items
 */
function generateCacheKey(address: AddressInput, items: Array<{ sku: string; quantity: number }>): string {
  const addressKey = `${address.zip}_${address.state}_${address.city}`.toLowerCase().replace(/\s+/g, '');
  const itemsKey = items.map(i => `${i.sku}:${i.quantity}`).sort().join(',');
  return `rates:${addressKey}:${itemsKey}`;
}

/**
 * Get KV namespace for caching (returns null if not available)
 */
async function getKVNamespace(): Promise<KVNamespace | null> {
  try {
    const { env } = await getCloudflareContext();
    return (env as { SHIPPING_RATES_CACHE?: KVNamespace }).SHIPPING_RATES_CACHE || null;
  } catch {
    // Running locally without Cloudflare context
    return null;
  }
}

/**
 * Fetch with timeout
 */
async function fetchWithTimeout<T>(
  fn: () => Promise<T>,
  timeoutMs: number
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const result = await Promise.race([
      fn(),
      new Promise<never>((_, reject) => {
        controller.signal.addEventListener('abort', () => {
          reject(new Error(`Request timed out after ${timeoutMs}ms`));
        });
      }),
    ]);
    return result;
  } finally {
    clearTimeout(timeoutId);
  }
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

    // Generate cache key
    const cacheKey = generateCacheKey(easypostAddress, items);
    const kv = await getKVNamespace();

    // Check cache first
    if (kv) {
      try {
        const cached = await kv.get(cacheKey, 'json') as {
          rates: EasyPostRate[];
          shipmentId: string;
        } | null;

        if (cached) {
          console.log('📦 Cache HIT for shipping rates');
          // Process cached rates through the same transformation
          const badges = assignBadges(cached.rates);
          const freeShippingThreshold = 200;
          const freeShippingEligible = subtotal >= freeShippingThreshold;

          const rates: ShippingRateResponse[] = cached.rates.map((rate) => ({
            id: rate.id,
            carrier: rate.carrier,
            service: rate.service,
            serviceName: formatServiceName(rate.carrier, rate.service),
            rate: freeShippingEligible && badges.get(rate.id)?.includes('Best Value')
              ? 0
              : rate.rate,
            currency: rate.currency,
            estimatedDays: rate.deliveryDays,
            estimatedDelivery: formatEstimatedDelivery(rate.deliveryDays, rate.deliveryDateGuaranteed),
            guaranteed: rate.deliveryDateGuaranteed,
            badges: badges.get(rate.id),
          }));

          return NextResponse.json<ShippingRatesApiResponse>({
            success: true,
            shipmentId: cached.shipmentId,
            rates,
            isDigitalOnly: false,
            freeShippingEligible,
            freeShippingThreshold,
          });
        }
      } catch (cacheError) {
        console.warn('📦 Cache read error:', cacheError);
        // Continue to fetch from API
      }
    }

    console.log('📦 Cache MISS - fetching from EasyPost');

    // Get rates from EasyPost with circuit breaker and timeout
    // Falls back to mock rates if circuit is open or request times out
    const ratesResponse = await withCircuitBreaker(
      EASYPOST_CIRCUIT,
      async () => {
        return fetchWithTimeout(
          () => getShippingRates(easypostAddress, parcel, ['USPS', 'FedEx']),
          API_TIMEOUT_MS
        );
      },
      () => {
        console.log('📦 Using mock rates (circuit open or timeout)');
        return getMockShippingRates(easypostAddress);
      }
    );

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

    // Cache the successful response
    if (kv && ratesResponse.rates.length > 0) {
      try {
        await kv.put(
          cacheKey,
          JSON.stringify({
            rates: ratesResponse.rates,
            shipmentId: ratesResponse.shipmentId,
          }),
          { expirationTtl: CACHE_TTL_SECONDS }
        );
        console.log('📦 Cached shipping rates for', CACHE_TTL_SECONDS, 'seconds');
      } catch (cacheError) {
        console.warn('📦 Cache write error:', cacheError);
        // Continue without caching
      }
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
