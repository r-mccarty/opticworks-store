import { cookies, headers } from "next/headers"

import { parseBag, serializeBag } from "./bag"
import { createMedusaBackend } from "./medusa"
import { mockBackend } from "./mock"
import { resolveStoreMode } from "./mode"
import type { BagLine, OrderConfirmation, QuoteLine, StoreBackend, StoreMode } from "./types"

const BAG_COOKIE = "ow_bag"
const CHECKOUT_COOKIE = "ow_checkout"
const ORDER_COOKIE = "ow_order"

export async function getStoreMode(): Promise<StoreMode> {
  return resolveStoreMode(process.env.STORE_MODE, (await headers()).get("host"))
}

/** The active backend, or null while the store is off (or misconfigured). */
export async function getBackend(): Promise<StoreBackend | null> {
  const mode = await getStoreMode()
  if (mode === "mock") return mockBackend
  if (mode !== "medusa") return null

  const baseUrl = process.env.MEDUSA_BACKEND_URL
  const publishableKey = process.env.MEDUSA_PUBLISHABLE_KEY
  if (!baseUrl || !publishableKey) {
    console.error("[store] STORE_MODE=medusa needs MEDUSA_BACKEND_URL and MEDUSA_PUBLISHABLE_KEY; store is off")
    return null
  }
  return createMedusaBackend({
    baseUrl: baseUrl.replace(/\/+$/, ""),
    publishableKey,
    accessClientId: process.env.CLOUDFLARE_BACKEND_ACCESS_ID,
    accessClientSecret: process.env.CLOUDFLARE_BACKEND_ACCESS_TOKEN,
  })
}

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
}

export async function readBag(): Promise<BagLine[]> {
  return parseBag((await cookies()).get(BAG_COOKIE)?.value)
}

export async function writeBag(lines: BagLine[]) {
  const jar = await cookies()
  if (lines.length)
    jar.set(BAG_COOKIE, serializeBag(lines), {
      ...cookieOptions,
      maxAge: 60 * 60 * 24 * 30,
    })
  else jar.delete(BAG_COOKIE)
}

export async function readCheckoutToken(): Promise<string | undefined> {
  return (await cookies()).get(CHECKOUT_COOKIE)?.value
}

export async function writeCheckoutToken(token: string | null) {
  const jar = await cookies()
  if (token) jar.set(CHECKOUT_COOKIE, token, { ...cookieOptions, maxAge: 60 * 60 * 24 })
  else jar.delete(CHECKOUT_COOKIE)
}

export async function readLastOrder(): Promise<OrderConfirmation | null> {
  const raw = (await cookies()).get(ORDER_COOKIE)?.value
  if (!raw) return null
  try {
    return JSON.parse(raw) as OrderConfirmation
  } catch {
    return null
  }
}

export async function writeLastOrder(order: OrderConfirmation) {
  ;(await cookies()).set(ORDER_COOKIE, JSON.stringify(order), {
    ...cookieOptions,
    maxAge: 60 * 60,
  })
}

/** Priced bag lines for display. Prices always come from the backend's offers. */
export async function pricedBag(backend: StoreBackend): Promise<{ lines: QuoteLine[]; currency: string }> {
  const [offers, bag] = await Promise.all([backend.listOffers(), readBag()])
  const lines = bag.flatMap((line) => {
    const offer = offers.find((o) => o.handle === line.handle)
    if (!offer) return []
    return [
      {
        handle: offer.handle,
        title: offer.title,
        quantity: line.quantity,
        unitPrice: offer.price,
        total: offer.price * line.quantity,
      },
    ]
  })
  return { lines, currency: offers[0]?.currency ?? "usd" }
}
