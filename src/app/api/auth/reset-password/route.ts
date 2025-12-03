import { NextRequest, NextResponse } from "next/server"
import { resetPassword } from "@/lib/api/medusa"

interface ResetPasswordRequest {
  token: string
  email: string
  password: string
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ResetPasswordRequest
    const { token, email, password } = body

    // Validate required fields
    if (!token || !email || !password) {
      return NextResponse.json(
        { error: "Token, email, and password are required" },
        { status: 400 }
      )
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      )
    }

    // Reset password with Medusa
    try {
      await resetPassword(token, email, password)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Password reset failed"

      // Check for expired or invalid token
      if (message.includes("401") || message.includes("expired") || message.includes("invalid")) {
        return NextResponse.json(
          { error: "Reset link has expired or is invalid. Please request a new one." },
          { status: 400 }
        )
      }

      console.error("[auth/reset-password] Medusa error:", message)
      return NextResponse.json(
        { error: "Failed to reset password. Please try again." },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Password has been reset successfully.",
    })
  } catch (error) {
    console.error("[auth/reset-password] Unexpected error:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}
