import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { sendEmail } from "@/lib/api/email"

const supportRequestSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  category: z.string().min(1),
  orderNumber: z.string().optional(),
  subject: z.string().min(5),
  message: z.string().min(20),
  priority: z.enum(["low", "medium", "high"]),
  turnstileToken: z.string().min(1),
})

type SupportRequestPayload = z.infer<typeof supportRequestSchema>

type TurnstileVerificationResponse = {
  success: boolean
  challenge_ts?: string
  hostname?: string
  "error-codes"?: string[]
}

async function verifyTurnstileToken(token: string) {
  const secretKey = process.env.TURNSTILE_SECRET_KEY

  if (!secretKey) {
    console.error("TURNSTILE_SECRET_KEY environment variable is not configured")
    return NextResponse.json(
      {
        error: "Security check is misconfigured. Please contact support directly.",
      },
      { status: 500 }
    )
  }

  const formData = new URLSearchParams()
  formData.append("secret", secretKey)
  formData.append("response", token)

  const verificationResponse = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData.toString(),
  })

  const verification: TurnstileVerificationResponse = await verificationResponse.json()

  if (!verification.success) {
    console.warn("Turnstile verification failed", verification["error-codes"])

    return NextResponse.json(
      {
        error: "Security check failed. Please try again.",
        field: "turnstile",
        codes: verification["error-codes"],
      },
      { status: 400 }
    )
  }

  return null
}

function buildEmailPayload(data: SupportRequestPayload) {
  const supportMailbox = process.env.SUPPORT_REQUEST_EMAIL ?? "ryan@mccarty.id"

  return {
    to: supportMailbox,
    subject: `Support Request: ${data.subject} [${data.category.toUpperCase()}]`,
    template: "support-request" as const,
    data: {
      customerName: data.name,
      customerEmail: data.email,
      customerPhone: data.phone,
      category: data.category,
      orderNumber: data.orderNumber,
      subject: data.subject,
      message: data.message,
      priority: data.priority,
      submittedAt: new Date().toLocaleString(),
    },
  }
}

export async function POST(request: NextRequest) {
  try {
    const json = await request.json()
    const parsed = supportRequestSchema.safeParse(json)

    if (!parsed.success) {
      console.warn("Invalid support request payload", parsed.error.flatten().fieldErrors)

      return NextResponse.json(
        {
          error: "Invalid request payload.",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    const validationErrorResponse = await verifyTurnstileToken(parsed.data.turnstileToken)
    if (validationErrorResponse) {
      return validationErrorResponse
    }

    const emailPayload = buildEmailPayload(parsed.data)
    const emailResult = await sendEmail(emailPayload)

    if (!emailResult.success) {
      console.error("Failed to dispatch support request email", emailResult.error)

      return NextResponse.json(
        {
          error: "We could not deliver your message. Please try again shortly.",
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      messageId: emailResult.messageId,
    })
  } catch (error) {
    console.error("Support contact endpoint error", error)

    return NextResponse.json(
      {
        error: "Internal server error",
      },
      { status: 500 }
    )
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 })
}
