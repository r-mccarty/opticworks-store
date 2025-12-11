import { ModuleProvider, Modules } from "@medusajs/framework/utils"
import StripeTaxProviderService from "./service"

export default ModuleProvider(Modules.TAX, {
  services: [StripeTaxProviderService],
})
