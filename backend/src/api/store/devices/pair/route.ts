import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { DEVICE_MODULE } from "../../../../modules/device"
import type DeviceModuleService from "../../../../modules/device/service"

interface PairDeviceBody {
  serial_number: string
}

/**
 * POST /store/devices/pair
 *
 * Pair a device to the authenticated customer by serial number.
 * The device must be pre-registered (created during fulfillment).
 */
export async function POST(
  req: AuthenticatedMedusaRequest<PairDeviceBody>,
  res: MedusaResponse
): Promise<void> {
  const logger = req.scope.resolve("logger")
  const deviceService: DeviceModuleService = req.scope.resolve(DEVICE_MODULE)

  const customerId = req.auth_context?.actor_id
  const { serial_number } = req.body

  if (!customerId) {
    res.status(401).json({ error: "Not authenticated" })
    return
  }

  if (!serial_number) {
    res.status(400).json({ error: "serial_number is required" })
    return
  }

  logger.info(`[devices] Pairing device ${serial_number} to customer: ${customerId}`)

  try {
    // Check if device exists
    const existingDevice = await deviceService.getDeviceBySerial(serial_number)

    if (!existingDevice) {
      res.status(404).json({
        error: "Device not found",
        message: "This device serial number is not registered. Please contact support.",
      })
      return
    }

    // Check if device is already paired to another customer
    if (existingDevice.customer_id && existingDevice.customer_id !== customerId) {
      res.status(409).json({
        error: "Device already paired",
        message: "This device is already paired to another account.",
      })
      return
    }

    // Check if device is already paired to this customer
    if (existingDevice.customer_id === customerId) {
      res.json({
        device: {
          id: existingDevice.id,
          serial_number: existingDevice.serial_number,
          product_type: existingDevice.product_type,
          firmware_version: existingDevice.firmware_version,
          last_seen_at: existingDevice.last_seen_at,
          registered_at: existingDevice.registered_at,
          paired_at: existingDevice.paired_at,
        },
        message: "Device is already paired to your account",
      })
      return
    }

    // Pair the device
    const device = await deviceService.pairDevice({
      serial_number,
      customer_id: customerId,
    })

    logger.info(`[devices] Paired device ${serial_number} to customer ${customerId}`)

    res.json({
      device: {
        id: device.id,
        serial_number: device.serial_number,
        product_type: device.product_type,
        firmware_version: device.firmware_version,
        last_seen_at: device.last_seen_at,
        registered_at: device.registered_at,
        paired_at: device.paired_at,
      },
      message: "Device paired successfully",
    })
  } catch (error) {
    logger.error(`[devices] Failed to pair device: ${error}`)
    res.status(500).json({ error: "Failed to pair device" })
  }
}
