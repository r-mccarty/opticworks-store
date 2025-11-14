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
        className="overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-slate-900/80 via-slate-900/70 to-slate-950/80 backdrop-blur-xl"
      >
        {/* Table Header */}
        <div className="grid grid-cols-4 gap-4 border-b border-white/10 bg-white/5 p-6">
          <div className="text-sm font-semibold uppercase tracking-[0.2em] text-white/50">
            Feature
          </div>
          <div className="text-center text-sm font-semibold uppercase tracking-[0.2em] text-white/50">
            Basic PIR
          </div>
          <div className="text-center text-sm font-semibold uppercase tracking-[0.2em] text-white/50">
            Competitors
          </div>
          <div className="relative text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-pink-600 px-4 py-1.5 text-sm font-bold uppercase tracking-[0.2em] text-white">
              <RiStarFill className="h-4 w-4" />
              OpticWorks
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
              "grid grid-cols-4 gap-4 border-b border-white/5 p-6 transition duration-300 hover:bg-white/5",
              row.highlight && "bg-gradient-to-r from-orange-500/5 to-transparent"
            )}
          >
            <div className="flex items-center gap-3">
              <span className="font-medium text-white">{row.feature}</span>
              {row.highlight && (
                <span className="rounded-full bg-orange-500/20 px-2 py-0.5 text-xs font-semibold text-orange-300">
                  Key
                </span>
              )}
            </div>
            <div className="flex items-center justify-center">
              {typeof row.basic === "boolean" ? (
                row.basic ? (
                  <div className="flex size-8 items-center justify-center rounded-full bg-white/10">
                    <RiCheckLine className="h-5 w-5 text-white/60" />
                  </div>
                ) : (
                  <div className="flex size-8 items-center justify-center rounded-full bg-white/5">
                    <RiCloseLine className="h-5 w-5 text-white/30" />
                  </div>
                )
              ) : (
                <span className="text-sm text-white/50">{row.basic}</span>
              )}
            </div>
            <div className="flex items-center justify-center">
              {typeof row.competitor === "boolean" ? (
                row.competitor ? (
                  <div className="flex size-8 items-center justify-center rounded-full bg-white/10">
                    <RiCheckLine className="h-5 w-5 text-white/60" />
                  </div>
                ) : (
                  <div className="flex size-8 items-center justify-center rounded-full bg-white/5">
                    <RiCloseLine className="h-5 w-5 text-white/30" />
                  </div>
                )
              ) : (
                <span className="text-sm text-white/50">{row.competitor}</span>
              )}
            </div>
            <div className="flex items-center justify-center">
              {typeof row.ours === "boolean" ? (
                row.ours ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={isInView ? { scale: 1 } : { scale: 0 }}
                    transition={{ duration: 0.3, delay: 0.4 + index * 0.05 }}
                    className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-pink-600 shadow-lg shadow-orange-500/30"
                  >
                    <RiCheckLine className="h-5 w-5 text-white" />
                  </motion.div>
                ) : (
                  <div className="flex size-8 items-center justify-center rounded-full bg-white/5">
                    <RiCloseLine className="h-5 w-5 text-white/30" />
                  </div>
                )
              ) : (
                <span className="text-sm font-medium text-white">{row.ours}</span>
              )}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Bottom CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="mt-8 text-center"
      >
        <p className="text-sm text-white/60">
          Every feature backed by our 2-year warranty and Oops Protection guarantee
        </p>
      </motion.div>
    </section>
  )
}
