import {
  AbstractNotificationProviderService,
  MedusaError,
} from "@medusajs/framework/utils"
import { Logger } from "@medusajs/framework/types"
import { Resend } from "resend"

// Import email templates
import { OrderPlacedEmail } from "./emails/order-placed"
import { OrderShippedEmail } from "./emails/order-shipped"
import { PasswordResetEmail } from "./emails/password-reset"
import { CustomerWelcomeEmail } from "./emails/customer-welcome"

type ResendOptions = {
  api_key: string
  from: string
}

type InjectedDependencies = {
  logger: Logger
}

// Template registry mapping template names to React components
const TEMPLATES: Record<string, (data: Record<string, unknown>) => React.ReactElement> = {
  "order.placed": OrderPlacedEmail,
  "order.shipped": OrderShippedEmail,
  "auth.password_reset": PasswordResetEmail,
  "customer.welcome": CustomerWelcomeEmail,
}

// Default subjects for each template
const TEMPLATE_SUBJECTS: Record<string, string | ((data: Record<string, unknown>) => string)> = {
  "order.placed": (data) => `Order Confirmation - #${data.display_id || data.id}`,
  "order.shipped": (data) => `Your Order Has Shipped - #${data.display_id || data.id}`,
  "auth.password_reset": "Reset Your Password",
  "customer.welcome": "Welcome to OpticWorks!",
}

class ResendNotificationProviderService extends AbstractNotificationProviderService {
  static identifier = "notification-resend"
  private resendClient: Resend
  private options: ResendOptions
  private logger: Logger

  constructor({ logger }: InjectedDependencies, options: ResendOptions) {
    super()
    this.resendClient = new Resend(options.api_key)
    this.options = options
    this.logger = logger
  }

  static validateOptions(options: Record<string, unknown>) {
    if (!options.api_key) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Resend provider requires `api_key` option"
      )
    }
    if (!options.from) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Resend provider requires `from` option"
      )
    }
  }

  async send(notification: {
    to: string
    channel: string
    template: string
    data: Record<string, unknown>
  }): Promise<{ id: string }> {
    const { to, template, data } = notification

    this.logger.info(`[Resend] Sending ${template} email to ${to}`)

    // Get template component
    const TemplateComponent = TEMPLATES[template]
    if (!TemplateComponent) {
      this.logger.warn(`[Resend] No template found for: ${template}, using fallback`)
      // For unknown templates, send a basic notification
      return this.sendBasicEmail(to, template, data)
    }

    // Get subject
    const subjectConfig = TEMPLATE_SUBJECTS[template]
    const subject =
      typeof subjectConfig === "function"
        ? subjectConfig(data)
        : subjectConfig || "Notification from OpticWorks"

    try {
      const { data: result, error } = await this.resendClient.emails.send({
        from: this.options.from,
        to: [to],
        subject,
        react: TemplateComponent(data),
      })

      if (error || !result) {
        this.logger.error(`[Resend] Failed to send email: ${error?.message}`, error)
        throw new MedusaError(
          MedusaError.Types.UNEXPECTED_STATE,
          `Failed to send email: ${error?.message}`
        )
      }

      this.logger.info(`[Resend] Email sent successfully: ${result.id}`)
      return { id: result.id }
    } catch (err) {
      this.logger.error(`[Resend] Error sending email`, err)
      throw err
    }
  }

  /**
   * Send a basic text email for templates we don't have React components for
   */
  private async sendBasicEmail(
    to: string,
    template: string,
    data: Record<string, unknown>
  ): Promise<{ id: string }> {
    const { data: result, error } = await this.resendClient.emails.send({
      from: this.options.from,
      to: [to],
      subject: `Notification: ${template}`,
      text: `You have a new notification.\n\nType: ${template}\n\nDetails:\n${JSON.stringify(data, null, 2)}`,
    })

    if (error || !result) {
      this.logger.error(`[Resend] Failed to send basic email: ${error?.message}`)
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Failed to send email: ${error?.message}`
      )
    }

    return { id: result.id }
  }
}

export default ResendNotificationProviderService
