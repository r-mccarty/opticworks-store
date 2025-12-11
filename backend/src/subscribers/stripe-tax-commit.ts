import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import Stripe from "stripe"

/**
 * Subscriber that commits Stripe Tax calculations when an order is placed.
 *
 * This ensures that tax transactions appear in Stripe Tax reporting.
 * The calculation ID is stored in tax line metadata during checkout.
 */
export default async function stripeTaxCommitHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve("logger")
  const query = container.resolve("query")

  // Check skip flag for local development
  if (process.env.STRIPE_TAX_SKIP_COMMIT === "true") {
    logger.info("[stripe-tax-commit] Skipping commit (STRIPE_TAX_SKIP_COMMIT=true)")
    return
  }

  // Ensure Stripe API key is available
  const stripeApiKey = process.env.STRIPE_API_KEY
  if (!stripeApiKey) {
    logger.warn("[stripe-tax-commit] STRIPE_API_KEY not set, skipping commit")
    return
  }

  logger.info(`[stripe-tax-commit] Processing order: ${data.id}`)

  try {
    // Fetch order with tax lines from items and shipping methods
    // Include code field which contains the encoded calculation ID
    const { data: orders } = await query.graph({
      entity: "order",
      fields: [
        "id",
        "display_id",
        "items.id",
        "items.tax_lines.id",
        "items.tax_lines.code",
        "items.tax_lines.metadata",
        "shipping_methods.id",
        "shipping_methods.tax_lines.id",
        "shipping_methods.tax_lines.code",
        "shipping_methods.tax_lines.metadata",
      ],
      filters: { id: data.id },
    })

    const order = orders[0] as {
      id: string
      display_id: string | number
      items?: Array<{
        id: string
        tax_lines?: Array<{
          id: string
          code?: string
          metadata?: Record<string, unknown>
        }>
      }>
      shipping_methods?: Array<{
        id: string
        tax_lines?: Array<{
          id: string
          code?: string
          metadata?: Record<string, unknown>
        }>
      }>
    } | undefined

    if (!order) {
      logger.warn(`[stripe-tax-commit] Order not found: ${data.id}`)
      return
    }

    // Debug: Log what we found on the order
    const itemCount = order.items?.length ?? 0
    const itemTaxLineCount = order.items?.reduce((sum, item) => sum + (item.tax_lines?.length ?? 0), 0) ?? 0
    const shippingCount = order.shipping_methods?.length ?? 0
    const shippingTaxLineCount = order.shipping_methods?.reduce((sum, m) => sum + (m.tax_lines?.length ?? 0), 0) ?? 0

    logger.info(
      `[stripe-tax-commit] Order ${order.display_id}: ${itemCount} items with ${itemTaxLineCount} tax lines, ` +
      `${shippingCount} shipping methods with ${shippingTaxLineCount} tax lines`
    )

    // Extract unique stripe_calculation_ids from tax line code field
    // Format: "stripe-tax:taxcalc_xxx" (encoded in code since Medusa drops metadata)
    const calculationIds = new Set<string>()

    // Check item tax lines
    for (const item of order.items ?? []) {
      for (const taxLine of item.tax_lines ?? []) {
        // Try code field first (new format: "stripe-tax:taxcalc_xxx")
        if (taxLine.code?.startsWith("stripe-tax:taxcalc_")) {
          const calcId = taxLine.code.replace("stripe-tax:", "")
          calculationIds.add(calcId)
        }
        // Fallback to metadata (in case it's preserved somehow)
        const metaCalcId = taxLine.metadata?.stripe_calculation_id
        if (typeof metaCalcId === "string" && metaCalcId.startsWith("taxcalc_")) {
          calculationIds.add(metaCalcId)
        }
      }
    }

    // Check shipping method tax lines
    for (const method of order.shipping_methods ?? []) {
      for (const taxLine of method.tax_lines ?? []) {
        if (taxLine.code?.startsWith("stripe-tax:taxcalc_")) {
          const calcId = taxLine.code.replace("stripe-tax:", "")
          calculationIds.add(calcId)
        }
        const metaCalcId = taxLine.metadata?.stripe_calculation_id
        if (typeof metaCalcId === "string" && metaCalcId.startsWith("taxcalc_")) {
          calculationIds.add(metaCalcId)
        }
      }
    }

    if (calculationIds.size === 0) {
      logger.info(
        `[stripe-tax-commit] No Stripe calculation IDs found for order ${order.display_id}, skipping commit`
      )
      return
    }

    logger.info(
      `[stripe-tax-commit] Found ${calculationIds.size} calculation(s) to commit for order ${order.display_id}`
    )

    // Initialize Stripe client
    const stripe = new Stripe(stripeApiKey)

    // Commit each calculation
    let committed = 0
    let alreadyCommitted = 0
    let failed = 0

    for (const calculationId of calculationIds) {
      try {
        await stripe.tax.transactions.createFromCalculation({
          calculation: calculationId,
          reference: order.id,
          metadata: {
            order_id: order.id,
            display_id: String(order.display_id),
          },
        })

        committed++
        logger.info(
          `[stripe-tax-commit] Committed calculation ${calculationId} for order ${order.display_id}`
        )
      } catch (error) {
        // Handle "already exists" gracefully (idempotency)
        if (
          error instanceof Stripe.errors.StripeError &&
          error.code === "resource_already_exists"
        ) {
          alreadyCommitted++
          logger.info(
            `[stripe-tax-commit] Calculation ${calculationId} already committed (idempotent)`
          )
          continue
        }

        // Log other errors but don't fail the order
        failed++
        logger.error(
          `[stripe-tax-commit] Failed to commit ${calculationId}: ${
            error instanceof Error ? error.message : error
          }`
        )
      }
    }

    logger.info(
      `[stripe-tax-commit] Order ${order.display_id} complete: ${committed} committed, ${alreadyCommitted} already existed, ${failed} failed`
    )
  } catch (error) {
    // Don't throw - we don't want to fail order processing if tax commit fails
    logger.error(
      `[stripe-tax-commit] Failed to process order ${data.id}: ${
        error instanceof Error ? error.message : error
      }`
    )
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
}
