/**
 * EasyPost Fulfillment Provider Service
 *
 * Implements Medusa's fulfillment provider interface to:
 * - Calculate shipping rates dynamically via EasyPost
 * - Create fulfillments (purchase labels)
 * - Cancel fulfillments (void labels)
 */

import { AbstractFulfillmentProviderService, MedusaError } from "@medusajs/framework/utils"
import { Logger, CreateShippingOptionDTO } from "@medusajs/framework/types"
import { EasyPostClient } from "./client"
import {
  EasyPostProviderOptions,
  EasyPostAddress,
  EasyPostParcel,
  CARRIER_SERVICES,
  SERVICE_MAP,
} from "./types"

type InjectedDependencies = {
  logger: Logger
}

// Default parcel dimensions for products without specific dimensions
const DEFAULT_PARCEL: EasyPostParcel = {
  length: 8,
  width: 6,
  height: 4,
  weight: 16, // 1 lb default
}

class EasyPostFulfillmentProviderService extends AbstractFulfillmentProviderService {
  static identifier = "easypost"

  private client: EasyPostClient
  private logger: Logger
  private originAddress: EasyPostAddress

  constructor(
    { logger }: InjectedDependencies,
    options: EasyPostProviderOptions
  ) {
    super()

    this.logger = logger

    if (!options.api_key) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "EasyPost provider requires `api_key` option"
      )
    }

    this.client = new EasyPostClient(options.api_key)

    // Configure origin/warehouse address
    // FedEx requires phone number on both addresses to return rates
    this.originAddress = {
      name: options.ship_from_name || "OpticWorks",
      street1: options.ship_from_street1 || "123 Commerce St",
      city: options.ship_from_city || "Los Angeles",
      state: options.ship_from_state || "CA",
      zip: options.ship_from_zip || "90001",
      country: "US",
      phone: options.ship_from_phone || "0000000000",
    }

    this.logger.info("[EasyPost] Fulfillment provider initialized")
  }

  /**
   * Validate provider options
   */
  static validateOptions(options: Record<string, unknown>) {
    if (!options.api_key) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "EasyPost provider requires `api_key` option"
      )
    }
  }

  /**
   * Return the list of fulfillment options this provider supports
   */
  async getFulfillmentOptions(): Promise<{ id: string; is_return?: boolean; [k: string]: unknown }[]> {
    return Object.entries(CARRIER_SERVICES).map(([id, config]) => ({
      id,
      name: config.name,
      carriers: config.carriers,
      is_return: false,
    }))
  }

  /**
   * Validate that a shipping option's data is valid
   */
  async validateOption(data: Record<string, unknown>): Promise<boolean> {
    const optionId = data.id as string
    return optionId in CARRIER_SERVICES
  }

  /**
   * Validate fulfillment data (shipping address, etc.)
   * Called when adding a shipping method to a cart
   */
  async validateFulfillmentData(
    optionData: Record<string, unknown>,
    data: Record<string, unknown>,
    context: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    // Extract shipping address from context
    const shippingAddress = context.shipping_address as Record<string, unknown> | undefined

    if (!shippingAddress) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Shipping address is required"
      )
    }

    // Validate address with EasyPost
    const address: EasyPostAddress = {
      name: shippingAddress.first_name
        ? `${shippingAddress.first_name} ${shippingAddress.last_name || ""}`
        : undefined,
      street1: shippingAddress.address_1 as string,
      street2: shippingAddress.address_2 as string | undefined,
      city: shippingAddress.city as string,
      state: shippingAddress.province as string,
      zip: shippingAddress.postal_code as string,
      country: (shippingAddress.country_code as string)?.toUpperCase() || "US",
    }

    const validation = await this.client.validateAddress(address)

    if (!validation.success) {
      this.logger.warn(`[EasyPost] Address validation failed: ${validation.errors?.join(", ")}`)
      // Don't throw - let the order proceed but log the warning
      // The address might still be deliverable even if validation fails
    }

    // Return the validated/normalized address data
    return {
      ...data,
      easypost_address: validation.address || address,
      address_validated: validation.success,
    }
  }

  /**
   * Check if this provider can calculate prices
   */
  async canCalculate(_data: CreateShippingOptionDTO): Promise<boolean> {
    // We can calculate prices for all our shipping options
    return true
  }

  /**
   * Calculate the shipping price for a given option
   * This is called when displaying shipping options to the customer
   */
  async calculatePrice(
    optionData: Record<string, unknown>,
    data: Record<string, unknown>,
    context: Record<string, unknown>
  ): Promise<{ calculated_amount: number; is_calculated_price_tax_inclusive: boolean }> {
    const optionId = optionData.id as string
    const carrierConfig = CARRIER_SERVICES[optionId]

    if (!carrierConfig) {
      this.logger.warn(`[EasyPost] Unknown shipping option: ${optionId}`)
      return { calculated_amount: 0, is_calculated_price_tax_inclusive: false }
    }

    // Extract shipping address from context
    const shippingAddress = context.shipping_address as Record<string, unknown> | undefined

    if (!shippingAddress) {
      this.logger.warn("[EasyPost] No shipping address in context for price calculation")
      return { calculated_amount: 0, is_calculated_price_tax_inclusive: false }
    }

    // Build destination address
    // FedEx requires phone number to return rates - use a placeholder if not provided
    const toAddress: EasyPostAddress = {
      name: shippingAddress.first_name
        ? `${shippingAddress.first_name} ${shippingAddress.last_name || ""}`
        : "Customer",
      street1: shippingAddress.address_1 as string,
      street2: shippingAddress.address_2 as string | undefined,
      city: shippingAddress.city as string,
      state: shippingAddress.province as string,
      zip: shippingAddress.postal_code as string,
      country: (shippingAddress.country_code as string)?.toUpperCase() || "US",
      phone: (shippingAddress.phone as string) || "0000000000", // FedEx requires phone
    }

    // Get parcel dimensions from context or use defaults
    const parcel = this.getParcelFromContext(context)

    // Debug log the addresses being sent
    this.logger.info(`[EasyPost] Creating shipment for ${optionId} with from_phone=${this.originAddress.phone}, to_phone=${toAddress.phone}`)

    try {
      // Create shipment to get rates
      const shipment = await this.client.createShipment(
        this.originAddress,
        toAddress,
        parcel,
        carrierConfig.carriers
      )

      // Log all rates returned by EasyPost for debugging
      if (shipment.rates.length > 0) {
        const ratesSummary = shipment.rates.map(r => `${r.carrier}/${r.service}=$${r.rate}`).join(', ')
        this.logger.info(`[EasyPost] Rates returned for ${optionId}: ${ratesSummary}`)
      } else {
        this.logger.warn(`[EasyPost] No rates returned by EasyPost for ${optionId}`)
      }

      // Find the matching rate for this service
      const matchingRate = this.findMatchingRate(shipment.rates, optionId)

      if (!matchingRate) {
        this.logger.warn(`[EasyPost] No matching rate for ${optionId} (looking for carrier: ${carrierConfig.carriers.join(',')})`)
        return { calculated_amount: 0, is_calculated_price_tax_inclusive: false }
      }

      // Store the shipment ID and rate ID for later use
      // This will be passed to createFulfillment
      if (data) {
        (data as Record<string, unknown>).easypost_shipment_id = shipment.id
        ;(data as Record<string, unknown>).easypost_rate_id = matchingRate.id
      }

      // Medusa v2 stores prices in MAJOR units (dollars), not minor units (cents)
      // EasyPost returns rate as a string like "7.67" (dollars)
      // We return it directly as a number without converting to cents
      // See: https://docs.medusajs.com/learn/introduction/from-v1-to-v2#prices-are-stored-in-major-units
      const rateInDollars = parseFloat(matchingRate.rate)

      this.logger.info(
        `[EasyPost] Calculated rate for ${optionId}: $${matchingRate.rate} (${rateInDollars} major units)`
      )

      return {
        calculated_amount: rateInDollars,
        is_calculated_price_tax_inclusive: false,
      }
    } catch (error) {
      this.logger.error(`[EasyPost] Failed to calculate price: ${error}`)
      return { calculated_amount: 0, is_calculated_price_tax_inclusive: false }
    }
  }

  /**
   * Create a fulfillment (purchase a shipping label)
   */
  async createFulfillment(
    data: Record<string, unknown>,
    items: Record<string, unknown>[],
    order: Record<string, unknown> | undefined,
    _fulfillment: Record<string, unknown>
  ): Promise<{ data: Record<string, unknown>; labels: { tracking_number: string; tracking_url: string; label_url: string }[] }> {
    // Debug: Log what data is passed to createFulfillment
    this.logger.info("[EasyPost] createFulfillment called with data keys: " + Object.keys(data).join(", "))
    this.logger.info("[EasyPost] createFulfillment data: " + JSON.stringify(data, null, 2))

    const shipmentId = data.easypost_shipment_id as string
    const rateId = data.easypost_rate_id as string

    this.logger.info(`[EasyPost] createFulfillment - shipmentId: ${shipmentId || "NOT FOUND"}, rateId: ${rateId || "NOT FOUND"}`)

    if (!shipmentId || !rateId) {
      // If we don't have a pre-created shipment, create one now
      this.logger.info("[EasyPost] No pre-created shipment, creating new one for fulfillment")

      const shippingAddress = (order as Record<string, unknown>)?.shipping_address as Record<string, unknown>
      if (!shippingAddress) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          "Order shipping address is required for fulfillment"
        )
      }

      const toAddress: EasyPostAddress = {
        name: shippingAddress.first_name
          ? `${shippingAddress.first_name} ${shippingAddress.last_name || ""}`
          : "Customer",
        street1: shippingAddress.address_1 as string,
        street2: shippingAddress.address_2 as string | undefined,
        city: shippingAddress.city as string,
        state: shippingAddress.province as string,
        zip: shippingAddress.postal_code as string,
        country: (shippingAddress.country_code as string)?.toUpperCase() || "US",
      }

      const parcel = this.calculateParcelFromItems(items)
      const shipment = await this.client.createShipment(
        this.originAddress,
        toAddress,
        parcel,
        ["USPS", "FedEx"]
      )

      // Use the cheapest rate
      if (shipment.rates.length === 0) {
        throw new MedusaError(
          MedusaError.Types.UNEXPECTED_STATE,
          "No shipping rates available"
        )
      }

      const purchasedLabel = await this.client.purchaseLabel(
        shipment.id,
        shipment.rates[0].id
      )

      return this.formatLabelResponse(purchasedLabel)
    }

    // Purchase the pre-selected rate
    try {
      const purchasedLabel = await this.client.purchaseLabel(shipmentId, rateId)
      return this.formatLabelResponse(purchasedLabel)
    } catch (error) {
      this.logger.error(`[EasyPost] Failed to purchase label: ${error}`)
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Failed to purchase shipping label: ${error instanceof Error ? error.message : "Unknown error"}`
      )
    }
  }

  /**
   * Create a return fulfillment
   */
  async createReturnFulfillment(
    _fulfillment: Record<string, unknown>
  ): Promise<{ data: Record<string, unknown>; labels: { tracking_number: string; tracking_url: string; label_url: string }[] }> {
    // For returns, we'd create a return shipment
    // For now, return empty - can be implemented later
    this.logger.info("[EasyPost] Return fulfillment requested - not yet implemented")
    return { data: {}, labels: [] }
  }

  /**
   * Cancel a fulfillment (void/refund the label)
   */
  async cancelFulfillment(fulfillment: Record<string, unknown>): Promise<Record<string, unknown>> {
    const shipmentId = (fulfillment.data as Record<string, unknown>)?.easypost_shipment_id as string

    if (!shipmentId) {
      this.logger.warn("[EasyPost] No shipment ID found for cancellation")
      return { cancelled: false, reason: "No shipment ID" }
    }

    try {
      const result = await this.client.refundShipment(shipmentId)
      this.logger.info(`[EasyPost] Shipment ${shipmentId} refund status: ${result.status}`)
      return { cancelled: true, status: result.status }
    } catch (error) {
      this.logger.error(`[EasyPost] Failed to cancel fulfillment: ${error}`)
      return {
        cancelled: false,
        reason: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  /**
   * Get fulfillment documents (labels, packing slips, etc.)
   * Note: Base class expects never[] but we return actual documents
   */
  async getFulfillmentDocuments(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _data: Record<string, unknown>
  ): Promise<never[]> {
    // The base class signature expects never[] - documents are accessed via fulfillment data
    return []
  }

  /**
   * Get return documents
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getReturnDocuments(_data: Record<string, unknown>): Promise<never[]> {
    return []
  }

  /**
   * Get shipment documents
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getShipmentDocuments(_data: Record<string, unknown>): Promise<never[]> {
    return []
  }

  /**
   * Retrieve documents by type
   */
  async retrieveDocuments(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _fulfillmentData: Record<string, unknown>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _documentType: string
  ): Promise<void> {
    // Documents are stored in fulfillment.data and accessed directly
    return
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  private getParcelFromContext(context: Record<string, unknown>): EasyPostParcel {
    // Try to get parcel info from context items
    const items = context.items as Record<string, unknown>[] | undefined

    if (items && items.length > 0) {
      return this.calculateParcelFromItems(items)
    }

    return DEFAULT_PARCEL
  }

  private calculateParcelFromItems(items: Record<string, unknown>[]): EasyPostParcel {
    // Simple box-packing heuristic
    // In production, you'd want more sophisticated packing algorithms
    let totalWeight = 0
    let maxLength = 0
    let maxWidth = 0
    let totalHeight = 0

    for (const item of items) {
      const quantity = (item.quantity as number) || 1
      const variant = item.variant as Record<string, unknown> | undefined

      // Get weight (convert from grams to ounces if needed)
      const weightGrams = (variant?.weight as number) || 500 // Default 500g
      totalWeight += (weightGrams / 28.35) * quantity // Convert to oz

      // Get dimensions or use defaults
      const length = (variant?.length as number) || 8
      const width = (variant?.width as number) || 6
      const height = (variant?.height as number) || 4

      maxLength = Math.max(maxLength, length)
      maxWidth = Math.max(maxWidth, width)
      totalHeight += height * quantity
    }

    return {
      length: maxLength || DEFAULT_PARCEL.length,
      width: maxWidth || DEFAULT_PARCEL.width,
      height: Math.min(totalHeight, 24) || DEFAULT_PARCEL.height, // Cap at 24 inches
      weight: Math.max(totalWeight, 1) || DEFAULT_PARCEL.weight, // Minimum 1 oz
    }
  }

  private findMatchingRate(
    rates: Array<{ id: string; carrier: string; service: string; rate: string }>,
    optionId: string
  ): { id: string; rate: string } | undefined {
    // Find the EasyPost service name that maps to this option ID
    for (const [easypostService, mappedOptionId] of Object.entries(SERVICE_MAP)) {
      if (mappedOptionId === optionId) {
        const rate = rates.find((r) => r.service === easypostService)
        if (rate) {
          return { id: rate.id, rate: rate.rate }
        }
      }
    }

    // If no exact match, find by carrier and return cheapest
    const config = CARRIER_SERVICES[optionId]
    if (config) {
      const carrierRates = rates.filter((r) =>
        config.carriers.some((c) => c.toUpperCase() === r.carrier.toUpperCase())
      )
      if (carrierRates.length > 0) {
        return { id: carrierRates[0].id, rate: carrierRates[0].rate }
      }
    }

    return undefined
  }

  private formatLabelResponse(purchasedLabel: {
    id: string
    tracking_code: string
    tracker?: { tracking_code: string; public_url: string }
    postage_label?: { label_url: string; label_file_type: string }
    selected_rate?: { carrier: string; service: string }
  }): { data: Record<string, unknown>; labels: { tracking_number: string; tracking_url: string; label_url: string }[] } {
    const trackingCode = purchasedLabel.tracker?.tracking_code || purchasedLabel.tracking_code
    const trackingUrl = purchasedLabel.tracker?.public_url || ""
    const labelUrl = purchasedLabel.postage_label?.label_url || ""
    const labelFormat = purchasedLabel.postage_label?.label_file_type || "PDF"

    this.logger.info(
      `[EasyPost] Label purchased: tracking=${trackingCode}, carrier=${purchasedLabel.selected_rate?.carrier}`
    )

    return {
      data: {
        easypost_shipment_id: purchasedLabel.id,
        tracking_code: trackingCode,
        tracking_url: trackingUrl,
        label_url: labelUrl,
        label_format: labelFormat,
        carrier: purchasedLabel.selected_rate?.carrier,
        service: purchasedLabel.selected_rate?.service,
      },
      labels: [
        {
          tracking_number: trackingCode,
          tracking_url: trackingUrl,
          label_url: labelUrl,
        },
      ],
    }
  }
}

export default EasyPostFulfillmentProviderService
