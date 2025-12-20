import { model } from "@medusajs/framework/utils"

/**
 * Device data model for OpticWorks RS-1 devices.
 *
 * Devices are pre-registered during fulfillment (when orders ship)
 * and later paired to customer accounts when customers set them up.
 */
const Device = model.define("device", {
  id: model.id().primaryKey(),
  // Hardware serial number from /proc/cpuinfo on the device
  serial_number: model.text().unique(),
  // Product type (e.g., "rs1" for OpticWorks RS-1)
  product_type: model.text().default("rs1"),
  // Current firmware version reported by device
  firmware_version: model.text().nullable(),
  // Customer ID (set when device is paired)
  customer_id: model.text().nullable(),
  // Order ID (set when device is shipped)
  order_id: model.text().nullable(),
  // Bearer token for device cloud authentication
  cloud_token: model.text().nullable(),
  // Temporary token for device registration flow
  temp_token: model.text().nullable(),
  // When the device last connected to cloud
  last_seen_at: model.dateTime().nullable(),
  // When the device first registered with cloud
  registered_at: model.dateTime().nullable(),
  // When the device was paired to a customer
  paired_at: model.dateTime().nullable(),
  // Extensible metadata (device info, settings, etc.)
  metadata: model.json().nullable(),
})

export default Device
