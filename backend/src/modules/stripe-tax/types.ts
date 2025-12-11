/**
 * Stripe Tax Provider Types
 *
 * Configuration options and metadata types for the Stripe Tax integration.
 */

export interface StripeTaxProviderOptions {
  /** Stripe API key (sk_live_* or sk_test_*) */
  api_key: string

  /** Ship-from country code (ISO 2-letter, e.g., "US") */
  from_country: string

  /** Ship-from state/province (e.g., "CA" for California) */
  from_state?: string

  /** Ship-from postal code (e.g., "94105") */
  from_postal: string

  /** Ship-from city (e.g., "San Francisco") */
  from_city?: string

  /** Default Stripe tax code for products (e.g., "txcd_99999999" for general goods) */
  default_product_tax_code?: string

  /** Default Stripe tax code for shipping (e.g., "txcd_92010001" for shipping) */
  default_shipping_tax_code?: string

  /** Skip committing transactions (useful for local development) */
  skip_commit?: boolean
}

/**
 * Metadata attached to tax lines for traceability and commit operations
 */
export interface StripeTaxLineMetadata {
  /** Stripe calculation ID (used for commit) */
  stripe_calculation_id: string

  /** Stripe line item ID within the calculation */
  stripe_line_item_id: string

  /** Scope of the tax line */
  stripe_scope: "product" | "shipping"
}

/**
 * Shape of a Stripe Tax calculation line item amount
 */
export interface StripeLineItemAmount {
  /** Amount in minor units (cents) */
  amount: number

  /** Tax amount in minor units (cents) */
  amount_tax: number

  /** Reference (our line item ID) */
  reference: string

  /** Stripe's line item ID */
  id: string

  /** Tax behavior (exclusive/inclusive) */
  tax_behavior: string

  /** Tax code used for calculation */
  tax_code: string

  /** Taxability reason */
  taxability_reason: string

  /** Whether item is taxable */
  taxable: boolean
}

/**
 * Shape of the Stripe Tax calculation response (subset of relevant fields)
 */
export interface StripeCalculationResponse {
  id: string
  amount_total: number
  tax_amount_exclusive: number
  tax_amount_inclusive: number
  currency: string
  line_items: {
    data: StripeLineItemAmount[]
  }
  shipping_cost?: {
    amount: number
    amount_tax: number
    tax_behavior: string
    tax_code: string
  }
}
