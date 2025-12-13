import type { Metadata } from "next"
import Link from "next/link"

import { FadeContainer, FadeDiv } from "@/components/Fade"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { siteConfig } from "@/app/siteConfig"
import {
  RiBankCardLine,
  RiBook3Line,
  RiCompassDiscoverLine,
  RiFileTextLine,
  RiShieldCheckLine,
  RiShoppingBag3Line,
  RiToolsLine,
} from "@remixicon/react"

export const metadata: Metadata = {
  title: "Customer Support - OpticWorks Presence",
  description:
    "Get help with installs, calibration, warranty claims, subscriptions, and order tracking.",
  keywords: ["support", "presence sensors", "calibration", "warranty", "OpticWorks"],
}

type SupportCategory = {
  title: string
  description: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const categories: SupportCategory[] = [
  {
    title: "Install guides",
    description:
      "Setup, calibration, and placement playbooks for every zone.",
    href: siteConfig.baseLinks.installGuides,
    icon: RiToolsLine,
  },
  {
    title: "Order tracking",
    description:
      "Track shipments, reschedule deliveries, and view receipts.",
    href: siteConfig.baseLinks.supportOrders,
    icon: RiShoppingBag3Line,
  },
  {
    title: "Warranty",
    description:
      "Claim replacements and check coverage for your hardware.",
    href: siteConfig.baseLinks.supportWarranty,
    icon: RiShieldCheckLine,
  },
  {
    title: "Billing",
    description:
      "Invoices, subscriptions, and refunds in one place.",
    href: siteConfig.baseLinks.supportBilling,
    icon: RiBankCardLine,
  },
  {
    title: "Compatibility",
    description:
      "Check integrations, mounts, and environment fit.",
    href: siteConfig.baseLinks.supportCompatibility,
    icon: RiCompassDiscoverLine,
  },
  {
    title: "FAQ",
    description:
      "Instant answers across presence, installs, and accounts.",
    href: siteConfig.baseLinks.supportFaq,
    icon: RiBook3Line,
  },
  {
    title: "Legal",
    description:
      "Policies, compliance, and privacy documentation.",
    href: siteConfig.baseLinks.supportLegal,
    icon: RiFileTextLine,
  },
]

export default function SupportPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="relative mx-auto max-w-6xl px-6 pt-32 pb-16 lg:px-8">
        <FadeContainer className="space-y-6 text-center">
          <FadeDiv>
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">
              Support
            </p>
          </FadeDiv>
          <FadeDiv>
            <h1 className="text-balance text-5xl font-semibold tracking-tight sm:text-6xl font-display">
              Presence Lab concierge
            </h1>
          </FadeDiv>
          <FadeDiv>
            <p className="mx-auto max-w-3xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
              We’ll help you place, tune, and automate your sensors so your home
              understands intent — not noise.
            </p>
          </FadeDiv>
          <FadeDiv className="flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link href={siteConfig.baseLinks.supportContact}>
                Contact support
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href={siteConfig.baseLinks.supportFaq}>Browse FAQ</Link>
            </Button>
          </FadeDiv>
        </FadeContainer>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24 lg:px-8">
        <FadeContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <FadeDiv key={category.title}>
              <Link
                href={category.href}
                className="group block h-full"
              >
                <Card className="h-full transition hover:shadow-elevation-2">
                  <CardContent className="p-6">
                    <category.icon className="h-6 w-6 text-muted-foreground group-hover:text-primary" />
                    <h2 className="mt-4 text-lg font-semibold text-foreground">
                      {category.title}
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {category.description}
                    </p>
                    <p className="mt-4 text-sm text-muted-foreground">
                      Open →
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </FadeDiv>
          ))}
        </FadeContainer>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-28 lg:px-8">
        <div className="rounded-xl border border-border bg-card p-8 text-center shadow-elevation-1 sm:p-10">
          <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">
            Still stuck?
          </h2>
          <p className="mt-3 text-muted-foreground">
            Send us logs or a screenshot of your presence trace and we’ll guide
            you to a stable configuration.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link href={siteConfig.baseLinks.supportContact}>
                Start a ticket
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href={siteConfig.baseLinks.installGuides}>
                View install guides
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}

