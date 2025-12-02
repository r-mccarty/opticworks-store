/**
 * Seed OpticWorks Product Catalog
 *
 * Run via: pnpm medusa exec ./src/scripts/seed-opticworks-products.ts
 *
 * This creates the real OpticWorks product catalog (sensors, bundles, accessories)
 * replacing the generic Medusa template products.
 */

import { ExecArgs } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils"
import {
  createProductsWorkflow,
} from "@medusajs/medusa/core-flows"

// OpticWorks Product Catalog
const OPTICWORKS_PRODUCTS = [
  {
    title: "Bed Presence Sensor Kit",
    handle: "bed-presence-sensor-kit",
    description: "Complete mmWave hardware + presence engine stack tuned for Home Assistant. Ships flashed, calibrated, and ready for dependable automations.",
    status: ProductStatus.PUBLISHED,
    options: [
      {
        title: "Configuration",
        values: ["Single Bed Kit", "Dual Bed Pack", "Studio + Dev Pack"],
      },
    ],
    variants: [
      {
        title: "Single Bed Kit",
        sku: "BPS-SINGLE",
        options: { Configuration: "Single Bed Kit" },
        prices: [{ amount: 23900, currency_code: "usd" }],
        manage_inventory: false,
      },
      {
        title: "Dual Bed Pack",
        sku: "BPS-DUO",
        options: { Configuration: "Dual Bed Pack" },
        prices: [{ amount: 44900, currency_code: "usd" }],
        manage_inventory: false,
      },
      {
        title: "Studio + Dev Pack",
        sku: "BPS-STUDIO",
        options: { Configuration: "Studio + Dev Pack" },
        prices: [{ amount: 52500, currency_code: "usd" }],
        manage_inventory: false,
      },
    ],
    metadata: {
      category: "sensor",
      badge: "Flagship",
      featured: true,
    },
  },
  {
    title: "Presence Sensor Duo Pack",
    handle: "presence-sensor-duo-pack",
    description: "Two Bed Presence Sensors plus synchronized automations for multi-room deployments. Ships with offset mounting jig for bunk or split beds.",
    status: ProductStatus.PUBLISHED,
    options: [
      {
        title: "Configuration",
        values: ["Standard"],
      },
    ],
    variants: [
      {
        title: "Standard",
        sku: "PSP-DUO",
        options: { Configuration: "Standard" },
        prices: [{ amount: 44900, currency_code: "usd" }],
        manage_inventory: false,
      },
    ],
    metadata: {
      category: "bundle",
      badge: "Bundle",
      featured: true,
    },
  },
  {
    title: "Presence Engine Developer Edition",
    handle: "presence-developer-edition",
    description: "For tinkerers who want deeper insight. Breakout headers, serial console, and beta firmware channel for experimenting with new detection ideas.",
    status: ProductStatus.PUBLISHED,
    options: [
      {
        title: "Configuration",
        values: ["Standard"],
      },
    ],
    variants: [
      {
        title: "Standard",
        sku: "PDE-STD",
        options: { Configuration: "Standard" },
        prices: [{ amount: 32900, currency_code: "usd" }],
        manage_inventory: false,
      },
    ],
    metadata: {
      category: "sensor",
      badge: "Developer",
    },
  },
  {
    title: "Home Assistant Dashboard Pack",
    handle: "presence-dashboard-pack",
    description: "Pre-built Lovelace dashboards, helper templates, and automations that expose state reasons, z-score charts, and tuning controls.",
    status: ProductStatus.PUBLISHED,
    options: [
      {
        title: "Configuration",
        values: ["Digital Download"],
      },
    ],
    variants: [
      {
        title: "Digital Download",
        sku: "HADP-DL",
        options: { Configuration: "Digital Download" },
        prices: [{ amount: 5900, currency_code: "usd" }],
        manage_inventory: false,
      },
    ],
    metadata: {
      category: "software",
    },
  },
  {
    title: "Magnetic Enclosure + Mount Pack",
    handle: "presence-enclosure-pack",
    description: "3D-printed magnetic enclosure with adjustable tilt bracket, bed-rail clips, and adhesive pads for stealth installs.",
    status: ProductStatus.PUBLISHED,
    options: [
      {
        title: "Configuration",
        values: ["Standard"],
      },
    ],
    variants: [
      {
        title: "Standard",
        sku: "ENC-PACK",
        options: { Configuration: "Standard" },
        prices: [{ amount: 7900, currency_code: "usd" }],
        manage_inventory: false,
      },
    ],
    metadata: {
      category: "accessory",
    },
  },
  {
    title: "Spare mmWave Sensor Module",
    handle: "presence-spare-sensor",
    description: "Individual still-energy mmWave module for labs, redundancy, or advanced automations outside of the bedroom.",
    status: ProductStatus.PUBLISHED,
    options: [
      {
        title: "Configuration",
        values: ["Standard"],
      },
    ],
    variants: [
      {
        title: "Standard",
        sku: "SPARE-MOD",
        options: { Configuration: "Standard" },
        prices: [{ amount: 11900, currency_code: "usd" }],
        manage_inventory: false,
      },
    ],
    metadata: {
      category: "sensor",
    },
  },
  {
    title: "Reliability Lab Subscription",
    handle: "presence-lab-support",
    description: "Join our Reliability Lab to get monthly firmware drops, guided tuning sessions, and early access to experimental engine features.",
    status: ProductStatus.PUBLISHED,
    options: [
      {
        title: "Configuration",
        values: ["Monthly"],
      },
    ],
    variants: [
      {
        title: "Monthly",
        sku: "LAB-MONTHLY",
        options: { Configuration: "Monthly" },
        prices: [{ amount: 1900, currency_code: "usd" }],
        manage_inventory: false,
      },
    ],
    metadata: {
      category: "software",
    },
  },
]

export default async function seedOpticWorksProducts({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const salesChannelModule = container.resolve(Modules.SALES_CHANNEL)
  const fulfillmentModule = container.resolve(Modules.FULFILLMENT)

  logger.info("=".repeat(60))
  logger.info("OpticWorks Product Catalog Seed")
  logger.info("=".repeat(60))

  // Get default sales channel
  const salesChannels = await salesChannelModule.listSalesChannels({
    name: "Default Sales Channel",
  })

  if (!salesChannels.length) {
    throw new Error("No Default Sales Channel found. Run the main seed first.")
  }
  const salesChannel = salesChannels[0]
  logger.info(`Using sales channel: ${salesChannel.id}`)

  // Get shipping profile
  const shippingProfiles = await fulfillmentModule.listShippingProfiles()
  if (!shippingProfiles.length) {
    throw new Error("No shipping profile found. Run the main seed first.")
  }
  const shippingProfile = shippingProfiles[0]
  logger.info(`Using shipping profile: ${shippingProfile.id}`)

  // Check for existing products
  const { data: existingProducts } = await query.graph({
    entity: "product",
    fields: ["id", "handle"],
  })

  const existingHandles = new Set(existingProducts.map((p: { handle: string }) => p.handle))

  // Filter to only new products
  const newProducts = OPTICWORKS_PRODUCTS.filter(
    (p) => !existingHandles.has(p.handle)
  )

  if (newProducts.length === 0) {
    logger.info("All OpticWorks products already exist. Skipping.")
    logger.info("=".repeat(60))
    return
  }

  logger.info(`Creating ${newProducts.length} new products...`)

  // Create products via workflow
  const productsWithChannel = newProducts.map((product) => ({
    ...product,
    sales_channels: [{ id: salesChannel.id }],
    shipping_profile_id: shippingProfile.id,
  }))

  try {
    const { result } = await createProductsWorkflow(container).run({
      input: {
        products: productsWithChannel,
      },
    })

    logger.info(`✓ Created ${result.length} products:`)
    result.forEach((p: { title: string; handle: string }) => {
      logger.info(`  - ${p.title} (${p.handle})`)
    })
  } catch (error) {
    logger.error("Failed to create products:", error)
    throw error
  }

  logger.info("=".repeat(60))
  logger.info("OpticWorks catalog seed complete!")
  logger.info("=".repeat(60))
}
