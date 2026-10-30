import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"

/** Welcome email for new customer accounts (not guest checkouts). */
export default async function customerCreated({ event: { data }, container }: SubscriberArgs<{ id: string }>) {
  const query = container.resolve("query")
  const notifications = container.resolve(Modules.NOTIFICATION)

  const { data: customers } = await query.graph({
    entity: "customer",
    fields: ["id", "email", "first_name", "last_name", "has_account"],
    filters: { id: data.id },
  })
  const customer = customers[0]
  if (!customer?.email || !customer.has_account) return

  await notifications.createNotifications({
    to: customer.email,
    channel: "email",
    template: "customer.welcome",
    idempotency_key: `customer.welcome:${customer.id}`,
    data: { id: customer.id, first_name: customer.first_name, last_name: customer.last_name },
  })
}

export const config: SubscriberConfig = { event: "customer.created" }
