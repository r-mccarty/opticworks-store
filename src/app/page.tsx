import Image from "next/image"
import Link from "next/link"

import { FadeContainer, FadeDiv } from "@/components/Fade"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { products } from "@/lib/products"

const featuredProducts = products.filter((product) => product.featured).slice(0, 3)

export default function Home() {
  return (
    <main className="relative w-full bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,oklch(0.75_0.18_55/0.16),transparent_50%),radial-gradient(circle_at_85%_20%,oklch(0.82_0.19_145/0.12),transparent_55%),radial-gradient(circle_at_50%_90%,oklch(0.7_0.12_240/0.10),transparent_60%)]" />

      {/* Hero */}
      <section className="relative mx-auto max-w-6xl px-6 pt-32 pb-20 lg:px-8">
        <FadeContainer className="grid items-center gap-12 lg:grid-cols-2">
          <div className="space-y-6">
            <FadeDiv>
              <Badge variant="outline" className="bg-card/60">
                Presence Lab
              </Badge>
            </FadeDiv>
            <FadeDiv>
              <h1 className="text-balance text-5xl font-semibold tracking-tight sm:text-6xl lg:text-7xl font-display">
                Your space, rendered in real time.
              </h1>
            </FadeDiv>
            <FadeDiv>
              <p className="max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
                OpticWorks brings Tesla‑like spatial awareness to Home Assistant:
                presence sensors that visualize your surroundings, infer intent
                locally, and make automations feel obvious to everyone in the
                home.
              </p>
            </FadeDiv>
            <FadeDiv className="flex flex-wrap items-center gap-3">
              <Button asChild size="lg">
                <Link href="/products">Explore products</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/store">Shop now</Link>
              </Button>
            </FadeDiv>
          </div>

          <FadeDiv>
            <div className="relative overflow-hidden rounded-xl border border-border bg-card p-6 shadow-elevation-2">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,oklch(0.75_0.18_55/0.18),transparent_50%),radial-gradient(circle_at_100%_100%,oklch(0.82_0.19_145/0.14),transparent_55%)] opacity-60" />
              <pre className="relative font-mono text-xs leading-relaxed text-muted-foreground">
{`[presence] zone: living_room
still_energy: 0.92
motion_energy: 0.07
state: occupied
confidence: 0.98
trace: stable`}
              </pre>
              <div
                className="relative mt-5 h-44 rounded-lg bg-muted/60"
                aria-hidden
              />
              <p className="relative mt-3 text-xs text-muted-foreground">
                Live presence trace preview
              </p>
            </div>
          </FadeDiv>
        </FadeContainer>
      </section>

      {/* What makes it different */}
      <section className="relative mx-auto max-w-6xl px-6 py-16 lg:px-8">
        <FadeContainer className="grid gap-6 md:grid-cols-3">
          {[
            {
              title: "Spatial sensing",
              body: "mmWave + sensor fusion builds a real‑time map of occupied space, not just motion blips.",
            },
            {
              title: "Readable intelligence",
              body: "A transparent presence engine shows you why state changes happen — no guessing, no false toggles.",
            },
            {
              title: "Open automation OS",
              body: "HardwareOS integrations, blueprints, and dashboards designed for Home Assistant and non‑technical users alike.",
            },
          ].map((feature) => (
            <FadeDiv
              key={feature.title}
              className="rounded-lg border border-border bg-card p-6 shadow-elevation-1"
            >
              <h2 className="text-lg font-semibold text-foreground">
                {feature.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {feature.body}
              </p>
            </FadeDiv>
          ))}
        </FadeContainer>
      </section>

      {/* Featured products */}
      <section className="relative mx-auto max-w-6xl px-6 pb-24 lg:px-8">
        <FadeContainer className="space-y-8">
          <FadeDiv className="flex items-end justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">
                Featured hardware
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                Start with a kit. Expand as you go.
              </h2>
            </div>
            <Button asChild variant="outline" className="hidden sm:inline-flex">
              <Link href="/products">See all</Link>
            </Button>
          </FadeDiv>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredProducts.map((product) => (
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
                  <h3 className="text-lg font-semibold text-foreground transition-colors group-hover:text-primary">
                    {product.name}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {product.description}
                  </p>
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="font-semibold text-foreground">
                      ${product.price}
                    </span>
                    <span className="text-muted-foreground">View →</span>
                  </div>
                </Link>
              </FadeDiv>
            ))}
          </div>
        </FadeContainer>
      </section>

      {/* Final CTA */}
      <section className="relative mx-auto max-w-6xl px-6 pb-28 lg:px-8">
        <div className="rounded-xl border border-border bg-card p-8 text-center shadow-elevation-1 sm:p-10">
          <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">
            Ready to build a presence‑aware home?
          </h2>
          <p className="mt-3 text-muted-foreground">
            See what your sensors see, then ship automations with confidence.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/store">Shop Presence Lab</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/support">Talk to the team</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}

