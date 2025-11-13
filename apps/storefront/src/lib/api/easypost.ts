import EasyPost from '@easypost/api';

// Lazily initialize EasyPost client to avoid build errors
let easypost: InstanceType<typeof EasyPost> | null = null;

function getEasyPostClient(): InstanceType<typeof EasyPost> {
  if (!easypost) {
    if (!process.env.EASYPOST_API_KEY) {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('EASYPOST_API_KEY is not set in production environment');
      }
      // In non-production environments, we can allow this to fail gracefully
      // or use a mock client. For now, we'll throw to indicate a setup issue.
      throw new Error('EASYPOST_API_KEY is not set.');
    }
    easypost = new EasyPost(process.env.EASYPOST_API_KEY);
  }
  return easypost;
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
 * Validate a single address using EasyPost's address verification API
 */
export async function validateAddress(address: AddressInput): Promise<AddressValidationResponse> {
  try {
    // Add development delay simulation
    if (process.env.NODE_ENV === 'development') {
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    const client = getEasyPostClient();
    const easypostAddress = await client.Address.create({
      street1: address.street1,
      street2: address.street2 || '',
      city: address.city,
      state: address.state,
      zip: address.zip,
      country: address.country || 'US',
      name: address.name || '',
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
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          errors: easypostAddress.verifications?.delivery?.errors?.map((err: any) => ({
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
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          zip4: (easypostAddress.verifications?.zip4 as any)?.zip4 || '',
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

// Export EasyPost client for advanced usage
export { easypost };