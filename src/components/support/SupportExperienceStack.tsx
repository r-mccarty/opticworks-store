"use client"

import {
  RiArrowRightUpLine,
  RiChatVoiceLine,
  RiLiveLine,
  RiStackshareLine
} from "@remixicon/react"
import { motion } from "motion/react"
import Link from "next/link"

import { siteConfig } from "@/app/siteConfig"

const experienceTimeline = [
  {
    title: "Signal received",
    description: "You ping us from the dashboard, text line, or automation alert. We instantly ingest device telemetry.",
    time: "0 min",
  },
  {
    title: "Concierge triage",
    description: "A specialist reviews sensor health, compares historical baselines, and drafts an action plan.",
    time: "3 min",
  },
  {
    title: "Resolution shipped",
    description: "We deliver firmware steps, schedule an integrator, or push replacement hardware before downtime hits.",
    time: "< 30 min",
  },
] as const

const liveStatuses = [
  {
    label: "Presence Core",
    state: "Operational",
    detail: "Latency 28ms • Firmware 2.5.0",
  },
  {
    label: "Logistics",
    state: "On schedule",
    detail: "13 kits out for delivery today",
  },
  {
    label: "Billing",
    state: "Clear",
    detail: "No outstanding approvals",
  },
] as const

export function SupportExperienceStack() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#05070d] via-[#04050b] to-[#020308] py-28 text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[5%] top-[25%] h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute right-[12%] bottom-[15%] h-72 w-72 rounded-full bg-sky-500/20 blur-[160px]" />
      </div>
      <div className="relative mx-auto max-w-6xl grid gap-16 px-6 sm:px-10 lg:grid-cols-[minmax(0,1fr)_420px]">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs uppercase tracking-[0.28em] text-white/60">
            <RiStackshareLine aria-hidden="true" className="h-4 w-4" />
            How the concierge resolves issues
          </span>
          <h2 className="mt-8 font-barlow text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Precision operations for every ticket
          </h2>
          <p className="font-colfax mt-6 text-lg leading-relaxed text-slate-300">
            When you open a case, our support OS choreographs experts, logistics, and firmware so every environment returns to calm quickly.
          </p>

          <div className="mt-12 space-y-8">
            {experienceTimeline.map((stage, index) => (
              <motion.div
                key={stage.title}
                className="relative flex gap-6 rounded-3xl border border-white/10 bg-white/[0.03] p-6"
                initial={{ opacity: 0, x: -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 font-barlow text-base font-semibold text-white">
                  {stage.time}
                </div>
                <div>
                  <h3 className="font-barlow text-xl font-semibold text-white">{stage.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-300">{stage.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          className="relative flex h-fit flex-col gap-6 rounded-3xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl"
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.45, delay: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.32em] text-white/60">Live status board</p>
              <p className="mt-2 font-barlow text-2xl font-semibold text-white">All systems calibrated</p>
            </div>
            <RiLiveLine aria-hidden="true" className="h-6 w-6 text-white/80" />
          </div>

          <div className="space-y-4">
            {liveStatuses.map((status, index) => (
              <motion.div
                key={status.label}
                className="rounded-2xl border border-white/10 bg-black/30 p-4"
                initial={{ opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.45, delay: 0.12 * index }}
              >
                <div className="flex items-center justify-between text-sm text-white">
                  <span className="font-semibold">{status.label}</span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[0.65rem] uppercase tracking-[0.28em] text-white/70">
                    {status.state}
                  </span>
                </div>
                <p className="mt-2 text-xs uppercase tracking-[0.3em] text-white/50">{status.detail}</p>
              </motion.div>
            ))}
          </div>

          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-6 text-sm text-slate-200">
            <p className="font-semibold text-white">Need to escalate instantly?</p>
            <p className="mt-2 text-xs leading-relaxed text-slate-300">
              Tap the concierge line for live voice support. We loop in engineering or logistics in under five minutes.
            </p>
            <Link
              className="group mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-white transition hover:border-white/30 hover:bg-white/20"
              href={siteConfig.baseLinks.supportContact}
            >
              <RiChatVoiceLine aria-hidden="true" className="h-4 w-4" />
              Call concierge
              <RiArrowRightUpLine aria-hidden="true" className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
