import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { siteConfig } from "@/app/siteConfig"
import { ArrowLink, PageIntro, Section } from "@/components/site/primitives"
import { formatMoney } from "@/lib/store/money"
import { getBackend, readLastOrder } from "@/lib/store/server"

export const metadata: Metadata = {
  title: "Order confirmation",
  robots: { index: false },
}

export default async function ConfirmationPage() {
  if (!(await getBackend())) notFound()
  const order = await readLastOrder()
  if (!order) notFound()

  return (
    <main>
      <PageIntro
        label={order.simulated ? "Simulated order" : "Order confirmed"}
        title={order.simulated ? "Checkout complete (simulated)." : "Thank you for your order."}
        lede={
          order.simulated
            ? "This was a mock checkout. No order was placed, no payment was taken and no email was sent."
            : `A confirmation is on its way to ${order.email}.`
        }
      />
      <Section>
        <div className="max-w-2xl">
          <p className="annotation">Reference</p>
          <p className="text-text mt-2 font-mono text-xl">{order.id}</p>
          <ul className="divide-line border-line mt-8 divide-y border-y">
            {order.lines.map((line) => (
              <li key={line.handle} className="flex justify-between gap-4 py-3 text-sm">
                <span className="text-text">
                  {line.title} <span className="text-text-subtle">× {line.quantity}</span>
                </span>
                <span className="text-text-muted font-mono">{formatMoney(line.total, order.currency)}</span>
              </li>
            ))}
          </ul>
          <dl className="text-text mt-4 flex justify-between">
            <dt>Total</dt>
            <dd className="font-mono">{formatMoney(order.total, order.currency)}</dd>
          </dl>
          <p className="text-text-muted mt-8 text-sm">
            Questions? Email{" "}
            <a href={`mailto:${siteConfig.contact.email}`} className="text-amber hover:text-amber-strong">
              {siteConfig.contact.email}
            </a>
            .
          </p>
          <ArrowLink href="/products" variant="secondary" className="mt-8">
            Back to products
          </ArrowLink>
        </div>
      </Section>
    </main>
  )
}
