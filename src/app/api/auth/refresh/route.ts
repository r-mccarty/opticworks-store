import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { refreshAuthToken } from "@/lib/api/medusa"

const AUTH_COOKIE_NAME = "medusa_auth_token"
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

export async function POST() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value

    if (!token) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      )
    }

    try {
      const refreshed = await refreshAuthToken(token)

      cookieStore.set(AUTH_COOKIE_NAME, refreshed.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: COOKIE_MAX_AGE,
        path: "/",
      })

      return NextResponse.json({ success: true })
    } catch (error) {
      const message = error instanceof Error ? error.message : "Refresh failed"
      // Expired/invalid token: clear cookie
      if (message.includes("401") || message.includes("unauthorized")) {
        cookieStore.delete(AUTH_COOKIE_NAME)
        return NextResponse.json({ error: "Session expired" }, { status: 401 })
      }

      console.error("[auth/refresh] Refresh error:", message)
      return NextResponse.json({ error: "Refresh failed" }, { status: 500 })
    }
  } catch (error) {
    console.error("[auth/refresh] Unexpected error:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}
