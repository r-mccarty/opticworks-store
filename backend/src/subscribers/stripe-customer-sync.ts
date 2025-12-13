import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"

/**
 * Subscriber that creates a Stripe customer and links an Account Holder
 * when a new Medusa customer is created. This enables saved payment methods.
 *
 * Flow:
 * 1. Customer registers → customer.created event fires
 * 2. This subscriber creates an Account Holder via the Payment Module
 * 3. The Stripe provider creates a corresponding Stripe Customer
 * 4. The Account Holder is linked to the Medusa Customer via remoteLink
 *
 * When the customer checks out later, their payment methods will be saved
 * to their Stripe Customer account automatically.
 */
export default async function stripeCustomerSyncHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve("logger")
  const query = container.resolve("query")
  const paymentModuleService = container.resolve(Modules.PAYMENT)
  const remoteLink = container.resolve("remoteLink")

  logger.info(`[stripe-customer-sync] Processing customer: ${data.id}`)

  try {
    // Fetch customer details using Query
    const { data: customers } = await query.graph({
      entity: "customer",
      fields: ["id", "email", "first_name", "last_name", "metadata"],
      filters: { id: data.id },
    })

    const customer = customers[0]

    if (!customer) {
      logger.error(`[stripe-customer-sync] Customer not found: ${data.id}`)
      return
    }

    if (!customer.email) {
      logger.warn(
        `[stripe-customer-sync] Customer ${data.id} has no email, skipping Stripe sync`
      )
      return
    }

    // Check if customer already has an account holder linked
    // This prevents duplicate Stripe customers on re-registration
    const { data: customersWithAccountHolder } = await query.graph({
      entity: "customer",
      fields: ["id", "account_holder_link.account_holder.*"],
      filters: { id: data.id },
    })

    const customerWithAccountHolder = customersWithAccountHolder[0] as {
      id: string
      account_holder_link?: Array<{ account_holder: { id: string } }>
    }
    const existingAccountHolder = customerWithAccountHolder?.account_holder_link?.[0]?.account_holder
    if (existingAccountHolder) {
      logger.info(
        `[stripe-customer-sync] Customer ${data.id} already has account holder ${existingAccountHolder.id}, skipping`
      )
      return
    }

    logger.info(
      `[stripe-customer-sync] Creating Stripe customer for: ${customer.email}`
    )

    // Create Account Holder via Payment Module
    // This triggers the Stripe provider to create a Stripe Customer
    const accountHolder = await paymentModuleService.createAccountHolder({
      provider_id: "pp_stripe_stripe",
      context: {
        customer: {
          id: customer.id,
          email: customer.email,
          first_name: customer.first_name,
          last_name: customer.last_name,
        },
      },
    })

    logger.info(
      `[stripe-customer-sync] Created account holder ${accountHolder.id} for customer ${data.id}`
    )

    // Link Account Holder to Customer via remoteLink
    // This enables the payment module to find the customer's Stripe account during checkout
    await remoteLink.create([
      {
        [Modules.CUSTOMER]: {
          customer_id: customer.id,
        },
        [Modules.PAYMENT]: {
          account_holder_id: accountHolder.id,
        },
      },
    ])

    logger.info(
      `[stripe-customer-sync] Linked account holder ${accountHolder.id} to customer ${data.id}`
    )
  } catch (error) {
    // Log the error but don't throw - registration should not fail if Stripe sync fails
    // The customer can still checkout, they just won't have saved payment methods
    logger.error(
      `[stripe-customer-sync] Failed to create Stripe customer for ${data.id}: ${error}`
    )
  }
}

export const config: SubscriberConfig = {
  event: "customer.created",
}
