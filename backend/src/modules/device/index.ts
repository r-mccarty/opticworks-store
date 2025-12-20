import DeviceModuleService from "./service"
import { Module } from "@medusajs/framework/utils"

export const DEVICE_MODULE = "device"

export default Module(DEVICE_MODULE, {
  service: DeviceModuleService,
})
