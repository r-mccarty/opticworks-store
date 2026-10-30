import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"

/** Order confirmation email. Throws on failure so the event bus retries. */
export default async function orderPlaced({ event: { data }, container }: SubscriberArgs<{ id: string }>) {
  const query = container.resolve("query")
  const notifications = container.resolve(Modules.NOTIFICATION)

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
      "items.id",
      "items.title",
      "items.product_title",
      "items.variant_title",
      "items.quantity",
      "items.unit_price",
      "items.total",
      "shipping_address.*",
      "customer.first_name",
      "customer.last_name",
    ],
    filters: { id: data.id },
  })
  const order = orders[0]
  if (!order?.email) return

  await notifications.createNotifications({
    to: order.email,
    channel: "email",
    template: "order.placed",
    // One confirmation per order, however many times the event is redelivered.
    idempotency_key: `order.placed:${order.id}`,
    data: {
      id: order.id,
      display_id: order.display_id,
      email: order.email,
      currency_code: order.currency_code,
      subtotal: order.subtotal,
      shipping_total: order.shipping_total,
      tax_total: order.tax_total,
      total: order.total,
      items: (order.items ?? []).filter(Boolean),
      shipping_address: order.shipping_address,
      customer: order.customer,
    },
  })
}

export const config: SubscriberConfig = { event: "order.placed" }
