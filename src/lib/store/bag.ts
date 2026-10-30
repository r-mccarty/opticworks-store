import type { BagLine, CheckoutContact } from "./types"

export const MAX_QUANTITY = 5

const handlePattern = /^[a-z0-9-]{1,64}$/

/** Parse the bag cookie. Anything malformed is dropped rather than trusted. */
export function parseBag(raw: string | undefined): BagLine[] {
  if (!raw) return []
  let data: unknown
  try {
    data = JSON.parse(raw)
  } catch {
    return []
  }
  if (!Array.isArray(data)) return []
  const lines: BagLine[] = []
  for (const entry of data) {
    if (typeof entry !== "object" || entry === null) continue
    const { handle, quantity } = entry as Record<string, unknown>
    if (typeof handle !== "string" || !handlePattern.test(handle)) continue
    if (typeof quantity !== "number" || !Number.isInteger(quantity) || quantity < 1) continue
    if (lines.some((line) => line.handle === handle)) continue
    lines.push({ handle, quantity: Math.min(quantity, MAX_QUANTITY) })
  }
  return lines
}

export function serializeBag(lines: BagLine[]): string {
  return JSON.stringify(lines.map(({ handle, quantity }) => ({ handle, quantity })))
}

/** Set a line's quantity (adding it if new); quantity 0 removes it. */
export function setQuantity(lines: BagLine[], handle: string, quantity: number): BagLine[] {
  const clamped = Math.max(0, Math.min(MAX_QUANTITY, Math.trunc(quantity)))
  const rest = lines.filter((line) => line.handle !== handle)
  if (clamped === 0) return rest
  const index = lines.findIndex((line) => line.handle === handle)
  const next = { handle, quantity: clamped }
  if (index === -1) return [...rest, next]
  return [...rest.slice(0, index), next, ...rest.slice(index)]
}

export function addToBag(lines: BagLine[], handle: string, quantity = 1): BagLine[] {
  const current = lines.find((line) => line.handle === handle)?.quantity ?? 0
  return setQuantity(lines, handle, current + quantity)
}

export function bagCount(lines: BagLine[]): number {
  return lines.reduce((sum, line) => sum + line.quantity, 0)
}

const states = new Set(
  "AL AK AZ AR CA CO CT DE DC FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY".split(
    " ",
  ),
)

export type ContactErrors = Partial<Record<keyof CheckoutContact, string>>

/** Validate and normalise checkout form input (US addresses only). */
export function parseContact(form: Record<string, unknown>): {
  contact?: CheckoutContact
  errors: ContactErrors
} {
  const text = (key: keyof CheckoutContact) => {
    const value = form[key]
    return typeof value === "string" ? value.trim() : ""
  }
  const contact: CheckoutContact = {
    email: text("email").toLowerCase(),
    firstName: text("firstName"),
    lastName: text("lastName"),
    address1: text("address1"),
    address2: text("address2") || undefined,
    city: text("city"),
    state: text("state").toUpperCase(),
    postalCode: text("postalCode"),
    phone: text("phone") || undefined,
  }
  const errors: ContactErrors = {}
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) errors.email = "Enter a valid email address."
  if (!contact.firstName) errors.firstName = "Required."
  if (!contact.lastName) errors.lastName = "Required."
  if (!contact.address1) errors.address1 = "Required."
  if (!contact.city) errors.city = "Required."
  if (!states.has(contact.state)) errors.state = "Use a two-letter US state code."
  if (!/^\d{5}(-\d{4})?$/.test(contact.postalCode)) errors.postalCode = "Use a 5-digit ZIP code."
  if (contact.phone && !/^[+\d][\d\s().-]{6,}$/.test(contact.phone)) errors.phone = "Enter a valid phone number."
  for (const key of Object.keys(contact) as (keyof CheckoutContact)[]) {
    if ((contact[key]?.length ?? 0) > 200) errors[key] = "Too long."
  }
  return Object.keys(errors).length ? { errors } : { contact, errors }
}
