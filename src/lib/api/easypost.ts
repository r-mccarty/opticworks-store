// Use fetch-based EasyPost API calls for Cloudflare Workers compatibility
// The @easypost/api SDK uses Node.js 'https' module which isn't supported in Workers

const EASYPOST_API_BASE = 'https://api.easypost.com/v2';

/**
 * Make an authenticated request to the EasyPost API
 */
async function easypostFetch<T>(
  endpoint: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: Record<string, unknown>;
  } = {}
): Promise<T> {
  const apiKey = process.env.EASYPOST_API_KEY;
  if (!apiKey) {
    throw new Error('EASYPOST_API_KEY is not configured');
  }

  const { method = 'GET', body } = options;

  const response = await fetch(`${EASYPOST_API_BASE}${endpoint}`, {
    method,
    headers: {
      'Authorization': `Basic ${btoa(`${apiKey}:`)}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      (errorData as { error?: { message?: string } })?.error?.message ||
      `EasyPost API error: ${response.status}`
    );
  }

  return response.json() as Promise<T>;
}


export interface AddressInput {
  street1: string;
  street2?: string;
  city: string;
  state: string;
  zip: string;
  country?: string;
  name?: string;
}

export interface ValidatedAddress extends AddressInput {
  id: string;
  residential: boolean;
  verifications: {
    delivery: {
      success: boolean;
      errors: Array<{
        code: string;
        field: string;
        message: string;
      }>;
      details: {
        latitude: number;
        longitude: number;
        time_zone: string;
      };
    };
    zip4: {
      success: boolean;
      zip4: string;
    };
  };
}

export interface AddressValidationResponse {
  success: boolean;
  address?: ValidatedAddress;
  suggestions?: ValidatedAddress[];
  errors?: string[];
}

export interface AddressSuggestionResponse {
  success: boolean;
  suggestions: ValidatedAddress[];
  originalAddress: AddressInput;
}

/**
 * EasyPost address response type
 */
interface EasyPostAddressResponse {
  id: string;
  street1: string;
  street2: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  name: string;
  residential: boolean;
  verifications?: {
    delivery?: {
      success: boolean;
      errors?: Array<{ code: string; field: string; message: string }>;
      details?: { latitude: number; longitude: number; time_zone: string };
    };
    zip4?: {
      success: boolean;
      zip4?: string;
    };
  };
}

/**
 * Validate a single address using EasyPost's address verification API
 * Uses fetch-based API calls for Cloudflare Workers compatibility
 */
export async function validateAddress(address: AddressInput): Promise<AddressValidationResponse> {
  try {
    // Add development delay simulation
    if (process.env.NODE_ENV === 'development') {
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    const easypostAddress = await easypostFetch<EasyPostAddressResponse>('/addresses', {
      method: 'POST',
      body: {
        address: {
          street1: address.street1,
          street2: address.street2 || '',
          city: address.city,
          state: address.state,
          zip: address.zip,
          country: address.country || 'US',
          name: address.name || '',
          verify: ['delivery', 'zip4'],
        },
      },
    });

    const validated: ValidatedAddress = {
      id: easypostAddress.id,
      street1: easypostAddress.street1 || '',
      street2: easypostAddress.street2 || '',
      city: easypostAddress.city || '',
      state: easypostAddress.state || '',
      zip: easypostAddress.zip || '',
      country: easypostAddress.country || 'US',
      name: easypostAddress.name || '',
      residential: easypostAddress.residential || false,
      verifications: {
        delivery: {
          success: easypostAddress.verifications?.delivery?.success || false,
          errors: easypostAddress.verifications?.delivery?.errors?.map((err) => ({
            code: err.code || 'unknown',
            field: err.field || 'unknown',
            message: err.message || 'Unknown error'
          })) || [],
          details: {
            latitude: easypostAddress.verifications?.delivery?.details?.latitude || 0,
            longitude: easypostAddress.verifications?.delivery?.details?.longitude || 0,
            time_zone: easypostAddress.verifications?.delivery?.details?.time_zone || '',
          }
        },
        zip4: {
          success: easypostAddress.verifications?.zip4?.success || false,
          zip4: easypostAddress.verifications?.zip4?.zip4 || '',
        }
      }
    };

    return {
      success: true,
      address: validated,
      suggestions: [], // EasyPost doesn't provide suggestions in the same call
    };

  } catch (error) {
    console.error('EasyPost address validation error:', error);

    return {
      success: false,
      errors: [error instanceof Error ? error.message : 'Address validation failed'],
    };
  }
}

/**
 * Get address suggestions/corrections for potentially invalid addresses
 */
export async function getAddressSuggestions(address: AddressInput): Promise<AddressSuggestionResponse> {
  try {
    // Add development delay simulation
    if (process.env.NODE_ENV === 'development') {
      await new Promise(resolve => setTimeout(resolve, 600));
    }

    // For development/testing, return mock suggestions based on common patterns
    if (process.env.NODE_ENV === 'development') {
      return getMockAddressSuggestions(address);
    }

    // In production, use EasyPost's address verification
    const validationResult = await validateAddress(address);
    
    if (validationResult.success && validationResult.address) {
      return {
        success: true,
        suggestions: [validationResult.address],
        originalAddress: address,
      };
    }

    return {
      success: false,
      suggestions: [],
      originalAddress: address,
    };

  } catch (error) {
    console.error('EasyPost address suggestions error:', error);
    
    return {
      success: false,
      suggestions: [],
      originalAddress: address,
    };
  }
}

/**
 * Mock address suggestions for development and testing
 */
function getMockAddressSuggestions(address: AddressInput): AddressSuggestionResponse {
  const suggestions: ValidatedAddress[] = [];
  
  // Common address corrections
  const corrections = [
    { from: 'stret', to: 'street' },
    { from: 'st', to: 'street' },
    { from: 'ave', to: 'avenue' },
    { from: 'rd', to: 'road' },
    { from: 'blvd', to: 'boulevard' },
    { from: 'ln', to: 'lane' },
    { from: 'dr', to: 'drive' },
  ];

  let correctedStreet1 = address.street1.toLowerCase();
  let hasSuggestion = false;

  // Apply common corrections
  corrections.forEach(({ from, to }) => {
    if (correctedStreet1.includes(from)) {
      correctedStreet1 = correctedStreet1.replace(new RegExp(from, 'gi'), to);
      hasSuggestion = true;
    }
  });

  // Capitalize properly
  correctedStreet1 = correctedStreet1.replace(/\b\w/g, char => char.toUpperCase());

  if (hasSuggestion) {
    suggestions.push({
      id: `mock_${Date.now()}`,
      street1: correctedStreet1,
      street2: address.street2 || '',
      city: address.city,
      state: address.state,
      zip: address.zip,
      country: address.country || 'US',
      name: address.name || '',
      residential: true,
      verifications: {
        delivery: {
          success: true,
          errors: [],
          details: {
            latitude: 40.7128,
            longitude: -74.0060,
            time_zone: 'America/New_York',
          }
        },
        zip4: {
          success: true,
          zip4: address.zip.length === 5 ? address.zip + '-1234' : address.zip,
        }
      }
    });
  }

  return {
    success: true,
    suggestions,
    originalAddress: address,
  };
}

/**
 * Check if an address is residential or commercial
 */
export async function checkAddressType(address: AddressInput): Promise<{
  success: boolean;
  residential?: boolean;
  confidence?: number;
}> {
  try {
    const validationResult = await validateAddress(address);
    
    if (validationResult.success && validationResult.address) {
      return {
        success: true,
        residential: validationResult.address.residential,
        confidence: validationResult.address.verifications.delivery.success ? 0.95 : 0.7,
      };
    }

    return {
      success: false,
    };

  } catch (error) {
    console.error('EasyPost address type check error:', error);
    
    return {
      success: false,
    };
  }
}

/**
 * Batch validate multiple addresses
 */
export async function batchValidateAddresses(addresses: AddressInput[]): Promise<AddressValidationResponse[]> {
  const results = await Promise.allSettled(
    addresses.map(address => validateAddress(address))
  );

  return results.map(result => 
    result.status === 'fulfilled' 
      ? result.value 
      : { success: false, errors: ['Validation failed'] }
  );
}

/**
 * Format address for display
 */
export function formatAddress(address: AddressInput | ValidatedAddress): string {
  const parts = [
    address.street1,
    address.street2,
    `${address.city}, ${address.state} ${address.zip}`,
    address.country && address.country !== 'US' ? address.country : null,
  ].filter(Boolean);

  return parts.join('\n');
}

/**
 * Convert EasyPost address to Stripe address format
 */
export function convertToStripeAddress(address: ValidatedAddress): {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
} {
  return {
    line1: address.street1,
    line2: address.street2 || undefined,
    city: address.city,
    state: address.state,
    postal_code: address.zip,
    country: address.country || 'US',
  };
}

// ============================================================================
// SHIPPING RATES
// ============================================================================
// NOTE: Shipping rates are now calculated via Medusa's fulfillment provider.
// The backend EasyPost provider (backend/src/modules/easypost-fulfillment/)
// handles rate calculation when shipping options are requested.
// See: docs/reference/FULFILLMENT.md for architecture details.

// ============================================================================
// LABEL GENERATION
// ============================================================================

/**
 * Purchased shipping label
 */
export interface PurchasedLabel {
  trackingCode: string;
  trackingUrl: string;
  labelUrl: string;
  labelFormat: string;
  carrier: string;
  service: string;
  shipmentId: string;
}

/**
 * Purchase a shipping label for a shipment
 *
 * @param shipmentId - EasyPost shipment ID (from getShippingRates)
 * @param rateId - EasyPost rate ID (user's selected rate)
 */
/**
 * EasyPost purchased shipment response type
 */
interface EasyPostPurchasedShipmentResponse {
  id: string;
  tracking_code: string;
  tracker?: {
    tracking_code: string;
    public_url: string;
  };
  postage_label?: {
    label_url: string;
    label_file_type: string;
  };
  selected_rate?: {
    carrier: string;
    service: string;
  };
}

export async function purchaseLabel(
  shipmentId: string,
  rateId: string
): Promise<{ success: boolean; label?: PurchasedLabel; errors?: string[] }> {
  try {
    // Buy the selected rate using fetch API
    const purchasedShipment = await easypostFetch<EasyPostPurchasedShipmentResponse>(
      `/shipments/${shipmentId}/buy`,
      {
        method: 'POST',
        body: {
          rate: { id: rateId },
        },
      }
    );

    // Extract tracking and label info
    const tracker = purchasedShipment.tracker;
    const postageLabel = purchasedShipment.postage_label;
    const selectedRate = purchasedShipment.selected_rate;

    return {
      success: true,
      label: {
        trackingCode: tracker?.tracking_code || purchasedShipment.tracking_code || '',
        trackingUrl: tracker?.public_url || '',
        labelUrl: postageLabel?.label_url || '',
        labelFormat: postageLabel?.label_file_type || 'PDF',
        carrier: selectedRate?.carrier || '',
        service: selectedRate?.service || '',
        shipmentId: purchasedShipment.id,
      },
    };

  } catch (error) {
    console.error('EasyPost label purchase error:', error);

    return {
      success: false,
      errors: [error instanceof Error ? error.message : 'Failed to purchase label'],
    };
  }
}

/**
 * Convert Stripe address format to EasyPost address format
 */
export function stripeToEasyPostAddress(stripeAddress: {
  name?: string;
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
}): AddressInput {
  return {
    name: stripeAddress.name || '',
    street1: stripeAddress.line1 || '',
    street2: stripeAddress.line2 || '',
    city: stripeAddress.city || '',
    state: stripeAddress.state || '',
    zip: stripeAddress.postal_code || '',
    country: stripeAddress.country || 'US',
  };
}