/**
 * EasyPost API Client
 *
 * Fetch-based client for EasyPost API calls.
 * Uses basic auth with API key.
 */

import {
  EasyPostAddress,
  EasyPostParcel,
  EasyPostShipmentResponse,
  EasyPostPurchasedShipment,
  EasyPostAddressResponse,
} from "./types"

const EASYPOST_API_BASE = "https://api.easypost.com/v2"

export class EasyPostClient {
  private apiKey: string

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error("EasyPost API key is required")
    }
    this.apiKey = apiKey
  }

  /**
   * Make an authenticated request to the EasyPost API
   */
  private async fetch<T>(
    endpoint: string,
    options: {
      method?: "GET" | "POST" | "PUT" | "DELETE"
      body?: Record<string, unknown>
    } = {}
  ): Promise<T> {
    const { method = "GET", body } = options

    // Use Buffer for Node.js environment (backend)
    const authHeader = `Basic ${Buffer.from(`${this.apiKey}:`).toString("base64")}`

    const response = await fetch(`${EASYPOST_API_BASE}${endpoint}`, {
      method,
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({})) as { error?: { message?: string } }
      throw new Error(
        errorData?.error?.message || `EasyPost API error: ${response.status}`
      )
    }

    return response.json() as Promise<T>
  }

  /**
   * Validate an address
   */
  async validateAddress(address: EasyPostAddress): Promise<{
    success: boolean
    address?: EasyPostAddressResponse
    errors?: string[]
  }> {
    try {
      const result = await this.fetch<EasyPostAddressResponse>("/addresses", {
        method: "POST",
        body: {
          address: {
            ...address,
            country: address.country || "US",
            verify: ["delivery"],
          },
        },
      })

      const deliverySuccess = result.verifications?.delivery?.success ?? false

      return {
        success: deliverySuccess,
        address: result,
        errors: result.verifications?.delivery?.errors?.map((e) => e.message),
      }
    } catch (error) {
      return {
        success: false,
        errors: [error instanceof Error ? error.message : "Address validation failed"],
      }
    }
  }

  /**
   * Create a shipment and get rates
   */
  async createShipment(
    fromAddress: EasyPostAddress,
    toAddress: EasyPostAddress,
    parcel: EasyPostParcel,
    carrierFilter?: string[]
  ): Promise<EasyPostShipmentResponse> {
    const shipment = await this.fetch<EasyPostShipmentResponse>("/shipments", {
      method: "POST",
      body: {
        shipment: {
          from_address: {
            ...fromAddress,
            country: fromAddress.country || "US",
          },
          to_address: {
            ...toAddress,
            country: toAddress.country || "US",
          },
          parcel,
        },
      },
    })

    // Filter rates by carrier if specified
    if (carrierFilter && carrierFilter.length > 0) {
      const normalizedFilter = carrierFilter.map((c) => c.toUpperCase())
      shipment.rates = shipment.rates.filter((rate) =>
        normalizedFilter.includes(rate.carrier.toUpperCase())
      )
    }

    // Sort by rate (cheapest first)
    shipment.rates.sort((a, b) => parseFloat(a.rate) - parseFloat(b.rate))

    return shipment
  }

  /**
   * Purchase a shipping label
   */
  async purchaseLabel(
    shipmentId: string,
    rateId: string
  ): Promise<EasyPostPurchasedShipment> {
    return this.fetch<EasyPostPurchasedShipment>(
      `/shipments/${shipmentId}/buy`,
      {
        method: "POST",
        body: {
          rate: { id: rateId },
        },
      }
    )
  }

  /**
   * Refund/cancel a shipment
   */
  async refundShipment(shipmentId: string): Promise<{ status: string }> {
    return this.fetch<{ status: string }>(`/shipments/${shipmentId}/refund`, {
      method: "POST",
    })
  }

  /**
   * Get shipment details
   */
  async getShipment(shipmentId: string): Promise<EasyPostShipmentResponse> {
    return this.fetch<EasyPostShipmentResponse>(`/shipments/${shipmentId}`)
  }
}
