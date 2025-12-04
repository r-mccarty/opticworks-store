import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"

/**
 * Subscriber that sends welcome emails when a new customer registers.
 * Uses the Resend notification provider configured in medusa-config.ts.
 */
export default async function customerCreatedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve("logger")
  const query = container.resolve("query")
  const notificationModuleService = container.resolve(Modules.NOTIFICATION)

  logger.info(`[customer-created] Processing customer: ${data.id}`)

  try {
    // Fetch customer details using Query
    const { data: customers } = await query.graph({
      entity: "customer",
      fields: [
        "id",
        "email",
        "first_name",
        "last_name",
        "created_at",
      ],
      filters: { id: data.id },
    })

    const customer = customers[0]

    if (!customer) {
      logger.error(`[customer-created] Customer not found: ${data.id}`)
      return
    }

    if (!customer.email) {
      logger.warn(`[customer-created] Customer ${data.id} has no email, skipping notification`)
      return
    }

    logger.info(`[customer-created] Sending welcome email to: ${customer.email}`)

    // Send notification via Resend provider
    await notificationModuleService.createNotifications({
      to: customer.email,
      channel: "email",
      template: "customer.welcome",
      data: {
        id: customer.id,
        email: customer.email,
        first_name: customer.first_name,
        last_name: customer.last_name,
      },
    })

    logger.info(`[customer-created] Welcome email sent for customer: ${data.id}`)
  } catch (error) {
    logger.error(`[customer-created] Failed to send welcome email: ${error}`)
    // Don't throw - we don't want to fail registration if email fails
  }
}

export const config: SubscriberConfig = {
  event: "customer.created",
}
