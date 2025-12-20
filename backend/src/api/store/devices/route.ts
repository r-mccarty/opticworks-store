import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { DEVICE_MODULE } from "../../../modules/device"
import type DeviceModuleService from "../../../modules/device/service"

/**
 * GET /store/devices
 *
 * List all devices for the authenticated customer.
 * Requires customer authentication via bearer token.
 */
export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const logger = req.scope.resolve("logger")
  const deviceService: DeviceModuleService = req.scope.resolve(DEVICE_MODULE)

  const customerId = req.auth_context?.actor_id

  if (!customerId) {
    res.status(401).json({ error: "Not authenticated" })
    return
  }

  logger.info(`[devices] Listing devices for customer: ${customerId}`)

  try {
    const devices = await deviceService.getDevicesByCustomer(customerId)

    // Format response (exclude sensitive fields like tokens)
    const formattedDevices = devices.map((device) => ({
      id: device.id,
      serial_number: device.serial_number,
      product_type: device.product_type,
      firmware_version: device.firmware_version,
      last_seen_at: device.last_seen_at,
      registered_at: device.registered_at,
      paired_at: device.paired_at,
      metadata: device.metadata,
    }))

    res.json({ devices: formattedDevices })
  } catch (error) {
    logger.error(`[devices] Failed to list devices: ${error}`)
    res.status(500).json({ error: "Failed to fetch devices" })
  }
}
