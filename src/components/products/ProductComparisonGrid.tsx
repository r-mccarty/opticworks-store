'use client'

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import {
  RiCheckLine,
  RiCloseLine,
  RiStarFill,
} from "@remixicon/react"

import { cx } from "@/lib/utils"

const COMPARISON_DATA = [
  {
    feature: "Stillness Detection",
    basic: false,
    competitor: "Limited",
    ours: true,
    highlight: true,
  },
  {
    feature: "Z-Score Analysis",
    basic: false,
    competitor: false,
    ours: true,
    highlight: true,
  },
  {
    feature: "4-State Engine",
    basic: false,
    competitor: false,
    ours: true,
    highlight: true,
  },
  {
    feature: "Absolute Clear Delay",
    basic: false,
    competitor: false,
    ours: true,
    highlight: false,
  },
  {
    feature: "Home Assistant Native",
    basic: "Manual",
    competitor: "Cloud",
    ours: true,
    highlight: false,
  },
  {
    feature: "Privacy (No Cloud)",
    basic: true,
    competitor: false,
    ours: true,
    highlight: false,
  },
  {
    feature: "Live Tuning Dashboard",
    basic: false,
    competitor: false,
    ours: true,
    highlight: true,
  },
  {
    feature: "Multi-Body Detection",
    basic: false,
    competitor: "Paid",
    ours: true,
    highlight: false,
  },
]

export function ProductComparisonGrid() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section
      ref={ref}
      className="relative mx-auto max-w-6xl py-24"
    >
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.6 }}
        className="mb-16 text-center"
      >
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-orange-500">
          The Difference
        </p>
        <h2 className="mt-4 text-4xl font-bold tracking-tight text-white md:text-5xl">
          Why OpticWorks Stands Apart
        </h2>
        <p className="mt-6 text-lg text-white/70">
          Not all presence sensors are created equal. See how we compare.
        </p>
      </motion.div>

      {/* Comparison Table */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="relative overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-slate-900/80 via-slate-900/70 to-slate-950/80 backdrop-blur-xl"
      >
        {/* Scroll indicator gradient for mobile */}
        <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-8 bg-gradient-to-l from-slate-900/90 to-transparent sm:hidden" />

        {/* Scroll container for mobile */}
        <div className="overflow-x-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
          {/* Table Header */}
          <div className="grid min-w-full grid-cols-4 gap-4 border-b border-white/10 bg-white/5 p-4 sm:min-w-[640px] sm:p-6">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50 sm:text-sm">
              Feature
            </div>
            <div className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-white/50 sm:text-sm">
              Basic PIR
            </div>
            <div className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-white/50 sm:text-sm">
              Competitors
            </div>
            <div className="relative text-center">
              <div className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-orange-500 to-pink-600 px-2 py-1 text-xs font-bold uppercase tracking-[0.15em] text-white sm:gap-2 sm:px-4 sm:py-1.5 sm:text-sm sm:tracking-[0.2em]">
                <RiStarFill className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">OpticWorks</span>
                <span className="sm:hidden">Ours</span>
              </div>
            </div>
          </div>

          {/* Table Rows */}
          {COMPARISON_DATA.map((row, index) => (
            <motion.div
              key={row.feature}
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
              transition={{ duration: 0.4, delay: 0.3 + index * 0.05 }}
              className={cx(
                "grid min-w-full grid-cols-4 gap-4 border-b border-white/5 p-4 transition duration-300 hover:bg-white/5 sm:min-w-[640px] sm:p-6",
                row.highlight && "bg-gradient-to-r from-orange-500/5 to-transparent"
              )}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-white sm:text-base">{row.feature}</span>
                {row.highlight && (
                  <span className="rounded-full bg-orange-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-orange-300 sm:px-2 sm:text-xs">
                    Key
                  </span>
                )}
              </div>
              <div className="flex items-center justify-center">
                {typeof row.basic === "boolean" ? (
                  row.basic ? (
                    <div className="flex size-6 items-center justify-center rounded-full bg-white/10 sm:size-8">
                      <RiCheckLine className="h-4 w-4 text-white/60 sm:h-5 sm:w-5" />
                    </div>
                  ) : (
                    <div className="flex size-6 items-center justify-center rounded-full bg-white/5 sm:size-8">
                      <RiCloseLine className="h-4 w-4 text-white/30 sm:h-5 sm:w-5" />
                    </div>
                  )
                ) : (
                  <span className="text-xs text-white/50 sm:text-sm">{row.basic}</span>
                )}
              </div>
              <div className="flex items-center justify-center">
                {typeof row.competitor === "boolean" ? (
                  row.competitor ? (
                    <div className="flex size-6 items-center justify-center rounded-full bg-white/10 sm:size-8">
                      <RiCheckLine className="h-4 w-4 text-white/60 sm:h-5 sm:w-5" />
                    </div>
                  ) : (
                    <div className="flex size-6 items-center justify-center rounded-full bg-white/5 sm:size-8">
                      <RiCloseLine className="h-4 w-4 text-white/30 sm:h-5 sm:w-5" />
                    </div>
                  )
                ) : (
                  <span className="text-xs text-white/50 sm:text-sm">{row.competitor}</span>
                )}
              </div>
              <div className="flex items-center justify-center">
                {typeof row.ours === "boolean" ? (
                  row.ours ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={isInView ? { scale: 1 } : { scale: 0 }}
                      transition={{ duration: 0.3, delay: 0.4 + index * 0.05 }}
                      className="flex size-6 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-pink-600 shadow-lg shadow-orange-500/30 sm:size-8"
                    >
                      <RiCheckLine className="h-4 w-4 text-white sm:h-5 sm:w-5" />
                    </motion.div>
                  ) : (
                    <div className="flex size-6 items-center justify-center rounded-full bg-white/5 sm:size-8">
                      <RiCloseLine className="h-4 w-4 text-white/30 sm:h-5 sm:w-5" />
                    </div>
                  )
                ) : (
                  <span className="text-xs font-medium text-white sm:text-sm">{row.ours}</span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Bottom CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="mt-8 space-y-2 text-center"
      >
        <p className="text-xs text-white/40 sm:hidden">
          👉 Swipe to see all features
        </p>
        <p className="text-xs text-white/60 sm:text-sm">
          Every feature backed by our 2-year warranty and Oops Protection guarantee
        </p>
      </motion.div>
    </section>
  )
}
