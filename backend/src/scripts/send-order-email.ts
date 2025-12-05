/**
 * Send order confirmation email for a specific order.
 * Usage: ORDER_ID=25 pnpm medusa exec ./src/scripts/send-order-email.ts
 */
import { Modules } from "@medusajs/framework/utils"
import type { ExecArgs } from "@medusajs/framework/types"

export default async function sendOrderEmail({ container }: ExecArgs) {
  const logger = container.resolve("logger")
  const query = container.resolve("query")
  const notificationService = container.resolve(Modules.NOTIFICATION)

  const displayId = process.env.ORDER_ID || "25"
  logger.info(`[send-order-email] Looking for order with display_id: ${displayId}`)

  const { data: orders } = await query.graph({
    entity: "order",
    fields: [
      "id", "display_id", "email", "currency_code",
      "subtotal", "shipping_total", "tax_total", "total",
      "items.*", "items.variant.*", "items.variant.product.*",
      "shipping_address.*", "customer.*",
    ],
    filters: { display_id: displayId },
  })

  if (!orders || orders.length === 0) {
    logger.error(`[send-order-email] Order ${displayId} not found`)
    return
  }

  const order = orders[0]
  logger.info(`[send-order-email] Found order ${order.id}, email: ${order.email}`)

  if (!order.email) {
    logger.error(`[send-order-email] Order ${displayId} has no email address`)
    return
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const notificationData = {
    id: order.id,
    display_id: order.display_id,
    email: order.email,
    currency_code: order.currency_code,
    subtotal: order.subtotal,
    shipping_total: order.shipping_total,
    tax_total: order.tax_total,
    total: order.total,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    items: order.items?.map((item: any) => ({
      id: item.id,
      title: item.title,
      product_title: item.product_title || item.variant?.product?.title,
      variant_title: item.variant_title || item.variant?.title,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total: item.total,
    })).filter(Boolean),
    shipping_address: order.shipping_address,
    customer: order.customer,
  }

  try {
    const result = await notificationService.createNotifications({
      to: order.email,
      channel: "email",
      template: "order.placed",
      data: notificationData,
    })
    logger.info(`[send-order-email] Email sent successfully!`)
    logger.info(`[send-order-email] Result status: ${result.status}`)
    logger.info(`[send-order-email] External ID: ${result.external_id}`)
  } catch (error) {
    logger.error(`[send-order-email] Failed: ${error}`)
  }
}
