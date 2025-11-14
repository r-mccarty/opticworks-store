'use client'

import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"
import Link from "next/link"
import {
  RiArrowRightLine,
  RiShoppingBag3Line,
} from "@remixicon/react"

import { FadeContainer, FadeDiv } from "@/components/Fade"
import { Button } from "@/components/ui/button"
import { BentoProductShowcase } from "@/components/products/BentoProductShowcase"
import { ProductComparisonGrid } from "@/components/products/ProductComparisonGrid"
import { AnimatedSpecsSection } from "@/components/products/AnimatedSpecsSection"

// Animated Hero Background SVG
function HeroBackgroundSVG() {
  return (
    <svg
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 1000 1000"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <motion.circle
        cx="200"
        cy="200"
        r="300"
        fill="url(#heroGradient1)"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.2 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      />
      <motion.circle
        cx="800"
        cy="800"
        r="350"
        fill="url(#heroGradient2)"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.15 }}
        transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }}
      />
      <defs>
        <radialGradient id="heroGradient1">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <radialGradient id="heroGradient2">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>
    </svg>
  )
}

export default function ProductsPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  })

  const y = useTransform(scrollYProgress, [0, 1], [0, -150])
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.8, 0.3])

  return (
    <main
      ref={containerRef}
      className="relative min-h-screen overflow-x-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white"
    >
      {/* Animated Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <HeroBackgroundSVG />
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.18),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(149,114,252,0.12),transparent_55%)]" />

      {/* Hero Section */}
      <motion.section
        style={{ y, opacity }}
        className="relative px-6 pb-24 pt-32 sm:px-8 lg:px-12"
      >
        <FadeContainer className="mx-auto max-w-7xl">
          {/* Eyebrow */}
          <FadeDiv className="flex justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/5 px-5 py-2 backdrop-blur-sm"
            >
              <span className="rounded-full bg-orange-500/80 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
                New
              </span>
              <span className="text-sm text-white/80">
                Complete Presence Lab Catalog
              </span>
              <RiArrowRightLine className="h-4 w-4 text-white/60" />
            </motion.div>
          </FadeDiv>

          {/* Main Headline */}
          <FadeDiv className="mt-8 text-center">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl xl:text-8xl"
            >
              <span className="inline-block bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent">
                Presence sensors.
              </span>
              <br />
              <span className="inline-block bg-gradient-to-r from-orange-400 via-pink-500 to-purple-500 bg-clip-text text-transparent">
                Perfected.
              </span>
            </motion.h1>
          </FadeDiv>

          {/* Subheading */}
          <FadeDiv className="mt-8 text-center">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mx-auto max-w-3xl text-xl leading-relaxed text-white/70 sm:text-2xl"
            >
              Hardware, software, and kits for rock-solid bed occupancy detection. Local processing, privacy by design, fully tunable from Home Assistant.
            </motion.p>
          </FadeDiv>

          {/* CTA Buttons */}
          <FadeDiv className="mt-12 flex flex-wrap items-center justify-center gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Button
                asChild
                size="lg"
                className="bg-orange-500 px-8 py-6 text-lg font-semibold text-white shadow-lg shadow-orange-500/30 transition hover:bg-orange-400 hover:shadow-xl hover:shadow-orange-500/40"
              >
                <Link href="/store">
                  <RiShoppingBag3Line className="mr-2 h-5 w-5" />
                  Browse Catalog
                </Link>
              </Button>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Button
                asChild
                size="lg"
                variant="secondary"
                className="bg-white/10 px-8 py-6 text-lg font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
              >
                <Link href="#comparison">
                  Compare Products <RiArrowRightLine className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </motion.div>
          </FadeDiv>

          {/* Stats Bar */}
          <FadeDiv className="mt-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="mx-auto grid max-w-5xl gap-8 rounded-[32px] border border-white/10 bg-white/5 p-8 backdrop-blur-xl sm:grid-cols-3"
            >
              {[
                { label: "Products", value: "7+", detail: "Complete lineup" },
                { label: "Detection Range", value: "3.2m", detail: "Focused bed cone" },
                { label: "Reliability", value: "99.7%", detail: "Uptime average" },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                  className="text-center"
                >
                  <p className="text-4xl font-bold text-white sm:text-5xl">{stat.value}</p>
                  <p className="mt-2 text-sm font-semibold uppercase tracking-[0.2em] text-white/60">
                    {stat.label}
                  </p>
                  <p className="mt-1 text-xs text-white/40">{stat.detail}</p>
                </motion.div>
              ))}
            </motion.div>
          </FadeDiv>
        </FadeContainer>
      </motion.section>

      {/* Bento Product Showcase */}
      <section className="relative px-6 py-24 sm:px-8 lg:px-12">
        <BentoProductShowcase />
      </section>

      {/* Animated Specs Section */}
      <AnimatedSpecsSection />

      {/* Product Comparison */}
      <div id="comparison" className="scroll-mt-20 px-6 sm:px-8 lg:px-12">
        <ProductComparisonGrid />
      </div>

      {/* Final CTA Section */}
      <section className="relative px-6 py-32 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Ready to experience perfect presence?
            </h2>
            <p className="mt-6 text-xl text-white/70">
              Join hundreds of smart home enthusiasts who&apos;ve eliminated false automations forever.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Button
                asChild
                size="lg"
                className="bg-orange-500 px-10 py-6 text-lg font-semibold text-white shadow-lg shadow-orange-500/30 transition hover:bg-orange-400"
              >
                <Link href="/store">
                  Shop Now
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="secondary"
                className="bg-white/10 px-10 py-6 text-lg font-semibold text-white backdrop-blur-sm hover:bg-white/20"
              >
                <Link href="/support">
                  Contact Sales
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  )
}
