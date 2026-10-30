import crypto from "crypto"
import type React from "react"
import { AbstractNotificationProviderService, MedusaError } from "@medusajs/framework/utils"
import type { Logger, ProviderSendNotificationDTO } from "@medusajs/framework/types"
import { Resend } from "resend"
import { OrderPlacedEmail } from "./emails/order-placed"
import { PasswordResetEmail } from "./emails/password-reset"
import { CustomerWelcomeEmail } from "./emails/customer-welcome"

type ResendOptions = {
  api_key: string
  from: string
  // When set, only these addresses (or @domains) receive mail. Used while the
  // backend is dark so synthetic customers never trigger real deliveries.
  allowlist?: string[]
}

type InjectedDependencies = { logger: Logger }

type Template = {
  render: (data: Record<string, unknown>) => React.ReactElement
  subject: (data: Record<string, unknown>) => string
}

const TEMPLATES: Record<string, Template> = {
  "order.placed": {
    render: OrderPlacedEmail,
    subject: (d) => `Order Confirmation - #${String(d.display_id ?? d.id)}`,
  },
  "auth.password_reset": { render: PasswordResetEmail, subject: () => "Reset Your Password" },
  "customer.welcome": { render: CustomerWelcomeEmail, subject: () => "Welcome to OpticWorks" },
}

class ResendNotificationProviderService extends AbstractNotificationProviderService {
  static identifier = "notification-resend"

  private client: Resend
  private options: ResendOptions
  private logger: Logger

  constructor({ logger }: InjectedDependencies, options: ResendOptions) {
    super()
    this.client = new Resend(options.api_key)
    this.options = options
    this.logger = logger
  }

  static validateOptions(options: Record<string, unknown>) {
    if (!options.api_key) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "Resend provider requires `api_key`")
    }
    if (!options.from) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "Resend provider requires `from`")
    }
  }

  async send(notification: ProviderSendNotificationDTO): Promise<{ id: string }> {
    const { to, template } = notification
    const data = notification.data ?? {}
    const spec = TEMPLATES[template]
    if (!spec) {
      // No generic fallback: dumping event data into an email can leak tokens.
      throw new MedusaError(MedusaError.Types.INVALID_DATA, `Unknown email template: ${template}`)
    }

    if (!this.allowed(to)) {
      this.logger.info(`[resend] ${template} suppressed by allowlist`)
      return { id: "suppressed" }
    }

    // Same template/recipient/payload yields the same key, so an event retry
    // can't deliver a second copy (Resend deduplicates for 24h).
    const idempotencyKey = crypto
      .createHash("sha256")
      .update(JSON.stringify([template, to, data]))
      .digest("hex")

    const { data: result, error } = await this.client.emails.send(
      {
        from: this.options.from,
        to: [to],
        subject: spec.subject(data),
        react: spec.render(data),
      },
      { idempotencyKey }
    )
    if (error || !result) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Resend rejected ${template}: ${error?.name ?? "unknown error"}`
      )
    }
    this.logger.info(`[resend] ${template} sent id=${result.id}`)
    return { id: result.id }
  }

  private allowed(to: string): boolean {
    const list = this.options.allowlist
    if (!list || list.length === 0) return true
    const addr = to.trim().toLowerCase()
    return list.some((entry) => {
      const e = entry.toLowerCase()
      return e.startsWith("@") ? addr.endsWith(e) : addr === e
    })
  }
}

export default ResendNotificationProviderService
