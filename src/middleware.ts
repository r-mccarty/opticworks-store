import { NextResponse } from "next/server"

import { COMMERCE_ENABLED } from "@/lib/commerce"

const AUTH_COOKIE_NAME = "medusa_auth_token"

export function middleware(request: Request) {
  const url = new URL(request.url)
  const pathname = url.pathname

  // Account pages render an unavailable state while commerce is offline.
  if (!COMMERCE_ENABLED) {
    return NextResponse.next()
  }

  // Protect account routes server-side
  if (pathname === "/account" || pathname.startsWith("/account/")) {
    const hasAuthCookie = request.headers.get("cookie")?.includes(`${AUTH_COOKIE_NAME}=`)
    if (!hasAuthCookie) {
      const redirectUrl = new URL("/auth/login", request.url)
      redirectUrl.searchParams.set("redirect", pathname)
      return NextResponse.redirect(redirectUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/account/:path*", "/account"],
}
