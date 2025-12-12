import Image from "next/image"
import Link from "next/link"

import { FadeContainer, FadeDiv } from "@/components/Fade"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { products } from "@/lib/products"

export default function ProductsPage() {
  return (
    <main className="relative min-h-screen bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,oklch(0.75_0.18_55/0.18),transparent_55%),radial-gradient(circle_at_80%_30%,oklch(0.82_0.19_145/0.12),transparent_60%)]" />

      <FadeContainer className="relative mx-auto max-w-6xl px-6 pt-32 pb-16 lg:px-8">
        <FadeDiv className="flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-2 text-xs font-medium text-muted-foreground shadow-elevation-1">
            <span className="rounded-full bg-primary px-2 py-0.5 text-[11px] font-semibold text-primary-foreground">
              Catalog
            </span>
            Presence Lab hardware + platform
          </div>
        </FadeDiv>

        <FadeDiv className="mt-8 text-center">
          <h1 className="text-balance text-5xl font-semibold tracking-tight sm:text-6xl lg:text-7xl font-display">
            Presence sensors for spaces that think.
          </h1>
        </FadeDiv>

        <FadeDiv className="mt-6 text-center">
          <p className="mx-auto max-w-3xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
            Tesla‑like spatial awareness built for Home Assistant: real‑time
            environment visualization, local inference, and an open automation
            OS anyone can use.
          </p>
        </FadeDiv>

        <FadeDiv className="mt-10 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/store">Shop hardware</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="https://docs.optic.works" target="_blank" rel="noreferrer">
              Read the docs
            </Link>
          </Button>
        </FadeDiv>
      </FadeContainer>

      <section className="relative mx-auto max-w-6xl px-6 pb-24 lg:px-8">
        <FadeContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <FadeDiv key={product.id}>
              <Link
                href={`/products/${product.id}`}
                className="group block overflow-hidden rounded-lg border border-border bg-card p-5 shadow-elevation-1 transition hover:shadow-elevation-2"
              >
                <div className="relative mb-4 aspect-[4/3] overflow-hidden rounded-md bg-muted">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    sizes="(max-width: 1024px) 100vw, 33vw"
                  />
                </div>

                {product.badge && (
                  <Badge variant="secondary" className="mb-2">
                    {product.badge}
                  </Badge>
                )}

                <h2 className="text-lg font-semibold text-foreground transition-colors group-hover:text-primary">
                  {product.name}
                </h2>
                <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">
                  {product.description}
                </p>

                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="font-semibold text-foreground">
                    ${product.price}
                  </span>
                  <span className="text-muted-foreground">View details →</span>
                </div>
              </Link>
            </FadeDiv>
          ))}
        </FadeContainer>
      </section>

      <section className="relative mx-auto max-w-6xl px-6 pb-28 lg:px-8">
        <div className="rounded-xl border border-border bg-card p-8 text-center shadow-elevation-1 sm:p-10">
          <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">
            Build automations that see.
          </h2>
          <p className="mt-3 text-muted-foreground">
            Start with a Presence Sensor Kit, then expand with nodes, mounts, and
            dashboards as your space grows.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/store">Shop now</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/support/contact">Talk to us</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}

