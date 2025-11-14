"use client"

import { FormEvent, useState } from "react"
import {
  RiArrowRightUpLine,
  RiChatSmile3Line,
  RiCustomerService2Line,
  RiInformationLine,
  RiRadarLine,
  RiSearchLine
} from "@remixicon/react"
import { motion } from "motion/react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { siteConfig } from "@/app/siteConfig"

import { Button } from "../ui/button"
import { Input } from "../ui/input"

const responseSignals = [
  {
    label: "Concierge crew online",
    value: "12 specialists",
    detail: "Calibration, billing, and clinic-grade support",
  },
  {
    label: "Average resolve time",
    value: "38 min",
    detail: "Measured across the last 500 tickets",
  },
  {
    label: "Live system status",
    value: "All services green",
    detail: "Presence cloud, firmware sync, logistics",
  },
]

const quickLinks = [
  {
    href: siteConfig.baseLinks.supportContact,
    label: "Concierge desk",
    icon: RiChatSmile3Line,
  },
  {
    href: siteConfig.baseLinks.supportFaq,
    label: "Instant answers",
    icon: RiInformationLine,
  },
]

export function SupportHero() {
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const query = searchQuery.trim()
    if (query.length === 0) {
      return
    }

    const nextUrl = `/support/faq?search=${encodeURIComponent(query)}`
    router.push(nextUrl)
  }

  return (
    <section
      aria-labelledby="support-hero-title"
      className="relative overflow-hidden bg-[#05060a] pb-28 pt-28 text-white"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[-20%] h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-[#617cff]/30 blur-3xl" />
        <div className="absolute right-[-10%] top-1/2 h-[28rem] w-[28rem] -translate-y-1/2 rounded-full bg-[#15b1ff]/20 blur-[140px]" />
      </div>

      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-1/4 -z-10 h-[40rem] w-full"
        viewBox="0 0 1440 960"
        fill="none"
      >
        <defs>
          <radialGradient id="support-gradient" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(720 320) rotate(90) scale(320 720)">
            <stop stopColor="#3b82f6" stopOpacity="0.5" />
            <stop offset="0.45" stopColor="#1e293b" stopOpacity="0.2" />
            <stop offset="1" stopColor="#05060a" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="support-grid" x1="0" x2="0" y1="0" y2="1">
            <stop stopColor="rgba(148, 163, 184, 0.22)" />
            <stop offset="1" stopColor="rgba(148, 163, 184, 0.02)" />
          </linearGradient>
          <pattern id="support-lines" width="72" height="72" patternUnits="userSpaceOnUse">
            <path d="M72 0H0V72" stroke="url(#support-grid)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="1440" height="960" fill="url(#support-gradient)" />
        <rect width="1440" height="960" fill="url(#support-lines)" opacity="0.65" />
      </svg>

      <div className="relative mx-auto grid max-w-6xl grid-cols-1 gap-16 px-6 sm:px-10 lg:grid-cols-[minmax(0,1fr)_minmax(340px,420px)]">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-1 text-xs uppercase tracking-[0.3em] text-white/70">
            <RiRadarLine aria-hidden="true" className="h-4 w-4" />
            Concierge Presence Support
          </span>

          <h1
            id="support-hero-title"
            className="mt-10 font-barlow text-5xl font-semibold tracking-tight text-white sm:text-6xl"
          >
            Every signal of your home, backed by a human expert
          </h1>
          <p className="font-colfax mt-6 max-w-2xl text-lg leading-relaxed text-slate-300">
            OpticWorks specialists monitor diagnostics across your sensors, logistics, and billing so you never debug alone. Tell us what you need—the concierge orchestrates the right playbook in seconds.
          </p>

          <motion.form
            onSubmit={handleSearch}
            className="mt-10 max-w-xl rounded-2xl border border-white/10 bg-white/5 p-2 backdrop-blur-lg"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <RiSearchLine aria-hidden="true" className="h-5 w-5 text-white/50" />
                </div>
                <Input
                  aria-label="Search support knowledge base"
                  className="h-12 w-full border-none bg-transparent pl-12 font-medium text-white placeholder:text-white/40 focus-visible:ring-0 focus-visible:outline-none"
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search troubleshooting, installations, or billing"
                  type="search"
                  value={searchQuery}
                />
              </div>
              <Button
                type="submit"
                className="group h-12 shrink-0 rounded-xl bg-white px-5 font-semibold text-slate-900 transition hover:bg-slate-200"
              >
                Search support
                <RiArrowRightUpLine aria-hidden="true" className="ml-2 h-5 w-5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Button>
            </div>
          </motion.form>

          <div className="mt-12 flex flex-wrap gap-4">
            {quickLinks.map((item) => (
              <Button
                key={item.href}
                asChild
                variant="ghost"
                className="group h-11 rounded-full border border-white/10 bg-white/5 px-5 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/10"
              >
                <Link href={item.href}>
                  <span className="flex items-center gap-2">
                    <item.icon aria-hidden="true" className="h-5 w-5" />
                    {item.label}
                    <RiArrowRightUpLine aria-hidden="true" className="h-4 w-4 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
                  </span>
                </Link>
              </Button>
            ))}
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-3">
            {responseSignals.map((signal) => (
              <motion.div
                key={signal.label}
                className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl"
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4 }}
              >
                <p className="text-xs uppercase tracking-[0.24em] text-white/50">{signal.label}</p>
                <p className="mt-4 font-barlow text-2xl font-semibold text-white">{signal.value}</p>
                <p className="mt-2 text-sm text-slate-300">{signal.detail}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.aside
          aria-label="Support concierge live digest"
          className="relative rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 to-white/[0.02] p-8 shadow-2xl backdrop-blur-2xl"
          initial={{ opacity: 0, scale: 0.95, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center justify-between text-xs uppercase tracking-[0.32em] text-white/50">
            <span>Live concierge</span>
            <span>Updated just now</span>
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-6 text-sm text-slate-200">
            <p className="font-semibold text-white">Firmware sync scheduled</p>
            <p className="mt-2 text-xs leading-relaxed text-slate-300">
              Presence Core 2.5.1 rolling out tonight at 11:00 PM local. Expect 4-minute downtime—automations will buffer and replay automatically.
            </p>
          </div>

          <div className="mt-6 space-y-4 text-sm">
            <motion.div
              className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35, duration: 0.4 }}
            >
              <RiCustomerService2Line aria-hidden="true" className="mt-0.5 h-5 w-5 text-white" />
              <div>
                <p className="font-semibold text-white">Clinic escalation lane</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-300">
                  Dedicated liaisons for integrators and sleep labs with HIPAA-grade workflows.
                </p>
              </div>
            </motion.div>

            <motion.div
              className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.45, duration: 0.4 }}
            >
              <RiInformationLine aria-hidden="true" className="mt-0.5 h-5 w-5 text-white" />
              <div>
                <p className="font-semibold text-white">Proactive knowledge drops</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-300">
                  We push insights before issues flare up—guided calibrations, device health nudges, and automation recipes.
                </p>
              </div>
            </motion.div>
          </div>

          <motion.div
            className="mt-10 flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.02] p-5"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.4 }}
          >
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-white/50">Always-on line</p>
              <p className="mt-2 font-barlow text-xl font-semibold text-white">Text +1 (855) 555-2211</p>
            </div>
            <Button
              asChild
              size="sm"
              variant="ghost"
              className="group h-10 rounded-full border border-white/10 bg-white/10 px-4 text-xs font-semibold uppercase tracking-widest text-white transition hover:border-white/30 hover:bg-white/20"
            >
              <Link href={siteConfig.baseLinks.supportContact}>
                Message now
                <RiArrowRightUpLine aria-hidden="true" className="ml-2 h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            </Button>
          </motion.div>
        </motion.aside>
      </div>
    </section>
  )
}
