import { NextResponse } from "next/server"

import { COMMERCE_ENABLED } from "@/lib/commerce"
import { goneResponseHtml, isGonePath } from "@/lib/legacy-routes"

const AUTH_COOKIE_NAME = "medusa_auth_token"

export function middleware(request: Request) {
  const url = new URL(request.url)
  const pathname = url.pathname

  // Retired storefront pages answer 410 Gone.
  if (isGonePath(pathname)) {
    return new NextResponse(goneResponseHtml(url.origin), {
      status: 410,
      headers: { "Content-Type": "text/html; charset=utf-8", "X-Robots-Tag": "noindex" },
    })
  }

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
  matcher: [
    "/account/:path*",
    "/account",
    "/products/ow-1-dev-kit",
    "/install-guides",
    "/install-guides/:path*",
    "/support/faq",
    "/support/warranty",
    "/support/compatibility",
    "/support/legal/tinting-laws",
  ],
}
