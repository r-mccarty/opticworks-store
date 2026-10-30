import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import Stripe from "stripe"
import { env } from "../lib/env"

type TaxLine = { code?: string | null; metadata?: Record<string, unknown> | null }
type Order = {
  id: string
  display_id: string | number
  items?: Array<{ tax_lines?: TaxLine[] } | null>
  shipping_methods?: Array<{ tax_lines?: TaxLine[] } | null>
}

/** Calculation ids are carried in the tax line code ("stripe-tax:taxcalc_..."). */
function calculationIds(order: Order): string[] {
  const ids = new Set<string>()
  const lines = [
    ...(order.items ?? []).flatMap((i) => i?.tax_lines ?? []),
    ...(order.shipping_methods ?? []).flatMap((m) => m?.tax_lines ?? []),
  ]
  for (const line of lines) {
    if (line.code?.startsWith("stripe-tax:taxcalc_")) ids.add(line.code.slice("stripe-tax:".length))
    const meta = line.metadata?.stripe_calculation_id
    if (typeof meta === "string" && meta.startsWith("taxcalc_")) ids.add(meta)
  }
  return [...ids].sort()
}

/**
 * Records the order's Stripe Tax calculation(s) as tax transactions so they
 * appear in Stripe Tax reporting. Throws on real failures so the event bus
 * retries; an already-recorded transaction counts as success.
 */
export default async function stripeTaxCommit({ event: { data }, container }: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve("logger")
  if (env().STRIPE_TAX_SKIP_COMMIT === "true") return

  const query = container.resolve("query")
  const { data: orders } = await query.graph({
    entity: "order",
    fields: [
      "id",
      "display_id",
      "items.tax_lines.code",
      "items.tax_lines.metadata",
      "shipping_methods.tax_lines.code",
      "shipping_methods.tax_lines.metadata",
    ],
    filters: { id: data.id },
  })
  const order = orders[0] as Order | undefined
  if (!order) return

  const ids = calculationIds(order)
  if (ids.length === 0) return

  const stripe = new Stripe(env().STRIPE_API_KEY)
  for (const [index, calculation] of ids.entries()) {
    // Stripe requires a unique reference per transaction.
    const reference = ids.length === 1 ? order.id : `${order.id}:${index + 1}`
    try {
      await stripe.tax.transactions.createFromCalculation(
        { calculation, reference, metadata: { order_id: order.id, display_id: String(order.display_id) } },
        { idempotencyKey: `tax-commit:${reference}` }
      )
    } catch (error) {
      if (error instanceof Stripe.errors.StripeError && error.code === "resource_already_exists") continue
      logger.error(
        `[stripe-tax-commit] order ${order.id}: ${error instanceof Error ? error.message : "unknown error"}`
      )
      throw error
    }
  }
}

export const config: SubscriberConfig = { event: "order.placed" }
