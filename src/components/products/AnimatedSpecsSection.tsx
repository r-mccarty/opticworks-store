'use client'

import { motion, useInView, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"
import {
  RiCpuLine,
  RiRadarLine,
  RiTimerLine,
  RiShieldCheckLine,
  RiWifiLine,
  RiFlashlightLine,
} from "@remixicon/react"

import { cx } from "@/lib/utils"

const SPECS = [
  {
    icon: RiRadarLine,
    label: "Sensor Suite",
    value: "60GHz mmWave",
    detail: "Still-energy focused FMCW radar",
    color: "from-blue-500 to-cyan-500",
    bgGlow: "rgba(59, 130, 246, 0.15)",
  },
  {
    icon: RiCpuLine,
    label: "Processor",
    value: "ESP32-S3",
    detail: "Wi-Fi 6 + BLE 5.0 ready",
    color: "from-purple-500 to-pink-500",
    bgGlow: "rgba(139, 92, 246, 0.15)",
  },
  {
    icon: RiFlashlightLine,
    label: "Detection Zone",
    value: "Up to 3.2m",
    detail: "Focused bed cone pattern",
    color: "from-orange-500 to-red-500",
    bgGlow: "rgba(249, 115, 22, 0.15)",
  },
  {
    icon: RiTimerLine,
    label: "Clear Delay",
    value: "30s default",
    detail: "Fully tunable in real-time",
    color: "from-emerald-500 to-teal-500",
    bgGlow: "rgba(16, 185, 129, 0.15)",
  },
  {
    icon: RiWifiLine,
    label: "Connectivity",
    value: "USB-C + Wi-Fi",
    detail: "5V power, OTA updates",
    color: "from-sky-500 to-blue-500",
    bgGlow: "rgba(14, 165, 233, 0.15)",
  },
  {
    icon: RiShieldCheckLine,
    label: "Warranty",
    value: "2 Years",
    detail: "Plus Oops Protection",
    color: "from-violet-500 to-purple-500",
    bgGlow: "rgba(124, 58, 237, 0.15)",
  },
]

// Animated Background Grid
function AnimatedGridSVG() {
  return (
    <svg
      className="absolute inset-0 h-full w-full opacity-20"
      viewBox="0 0 800 600"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Vertical lines */}
      {[...Array(9)].map((_, i) => (
        <motion.line
          key={`v-${i}`}
          x1={i * 100}
          y1="0"
          x2={i * 100}
          y2="600"
          stroke="currentColor"
          strokeWidth="0.5"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.3 }}
          transition={{ duration: 1.5, delay: i * 0.1, ease: "easeInOut" }}
        />
      ))}
      {/* Horizontal lines */}
      {[...Array(7)].map((_, i) => (
        <motion.line
          key={`h-${i}`}
          x1="0"
          y1={i * 100}
          x2="800"
          y2={i * 100}
          stroke="currentColor"
          strokeWidth="0.5"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.3 }}
          transition={{ duration: 1.5, delay: i * 0.1 + 0.5, ease: "easeInOut" }}
        />
      ))}
    </svg>
  )
}

export function AnimatedSpecsSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(containerRef, { once: true, margin: "-100px" })

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  })

  const y = useTransform(scrollYProgress, [0, 1], [100, -100])
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0])

  return (
    <section
      ref={containerRef}
      className="relative overflow-hidden py-24"
    >
      {/* Animated Background */}
      <motion.div
        style={{ y, opacity }}
        className="absolute inset-0 text-blue-400/20"
      >
        <AnimatedGridSVG />
      </motion.div>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.08),transparent_70%)]" />

      <div className="relative mx-auto max-w-7xl px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-orange-500">
            Technical Specifications
          </p>
          <h2 className="mt-4 text-4xl font-bold tracking-tight text-white md:text-5xl">
            Precision Engineering
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/70">
            Every component selected for reliability, tuned for performance, and tested for the real world.
          </p>
        </motion.div>

        {/* Specs Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {SPECS.map((spec, index) => {
            const Icon = spec.icon
            return (
              <motion.div
                key={spec.label}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={
                  isInView
                    ? { opacity: 1, y: 0, scale: 1 }
                    : { opacity: 0, y: 30, scale: 0.95 }
                }
                transition={{
                  duration: 0.5,
                  delay: 0.1 + index * 0.1,
                  ease: [0.16, 1, 0.3, 1],
                }}
                whileHover={{ scale: 1.02, y: -4 }}
                className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-slate-950/90 p-8 shadow-[0_20px_80px_rgba(0,0,0,0.4)] backdrop-blur-xl transition duration-500"
              >
                {/* Dynamic background glow */}
                <div
                  className="absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100"
                  style={{
                    background: `radial-gradient(circle at 30% 30%, ${spec.bgGlow}, transparent 70%)`,
                  }}
                />

                <div className="relative z-10">
                  {/* Icon */}
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={
                      isInView
                        ? { scale: 1, rotate: 0 }
                        : { scale: 0, rotate: -180 }
                    }
                    transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                    className={cx(
                      "mb-6 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br shadow-lg transition duration-500 group-hover:scale-110 group-hover:shadow-2xl",
                      spec.color
                    )}
                  >
                    <Icon className="size-7 text-white" />
                  </motion.div>

                  {/* Label */}
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">
                    {spec.label}
                  </p>

                  {/* Value */}
                  <motion.h3
                    initial={{ opacity: 0, x: -20 }}
                    animate={
                      isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }
                    }
                    transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                    className="mt-3 text-3xl font-bold text-white"
                  >
                    {spec.value}
                  </motion.h3>

                  {/* Detail */}
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                    className="mt-2 text-sm text-white/60"
                  >
                    {spec.detail}
                  </motion.p>

                  {/* Decorative line */}
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                    className={cx(
                      "mt-6 h-1 w-full origin-left rounded-full bg-gradient-to-r opacity-50",
                      spec.color
                    )}
                  />
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Bottom Note */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-6 py-3 backdrop-blur-sm">
            <div className="flex size-2 rounded-full bg-emerald-400">
              <motion.div
                className="size-2 rounded-full bg-emerald-400"
                animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            <span className="text-sm font-medium text-white/80">
              All specifications validated through 10,000+ hour reliability testing
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
