/**
 * Cleanup Template Products
 *
 * Run via: pnpm medusa exec ./src/scripts/cleanup-template-products.ts
 *
 * Removes the default Medusa template products (T-Shirt, Sweatpants, etc.)
 */

import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { deleteProductsWorkflow } from "@medusajs/medusa/core-flows"

const TEMPLATE_HANDLES = ["t-shirt", "sweatpants", "shorts", "sweatshirt"]

export default async function cleanupTemplateProducts({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  logger.info("Cleaning up template products...")

  const { data: products } = await query.graph({
    entity: "product",
    fields: ["id", "handle", "title"],
  })

  const toDelete = products.filter((p: { handle: string }) =>
    TEMPLATE_HANDLES.includes(p.handle)
  )

  if (toDelete.length === 0) {
    logger.info("No template products to delete.")
    return
  }

  logger.info(`Deleting ${toDelete.length} template products...`)

  await deleteProductsWorkflow(container).run({
    input: {
      ids: toDelete.map((p: { id: string }) => p.id),
    },
  })

  toDelete.forEach((p: { title: string }) => {
    logger.info(`  - Deleted: ${p.title}`)
  })

  logger.info("Cleanup complete!")
}
