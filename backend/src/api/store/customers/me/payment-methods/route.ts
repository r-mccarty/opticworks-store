import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import Stripe from "stripe"

/**
 * Payment Method response structure
 */
interface PaymentMethodData {
  id: string
  provider_id: string
  data: {
    id: string
    card?: {
      brand: string
      last4: string
      exp_month: number
      exp_year: number
    }
    [key: string]: unknown
  }
}

/**
 * GET /store/customers/me/payment-methods
 *
 * List all saved payment methods for the authenticated customer.
 * Requires customer authentication via bearer token.
 */
export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const logger = req.scope.resolve("logger")
  const query = req.scope.resolve("query")
  const paymentModuleService = req.scope.resolve(Modules.PAYMENT)

  const customerId = req.auth_context?.actor_id

  if (!customerId) {
    res.status(401).json({ error: "Not authenticated" })
    return
  }

  logger.info(`[payment-methods] Listing payment methods for customer: ${customerId}`)

  try {
    // Fetch customer with linked account_holder
    const { data: customers } = await query.graph({
      entity: "customer",
      fields: ["id", "account_holder.*"],
      filters: { id: customerId },
    })

    const customer = customers[0]

    if (!customer?.account_holders?.[0]) {
      // Customer doesn't have an account holder yet (registered before this feature)
      logger.info(`[payment-methods] No account holder for customer ${customerId}`)
      res.json({ payment_methods: [] })
      return
    }

    // List payment methods from Stripe via payment module
    const paymentMethods = await paymentModuleService.listPaymentMethods({
      provider_id: "pp_stripe_stripe",
      context: {
        account_holder: customer.account_holders[0],
      },
    })

    logger.info(
      `[payment-methods] Found ${paymentMethods.length} payment methods for customer ${customerId}`
    )

    // Map to our response format
    const formattedMethods: PaymentMethodData[] = paymentMethods.map(
      (method: { id: string; provider_id: string; data: Record<string, unknown> }) => ({
        id: method.id,
        provider_id: method.provider_id,
        data: method.data as PaymentMethodData["data"],
      })
    )

    res.json({ payment_methods: formattedMethods })
  } catch (error) {
    logger.error(`[payment-methods] Failed to list payment methods: ${error}`)
    res.status(500).json({ error: "Failed to fetch payment methods" })
  }
}

/**
 * DELETE /store/customers/me/payment-methods
 *
 * Delete a saved payment method. Expects payment_method_id in query params.
 * Requires customer authentication via bearer token.
 *
 * Uses Stripe API directly to detach the payment method from the customer.
 */
export async function DELETE(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const logger = req.scope.resolve("logger")
  const query = req.scope.resolve("query")

  const customerId = req.auth_context?.actor_id
  const paymentMethodId = req.query.payment_method_id as string

  if (!customerId) {
    res.status(401).json({ error: "Not authenticated" })
    return
  }

  if (!paymentMethodId) {
    res.status(400).json({ error: "payment_method_id query parameter is required" })
    return
  }

  logger.info(
    `[payment-methods] Deleting payment method ${paymentMethodId} for customer ${customerId}`
  )

  try {
    // Verify customer has an account holder (security check)
    const { data: customers } = await query.graph({
      entity: "customer",
      fields: ["id", "account_holder.*"],
      filters: { id: customerId },
    })

    const customer = customers[0]

    if (!customer?.account_holders?.[0]) {
      res.status(404).json({ error: "No payment methods found" })
      return
    }

    // Get Stripe API key from environment
    const stripeApiKey = process.env.STRIPE_API_KEY
    if (!stripeApiKey) {
      logger.error("[payment-methods] STRIPE_API_KEY not configured")
      res.status(500).json({ error: "Payment provider not configured" })
      return
    }

    // Detach the payment method from the customer using Stripe API
    const stripe = new Stripe(stripeApiKey)
    await stripe.paymentMethods.detach(paymentMethodId)

    logger.info(
      `[payment-methods] Deleted payment method ${paymentMethodId} for customer ${customerId}`
    )

    res.json({ success: true })
  } catch (error) {
    logger.error(`[payment-methods] Failed to delete payment method: ${error}`)
    res.status(500).json({ error: "Failed to delete payment method" })
  }
}
