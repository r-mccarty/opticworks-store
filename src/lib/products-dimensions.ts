/**
 * Product Parcel Dimensions for Shipping Rate Calculation
 *
 * Dimensions are in inches, weight is in ounces.
 * These are used by the backend EasyPost provider to calculate accurate shipping rates.
 */

/**
 * Parcel dimensions for shipping rate calculation
 */
export interface ParcelDimensions {
  length: number;  // inches
  width: number;   // inches
  height: number;  // inches
  weight: number;  // ounces
}

/**
 * Parcel dimensions by product SKU
 */
export const PRODUCT_DIMENSIONS: Record<string, ParcelDimensions> = {
  // Bed Presence Sensor Kit variants
  'BPS-SINGLE': {
    length: 6,
    width: 4,
    height: 2,
    weight: 8,  // 8 oz = 0.5 lb
  },
  'BPS-DUO': {
    length: 8,
    width: 6,
    height: 3,
    weight: 16,  // 16 oz = 1 lb
  },
  'BPS-STUDIO': {
    length: 10,
    width: 8,
    height: 4,
    weight: 24,  // 24 oz = 1.5 lb
  },

  // Presence Sensor Duo Pack
  'PSP-DUO': {
    length: 8,
    width: 6,
    height: 3,
    weight: 16,
  },

  // Presence Engine Developer Edition
  'PDE-STD': {
    length: 8,
    width: 6,
    height: 3,
    weight: 12,
  },

  // Home Assistant Dashboard Pack (digital - use minimal parcel for rate calc)
  'HADP-DL': {
    length: 1,
    width: 1,
    height: 1,
    weight: 1,
  },

  // Magnetic Enclosure + Mount Pack
  'ENC-PACK': {
    length: 6,
    width: 4,
    height: 2,
    weight: 6,
  },

  // Spare mmWave Sensor Module
  'SPARE-MOD': {
    length: 4,
    width: 3,
    height: 1,
    weight: 4,
  },

  // Reliability Lab Subscription (digital)
  'LAB-MONTHLY': {
    length: 1,
    width: 1,
    height: 1,
    weight: 1,
  },
};

/**
 * Default parcel dimensions for products not in the config
 */
export const DEFAULT_PARCEL: ParcelDimensions = {
  length: 8,
  width: 6,
  height: 3,
  weight: 12,
};

/**
 * Get parcel dimensions for a SKU
 */
export function getParcelDimensions(sku: string): ParcelDimensions {
  return PRODUCT_DIMENSIONS[sku] || DEFAULT_PARCEL;
}

/**
 * Calculate combined parcel for multiple items
 *
 * Simple approach: uses largest dimensions and sums weights
 * (In production, you might use bin packing algorithms)
 */
export function calculateCombinedParcel(
  items: Array<{ sku: string; quantity: number }>
): ParcelDimensions {
  if (items.length === 0) {
    return DEFAULT_PARCEL;
  }

  let maxLength = 0;
  let maxWidth = 0;
  let maxHeight = 0;
  let totalWeight = 0;

  for (const item of items) {
    const dims = getParcelDimensions(item.sku);
    maxLength = Math.max(maxLength, dims.length);
    maxWidth = Math.max(maxWidth, dims.width);
    // Stack height for multiple quantities
    maxHeight = Math.max(maxHeight, dims.height * item.quantity);
    totalWeight += dims.weight * item.quantity;
  }

  return {
    length: maxLength,
    width: maxWidth,
    height: Math.min(maxHeight, 24), // Cap height at 24 inches
    weight: totalWeight,
  };
}

/**
 * Check if an order is digital-only (no physical shipping needed)
 */
export function isDigitalOnlyOrder(items: Array<{ sku: string }>): boolean {
  const digitalSkus = ['HADP-DL', 'LAB-MONTHLY'];
  return items.every(item => digitalSkus.includes(item.sku));
}

/**
 * Map product/variant names to SKUs
 * This allows the checkout to work with cart items that don't have SKUs directly
 */
const NAME_TO_SKU_MAP: Record<string, string> = {
  // Bed Presence Sensor Kit variants
  'Bed Presence Sensor Kit - Single Bed Kit': 'BPS-SINGLE',
  'Bed Presence Sensor Kit': 'BPS-SINGLE',  // Default variant
  'Single Bed Kit': 'BPS-SINGLE',
  'Dual Bed Pack': 'BPS-DUO',
  'Studio + Dev Pack': 'BPS-STUDIO',

  // Presence Sensor Duo Pack
  'Presence Sensor Duo Pack': 'PSP-DUO',
  'Presence Sensor Duo Pack - Standard': 'PSP-DUO',

  // Presence Engine Developer Edition
  'Presence Engine Developer Edition': 'PDE-STD',
  'Presence Engine Developer Edition - Standard': 'PDE-STD',

  // Home Assistant Dashboard Pack
  'Home Assistant Dashboard Pack': 'HADP-DL',
  'Home Assistant Dashboard Pack - Digital License': 'HADP-DL',

  // Magnetic Enclosure + Mount Pack
  'Magnetic Enclosure + Mount Pack': 'ENC-PACK',
  'Magnetic Enclosure + Mount Pack - Standard': 'ENC-PACK',

  // Spare mmWave Sensor Module
  'Spare mmWave Sensor Module': 'SPARE-MOD',
  'Spare mmWave Sensor Module - Standard': 'SPARE-MOD',

  // Reliability Lab Subscription
  'Reliability Lab Subscription': 'LAB-MONTHLY',
  'Reliability Lab Subscription - Monthly': 'LAB-MONTHLY',
};

/**
 * Get SKU from product/variant name
 * Falls back to product id if no match found
 */
export function getSkuFromName(name: string): string {
  // Check exact match first
  if (NAME_TO_SKU_MAP[name]) {
    return NAME_TO_SKU_MAP[name];
  }

  // Check if name contains any of the keys (partial match)
  for (const [key, sku] of Object.entries(NAME_TO_SKU_MAP)) {
    if (name.includes(key) || key.includes(name)) {
      return sku;
    }
  }

  // Return a generic fallback (will use DEFAULT_PARCEL)
  return 'UNKNOWN';
}
