/**
 * Stripe Tax Provider Service
 *
 * Implements Medusa's ITaxProvider interface to calculate taxes via Stripe Tax API.
 * Returns tax lines with Stripe calculation IDs for later commit on order placement.
 */

import { ITaxProvider, TaxTypes } from "@medusajs/framework/types"
import { MedusaError } from "@medusajs/framework/utils"
import { Logger } from "@medusajs/framework/types"
import Stripe from "stripe"
import {
  StripeTaxProviderOptions,
  StripeTaxLineMetadata,
} from "./types"

type InjectedDependencies = {
  logger: Logger
}

class StripeTaxProviderService implements ITaxProvider {
  static identifier = "stripe-tax"

  private stripe: Stripe
  private logger: Logger
  private options: StripeTaxProviderOptions

  constructor(
    { logger }: InjectedDependencies,
    options: StripeTaxProviderOptions
  ) {
    this.logger = logger
    this.options = options

    if (!options.api_key) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Stripe Tax provider requires `api_key` option"
      )
    }

    if (!options.from_country || !options.from_postal) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Stripe Tax provider requires `from_country` and `from_postal` options"
      )
    }

    this.stripe = new Stripe(options.api_key)

    this.logger.info("[stripe-tax] Tax provider initialized")
  }

  /**
   * Validate provider options at startup
   */
  static validateOptions(options: Record<string, unknown>): void {
    if (!options.api_key) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Stripe Tax provider requires `api_key` option"
      )
    }
    if (!options.from_country || !options.from_postal) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Stripe Tax provider requires `from_country` and `from_postal` options"
      )
    }
  }

  /**
   * Return the provider identifier
   */
  getIdentifier(): string {
    return StripeTaxProviderService.identifier
  }

  /**
   * Calculate tax lines for items and shipping methods via Stripe Tax API
   *
   * @param itemLines - Line items to calculate tax for
   * @param shippingLines - Shipping lines to calculate tax for
   * @param context - Tax calculation context (address, customer, etc.)
   * @returns Array of tax lines with Stripe calculation metadata
   */
  async getTaxLines(
    itemLines: TaxTypes.ItemTaxCalculationLine[],
    shippingLines: TaxTypes.ShippingTaxCalculationLine[],
    context: TaxTypes.TaxCalculationContext
  ): Promise<(TaxTypes.ItemTaxLineDTO | TaxTypes.ShippingTaxLineDTO)[]> {
    const address = context.address

    this.logger.info(
      `[stripe-tax] getTaxLines called with ${itemLines.length} items, ${shippingLines.length} shipping lines, address: ${address?.country_code || "none"}/${address?.province_code || "none"}`
    )

    // Require address for tax calculation
    if (!address?.country_code) {
      this.logger.warn("[stripe-tax] No address provided, returning zero taxes")
      const zeroLines = this.buildZeroTaxLines(itemLines, shippingLines)
      this.logger.info(`[stripe-tax] Returning ${zeroLines.length} zero tax lines`)
      return zeroLines
    }

    // If no items to tax, return empty array
    // Stripe Tax API requires at least one line item, and shipping-only
    // tax will be calculated when we have items + shipping together
    if (itemLines.length === 0) {
      this.logger.info("[stripe-tax] No items to tax, returning empty array (shipping tax included in item calculation)")
      return []
    }

    try {
      // Build Stripe Tax calculation payload
      const calculationParams = this.buildCalculationParams(
        itemLines,
        shippingLines,
        context
      )

      this.logger.info(
        `[stripe-tax] Creating calculation for ${itemLines.length} items, ${shippingLines.length} shipping lines`
      )

      // Call Stripe Tax API
      // Note: Must expand line_items to get them in the response
      const calculation = await this.stripe.tax.calculations.create({
        ...calculationParams,
        expand: ["line_items"],
      })

      this.logger.info(
        `[stripe-tax] Calculation created: ${calculation.id}, tax_amount: ${calculation.tax_amount_exclusive}, line_items: ${calculation.line_items?.data?.length ?? 0}`
      )

      // Map Stripe response to Medusa tax lines
      const taxLines = this.mapCalculationToTaxLines(
        calculation,
        itemLines,
        shippingLines
      )

      this.logger.info(
        `[stripe-tax] Returning ${taxLines.length} tax lines: ${JSON.stringify(taxLines.map(tl => ({ id: "line_item_id" in tl ? tl.line_item_id : tl.shipping_line_id, rate: tl.rate, name: tl.name })))}`
      )

      return taxLines
    } catch (error) {
      this.logger.error(
        `[stripe-tax] Failed to calculate taxes: ${error instanceof Error ? error.message : error}`
      )

      // Return zero taxes on error (fail-open for better UX)
      const zeroLines = this.buildZeroTaxLines(itemLines, shippingLines)
      this.logger.info(`[stripe-tax] Returning ${zeroLines.length} zero tax lines (error fallback)`)
      return zeroLines
    }
  }

  /**
   * Build Stripe Tax calculation API params
   */
  private buildCalculationParams(
    itemLines: TaxTypes.ItemTaxCalculationLine[],
    shippingLines: TaxTypes.ShippingTaxCalculationLine[],
    context: TaxTypes.TaxCalculationContext
  ): Stripe.Tax.CalculationCreateParams {
    const address = context.address!

    // Determine currency from first item (all items should have same currency)
    const currency =
      itemLines[0]?.line_item?.currency_code ||
      shippingLines[0]?.shipping_line?.currency_code ||
      "usd"

    // Build line items - convert major units to minor units (cents)
    const lineItems: Stripe.Tax.CalculationCreateParams.LineItem[] =
      itemLines.map((itemLine) => {
        const item = itemLine.line_item
        // Medusa v2 uses major units (dollars), Stripe expects minor units (cents)
        // unit_price and quantity can be BigNumberInput, convert to number
        const unitPrice = this.toBigNumberValue(item.unit_price)
        const quantity = this.toBigNumberValue(item.quantity) || 1
        const amountInCents = this.toMinorUnits(unitPrice, currency)

        // Try to get tax_code from item metadata
        const itemMetadata = (item as { metadata?: Record<string, unknown> }).metadata
        const taxCode =
          (itemMetadata?.tax_code as string) ||
          this.options.default_product_tax_code ||
          "txcd_99999999" // General tangible goods

        return {
          amount: amountInCents,
          quantity: quantity,
          reference: item.id,
          tax_code: taxCode,
          tax_behavior: "exclusive" as const,
        }
      })

    // Build params
    const params: Stripe.Tax.CalculationCreateParams = {
      currency: currency.toLowerCase(),
      customer_details: {
        address: {
          country: address.country_code?.toUpperCase(),
          state: address.province_code || undefined,
          city: address.city || undefined,
          postal_code: address.postal_code || undefined,
          line1: address.address_1 || undefined,
          line2: address.address_2 || undefined,
        },
        address_source: "shipping",
      },
      ship_from_details: {
        address: {
          country: this.options.from_country,
          state: this.options.from_state || undefined,
          city: this.options.from_city || undefined,
          postal_code: this.options.from_postal,
        },
      },
      line_items: lineItems,
    }

    // Add shipping cost if present
    if (shippingLines.length > 0) {
      // Sum all shipping costs
      const totalShippingCents = shippingLines.reduce((sum, sl) => {
        const shippingPrice = this.toBigNumberValue(sl.shipping_line.unit_price)
        return sum + this.toMinorUnits(shippingPrice, currency)
      }, 0)

      if (totalShippingCents > 0) {
        params.shipping_cost = {
          amount: totalShippingCents,
          tax_code:
            this.options.default_shipping_tax_code || "txcd_92010001", // Shipping
          tax_behavior: "exclusive",
        }
      }
    }

    return params
  }

  /**
   * Map Stripe calculation response to Medusa tax lines
   */
  private mapCalculationToTaxLines(
    calculation: Stripe.Tax.Calculation,
    itemLines: TaxTypes.ItemTaxCalculationLine[],
    shippingLines: TaxTypes.ShippingTaxCalculationLine[]
  ): (TaxTypes.ItemTaxLineDTO | TaxTypes.ShippingTaxLineDTO)[] {
    const taxLines: (TaxTypes.ItemTaxLineDTO | TaxTypes.ShippingTaxLineDTO)[] =
      []

    // Map item tax lines
    const stripeLineItems = calculation.line_items?.data || []

    for (const stripeItem of stripeLineItems) {
      // Find corresponding Medusa item by reference
      const medusaItem = itemLines.find(
        (il) => il.line_item.id === stripeItem.reference
      )

      if (!medusaItem) {
        this.logger.warn(
          `[stripe-tax] No matching Medusa item for Stripe reference: ${stripeItem.reference}`
        )
        continue
      }

      // Calculate effective tax rate
      // Stripe returns amounts in cents, we need percentage rate
      const rate =
        stripeItem.amount > 0
          ? (stripeItem.amount_tax / stripeItem.amount) * 100
          : 0

      const metadata: StripeTaxLineMetadata = {
        stripe_calculation_id: calculation.id ?? "",
        stripe_line_item_id: stripeItem.id,
        stripe_scope: "product",
      }

      // Encode calculation ID in code field since Medusa drops metadata during normalization
      const codeWithCalcId = `stripe-tax:${calculation.id}`

      taxLines.push({
        line_item_id: medusaItem.line_item.id,
        rate_id: medusaItem.rates[0]?.id ?? undefined,
        rate: rate,
        name: "Sales Tax",
        code: codeWithCalcId,
        provider_id: StripeTaxProviderService.identifier,
        metadata: metadata as unknown as Record<string, unknown>,
      } as TaxTypes.ItemTaxLineDTO)
    }

    // Map shipping tax lines
    if (calculation.shipping_cost && shippingLines.length > 0) {
      const shippingCost = calculation.shipping_cost
      const shippingRate =
        shippingCost.amount > 0
          ? (shippingCost.amount_tax / shippingCost.amount) * 100
          : 0

      // Apply shipping tax rate to all shipping lines proportionally
      for (const shippingLine of shippingLines) {
        const metadata: StripeTaxLineMetadata = {
          stripe_calculation_id: calculation.id ?? "",
          stripe_line_item_id: `shipping_${shippingLine.shipping_line.id}`,
          stripe_scope: "shipping",
        }

        taxLines.push({
          shipping_line_id: shippingLine.shipping_line.id,
          rate_id: shippingLine.rates[0]?.id ?? undefined,
          rate: shippingRate,
          name: "Shipping Tax",
          code: "stripe-tax-shipping",
          provider_id: StripeTaxProviderService.identifier,
          metadata: metadata as unknown as Record<string, unknown>,
        } as TaxTypes.ShippingTaxLineDTO)
      }
    }

    return taxLines
  }

  /**
   * Build zero tax lines when calculation fails or no address
   */
  private buildZeroTaxLines(
    itemLines: TaxTypes.ItemTaxCalculationLine[],
    shippingLines: TaxTypes.ShippingTaxCalculationLine[]
  ): (TaxTypes.ItemTaxLineDTO | TaxTypes.ShippingTaxLineDTO)[] {
    const taxLines: (TaxTypes.ItemTaxLineDTO | TaxTypes.ShippingTaxLineDTO)[] =
      []

    for (const itemLine of itemLines) {
      taxLines.push({
        line_item_id: itemLine.line_item.id,
        rate_id: itemLine.rates[0]?.id ?? undefined,
        rate: 0,
        name: "No Tax",
        code: "zero-tax",
        provider_id: StripeTaxProviderService.identifier,
      } as TaxTypes.ItemTaxLineDTO)
    }

    for (const shippingLine of shippingLines) {
      taxLines.push({
        shipping_line_id: shippingLine.shipping_line.id,
        rate_id: shippingLine.rates[0]?.id ?? undefined,
        rate: 0,
        name: "No Tax",
        code: "zero-tax",
        provider_id: StripeTaxProviderService.identifier,
      } as TaxTypes.ShippingTaxLineDTO)
    }

    return taxLines
  }

  /**
   * Convert BigNumberInput to a numeric value
   *
   * Medusa v2 uses BigNumberInput for prices/quantities which can be
   * number, string, or BigNumber object.
   */
  private toBigNumberValue(value: unknown): number {
    if (typeof value === "number") {
      return value
    }
    if (typeof value === "string") {
      return parseFloat(value) || 0
    }
    if (value && typeof value === "object" && "value" in value) {
      // BigNumber object with value property
      const bigNumValue = (value as { value: string | number }).value
      return typeof bigNumValue === "number"
        ? bigNumValue
        : parseFloat(bigNumValue) || 0
    }
    return 0
  }

  /**
   * Convert major units (dollars) to minor units (cents)
   *
   * Medusa v2 uses major units (BigNumber/decimal).
   * Stripe expects minor units (integer cents).
   */
  private toMinorUnits(amount: number, currency: string): number {
    // Most currencies use 2 decimal places (100 cents = 1 unit)
    // Some currencies like JPY use 0 decimal places
    const zeroDecimalCurrencies = [
      "bif",
      "clp",
      "djf",
      "gnf",
      "jpy",
      "kmf",
      "krw",
      "mga",
      "pyg",
      "rwf",
      "ugx",
      "vnd",
      "vuv",
      "xaf",
      "xof",
      "xpf",
    ]

    if (zeroDecimalCurrencies.includes(currency.toLowerCase())) {
      return Math.round(amount)
    }

    // Standard 2-decimal currencies
    return Math.round(amount * 100)
  }
}

export default StripeTaxProviderService
