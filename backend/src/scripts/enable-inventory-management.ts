/**
 * Enable Inventory Management for All Product Variants
 *
 * Run via: pnpm medusa exec ./src/scripts/enable-inventory-management.ts
 *
 * This updates all product variants to have manage_inventory: true
 * and creates inventory items for them.
 */

import { ExecArgs } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils"

export default async function enableInventoryManagement({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const productModule = container.resolve(Modules.PRODUCT)
  const inventoryModule = container.resolve(Modules.INVENTORY)
  const stockLocationModule = container.resolve(Modules.STOCK_LOCATION)

  logger.info("=".repeat(60))
  logger.info("Enable Inventory Management for All Variants")
  logger.info("=".repeat(60))

  // Get all product variants
  const { data: variants } = await query.graph({
    entity: "product_variant",
    fields: ["id", "sku", "title", "manage_inventory", "product.title"],
  })

  logger.info(`Found ${variants.length} product variants`)

  // Find US Warehouse stock location
  const stockLocations = await stockLocationModule.listStockLocations({
    name: "US Warehouse",
  })

  if (!stockLocations.length) {
    throw new Error("US Warehouse stock location not found. Run seed-us-region.ts first.")
  }

  const stockLocation = stockLocations[0]
  logger.info(`Using stock location: ${stockLocation.name} (${stockLocation.id})`)

  let updated = 0
  let alreadyEnabled = 0
  let inventoryCreated = 0

  for (const variant of variants) {
    const sku = variant.sku as string
    const manageInventory = variant.manage_inventory as boolean
    const productTitle = (variant.product as { title: string })?.title || "Unknown"

    if (manageInventory) {
      logger.info(`  ✓ ${sku} (${productTitle}) - already enabled`)
      alreadyEnabled++
      continue
    }

    // Update variant to enable inventory management
    logger.info(`  🔧 Enabling inventory for ${sku} (${productTitle})`)

    await productModule.updateProductVariants([
      {
        id: variant.id as string,
        manage_inventory: true,
      }
    ])
    updated++

    // Check if inventory item exists
    const existingItems = await inventoryModule.listInventoryItems({
      sku,
    })

    if (existingItems.length === 0) {
      // Create inventory item
      const [inventoryItem] = await inventoryModule.createInventoryItems([
        {
          sku,
          title: `${productTitle} - ${sku}`,
        }
      ])

      // Create inventory level at US Warehouse with default stock
      await inventoryModule.createInventoryLevels([
        {
          inventory_item_id: inventoryItem.id,
          location_id: stockLocation.id,
          stocked_quantity: 100, // Default starting quantity
        }
      ])

      logger.info(`    ➕ Created inventory item with 100 units`)
      inventoryCreated++
    } else {
      logger.info(`    ✓ Inventory item already exists`)
    }
  }

  // Summary
  logger.info("\n" + "=".repeat(60))
  logger.info("Summary")
  logger.info("=".repeat(60))
  logger.info(`Total variants: ${variants.length}`)
  logger.info(`Already enabled: ${alreadyEnabled}`)
  logger.info(`Updated to enabled: ${updated}`)
  logger.info(`Inventory items created: ${inventoryCreated}`)
  logger.info("=".repeat(60))
}
