import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"

/**
 * Subscriber that sends order confirmation emails when an order is placed.
 * Uses the Resend notification provider configured in medusa-config.ts.
 */
export default async function orderPlacedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve("logger")
  const query = container.resolve("query")
  const notificationModuleService = container.resolve(Modules.NOTIFICATION)

  logger.info(`[order-placed] Processing order: ${data.id}`)

  try {
    // Fetch full order details using Query
    const { data: orders } = await query.graph({
      entity: "order",
      fields: [
        "id",
        "display_id",
        "email",
        "currency_code",
        "subtotal",
        "shipping_total",
        "tax_total",
        "total",
        "items.*",
        "items.variant.*",
        "items.variant.product.*",
        "shipping_address.*",
        "customer.*",
      ],
      filters: { id: data.id },
    })

    const order = orders[0]

    if (!order) {
      logger.error(`[order-placed] Order not found: ${data.id}`)
      return
    }

    if (!order.email) {
      logger.warn(`[order-placed] Order ${data.id} has no email, skipping notification`)
      return
    }

    logger.info(`[order-placed] Sending confirmation to: ${order.email}`)

    // Send notification via Resend provider
    await notificationModuleService.createNotifications({
      to: order.email,
      channel: "email",
      template: "order.placed",
      data: {
        id: order.id,
        display_id: order.display_id,
        email: order.email,
        currency_code: order.currency_code,
        subtotal: order.subtotal,
        shipping_total: order.shipping_total,
        tax_total: order.tax_total,
        total: order.total,
        items: order.items?.map((item) => {
          if (!item) return null
          const variant = (item as Record<string, unknown>).variant as Record<string, unknown> | undefined
          const product = variant?.product as Record<string, unknown> | undefined
          return {
            id: item.id,
            title: item.title,
            product_title: item.product_title || product?.title,
            variant_title: item.variant_title || variant?.title,
            quantity: item.quantity,
            unit_price: item.unit_price,
            total: item.total,
          }
        }).filter(Boolean),
        shipping_address: order.shipping_address,
        customer: order.customer,
      },
    })

    logger.info(`[order-placed] Order confirmation email sent for order: ${data.id}`)
  } catch (error) {
    logger.error(`[order-placed] Failed to send order confirmation: ${error}`)
    // Don't throw - we don't want to fail the order if email fails
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
}
