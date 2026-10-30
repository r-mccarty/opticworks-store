"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { addToBag, bagCount, parseContact, setQuantity, type ContactErrors } from "./bag"
import { getBackend, readBag, readCheckoutToken, writeBag, writeCheckoutToken, writeLastOrder } from "./server"
import type { CheckoutQuote, Offer, StoreMode } from "./types"
import { StoreError } from "./types"

// Server actions post to the page's own URL, not /api/*, so they work behind
// the offline Worker that answers optic.works/api/*.

function message(error: unknown): string {
  if (error instanceof StoreError) return error.message
  console.error("[store]", error)
  return "Something went wrong. Please try again."
}

/** Header badge: null while the store is off. */
export async function getBagSummary(): Promise<{ count: number } | null> {
  if (!(await getBackend())) return null
  return { count: bagCount(await readBag()) }
}

/** Buy box data for a product page: null while the store is off or the product isn't offered. */
export async function getOfferForHandle(handle: string): Promise<{
  offer: Offer
  mode: Exclude<StoreMode, "off">
  inBag: number
} | null> {
  const backend = await getBackend()
  if (!backend) return null
  try {
    const offer = (await backend.listOffers()).find((o) => o.handle === handle)
    if (!offer) return null
    const inBag = (await readBag()).find((line) => line.handle === handle)?.quantity ?? 0
    return { offer, mode: backend.mode, inBag }
  } catch (error) {
    message(error)
    return null
  }
}

export async function addItem(handle: string): Promise<{ count: number } | { error: string }> {
  const backend = await getBackend()
  if (!backend) return { error: "The store isn't open." }
  try {
    if (!(await backend.listOffers()).some((o) => o.handle === handle))
      return { error: "That product isn't available." }
    const bag = addToBag(await readBag(), handle)
    await writeBag(bag)
    revalidatePath("/cart")
    return { count: bagCount(bag) }
  } catch (error) {
    return { error: message(error) }
  }
}

/** Form action for the bag page's quantity selectors and remove buttons. */
export async function updateQuantity(formData: FormData) {
  if (!(await getBackend())) return
  const handle = String(formData.get("handle") ?? "")
  const quantity = Number(formData.get("quantity") ?? 0)
  if (!Number.isFinite(quantity)) return
  await writeBag(setQuantity(await readBag(), handle, quantity))
  revalidatePath("/cart")
}

export interface CheckoutState {
  quote?: CheckoutQuote
  errors?: ContactErrors
  error?: string
  /** Echo of submitted fields, so the form keeps its values on error. */
  values?: Record<string, string>
}

export async function startCheckout(_previous: CheckoutState, formData: FormData): Promise<CheckoutState> {
  const values = Object.fromEntries(
    [...formData.entries()].filter(([, v]) => typeof v === "string") as [string, string][],
  )
  const backend = await getBackend()
  if (!backend) return { error: "The store isn't open.", values }

  const { contact, errors } = parseContact(values)
  if (!contact) return { errors, values }

  const bag = await readBag()
  if (!bag.length) return { error: "Your bag is empty.", values }
  try {
    const { token, quote } = await backend.startCheckout(bag, contact)
    await writeCheckoutToken(token)
    return { quote, values }
  } catch (error) {
    return { error: message(error), values }
  }
}

export async function chooseShipping(optionId: string): Promise<{ quote?: CheckoutQuote; error?: string }> {
  const backend = await getBackend()
  const token = await readCheckoutToken()
  if (!backend || !token) return { error: "Your checkout expired. Please start again." }
  try {
    const result = await backend.selectShipping(token, optionId)
    await writeCheckoutToken(result.token)
    return { quote: result.quote }
  } catch (error) {
    return { error: message(error) }
  }
}

export async function placeOrder(): Promise<{ error: string }> {
  const backend = await getBackend()
  const token = await readCheckoutToken()
  if (!backend || !token) return { error: "Your checkout expired. Please start again." }
  try {
    const order = await backend.placeOrder(token)
    await writeLastOrder(order)
    await writeCheckoutToken(null)
    await writeBag([])
  } catch (error) {
    return { error: message(error) }
  }
  redirect("/checkout/confirmation")
}
