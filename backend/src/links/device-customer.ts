/**
 * Device-Customer Link
 *
 * This link allows querying devices from customers and vice versa
 * using Medusa's Query API (query.graph()).
 *
 * Example usage:
 * ```typescript
 * const { data: customers } = await query.graph({
 *   entity: "customer",
 *   fields: ["id", "device_link.device.*"],
 *   filters: { id: customerId },
 * })
 * ```
 *
 * Note: We also store customer_id directly in the device model for
 * simpler direct queries. This link enables relationship traversal.
 */
import CustomerModule from "@medusajs/medusa/customer"
import DeviceModule from "../modules/device"
import { defineLink } from "@medusajs/framework/utils"

export default defineLink(
  CustomerModule.linkable.customer,
  DeviceModule.linkable.device
)
