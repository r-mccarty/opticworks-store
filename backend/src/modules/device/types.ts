/**
 * Device types for the OpticWorks device module.
 */

export type DeviceStatus = "unregistered" | "registered" | "paired"

export interface CreateDeviceInput {
  serial_number: string
  product_type?: string
  order_id?: string
  metadata?: Record<string, unknown>
}

export interface PairDeviceInput {
  serial_number: string
  customer_id: string
}

export interface UpdateDeviceStatusInput {
  serial_number: string
  firmware_version?: string
  last_seen_at?: Date
  metadata?: Record<string, unknown>
}

export interface DeviceDTO {
  id: string
  serial_number: string
  product_type: string
  firmware_version: string | null
  customer_id: string | null
  order_id: string | null
  last_seen_at: Date | null
  registered_at: Date | null
  paired_at: Date | null
  metadata: Record<string, unknown> | null
  created_at: Date
  updated_at: Date
}

export interface DeviceTokenResponse {
  temp_token: string
  device_id: string
}

export interface DeviceCloudTokenResponse {
  cloud_token: string
  device_id: string
}
