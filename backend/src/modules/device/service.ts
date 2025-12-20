import { MedusaService } from "@medusajs/framework/utils"
import { randomBytes } from "crypto"
import Device from "./models/device"
import type {
  CreateDeviceInput,
  PairDeviceInput,
  UpdateDeviceStatusInput,
  DeviceTokenResponse,
  DeviceCloudTokenResponse,
  DeviceDTO,
} from "./types"

/**
 * Device Module Service
 *
 * Handles device registration, pairing, and status updates.
 * Extends MedusaService to get auto-generated CRUD operations.
 */
class DeviceModuleService extends MedusaService({
  Device,
}) {
  /**
   * Create a new device record (called during fulfillment).
   * The device is pre-registered but not yet paired to a customer.
   */
  async createDevice(input: CreateDeviceInput): Promise<DeviceDTO> {
    const device = await this.createDevices({
      serial_number: input.serial_number,
      product_type: input.product_type ?? "rs1",
      order_id: input.order_id ?? null,
      metadata: input.metadata ?? null,
    })

    return device
  }

  /**
   * Get a device by serial number.
   */
  async getDeviceBySerial(serialNumber: string): Promise<DeviceDTO | null> {
    const devices = await this.listDevices({
      serial_number: serialNumber,
    })

    return devices[0] ?? null
  }

  /**
   * Get all devices for a customer.
   */
  async getDevicesByCustomer(customerId: string): Promise<DeviceDTO[]> {
    return await this.listDevices({
      customer_id: customerId,
    })
  }

  /**
   * Get all devices for an order.
   */
  async getDevicesByOrder(orderId: string): Promise<DeviceDTO[]> {
    return await this.listDevices({
      order_id: orderId,
    })
  }

  /**
   * Pair a device to a customer account.
   * Called when customer confirms device in their account.
   */
  async pairDevice(input: PairDeviceInput): Promise<DeviceDTO> {
    const device = await this.getDeviceBySerial(input.serial_number)

    if (!device) {
      throw new Error(`Device not found: ${input.serial_number}`)
    }

    if (device.customer_id && device.customer_id !== input.customer_id) {
      throw new Error("Device is already paired to another customer")
    }

    // Generate a permanent cloud token for the device
    const cloudToken = this.generateToken(64)

    const updated = await this.updateDevices({
      id: device.id,
      customer_id: input.customer_id,
      cloud_token: cloudToken,
      paired_at: new Date(),
      // Clear temp token after pairing
      temp_token: null,
    })

    return updated
  }

  /**
   * Unpair a device from a customer.
   */
  async unpairDevice(deviceId: string): Promise<DeviceDTO> {
    return await this.updateDevices({
      id: deviceId,
      customer_id: null,
      cloud_token: null,
      paired_at: null,
    })
  }

  /**
   * Generate a temporary token for device registration.
   * Called when device first connects and provides serial number.
   */
  async generateTempToken(serialNumber: string): Promise<DeviceTokenResponse> {
    const device = await this.getDeviceBySerial(serialNumber)

    if (!device) {
      throw new Error(`Device not found: ${serialNumber}`)
    }

    const tempToken = this.generateToken(32)

    await this.updateDevices({
      id: device.id,
      temp_token: tempToken,
      registered_at: device.registered_at ?? new Date(),
    })

    return {
      temp_token: tempToken,
      device_id: device.id,
    }
  }

  /**
   * Exchange a temporary token for a permanent cloud token.
   * Called after customer confirms pairing.
   */
  async exchangeToken(tempToken: string): Promise<DeviceCloudTokenResponse> {
    const devices = await this.listDevices({
      temp_token: tempToken,
    })

    const device = devices[0]

    if (!device) {
      throw new Error("Invalid or expired temporary token")
    }

    if (!device.customer_id) {
      throw new Error("Device not yet paired to a customer")
    }

    // Cloud token should already be set during pairing
    if (!device.cloud_token) {
      const cloudToken = this.generateToken(64)
      await this.updateDevices({
        id: device.id,
        cloud_token: cloudToken,
        temp_token: null,
      })
      return {
        cloud_token: cloudToken,
        device_id: device.id,
      }
    }

    // Clear temp token
    await this.updateDevices({
      id: device.id,
      temp_token: null,
    })

    return {
      cloud_token: device.cloud_token,
      device_id: device.id,
    }
  }

  /**
   * Validate a cloud token and return the device if valid.
   */
  async validateCloudToken(cloudToken: string): Promise<DeviceDTO | null> {
    const devices = await this.listDevices({
      cloud_token: cloudToken,
    })

    return devices[0] ?? null
  }

  /**
   * Update device status (called by Go device management service).
   */
  async updateDeviceStatus(input: UpdateDeviceStatusInput): Promise<DeviceDTO> {
    const device = await this.getDeviceBySerial(input.serial_number)

    if (!device) {
      throw new Error(`Device not found: ${input.serial_number}`)
    }

    const updateData: Record<string, unknown> = {
      id: device.id,
    }

    if (input.firmware_version !== undefined) {
      updateData.firmware_version = input.firmware_version
    }

    if (input.last_seen_at !== undefined) {
      updateData.last_seen_at = input.last_seen_at
    }

    if (input.metadata !== undefined) {
      // Merge metadata
      updateData.metadata = {
        ...(device.metadata as Record<string, unknown> ?? {}),
        ...input.metadata,
      }
    }

    return await this.updateDevices(updateData)
  }

  /**
   * Record device heartbeat (last seen).
   */
  async recordHeartbeat(serialNumber: string): Promise<void> {
    const device = await this.getDeviceBySerial(serialNumber)

    if (device) {
      await this.updateDevices({
        id: device.id,
        last_seen_at: new Date(),
      })
    }
  }

  /**
   * Generate a cryptographically secure random token.
   */
  private generateToken(bytes: number): string {
    return randomBytes(bytes).toString("hex")
  }
}

export default DeviceModuleService
