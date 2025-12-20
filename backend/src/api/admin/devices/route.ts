import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { DEVICE_MODULE } from "../../../modules/device"
import type DeviceModuleService from "../../../modules/device/service"

interface CreateDeviceBody {
  serial_number: string
  product_type?: string
  order_id?: string
  metadata?: Record<string, unknown>
}

/**
 * GET /admin/devices
 *
 * List all devices. Supports filtering by customer_id, order_id, product_type.
 * Requires admin authentication.
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const logger = req.scope.resolve("logger")
  const deviceService: DeviceModuleService = req.scope.resolve(DEVICE_MODULE)

  const { customer_id, order_id, product_type, limit, offset } = req.query as {
    customer_id?: string
    order_id?: string
    product_type?: string
    limit?: string
    offset?: string
  }

  logger.info("[admin/devices] Listing devices")

  try {
    // Build filters
    const filters: Record<string, unknown> = {}
    if (customer_id) filters.customer_id = customer_id
    if (order_id) filters.order_id = order_id
    if (product_type) filters.product_type = product_type

    const devices = await deviceService.listDevices(filters, {
      take: limit ? parseInt(limit, 10) : 50,
      skip: offset ? parseInt(offset, 10) : 0,
    })

    // Get total count for pagination
    const allDevices = await deviceService.listDevices(filters)
    const count = allDevices.length

    res.json({
      devices,
      count,
      limit: limit ? parseInt(limit, 10) : 50,
      offset: offset ? parseInt(offset, 10) : 0,
    })
  } catch (error) {
    logger.error(`[admin/devices] Failed to list devices: ${error}`)
    res.status(500).json({ error: "Failed to fetch devices" })
  }
}

/**
 * POST /admin/devices
 *
 * Create a new device (called during fulfillment when order ships).
 * Requires admin authentication.
 */
export async function POST(
  req: MedusaRequest<CreateDeviceBody>,
  res: MedusaResponse
): Promise<void> {
  const logger = req.scope.resolve("logger")
  const deviceService: DeviceModuleService = req.scope.resolve(DEVICE_MODULE)

  const { serial_number, product_type, order_id, metadata } = req.body

  if (!serial_number) {
    res.status(400).json({ error: "serial_number is required" })
    return
  }

  logger.info(`[admin/devices] Creating device: ${serial_number}`)

  try {
    // Check if device already exists
    const existingDevice = await deviceService.getDeviceBySerial(serial_number)
    if (existingDevice) {
      res.status(409).json({
        error: "Device already exists",
        device: existingDevice,
      })
      return
    }

    const device = await deviceService.createDevice({
      serial_number,
      product_type,
      order_id,
      metadata,
    })

    logger.info(`[admin/devices] Created device: ${device.id}`)

    res.status(201).json({ device })
  } catch (error) {
    logger.error(`[admin/devices] Failed to create device: ${error}`)
    res.status(500).json({ error: "Failed to create device" })
  }
}
