import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

const AUTH_COOKIE_NAME = "medusa_auth_token"

/**
 * GET /api/account/payment-methods
 *
 * Proxy to fetch saved payment methods from Medusa backend.
 * Passes the auth token from httpOnly cookie.
 */
export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const backendUrl =
      process.env.MEDUSA_SSR_BASE_URL ||
      process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL

    const response = await fetch(
      `${backendUrl}/store/customers/me/payment-methods`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "x-publishable-api-key":
            process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
        },
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[payment-methods] Backend error:", response.status, errorText)

      if (response.status === 401) {
        // Clear invalid cookie
        cookieStore.delete(AUTH_COOKIE_NAME)
        return NextResponse.json({ error: "Session expired" }, { status: 401 })
      }

      return NextResponse.json(
        { error: "Failed to fetch payment methods" },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("[payment-methods] Unexpected error:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/account/payment-methods
 *
 * Proxy to delete a saved payment method.
 * Expects payment_method_id in query params.
 */
export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const paymentMethodId = searchParams.get("id")

    if (!paymentMethodId) {
      return NextResponse.json(
        { error: "Payment method ID is required" },
        { status: 400 }
      )
    }

    const backendUrl =
      process.env.MEDUSA_SSR_BASE_URL ||
      process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL

    const response = await fetch(
      `${backendUrl}/store/customers/me/payment-methods?payment_method_id=${encodeURIComponent(paymentMethodId)}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "x-publishable-api-key":
            process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
        },
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[payment-methods] Delete error:", response.status, errorText)

      if (response.status === 401) {
        cookieStore.delete(AUTH_COOKIE_NAME)
        return NextResponse.json({ error: "Session expired" }, { status: 401 })
      }

      return NextResponse.json(
        { error: "Failed to delete payment method" },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("[payment-methods] Delete unexpected error:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}
