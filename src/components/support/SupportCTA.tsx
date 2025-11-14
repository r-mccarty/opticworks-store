"use client"

import { RiArrowRightUpLine, RiMessage3Line } from "@remixicon/react"
import { motion } from "motion/react"
import Link from "next/link"

import { siteConfig } from "@/app/siteConfig"

export function SupportCTA() {
  return (
    <section className="relative overflow-hidden bg-[#03040a] py-24 text-white">
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          aria-hidden="true"
          className="absolute left-1/2 top-1/2 h-[32rem] w-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-cyan-500/60 via-blue-500/40 to-indigo-500/20 blur-[180px]"
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ repeat: Infinity, duration: 12, ease: "easeInOut" }}
        />
      </div>
      <div className="relative mx-auto max-w-4xl px-6 text-center sm:px-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.45 }}
        >
          <p className="text-xs uppercase tracking-[0.3em] text-white/60">Concierge within reach</p>
          <h2 className="mt-6 font-barlow text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Prefer a human to walk you through it?
          </h2>
          <p className="font-colfax mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-300">
            Start a private session with a specialist, share diagnostics securely, and resolve every question in one conversation.
          </p>
          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-6 font-semibold text-slate-900 transition hover:bg-slate-200"
              href={siteConfig.baseLinks.supportContact}
            >
              <RiMessage3Line aria-hidden="true" className="h-5 w-5" />
              Message the concierge
              <RiArrowRightUpLine aria-hidden="true" className="h-5 w-5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
            <Link
              className="group inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 font-semibold text-white transition hover:border-white/40 hover:bg-white/20"
              href={siteConfig.baseLinks.supportFaq}
            >
              Review the knowledge base
              <RiArrowRightUpLine aria-hidden="true" className="h-5 w-5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
