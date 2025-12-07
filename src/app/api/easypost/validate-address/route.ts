import { NextRequest, NextResponse } from 'next/server';
import { validateAddress, type AddressInput } from '@/lib/api/easypost';
import {
  checkRateLimit,
  getClientIP,
  rateLimitHeaders,
  RATE_LIMITS,
} from '@/lib/rate-limit';

/**
 * POST /api/easypost/validate-address
 *
 * Validates a shipping address using EasyPost.
 * Rate limited to 30 requests per minute per IP.
 */
export async function POST(request: NextRequest) {
  // Rate limiting check
  const clientIP = getClientIP(request);
  const rateLimitResult = checkRateLimit(clientIP, RATE_LIMITS.addressValidation);

  if (!rateLimitResult.success) {
    return NextResponse.json(
      { success: false, errors: ['Too many requests. Please wait a moment.'] },
      { status: 429, headers: rateLimitHeaders(rateLimitResult) }
    );
  }

  try {
    const body = await request.json() as AddressInput;

    // Validate required fields
    if (!body.street1 || !body.city || !body.state || !body.zip) {
      return NextResponse.json(
        {
          success: false,
          errors: ['Missing required address fields: street1, city, state, zip']
        },
        { status: 400 }
      );
    }

    // Validate address with EasyPost
    const validationResult = await validateAddress(body);

    return NextResponse.json(validationResult);

  } catch (error) {
    console.error('Address validation API error:', error);

    return NextResponse.json(
      {
        success: false,
        errors: ['Internal server error during address validation']
      },
      { status: 500 }
    );
  }
}

// Handle preflight requests for CORS
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}