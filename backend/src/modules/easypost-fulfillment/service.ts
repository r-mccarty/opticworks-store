/**
 * EasyPost Fulfillment Provider
 *
 * Calculates live carrier rates and purchases labels. It fails closed: when a
 * rate cannot be obtained the option is unavailable, never quoted at $0, and a
 * fulfillment without a server-selected rate is refused rather than buying the
 * cheapest label on some carrier.
 */
import crypto from "crypto"
import { AbstractFulfillmentProviderService, MedusaError } from "@medusajs/framework/utils"
import type { CreateShippingOptionDTO, Logger } from "@medusajs/framework/types"
import { EasyPostClient } from "./client"
import {
  CARRIER_SERVICES,
  SERVICE_MAP,
  type EasyPostAddress,
  type EasyPostParcel,
  type EasyPostProviderOptions,
} from "./types"

type InjectedDependencies = { logger: Logger }

type Rate = { id: string; carrier: string; service: string; rate: string }
type Label = { tracking_number: string; tracking_url: string; label_url: string }

const DEFAULT_PARCEL: EasyPostParcel = { length: 8, width: 6, height: 4, weight: 16 }
const QUOTE_TTL_MS = 5 * 60_000

class EasyPostFulfillmentProviderService extends AbstractFulfillmentProviderService {
  static identifier = "easypost"

  private client: EasyPostClient
  private logger: Logger
  private origin: EasyPostAddress
  // Short-lived quote cache so listing options doesn't create a shipment per option.
  private quotes = new Map<string, { at: number; shipmentId: string; rates: Rate[] }>()

  constructor({ logger }: InjectedDependencies, options: EasyPostProviderOptions) {
    super()
    EasyPostFulfillmentProviderService.validateOptions(options as unknown as Record<string, unknown>)
    this.logger = logger
    this.client = new EasyPostClient(options.api_key)
    this.origin = options.origin
  }

  static validateOptions(options: Record<string, unknown>) {
    const origin = options.origin as Partial<EasyPostAddress> | undefined
    if (!options.api_key) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "EasyPost provider requires `api_key`")
    }
    for (const key of ["name", "street1", "city", "state", "zip"] as const) {
      if (!origin?.[key]) {
        throw new MedusaError(MedusaError.Types.INVALID_DATA, `EasyPost provider requires origin.${key}`)
      }
    }
  }

  async getFulfillmentOptions() {
    return Object.entries(CARRIER_SERVICES).map(([id, config]) => ({
      id,
      name: config.name,
      carriers: config.carriers,
      is_return: false,
    }))
  }

  async validateOption(data: Record<string, unknown>): Promise<boolean> {
    return typeof data.id === "string" && data.id in CARRIER_SERVICES
  }

  async canCalculate(_data: CreateShippingOptionDTO): Promise<boolean> {
    return true
  }

  /**
   * Runs when a shipping method is added to a cart. The returned object is
   * persisted as shipping_method.data and later passed to createFulfillment.
   * Only server-computed keys are returned; client-supplied `data` is ignored
   * so a caller cannot inject a rate id or amount.
   */
  async validateFulfillmentData(
    optionData: Record<string, unknown>,
    _data: Record<string, unknown>,
    context: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    const optionId = this.optionId(optionData)
    const to = this.destination(context.shipping_address)
    const { shipmentId, rate } = await this.quote(optionId, to, this.parcel(context.items))
    return {
      easypost_shipment_id: shipmentId,
      easypost_rate_id: rate.id,
      easypost_rate_amount: rate.rate,
      easypost_carrier: rate.carrier,
      easypost_service: rate.service,
    }
  }

  /**
   * Always prices from a server-side quote. `data` may come from the client
   * (the store calculate endpoint accepts a body), so it is never trusted.
   */
  async calculatePrice(
    optionData: Record<string, unknown>,
    _data: Record<string, unknown>,
    context: Record<string, unknown>
  ): Promise<{ calculated_amount: number; is_calculated_price_tax_inclusive: boolean }> {
    const optionId = this.optionId(optionData)
    const to = this.destination(context.shipping_address)
    const { rate } = await this.quote(optionId, to, this.parcel(context.items))
    const amount = Number(rate.rate)
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, `No valid rate for ${optionId}`)
    }
    // Medusa v2 amounts are major units (dollars).
    return { calculated_amount: amount, is_calculated_price_tax_inclusive: false }
  }

  async createFulfillment(
    data: Record<string, unknown>,
    _items: Record<string, unknown>[],
    _order: Record<string, unknown> | undefined,
    _fulfillment: Record<string, unknown>
  ): Promise<{ data: Record<string, unknown>; labels: Label[] }> {
    const shipmentId = data.easypost_shipment_id
    const rateId = data.easypost_rate_id
    if (typeof shipmentId !== "string" || typeof rateId !== "string") {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Shipping method has no server-selected EasyPost rate; refusing to buy an arbitrary label"
      )
    }
    const purchased = await this.client.purchaseLabel(shipmentId, rateId)
    const trackingCode = purchased.tracker?.tracking_code || purchased.tracking_code
    const trackingUrl = purchased.tracker?.public_url || ""
    const labelUrl = purchased.postage_label?.label_url || ""
    this.logger.info(`[easypost] label purchased shipment=${purchased.id} carrier=${purchased.selected_rate?.carrier ?? "?"}`)
    return {
      data: {
        easypost_shipment_id: purchased.id,
        tracking_code: trackingCode,
        tracking_url: trackingUrl,
        label_url: labelUrl,
        label_format: purchased.postage_label?.label_file_type || "PDF",
        carrier: purchased.selected_rate?.carrier,
        service: purchased.selected_rate?.service,
      },
      labels: [{ tracking_number: trackingCode, tracking_url: trackingUrl, label_url: labelUrl }],
    }
  }

  async createReturnFulfillment(
    _fulfillment: Record<string, unknown>
  ): Promise<{ data: Record<string, unknown>; labels: Label[] }> {
    throw new MedusaError(MedusaError.Types.NOT_ALLOWED, "Return labels are not supported yet")
  }

  async cancelFulfillment(fulfillment: Record<string, unknown>): Promise<Record<string, unknown>> {
    const shipmentId = (fulfillment.data as Record<string, unknown> | undefined)?.easypost_shipment_id
    if (typeof shipmentId !== "string") {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "Fulfillment has no EasyPost shipment to void")
    }
    // Throws on failure so the cancellation isn't recorded while the label stays billable.
    const result = await this.client.refundShipment(shipmentId)
    return { refund_status: result.status }
  }

  async getFulfillmentDocuments(_data: Record<string, unknown>): Promise<never[]> {
    return []
  }

  async getReturnDocuments(_data: Record<string, unknown>): Promise<never[]> {
    return []
  }

  async getShipmentDocuments(_data: Record<string, unknown>): Promise<never[]> {
    return []
  }

  async retrieveDocuments(_fulfillmentData: Record<string, unknown>, _documentType: string): Promise<void> {
    return
  }

  // ---------------------------------------------------------------------------

  private optionId(optionData: Record<string, unknown>): string {
    const id = optionData.id
    if (typeof id !== "string" || !(id in CARRIER_SERVICES)) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "Unknown EasyPost shipping option")
    }
    return id
  }

  private destination(raw: unknown): EasyPostAddress {
    const a = (raw ?? {}) as Record<string, unknown>
    const str = (k: string) => (typeof a[k] === "string" ? (a[k] as string).trim() : "")
    if (!str("address_1") || !str("city") || !str("postal_code") || !str("country_code")) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "A complete shipping address is required")
    }
    return {
      name: [str("first_name"), str("last_name")].filter(Boolean).join(" ") || "Customer",
      street1: str("address_1"),
      street2: str("address_2") || undefined,
      city: str("city"),
      state: str("province"),
      zip: str("postal_code"),
      country: str("country_code").toUpperCase(),
      // FedEx requires a phone number on both addresses to return rates.
      phone: str("phone") || this.origin.phone || undefined,
    }
  }

  private async quote(
    optionId: string,
    to: EasyPostAddress,
    parcel: EasyPostParcel
  ): Promise<{ shipmentId: string; rate: Rate }> {
    const key = crypto.createHash("sha256").update(JSON.stringify([to, parcel])).digest("hex")
    let entry = this.quotes.get(key)
    if (!entry || Date.now() - entry.at > QUOTE_TTL_MS) {
      const shipment = await this.client.createShipment(this.origin, to, parcel)
      entry = { at: Date.now(), shipmentId: shipment.id, rates: shipment.rates }
      this.quotes.set(key, entry)
      this.prune()
    }
    const rate = this.matchRate(entry.rates, optionId)
    if (!rate) {
      throw new MedusaError(MedusaError.Types.NOT_FOUND, `${CARRIER_SERVICES[optionId].name} is unavailable for this address`)
    }
    return { shipmentId: entry.shipmentId, rate }
  }

  private prune() {
    const now = Date.now()
    for (const [k, v] of this.quotes) if (now - v.at > QUOTE_TTL_MS) this.quotes.delete(k)
  }

  /** Exact service match only; never substitute a different service's price. */
  private matchRate(rates: Rate[], optionId: string): Rate | undefined {
    const carriers = CARRIER_SERVICES[optionId].carriers.map((c) => c.toUpperCase())
    return rates.find(
      (r) => SERVICE_MAP[r.service] === optionId && carriers.includes(r.carrier.toUpperCase())
    )
  }

  private parcel(rawItems: unknown): EasyPostParcel {
    const items = Array.isArray(rawItems) ? (rawItems as Record<string, unknown>[]) : []
    if (items.length === 0) return DEFAULT_PARCEL
    let weightOz = 0
    let length = 0
    let width = 0
    let height = 0
    for (const item of items) {
      const qty = Math.max(1, Number(item.quantity) || 1)
      const variant = (item.variant ?? {}) as Record<string, unknown>
      // Medusa variant weight is stored in grams.
      weightOz += ((Number(variant.weight) || 500) / 28.35) * qty
      length = Math.max(length, Number(variant.length) || 8)
      width = Math.max(width, Number(variant.width) || 6)
      height += (Number(variant.height) || 4) * qty
    }
    return { length, width, height: Math.min(height, 24), weight: Math.max(weightOz, 1) }
  }
}

export default EasyPostFulfillmentProviderService
