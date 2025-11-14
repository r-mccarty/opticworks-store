"use client"

import {
  RiPulseLine,
  RiShieldStarLine,
  RiTimeLine
} from "@remixicon/react"
import { motion } from "motion/react"

const highlights = [
  {
    icon: RiPulseLine,
    title: "Human + telemetry",
    description: "We blend motion analytics with concierge insight to pre-empt issues before you notice them.",
    stat: "92% of tickets solved without escalation",
  },
  {
    icon: RiTimeLine,
    title: "Follow-the-sun coverage",
    description: "Specialists in North America, Europe, and APAC keep the desk live every minute of the day.",
    stat: "Real humans respond under 15 minutes",
  },
  {
    icon: RiShieldStarLine,
    title: "Privacy-first by design",
    description: "No audio or video capture—just mmWave data with audited, on-device encryption pipelines.",
    stat: "Compliance-ready for clinics & premium homes",
  },
] as const

export function SupportHighlights() {
  return (
    <section className="relative border-y border-white/10 bg-[#05070d] py-24 text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
      </div>
      <div className="relative mx-auto max-w-6xl px-6 sm:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-barlow text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Built for mission-critical bedrooms and boutique hotels alike
          </h2>
          <p className="font-colfax mt-6 text-lg leading-relaxed text-slate-300">
            Our concierge team pairs premium industrial design with empathy, ensuring presence intelligence simply works—no matter the scale.
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {highlights.map((highlight, index) => (
            <motion.article
              key={highlight.title}
              className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-xl"
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
            >
              <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
              <div className="relative z-10 flex h-full flex-col">
                <span className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-white">
                  <highlight.icon aria-hidden="true" className="h-6 w-6" />
                </span>
                <h3 className="font-barlow text-2xl font-semibold text-white">{highlight.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-300">{highlight.description}</p>
                <p className="mt-6 text-xs uppercase tracking-[0.3em] text-white/60">{highlight.stat}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
