import { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"

import { FadeContainer, FadeDiv } from "@/components/Fade"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { products } from "@/lib/products"

const stats = [
  { value: "<35 ms", label: "Presence latency" },
  { value: "4-state", label: "Confidence engine" },
  { value: "0%", label: "Cloud dependency" },
]

const integrations = [
  "Home Assistant", "Matter", "HomeKit", "MQTT Streams",
]

export const metadata: Metadata = {
  title: "Bed Presence Sensor Lineup",
  description:
    "Explore the OpticWorks Presence Lab catalog—hardware kits, developer editions, and dashboards that make bed occupancy detection reliable.",
}

const flagshipProduct = products.find((product) => product.featured && product.heroIntro)
const supportingProducts = products.filter((product) => product.id !== flagshipProduct?.id)

const groupedProducts = {
  sensors: supportingProducts.filter((product) => product.category === "sensor"),
  bundles: supportingProducts.filter((product) => product.category === "bundle"),
  software: supportingProducts.filter((product) => product.category === "software" || product.category === "accessory"),
}

export default function ProductsPage() {
  const heroProduct = flagshipProduct ?? products[0]

  return (
    <main className="relative overflow-hidden bg-slate-950 text-white">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(56,189,248,0.22),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,rgba(168,85,247,0.18),transparent_62%)]" />
        <div
          aria-hidden
          className="absolute left-1/2 top-1/3 h-96 w-96 rounded-full bg-cyan-500/30 blur-3xl"
          style={{ animation: "var(--animate-aurora, none)", transform: "translate(-50%, 0)" }}
        />
        <svg className="absolute inset-x-0 top-0 h-[32rem] w-full text-white/5" viewBox="0 0 1440 600" fill="none">
          <defs>
            <pattern id="grid" width="72" height="72" patternUnits="userSpaceOnUse">
              <path d="M72 0H0V72" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="1440" height="600" fill="url(#grid)" />
        </svg>
      </div>

      <section className="relative mx-auto max-w-6xl px-6 pb-24 pt-32 sm:px-8">
        <FadeContainer>
          <FadeDiv className="flex items-center gap-3 text-sm text-white/60">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400" aria-hidden />
              Shipping now worldwide
            </span>
            <span className="hidden sm:block">Crafted for bedrooms, clinics, and integrator installs</span>
          </FadeDiv>

          <FadeDiv className="mt-10 max-w-4xl">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
              Presence intelligence designed like a flagship product launch.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/70">
              The OpticWorks Presence lineup pairs premium mmWave hardware with the software stack that keeps your automations responsive—even when sleepers barely move.
            </p>
          </FadeDiv>

          <FadeDiv className="mt-10 flex flex-wrap items-center gap-4 text-white/80">
            <Button asChild size="lg" className="rounded-full bg-white text-slate-900 hover:bg-white/90">
              <Link href={`/products/${heroProduct.id}`} className="inline-flex items-center gap-2">
                Configure your kit
                <svg viewBox="0 0 24 24" aria-hidden className="h-5 w-5">
                  <path d="M5 12h14m0 0-6-6m6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </Button>
            <Button asChild variant="ghost" size="lg" className="rounded-full border border-white/20 bg-white/5 text-white/80 hover:bg-white/10">
              <Link href="/install-guides/bed-presence-sensor" className="inline-flex items-center gap-2">
                Watch calibration walkthrough
                <svg viewBox="0 0 24 24" aria-hidden className="h-5 w-5">
                  <path d="M8 5v14l11-7-11-7z" fill="currentColor" />
                </svg>
              </Link>
            </Button>
          </FadeDiv>

          <FadeDiv className="mt-12 grid gap-6 sm:grid-cols-3">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                <p className="text-2xl font-semibold text-white">{stat.value}</p>
                <p className="mt-2 text-sm uppercase tracking-[0.18em] text-white/50">{stat.label}</p>
              </div>
            ))}
          </FadeDiv>
        </FadeContainer>
      </section>

      <section className="relative mx-auto max-w-6xl px-6 pb-24 sm:px-8">
        <div className="grid gap-6 lg:grid-cols-12">
          <div
            className="group relative col-span-12 overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-8 transition-transform duration-500 hover:-translate-y-1 sm:p-10 lg:col-span-7"
          >
            <div className="flex flex-col gap-8 lg:flex-row">
              <div className="flex-1 space-y-6">
                <div className="flex items-center gap-4">
                  {heroProduct.badge ? (
                    <Badge className="rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs uppercase tracking-[0.24em] text-white/70">
                      {heroProduct.badge}
                    </Badge>
                  ) : null}
                  <span className="text-sm text-white/60">{heroProduct.category.toUpperCase()}</span>
                </div>
                <div>
                  <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                    {heroProduct.heroIntro?.headline ?? heroProduct.name}
                  </h2>
                  <p className="mt-4 max-w-xl text-base text-white/70">
                    {heroProduct.heroIntro?.subheading ?? heroProduct.description}
                  </p>
                </div>
                <dl className="grid gap-4 sm:grid-cols-2">
                  {heroProduct.specifications.slice(0, 4).map((spec) => (
                    <div key={spec.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <dt className="text-xs uppercase tracking-[0.22em] text-white/50">{spec.label}</dt>
                      <dd className="mt-2 text-sm text-white/80">{spec.value}</dd>
                    </div>
                  ))}
                </dl>
                <div className="flex flex-wrap items-center gap-4">
                  <span className="text-3xl font-semibold text-white">${heroProduct.price}</span>
                  {heroProduct.originalPrice ? (
                    <span className="text-sm text-white/50 line-through">${heroProduct.originalPrice}</span>
                  ) : null}
                  {heroProduct.reviews ? (
                    <span className="flex items-center gap-2 text-sm text-white/70">
                      ★{heroProduct.reviews.rating.toFixed(2)}
                      <span className="text-white/50">({heroProduct.reviews.count} reviews)</span>
                    </span>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-4">
                  <Button asChild className="rounded-full bg-slate-900 text-white hover:bg-slate-800">
                    <Link href={`/products/${heroProduct.id}`}>View full specs</Link>
                  </Button>
                  <Button asChild variant="secondary" className="rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20">
                    <Link href={`/store?add=${heroProduct.id}`}>Add to cart instantly</Link>
                  </Button>
                </div>
              </div>

              <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur">
                <div
                  aria-hidden
                  className="absolute -left-16 top-10 h-48 w-48 rounded-full bg-cyan-400/40 blur-3xl"
                  style={{ animation: "var(--animate-glow, none)" }}
                />
                <div className="relative">
                  <Image
                    src={heroProduct.image}
                    alt={heroProduct.name}
                    width={720}
                    height={540}
                    className="w-full rounded-2xl border border-white/10 object-cover"
                    priority
                  />
                </div>
                {heroProduct.keyBenefits ? (
                  <ul className="mt-6 space-y-3 text-sm text-white/75">
                    {heroProduct.keyBenefits.slice(0, 3).map((benefit) => (
                      <li key={benefit.title} className="flex items-start gap-3">
                        <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" aria-hidden />
                        <div>
                          <p className="font-medium text-white">{benefit.title}</p>
                          <p className="text-white/70">{benefit.description}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </div>
          </div>

          <div className="col-span-12 grid gap-6 lg:col-span-5">
            <div
              className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/5 p-8 backdrop-blur transition-transform duration-500 hover:-translate-y-1"
            >
              <div className="absolute -top-24 right-0 h-56 w-56 rounded-full bg-emerald-400/30 blur-3xl" aria-hidden />
              <h3 className="text-2xl font-semibold text-white">Designed for presence-led spaces</h3>
              <p className="mt-4 text-sm text-white/70">
                The CyberShade Presence family coordinates sensors, dashboards, and integrator tools so rooms stay aware without cameras.
              </p>
              <div className="mt-8 flex flex-wrap gap-3 text-sm text-white/70">
                {integrations.map((integration) => (
                  <span key={integration} className="rounded-full border border-white/10 bg-white/10 px-4 py-2">
                    {integration}
                  </span>
                ))}
              </div>
              <Link
                href="/support"
                className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-white hover:text-white/80"
              >
                Integrator resources
                <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4">
                  <path d="M5 12h14m0 0-6-6m6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>

            <div
              className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-white/10 via-white/0 to-transparent p-8 transition-transform duration-500 hover:-translate-y-1"
            >
              <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 400" aria-hidden>
                <defs>
                  <radialGradient id="pulse" cx="50%" cy="50%" r="65%">
                    <stop offset="0%" stopColor="rgba(59,130,246,0.7)" />
                    <stop offset="60%" stopColor="rgba(59,130,246,0.1)" />
                    <stop offset="100%" stopColor="transparent" />
                  </radialGradient>
                </defs>
                <circle cx="200" cy="200" r="180" fill="url(#pulse)" />
              </svg>
              <div className="relative">
                <h3 className="text-2xl font-semibold text-white">Realtime presence pulse</h3>
                <p className="mt-4 text-sm text-white/70">
                  Adaptive thresholds sample still energy and confidence scoring 40 times per second to keep the state stable.
                </p>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {heroProduct.specifications.slice(4, 8).map((spec) => (
                    <div key={spec.label} className="rounded-3xl border border-white/10 bg-white/5 p-4 text-white/75">
                      <p className="text-xs uppercase tracking-[0.22em] text-white/50">{spec.label}</p>
                      <p className="mt-2 text-sm">{spec.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-6xl px-6 pb-32 sm:px-8">
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="col-span-12 flex flex-col gap-6 rounded-[2.5rem] border border-white/10 bg-white/5 p-8 backdrop-blur transition-transform duration-500 hover:-translate-y-1 lg:col-span-4"
          >
            <div>
              <h3 className="text-2xl font-semibold text-white">Sensors</h3>
              <p className="mt-2 text-sm text-white/70">Choose the hardware build that matches your installation style.</p>
            </div>
            <div className="space-y-5">
              {groupedProducts.sensors.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="group flex items-start justify-between gap-4 rounded-3xl border border-transparent bg-white/0 p-4 transition-colors hover:border-white/20 hover:bg-white/5"
                >
                  <div>
                    <p className="text-base font-medium text-white">{product.name}</p>
                    <p className="mt-2 text-sm text-white/60">{product.description}</p>
                  </div>
                  <span className="mt-1 text-sm text-white/70">${product.price}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="col-span-12 flex flex-col gap-6 rounded-[2.5rem] border border-white/10 bg-gradient-to-b from-white/10 via-white/5 to-transparent p-8 transition-transform duration-500 hover:-translate-y-1 lg:col-span-4"
          >
            <div>
              <h3 className="text-2xl font-semibold text-white">Bundles</h3>
              <p className="mt-2 text-sm text-white/70">Pre-calibrated sets with automation blueprints and shipping priority.</p>
            </div>
            <div className="space-y-5">
              {groupedProducts.bundles.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="group flex items-start justify-between gap-4 rounded-3xl border border-transparent bg-white/0 p-4 transition-colors hover:border-white/20 hover:bg-white/5"
                >
                  <div>
                    <p className="text-base font-medium text-white">{product.name}</p>
                    <p className="mt-2 text-sm text-white/60">{product.description}</p>
                  </div>
                  <span className="mt-1 text-sm text-white/70">${product.price}</span>
                </Link>
              ))}
            </div>
            <Link
              href="/store"
              className="inline-flex items-center gap-2 text-sm font-medium text-white hover:text-white/80"
            >
              Build your checkout
              <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4">
                <path d="M5 12h14m0 0-6-6m6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>

          <div className="col-span-12 flex flex-col gap-6 rounded-[2.5rem] border border-white/10 bg-white/5 p-8 backdrop-blur transition-transform duration-500 hover:-translate-y-1 lg:col-span-4"
          >
            <div>
              <h3 className="text-2xl font-semibold text-white">Dashboards & Accessories</h3>
              <p className="mt-2 text-sm text-white/70">Complete the experience with Lovelace dashboards and mounting options.</p>
            </div>
            <div className="space-y-5">
              {groupedProducts.software.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="group flex items-start justify-between gap-4 rounded-3xl border border-transparent bg-white/0 p-4 transition-colors hover:border-white/20 hover:bg-white/5"
                >
                  <div>
                    <p className="text-base font-medium text-white">{product.name}</p>
                    <p className="mt-2 text-sm text-white/60">{product.description}</p>
                  </div>
                  <span className="mt-1 text-sm text-white/70">${product.price}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-6xl px-6 pb-32 sm:px-8">
        <div className="overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-10 sm:p-14">
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <h3 className="text-3xl font-semibold text-white">Perfect presence, from install to automations</h3>
              <p className="mt-4 text-base text-white/70">
                Start with calibrated hardware, continue with the dashboards, and tie everything together with our integrator resources. We designed every touchpoint to feel like a flagship launch—because presence detection deserves it.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Button asChild className="rounded-full bg-white text-slate-900 hover:bg-white/90">
                  <Link href="/store">Start checkout</Link>
                </Button>
                <Button asChild variant="ghost" className="rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20">
                  <Link href="/support">Talk to an integrator</Link>
                </Button>
              </div>
            </div>
            <div className="relative">
              <svg className="absolute -top-20 right-0 h-64 w-64 text-cyan-400/40" viewBox="0 0 200 200" aria-hidden>
                <path
                  d="M100 10c24 0 36 12 48 24s24 24 24 48-12 36-24 48-24 24-48 24-36-12-48-24-24-24-24-48 12-36 24-48 24-24 48-24z"
                  fill="currentColor"
                  opacity="0.35"
                />
              </svg>
              <div className="relative rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-white/70 backdrop-blur">
                <p className="text-lg font-medium text-white">Deployment timeline</p>
                <ul className="mt-6 space-y-4">
                  <li className="flex items-start gap-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" aria-hidden />
                    <div>
                      <p className="font-medium text-white">Unbox & power</p>
                      <p>USB-C power, status LED pulses cyan when ready for pairing.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" aria-hidden />
                    <div>
                      <p className="font-medium text-white">Calibrate</p>
                      <p>Use the guided Home Assistant dashboard to capture the bed baseline in under 120 seconds.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" aria-hidden />
                    <div>
                      <p className="font-medium text-white">Automate</p>
                      <p>Activate the shared automation blueprints for circadian lighting, HVAC, and sleep tracking.</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
