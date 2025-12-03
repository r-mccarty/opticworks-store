import { NextRequest, NextResponse } from "next/server"
import { requestPasswordReset } from "@/lib/api/medusa"

interface ForgotPasswordRequest {
  email: string
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ForgotPasswordRequest
    const { email } = body

    // Validate required fields
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    // Request password reset from Medusa
    // This will send an email if the account exists
    try {
      await requestPasswordReset(email)
    } catch (error) {
      // Log the error but don't expose it to the client
      // This prevents email enumeration attacks
      console.error("[auth/forgot-password] Medusa error:", error)
    }

    // Always return success to prevent email enumeration
    return NextResponse.json({
      success: true,
      message: "If an account exists with this email, a reset link has been sent.",
    })
  } catch (error) {
    console.error("[auth/forgot-password] Unexpected error:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}
