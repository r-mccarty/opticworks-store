/**
 * Seed Inventory Levels for OpticWorks Products
 *
 * Run via: pnpm medusa exec ./src/scripts/seed-inventory.ts
 *
 * This creates realistic inventory levels (50-100 units per SKU) at the US warehouse
 * for all products with manage_inventory: true.
 *
 * Prerequisites:
 * - Run seed-us-region.ts first to create stock location
 * - Run seed-opticworks-products.ts to create products
 */

import { ExecArgs } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils"
import {
  createInventoryLevelsWorkflow,
  updateInventoryLevelsWorkflow,
} from "@medusajs/medusa/core-flows"

// Inventory configuration per SKU
// Realistic starting quantities for launch
const INVENTORY_CONFIG: Record<string, { quantity: number; lowStockThreshold: number }> = {
  // Bed Presence Sensor Kit variants
  "BPS-SINGLE": { quantity: 100, lowStockThreshold: 15 },
  "BPS-DUO": { quantity: 50, lowStockThreshold: 10 },
  "BPS-STUDIO": { quantity: 25, lowStockThreshold: 5 },

  // Presence Sensor Duo Pack
  "PSP-DUO": { quantity: 40, lowStockThreshold: 8 },

  // Developer Edition
  "PDE-STD": { quantity: 30, lowStockThreshold: 5 },

  // Dashboard Pack (digital - high quantity)
  "HADP-DL": { quantity: 9999, lowStockThreshold: 0 },

  // Enclosure Pack
  "ENC-PACK": { quantity: 75, lowStockThreshold: 10 },

  // Spare Sensor Module
  "SPARE-MOD": { quantity: 60, lowStockThreshold: 10 },

  // Reliability Lab Subscription (digital)
  "LAB-MONTHLY": { quantity: 9999, lowStockThreshold: 0 },
}

// Default for SKUs not in config
const DEFAULT_INVENTORY = { quantity: 50, lowStockThreshold: 10 }

export default async function seedInventory({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const stockLocationModule = container.resolve(Modules.STOCK_LOCATION)
  const inventoryModule = container.resolve(Modules.INVENTORY)

  logger.info("=".repeat(60))
  logger.info("OpticWorks Inventory Seed")
  logger.info("=".repeat(60))

  // Find US Warehouse stock location
  const stockLocations = await stockLocationModule.listStockLocations({
    name: "US Warehouse",
  })

  if (!stockLocations.length) {
    throw new Error("US Warehouse stock location not found. Run seed-us-region.ts first.")
  }

  const stockLocation = stockLocations[0]
  logger.info(`Using stock location: ${stockLocation.name} (${stockLocation.id})`)

  // Get all product variants with their SKUs
  const { data: variants } = await query.graph({
    entity: "product_variant",
    fields: ["id", "sku", "title", "manage_inventory", "product.title"],
  })

  logger.info(`Found ${variants.length} product variants`)

  // Get existing inventory items
  const { data: inventoryItems } = await query.graph({
    entity: "inventory_item",
    fields: ["id", "sku"],
  })

  const inventoryBySku = new Map(
    inventoryItems.map((item: { id: string; sku: string }) => [item.sku, item])
  )

  // Get existing inventory levels at this location
  const existingLevels = await inventoryModule.listInventoryLevels({
    location_id: stockLocation.id,
  })

  const existingLevelsByItemId = new Map(
    existingLevels.map((level) => [level.inventory_item_id, level])
  )

  const levelsToCreate: Array<{
    location_id: string
    stocked_quantity: number
    inventory_item_id: string
  }> = []

  const levelsToUpdate: Array<{
    id: string
    stocked_quantity: number
  }> = []

  let skipped = 0
  let digital = 0

  for (const variant of variants) {
    const sku = variant.sku as string
    const manageInventory = variant.manage_inventory as boolean
    const productTitle = (variant.product as { title: string })?.title || "Unknown"

    if (!manageInventory) {
      logger.info(`  ⏭ Skipping ${sku} (${productTitle}) - manage_inventory: false`)
      skipped++
      continue
    }

    const inventoryItem = inventoryBySku.get(sku)
    if (!inventoryItem) {
      logger.warn(`  ⚠ No inventory item found for SKU: ${sku}`)
      continue
    }

    const config = INVENTORY_CONFIG[sku] || DEFAULT_INVENTORY
    const existingLevel = existingLevelsByItemId.get(inventoryItem.id)

    if (existingLevel) {
      // Update existing level if quantity is unrealistic (1M+)
      if (existingLevel.stocked_quantity >= 100000) {
        levelsToUpdate.push({
          id: existingLevel.id,
          stocked_quantity: config.quantity,
        })
        logger.info(`  📝 Will update ${sku}: ${existingLevel.stocked_quantity} → ${config.quantity}`)
      } else {
        logger.info(`  ✓ ${sku} already has realistic inventory: ${existingLevel.stocked_quantity}`)
      }
    } else {
      levelsToCreate.push({
        location_id: stockLocation.id,
        stocked_quantity: config.quantity,
        inventory_item_id: inventoryItem.id,
      })
      logger.info(`  ➕ Will create ${sku}: ${config.quantity} units`)
    }

    // Track digital products
    if (config.quantity >= 9999) {
      digital++
    }
  }

  // Create new inventory levels
  if (levelsToCreate.length > 0) {
    logger.info(`\nCreating ${levelsToCreate.length} inventory levels...`)
    await createInventoryLevelsWorkflow(container).run({
      input: {
        inventory_levels: levelsToCreate,
      },
    })
    logger.info(`✓ Created ${levelsToCreate.length} inventory levels`)
  }

  // Update existing levels with realistic quantities
  if (levelsToUpdate.length > 0) {
    logger.info(`\nUpdating ${levelsToUpdate.length} inventory levels...`)
    await updateInventoryLevelsWorkflow(container).run({
      input: {
        updates: levelsToUpdate,
      },
    })
    logger.info(`✓ Updated ${levelsToUpdate.length} inventory levels`)
  }

  // Summary
  logger.info("\n" + "=".repeat(60))
  logger.info("Inventory Seed Summary")
  logger.info("=".repeat(60))
  logger.info(`Stock Location: ${stockLocation.name}`)
  logger.info(`Total variants: ${variants.length}`)
  logger.info(`Skipped (manage_inventory: false): ${skipped}`)
  logger.info(`Created: ${levelsToCreate.length}`)
  logger.info(`Updated: ${levelsToUpdate.length}`)
  logger.info(`Digital products (unlimited stock): ${digital}`)
  logger.info("=".repeat(60))

  // Print final inventory state
  logger.info("\nFinal Inventory State:")
  const finalLevels = await inventoryModule.listInventoryLevels({
    location_id: stockLocation.id,
  })

  interface InventoryLevel {
    id: string
    inventory_item_id: string
    stocked_quantity: number
  }

  interface InventoryItem {
    id: string
    sku: string
  }

  for (const level of finalLevels as InventoryLevel[]) {
    const item = inventoryItems.find((i: { id: string }) => i.id === level.inventory_item_id) as InventoryItem | undefined
    if (item) {
      const sku = item.sku
      const config = INVENTORY_CONFIG[sku] || DEFAULT_INVENTORY
      const status = level.stocked_quantity <= config.lowStockThreshold
        ? "⚠️ LOW"
        : level.stocked_quantity >= 9999
          ? "∞ DIGITAL"
          : "✓ OK"
      logger.info(`  ${sku}: ${level.stocked_quantity} units [${status}]`)
    }
  }
}
