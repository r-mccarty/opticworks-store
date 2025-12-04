/**
 * Test script to manually trigger an order confirmation email.
 *
 * Usage: pnpm medusa exec ./src/scripts/test-email-notification.ts
 */
import { Modules } from "@medusajs/framework/utils"
import type { ExecArgs } from "@medusajs/framework/types"

export default async function testEmailNotification({ container }: ExecArgs) {
  const logger = container.resolve("logger")
  const query = container.resolve("query")
  const notificationService = container.resolve(Modules.NOTIFICATION)

  logger.info("[test-email] Starting email notification test...")

  // Get the most recent order
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
  })

  if (!orders || orders.length === 0) {
    logger.error("[test-email] No orders found in database")
    return
  }

  // Get the most recent order
  const order = orders[0]
  logger.info(`[test-email] Found order ${order.id} (display_id: ${order.display_id})`)
  logger.info(`[test-email] Order email: ${order.email}`)

  if (!order.email) {
    logger.error("[test-email] Order has no email address")
    return
  }

  // Build notification data
  const notificationData = {
    id: order.id,
    display_id: order.display_id,
    email: order.email,
    currency_code: order.currency_code,
    subtotal: order.subtotal,
    shipping_total: order.shipping_total,
    tax_total: order.tax_total,
    total: order.total,
    items: order.items?.map((item: unknown) => {
      if (!item) return null
      const itemObj = item as Record<string, unknown>
      const variant = itemObj.variant as Record<string, unknown> | undefined
      const product = variant?.product as Record<string, unknown> | undefined
      return {
        id: itemObj.id,
        title: itemObj.title,
        product_title: itemObj.product_title || product?.title,
        variant_title: itemObj.variant_title || variant?.title,
        quantity: itemObj.quantity,
        unit_price: itemObj.unit_price,
        total: itemObj.total,
      }
    }).filter(Boolean),
    shipping_address: order.shipping_address,
    customer: order.customer,
  }

  logger.info(`[test-email] Notification data: ${JSON.stringify(notificationData, null, 2)}`)

  try {
    logger.info(`[test-email] Calling notificationService.createNotifications...`)

    const result = await notificationService.createNotifications({
      to: order.email,
      channel: "email",
      template: "order.placed",
      data: notificationData,
    })

    logger.info(`[test-email] Notification result: ${JSON.stringify(result, null, 2)}`)
    logger.info("[test-email] Email notification sent successfully!")
  } catch (error) {
    logger.error(`[test-email] Failed to send notification: ${error}`)
    if (error instanceof Error) {
      logger.error(`[test-email] Stack trace: ${error.stack}`)
    }
  }
}
