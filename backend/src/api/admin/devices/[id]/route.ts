import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { DEVICE_MODULE } from "../../../../modules/device"
import type DeviceModuleService from "../../../../modules/device/service"

interface UpdateDeviceBody {
  firmware_version?: string
  metadata?: Record<string, unknown>
}

/**
 * GET /admin/devices/:id
 *
 * Get a single device by ID.
 * Requires admin authentication.
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const logger = req.scope.resolve("logger")
  const deviceService: DeviceModuleService = req.scope.resolve(DEVICE_MODULE)

  const deviceId = req.params.id

  logger.info(`[admin/devices] Getting device: ${deviceId}`)

  try {
    const devices = await deviceService.listDevices({ id: deviceId })
    const device = devices[0]

    if (!device) {
      res.status(404).json({ error: "Device not found" })
      return
    }

    res.json({ device })
  } catch (error) {
    logger.error(`[admin/devices] Failed to get device: ${error}`)
    res.status(500).json({ error: "Failed to fetch device" })
  }
}

/**
 * PATCH /admin/devices/:id
 *
 * Update a device (e.g., firmware version, metadata).
 * Requires admin authentication.
 */
export async function PATCH(
  req: MedusaRequest<UpdateDeviceBody>,
  res: MedusaResponse
): Promise<void> {
  const logger = req.scope.resolve("logger")
  const deviceService: DeviceModuleService = req.scope.resolve(DEVICE_MODULE)

  const deviceId = req.params.id
  const { firmware_version, metadata } = req.body

  logger.info(`[admin/devices] Updating device: ${deviceId}`)

  try {
    const devices = await deviceService.listDevices({ id: deviceId })
    const device = devices[0]

    if (!device) {
      res.status(404).json({ error: "Device not found" })
      return
    }

    const updateData: Record<string, unknown> = { id: deviceId }

    if (firmware_version !== undefined) {
      updateData.firmware_version = firmware_version
    }

    if (metadata !== undefined) {
      // Merge metadata
      updateData.metadata = {
        ...(device.metadata as Record<string, unknown> ?? {}),
        ...metadata,
      }
    }

    const updated = await deviceService.updateDevices(updateData)

    logger.info(`[admin/devices] Updated device: ${deviceId}`)

    res.json({ device: updated })
  } catch (error) {
    logger.error(`[admin/devices] Failed to update device: ${error}`)
    res.status(500).json({ error: "Failed to update device" })
  }
}

/**
 * DELETE /admin/devices/:id
 *
 * Delete a device.
 * Requires admin authentication.
 */
export async function DELETE(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const logger = req.scope.resolve("logger")
  const deviceService: DeviceModuleService = req.scope.resolve(DEVICE_MODULE)

  const deviceId = req.params.id

  logger.info(`[admin/devices] Deleting device: ${deviceId}`)

  try {
    const devices = await deviceService.listDevices({ id: deviceId })
    const device = devices[0]

    if (!device) {
      res.status(404).json({ error: "Device not found" })
      return
    }

    await deviceService.deleteDevices(deviceId)

    logger.info(`[admin/devices] Deleted device: ${deviceId}`)

    res.json({ success: true })
  } catch (error) {
    logger.error(`[admin/devices] Failed to delete device: ${error}`)
    res.status(500).json({ error: "Failed to delete device" })
  }
}
