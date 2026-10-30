import type { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules, ProductStatus } from "@medusajs/framework/utils"
import {
  createApiKeysWorkflow,
  createProductsWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createShippingOptionsWorkflow,
  createStockLocationsWorkflow,
  createTaxRegionsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
  updateStoresWorkflow,
} from "@medusajs/medusa/core-flows"

/**
 * Mirrors src/content/programs.ts in the frontend: one product per program,
 * handle === program slug (the frontend's `commerce.productHandle`). Products
 * are created DRAFT with no prices. Offers (price + published status) are set
 * separately by infrastructure/ansible/scripts/catalog_offers.py.
 */
const PROGRAMS = [
  { handle: "vmc", title: "Compact VMC", category: "Precision manufacturing" },
  { handle: "mach-1", title: "Mach 1", category: "Advanced imaging and perception" },
]

/** EasyPost services offered as calculated shipping options (ids from CARRIER_SERVICES). */
const SHIPPING = [
  { id: "usps-ground", label: "USPS Ground Advantage", code: "usps-ground" },
  { id: "usps-priority", label: "USPS Priority Mail", code: "usps-priority" },
  { id: "fedex-2day", label: "FedEx 2Day", code: "fedex-2day" },
]

/**
 * Idempotent synthetic seed: US region with Stripe payments and Stripe Tax,
 * a sales channel + publishable key, a warehouse, EasyPost shipping and draft
 * program products. Re-running is a no-op once the region exists.
 *
 *   pnpm seed
 */
export default async function seed({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const link = container.resolve(ContainerRegistrationKeys.LINK)
  const fulfillment = container.resolve(Modules.FULFILLMENT)

  const { data: existing } = await query.graph({ entity: "region", fields: ["id"], filters: { name: "United States" } })
  if (existing.length > 0) {
    logger.info("[seed] already seeded; nothing to do")
    return
  }

  const {
    result: [channel],
  } = await createSalesChannelsWorkflow(container).run({
    input: { salesChannelsData: [{ name: "OpticWorks Store", description: "optic.works storefront" }] },
  })

  const {
    result: [key],
  } = await createApiKeysWorkflow(container).run({
    input: { api_keys: [{ title: "optic.works storefront", type: "publishable", created_by: "" }] },
  })
  await linkSalesChannelsToApiKeyWorkflow(container).run({ input: { id: key.id, add: [channel.id] } })

  const { data: stores } = await query.graph({ entity: "store", fields: ["id"] })
  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: stores[0].id },
      update: {
        name: "OpticWorks",
        supported_currencies: [{ currency_code: "usd", is_default: true }],
        default_sales_channel_id: channel.id,
      },
    },
  })

  const {
    result: [region],
  } = await createRegionsWorkflow(container).run({
    input: {
      regions: [
        {
          name: "United States",
          currency_code: "usd",
          countries: ["us"],
          payment_providers: ["pp_stripe_stripe"],
          automatic_taxes: true,
        },
      ],
    },
  })
  await createTaxRegionsWorkflow(container).run({
    input: [{ country_code: "us", provider_id: "tp_stripe-tax_stripe-tax" }],
  })

  const {
    result: [location],
  } = await createStockLocationsWorkflow(container).run({
    input: {
      locations: [
        {
          name: "San Diego Warehouse",
          address: { address_1: "", city: "San Diego", province: "CA", country_code: "US" },
        },
      ],
    },
  })
  for (const provider of ["manual_manual", "easypost_easypost"]) {
    await link.create({
      [Modules.STOCK_LOCATION]: { stock_location_id: location.id },
      [Modules.FULFILLMENT]: { fulfillment_provider_id: provider },
    })
  }
  await linkSalesChannelsToStockLocationWorkflow(container).run({ input: { id: location.id, add: [channel.id] } })

  const { data: profiles } = await query.graph({ entity: "shipping_profile", fields: ["id"] })
  const set = await fulfillment.createFulfillmentSets({
    name: "US shipping",
    type: "shipping",
    service_zones: [{ name: "United States", geo_zones: [{ country_code: "us", type: "country" }] }],
  })
  await link.create({
    [Modules.STOCK_LOCATION]: { stock_location_id: location.id },
    [Modules.FULFILLMENT]: { fulfillment_set_id: set.id },
  })
  await createShippingOptionsWorkflow(container).run({
    input: SHIPPING.map((s) => ({
      name: s.label,
      price_type: "calculated" as const,
      provider_id: "easypost_easypost",
      service_zone_id: set.service_zones[0].id,
      shipping_profile_id: profiles[0].id,
      type: { label: s.label, description: "Live carrier rate", code: s.code },
      data: { id: s.id },
      rules: [
        { attribute: "enabled_in_store", value: "true", operator: "eq" as const },
        { attribute: "is_return", value: "false", operator: "eq" as const },
      ],
    })),
  })

  const { result: products } = await createProductsWorkflow(container).run({
    input: {
      products: PROGRAMS.map((p) => ({
        title: p.title,
        handle: p.handle,
        status: ProductStatus.DRAFT,
        shipping_profile_id: profiles[0].id,
        sales_channels: [{ id: channel.id }],
        options: [{ title: "Configuration", values: ["Standard"] }],
        variants: [
          {
            title: "Standard",
            options: { Configuration: "Standard" },
            manage_inventory: false,
            prices: [],
          },
        ],
        metadata: { program_slug: p.handle, category: p.category, synthetic: true },
      })),
    },
  })

  logger.info(
    `[seed] region=${region.id} channel=${channel.id} products=${products.length} publishable_key_id=${key.id}`
  )
  // The publishable token is a public credential, but fetch it from the admin
  // (Settings → Publishable API Keys) rather than from logs.
}
