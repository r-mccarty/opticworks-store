import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { ArrowLink, PageIntro, Section } from "@/components/site/primitives"
import { StoreNotice } from "@/components/store/StoreNotice"
import { MAX_QUANTITY } from "@/lib/store/bag"
import { updateQuantity } from "@/lib/store/actions"
import { formatMoney } from "@/lib/store/money"
import { getBackend, pricedBag } from "@/lib/store/server"

export const metadata: Metadata = {
  title: "Bag",
  robots: { index: false },
}

export default async function CartPage() {
  const backend = await getBackend()
  if (!backend) notFound()
  const { lines, currency } = await pricedBag(backend)
  const subtotal = lines.reduce((sum, line) => sum + line.total, 0)

  return (
    <main>
      <PageIntro label="Bag" title="Your bag.">
        <StoreNotice mode={backend.mode} />
      </PageIntro>
      <Section>
        {lines.length === 0 ? (
          <div className="space-y-6">
            <p className="text-text-muted">Your bag is empty.</p>
            <ArrowLink href="/store" variant="secondary">
              Browse the store
            </ArrowLink>
          </div>
        ) : (
          <div className="grid gap-12 lg:grid-cols-12">
            <ul className="divide-line border-line divide-y border-y lg:col-span-8">
              {lines.map((line) => (
                <li key={line.handle} className="flex flex-wrap items-center justify-between gap-4 py-6">
                  <div>
                    <Link href={`/products/${line.handle}`} className="text-text hover:text-amber-strong text-lg">
                      {line.title}
                    </Link>
                    <p className="text-text-subtle mt-1 font-mono text-sm">
                      {formatMoney(line.unitPrice, currency)} each
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <form action={updateQuantity} className="flex items-center gap-2">
                      <input type="hidden" name="handle" value={line.handle} />
                      <label htmlFor={`qty-${line.handle}`} className="sr-only">
                        Quantity of {line.title}
                      </label>
                      <select
                        id={`qty-${line.handle}`}
                        name="quantity"
                        defaultValue={line.quantity}
                        className="border-line-strong bg-surface text-text rounded-sm border px-2 py-1.5"
                      >
                        {Array.from({ length: MAX_QUANTITY }, (_, i) => i + 1).map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                      <button type="submit" className="text-amber hover:text-amber-strong text-sm">
                        Update
                      </button>
                    </form>
                    <form action={updateQuantity}>
                      <input type="hidden" name="handle" value={line.handle} />
                      <input type="hidden" name="quantity" value="0" />
                      <button type="submit" className="text-text-subtle hover:text-text text-sm">
                        Remove
                      </button>
                    </form>
                    <span className="text-text w-28 text-right font-mono">{formatMoney(line.total, currency)}</span>
                  </div>
                </li>
              ))}
            </ul>
            <div className="lg:col-span-4">
              <div className="border-line-strong bg-surface rounded-sm border p-6">
                <dl className="text-text flex justify-between">
                  <dt>Subtotal</dt>
                  <dd className="font-mono">{formatMoney(subtotal, currency)}</dd>
                </dl>
                <p className="text-text-subtle mt-2 text-sm">Taxes and shipping are calculated at checkout.</p>
                <ArrowLink href="/checkout" variant="primary" className="mt-6 w-full justify-center">
                  Checkout
                </ArrowLink>
              </div>
            </div>
          </div>
        )}
      </Section>
    </main>
  )
}
