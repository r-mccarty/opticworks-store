"use client"

import {
  RiBankCardLine,
  RiBook3Line,
  RiCompassDiscoverLine,
  RiFlashlightLine,
  RiFileTextLine,
  RiRefreshLine,
  RiShieldCheckLine,
  RiShoppingBag3Line,
  RiToolsLine
} from "@remixicon/react"
import { motion } from "motion/react"
import Link from "next/link"

import { siteConfig } from "@/app/siteConfig"

import { Button } from "../ui/button"

type SupportCategory = {
  title: string
  description: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  signal: string
  accent: string
  emphasis?: string
}

const supportCategories: SupportCategory[] = [
  {
    title: "Installation playbooks",
    description: "Guided calibrations, millimeter-level placement, and quick fixes for every base type.",
    href: siteConfig.baseLinks.installGuides,
    icon: RiToolsLine,
    signal: "Updated this week",
    accent: "from-cyan-500/80 to-blue-500/50",
    emphasis: "Premier",
  },
  {
    title: "Order visibility",
    description: "Track shipments, reschedule deliveries, and orchestrate integrator drop-offs.",
    href: siteConfig.baseLinks.supportOrders,
    icon: RiShoppingBag3Line,
    signal: "Logistics sync in real-time",
    accent: "from-emerald-500/80 to-lime-400/50",
  },
  {
    title: "Warranty & assurance",
    description: "Membrane replacements, sensor swaps, and coverage for the unexpected.",
    href: siteConfig.baseLinks.supportWarranty,
    icon: RiShieldCheckLine,
    signal: "2-hour resolution average",
    accent: "from-amber-500/80 to-orange-400/50",
  },
  {
    title: "Oops protection",
    description: "Redeem no-fuss replacements when installs go sideways—just cover shipping.",
    href: siteConfig.baseLinks.supportOops,
    icon: RiRefreshLine,
    signal: "Unlimited incidents",
    accent: "from-purple-500/70 to-fuchsia-500/40",
    emphasis: "Customer favorite",
  },
  {
    title: "Billing clarity",
    description: "Manage subscriptions, view invoices, or align procurement with finance.",
    href: siteConfig.baseLinks.supportBilling,
    icon: RiBankCardLine,
    signal: "Concierge reconciliation",
    accent: "from-sky-500/70 to-indigo-500/40",
  },
  {
    title: "Compatibility intelligence",
    description: "Validate adjustable bases, split frames, and bespoke mattresses before install.",
    href: siteConfig.baseLinks.supportCompatibility,
    icon: RiCompassDiscoverLine,
    signal: "Powered by bed genome",
    accent: "from-rose-500/70 to-red-500/40",
  },
  {
    title: "Instant answers",
    description: "Fast responses to the most asked questions across presence, billing, and install.",
    href: siteConfig.baseLinks.supportFaq,
    icon: RiBook3Line,
    signal: "Searchable knowledge base",
    accent: "from-teal-500/70 to-green-500/40",
    emphasis: "Trending",
  },
  {
    title: "Legal & compliance",
    description: "HIPAA, CE, GDPR, and occupancy policy documentation at your fingertips.",
    href: "/support/legal",
    icon: RiFileTextLine,
    signal: "Reviewed quarterly",
    accent: "from-slate-500/70 to-slate-700/40",
  },
]

export function SupportCategoryGrid() {
  return (
    <section
      aria-labelledby="support-categories-heading"
      className="relative overflow-hidden bg-[#090b12] py-24 text-white"
      id="tools-section"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[10%] top-[15%] h-64 w-64 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute right-[15%] bottom-[20%] h-72 w-72 rounded-full bg-indigo-500/20 blur-[150px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 sm:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs uppercase tracking-[0.28em] text-white/60">
            Guided concierge tools
          </span>
          <h2
            id="support-categories-heading"
            className="mt-8 font-barlow text-4xl font-semibold tracking-tight text-white sm:text-5xl"
          >
            Everything you need, orchestrated in one surface
          </h2>
          <p className="font-colfax mt-6 text-lg leading-relaxed text-slate-300">
            Launch the exact workflow required—installations, returns, billing, or compliance—and keep every signal synchronized across your home.
          </p>
        </div>

        <div className="mt-20 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {supportCategories.map((category) => (
            <motion.article
              key={category.title}
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-6 transition-transform duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.06]"
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45 }}
            >
              <div className={`pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-gradient-to-br ${category.accent} opacity-70 blur-3xl transition duration-500 group-hover:opacity-100`} />
              <div className="relative z-10 flex h-full flex-col">
                <div className="flex items-center justify-between">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-white">
                    <category.icon className="h-6 w-6" />
                  </span>
                  {category.emphasis ? (
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[0.65rem] uppercase tracking-[0.24em] text-white/70">
                      {category.emphasis}
                    </span>
                  ) : null}
                </div>

                <h3 className="mt-8 font-barlow text-2xl font-semibold text-white">{category.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-300">{category.description}</p>

                <div className="mt-8 flex flex-1 flex-col justify-end gap-4 text-sm text-slate-200">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-white/60">
                    <RiFlashlightLine aria-hidden="true" className="h-4 w-4" />
                    {category.signal}
                  </div>
                  <Button
                    asChild
                    className="group/button h-11 w-full rounded-2xl border border-white/10 bg-white/10 font-semibold text-white transition hover:border-white/30 hover:bg-white/20"
                    variant="ghost"
                  >
                    <Link className="flex items-center justify-between" href={category.href}>
                      <span>Launch workflow</span>
                      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 transition group-hover/button:bg-white group-hover/button:text-slate-900">
                        <svg
                          aria-hidden="true"
                          className="h-4 w-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        >
                          <path d="M7 17L17 7" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M10 7H17V14" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                    </Link>
                  </Button>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
