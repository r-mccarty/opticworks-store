import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { DEVICE_MODULE } from "../../../../modules/device"
import type DeviceModuleService from "../../../../modules/device/service"

/**
 * GET /store/devices/:id
 *
 * Get a single device by ID.
 * Only returns the device if it belongs to the authenticated customer.
 */
export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const logger = req.scope.resolve("logger")
  const deviceService: DeviceModuleService = req.scope.resolve(DEVICE_MODULE)

  const customerId = req.auth_context?.actor_id
  const deviceId = req.params.id

  if (!customerId) {
    res.status(401).json({ error: "Not authenticated" })
    return
  }

  logger.info(`[devices] Getting device ${deviceId} for customer: ${customerId}`)

  try {
    const devices = await deviceService.listDevices({ id: deviceId })
    const device = devices[0]

    if (!device) {
      res.status(404).json({ error: "Device not found" })
      return
    }

    // Only return device if it belongs to this customer
    if (device.customer_id !== customerId) {
      res.status(403).json({ error: "Device not found" })
      return
    }

    // Format response (exclude sensitive fields)
    res.json({
      device: {
        id: device.id,
        serial_number: device.serial_number,
        product_type: device.product_type,
        firmware_version: device.firmware_version,
        last_seen_at: device.last_seen_at,
        registered_at: device.registered_at,
        paired_at: device.paired_at,
        metadata: device.metadata,
      },
    })
  } catch (error) {
    logger.error(`[devices] Failed to get device: ${error}`)
    res.status(500).json({ error: "Failed to fetch device" })
  }
}

/**
 * DELETE /store/devices/:id
 *
 * Unpair a device from the authenticated customer.
 */
export async function DELETE(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const logger = req.scope.resolve("logger")
  const deviceService: DeviceModuleService = req.scope.resolve(DEVICE_MODULE)

  const customerId = req.auth_context?.actor_id
  const deviceId = req.params.id

  if (!customerId) {
    res.status(401).json({ error: "Not authenticated" })
    return
  }

  logger.info(`[devices] Unpairing device ${deviceId} for customer: ${customerId}`)

  try {
    const devices = await deviceService.listDevices({ id: deviceId })
    const device = devices[0]

    if (!device) {
      res.status(404).json({ error: "Device not found" })
      return
    }

    // Only allow unpair if device belongs to this customer
    if (device.customer_id !== customerId) {
      res.status(403).json({ error: "Device not found" })
      return
    }

    await deviceService.unpairDevice(deviceId)

    logger.info(`[devices] Unpaired device ${deviceId} from customer ${customerId}`)

    res.json({ success: true })
  } catch (error) {
    logger.error(`[devices] Failed to unpair device: ${error}`)
    res.status(500).json({ error: "Failed to unpair device" })
  }
}
