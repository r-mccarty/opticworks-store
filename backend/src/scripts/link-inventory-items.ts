/**
 * Link Inventory Items to Product Variants
 *
 * Run via: pnpm medusa exec ./src/scripts/link-inventory-items.ts
 *
 * This creates the necessary links between product variants and their inventory items
 * so that stock levels are properly tracked and displayed.
 */

import { ExecArgs } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils"

export default async function linkInventoryItems({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const inventoryModule = container.resolve(Modules.INVENTORY)

  logger.info("=".repeat(60))
  logger.info("Link Inventory Items to Product Variants")
  logger.info("=".repeat(60))

  // Get all product variants with their SKUs
  const { data: variants } = await query.graph({
    entity: "product_variant",
    fields: ["id", "sku", "title", "manage_inventory", "product.title"],
  })

  logger.info(`Found ${variants.length} product variants`)

  // Get all inventory items
  const inventoryItems = await inventoryModule.listInventoryItems({})
  logger.info(`Found ${inventoryItems.length} inventory items`)

  const inventoryBySku = new Map(
    inventoryItems.map((item) => [item.sku, item])
  )

  const linksToCreate: Array<{
    productVariantId: string
    inventoryItemId: string
    requiredQuantity: number
  }> = []

  let linked = 0
  let skipped = 0
  let missing = 0

  for (const variant of variants) {
    const sku = variant.sku as string
    const manageInventory = variant.manage_inventory as boolean
    const productTitle = (variant.product as { title: string })?.title || "Unknown"
    const variantId = variant.id as string

    if (!manageInventory) {
      logger.info(`  ⏭ Skipping ${sku} (${productTitle}) - manage_inventory: false`)
      skipped++
      continue
    }

    const inventoryItem = inventoryBySku.get(sku)
    if (!inventoryItem) {
      logger.warn(`  ⚠ No inventory item found for SKU: ${sku}`)
      missing++
      continue
    }

    // Check if link already exists
    const existingLinks = await query.graph({
      entity: "product_variant_inventory_item",
      fields: ["inventory_item_id", "variant_id"],
      filters: {
        variant_id: variantId,
      },
    })

    if (existingLinks.data && existingLinks.data.length > 0) {
      logger.info(`  ✓ ${sku} already linked`)
      continue
    }

    linksToCreate.push({
      productVariantId: variantId,
      inventoryItemId: inventoryItem.id,
      requiredQuantity: 1,
    })
    logger.info(`  🔗 Will link ${sku} -> ${inventoryItem.id}`)
    linked++
  }

  // Create links using the remote link module
  if (linksToCreate.length > 0) {
    logger.info(`\nCreating ${linksToCreate.length} inventory links...`)

    const remoteLink = container.resolve(ContainerRegistrationKeys.REMOTE_LINK)

    for (const link of linksToCreate) {
      try {
        await remoteLink.create({
          [Modules.PRODUCT]: {
            variant_id: link.productVariantId,
          },
          [Modules.INVENTORY]: {
            inventory_item_id: link.inventoryItemId,
          },
        })
        logger.info(`  ✓ Linked ${link.productVariantId} -> ${link.inventoryItemId}`)
      } catch (err) {
        logger.error(`  ✗ Failed to link: ${err}`)
      }
    }

    logger.info(`✓ Finished creating inventory links`)
  }

  // Summary
  logger.info("\n" + "=".repeat(60))
  logger.info("Summary")
  logger.info("=".repeat(60))
  logger.info(`Total variants: ${variants.length}`)
  logger.info(`Skipped (manage_inventory: false): ${skipped}`)
  logger.info(`Missing inventory item: ${missing}`)
  logger.info(`Links created: ${linked}`)
  logger.info("=".repeat(60))
}
