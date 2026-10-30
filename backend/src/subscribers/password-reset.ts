import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"
import { env } from "../lib/env"

type ResetEvent = { entity_id: string; token: string; actor_type: string }

/**
 * Sends the reset link Medusa generates for POST /auth/{actor}/emailpass/reset-password.
 * The legacy backend had no subscriber, so reset emails were never sent.
 */
export default async function passwordReset({ event: { data }, container }: SubscriberArgs<ResetEvent>) {
  const notifications = container.resolve(Modules.NOTIFICATION)
  const { entity_id: email, token, actor_type } = data
  if (!email || !token) return

  const base =
    actor_type === "customer"
      ? `${env().STOREFRONT_URL}/auth/reset-password`
      : `${env().MEDUSA_BACKEND_URL}/app/reset-password`
  const reset_url = `${base}?${new URLSearchParams({ token, email }).toString()}`

  await notifications.createNotifications({
    to: email,
    channel: "email",
    template: "auth.password_reset",
    // Keyed by token: a retry won't resend, a new request (new token) will.
    idempotency_key: `auth.password_reset:${token.slice(-32)}`,
    data: { email, reset_url },
  })
}

export const config: SubscriberConfig = { event: "auth.password_reset" }
