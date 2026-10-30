/** Convert a Medusa v2 major-unit amount (possibly a long decimal) to integer cents. */
export function toMinor(amount: number | string | null | undefined): number {
  const value = typeof amount === "string" ? Number.parseFloat(amount) : (amount ?? 0)
  return Number.isFinite(value) ? Math.round(value * 100) : 0
}

export function formatMoney(minor: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(minor / 100)
}
