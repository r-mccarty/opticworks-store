import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { ArrowLink, PageIntro, Section, StagePill } from "@/components/site/primitives"
import { StoreNotice } from "@/components/store/StoreNotice"
import { programs } from "@/content/programs"
import { formatMoney } from "@/lib/store/money"
import { getBackend } from "@/lib/store/server"

export const metadata: Metadata = {
  title: "Store",
  robots: { index: false },
}

export default async function StorePage() {
  const backend = await getBackend()
  if (!backend) notFound()
  const offers = await backend.listOffers()

  const items = programs.flatMap((program) => {
    const offer = offers.find((o) => o.handle === program.commerce?.productHandle)
    return offer ? [{ program, offer }] : []
  })

  return (
    <main>
      <PageIntro
        label="Store"
        title="Order OpticWorks instruments."
        lede="Provisional list prices. Taxes and shipping are calculated at checkout."
      >
        <StoreNotice mode={backend.mode} />
      </PageIntro>
      <Section>
        {items.length === 0 ? (
          <p className="text-text-muted">Nothing is offered right now.</p>
        ) : (
          <ul className="grid gap-6 md:grid-cols-2">
            {items.map(({ program, offer }) => (
              <li key={offer.handle} className="border-line-strong bg-surface flex flex-col rounded-sm border p-6">
                <p className="annotation">{program.category}</p>
                <h2 className="text-text mt-4 text-2xl font-light">
                  <Link href={`/products/${program.slug}`} className="hover:text-amber-strong">
                    {program.name}
                  </Link>
                </h2>
                <p className="text-text-muted mt-2">{program.tagline}</p>
                <div className="mt-4">
                  <StagePill stage={program.stage} />
                </div>
                <p className="text-text mt-6 text-3xl font-light tracking-tight">
                  {formatMoney(offer.price, offer.currency)}
                </p>
                <div className="mt-6">
                  <ArrowLink href={`/products/${program.slug}`} variant="secondary">
                    Details and order
                  </ArrowLink>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </main>
  )
}
