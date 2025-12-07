/**
 * EasyPost Fulfillment Provider Types
 */

// ============================================================================
// Address Types
// ============================================================================

export interface EasyPostAddress {
  name?: string
  street1: string
  street2?: string
  city: string
  state: string
  zip: string
  country?: string
  phone?: string
  email?: string
}

export interface EasyPostAddressResponse {
  id: string
  street1: string
  street2: string | null
  city: string
  state: string
  zip: string
  country: string
  name: string | null
  phone: string | null
  residential: boolean | null
  verifications?: {
    delivery?: {
      success: boolean
      errors?: Array<{ code: string; field: string; message: string }>
    }
  }
}

// ============================================================================
// Parcel Types
// ============================================================================

export interface EasyPostParcel {
  length: number  // inches
  width: number   // inches
  height: number  // inches
  weight: number  // ounces
}

// ============================================================================
// Shipment Types
// ============================================================================

export interface EasyPostShipmentRequest {
  from_address: EasyPostAddress
  to_address: EasyPostAddress
  parcel: EasyPostParcel
}

export interface EasyPostRate {
  id: string
  carrier: string
  service: string
  rate: string
  currency: string
  delivery_days: number | null
  delivery_date: string | null
  delivery_date_guaranteed: boolean
  retail_rate: string | null
  list_rate: string | null
}

export interface EasyPostShipmentResponse {
  id: string
  rates: EasyPostRate[]
  to_address: EasyPostAddressResponse
  from_address: EasyPostAddressResponse
}

export interface EasyPostPurchasedShipment {
  id: string
  tracking_code: string
  tracker?: {
    tracking_code: string
    public_url: string
  }
  postage_label?: {
    label_url: string
    label_file_type: string
  }
  selected_rate?: {
    carrier: string
    service: string
  }
}

// ============================================================================
// Provider Types
// ============================================================================

export interface EasyPostProviderOptions {
  api_key: string
  ship_from_name?: string
  ship_from_street1?: string
  ship_from_city?: string
  ship_from_state?: string
  ship_from_zip?: string
}

export interface ShippingOptionData {
  carrier: string
  service: string
  name: string
}

export interface FulfillmentItemData {
  sku: string
  quantity: number
  weight_oz?: number
  length_in?: number
  width_in?: number
  height_in?: number
}

// ============================================================================
// Carrier Service Definitions
// ============================================================================

export const CARRIER_SERVICES: Record<string, { name: string; carriers: string[] }> = {
  "usps-ground": {
    name: "USPS Ground Advantage",
    carriers: ["USPS"],
  },
  "usps-priority": {
    name: "USPS Priority Mail",
    carriers: ["USPS"],
  },
  "usps-express": {
    name: "USPS Express Mail",
    carriers: ["USPS"],
  },
  "fedex-ground": {
    name: "FedEx Ground",
    carriers: ["FedEx"],
  },
  "fedex-home": {
    name: "FedEx Home Delivery",
    carriers: ["FedEx"],
  },
  "fedex-2day": {
    name: "FedEx 2Day",
    carriers: ["FedEx"],
  },
  "fedex-express": {
    name: "FedEx Express Saver",
    carriers: ["FedEx"],
  },
  "fedex-overnight": {
    name: "FedEx Standard Overnight",
    carriers: ["FedEx"],
  },
}

// Map EasyPost service names to our service IDs
export const SERVICE_MAP: Record<string, string> = {
  "GroundAdvantage": "usps-ground",
  "Priority": "usps-priority",
  "Express": "usps-express",
  "FEDEX_GROUND": "fedex-ground",
  "FEDEX_HOME_DELIVERY": "fedex-home",
  "FEDEX_2_DAY": "fedex-2day",
  "FEDEX_EXPRESS_SAVER": "fedex-express",
  "FEDEX_STANDARD_OVERNIGHT": "fedex-overnight",
}
