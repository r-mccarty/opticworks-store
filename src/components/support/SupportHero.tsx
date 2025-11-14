"use client"

import { useState } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { RiSearchLine, RiSparklingLine, RiCustomerService2Line } from "@remixicon/react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import Link from "next/link"
import { siteConfig } from "@/app/siteConfig"

// Animated SVG Background Grid
function AnimatedGrid() {
  return (
    <svg
      className="absolute inset-0 h-full w-full opacity-[0.15]"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern
          id="grid-pattern"
          width="32"
          height="32"
          patternUnits="userSpaceOnUse"
        >
          <motion.path
            d="M0 32V0M32 0v32"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
            className="text-gray-900"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid-pattern)" />
    </svg>
  )
}

// Floating Orb SVG
function FloatingOrb({ delay = 0, className = "" }: { delay?: number; className?: string }) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.div
      className={`absolute ${className}`}
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: [0.4, 0.6, 0.4],
        scale: [1, 1.1, 1],
        y: prefersReducedMotion ? 0 : [0, -20, 0],
      }}
      transition={{
        duration: 8,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <svg width="400" height="400" viewBox="0 0 400 400" fill="none">
        <motion.circle
          cx="200"
          cy="200"
          r="160"
          fill="url(#gradient1)"
          initial={{ scale: 0.8 }}
          animate={{ scale: [0.8, 1, 0.8] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <defs>
          <radialGradient id="gradient1" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(200 200) rotate(90) scale(160)">
            <stop stopColor="#FF6B35" stopOpacity="0.3" />
            <stop offset="1" stopColor="#F7931E" stopOpacity="0.1" />
          </radialGradient>
        </defs>
      </svg>
    </motion.div>
  )
}

// Search Icon Animation
function AnimatedSearchIcon() {
  return (
    <motion.div
      initial={{ rotate: 0 }}
      whileHover={{ rotate: 15, scale: 1.1 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <RiSearchLine className="h-5 w-5 text-gray-400" />
    </motion.div>
  )
}

// Support Card with animated icon
interface SupportCardProps {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  actionLabel: string
  href?: string
  onClick?: () => void
  responseTime: string
  delay: number
}

function SupportCard({ icon: Icon, title, description, actionLabel, href, onClick, responseTime, delay }: SupportCardProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: prefersReducedMotion ? 0 : -8 }}
      className="group relative"
    >
      <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-gray-200 to-gray-100 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative h-full rounded-2xl bg-white/80 backdrop-blur-xl p-8 shadow-lg ring-1 ring-gray-900/5">
        {/* Animated Icon Container */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: delay + 0.2, type: "spring", stiffness: 200 }}
          className="inline-flex rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 p-4 shadow-lg"
        >
          <motion.div
            whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
            transition={{ duration: 0.5 }}
          >
            <Icon className="h-7 w-7 text-white" />
          </motion.div>
        </motion.div>

        {/* Content */}
        <div className="mt-6">
          <h3 className="text-xl font-semibold leading-7 text-gray-900 group-hover:text-orange-600 transition-colors duration-300">
            {title}
          </h3>
          <p className="mt-3 text-sm leading-6 text-gray-600">
            {description}
          </p>

          {/* Action Button */}
          <div className="mt-6">
            {href ? (
              <Button
                asChild
                className="w-full bg-gray-900 hover:bg-orange-600 transition-all duration-300 shadow-sm group-hover:shadow-lg"
              >
                <Link href={href}>
                  {actionLabel}
                  <motion.span
                    className="ml-2 inline-block"
                    initial={{ x: 0 }}
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    →
                  </motion.span>
                </Link>
              </Button>
            ) : (
              <Button
                onClick={onClick}
                className="w-full bg-gray-900 hover:bg-orange-600 transition-all duration-300 shadow-sm group-hover:shadow-lg"
              >
                {actionLabel}
                <motion.span
                  className="ml-2 inline-block"
                  initial={{ x: 0 }}
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  →
                </motion.span>
              </Button>
            )}
          </div>

          {/* Response Time Badge */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: delay + 0.4 }}
            className="mt-4 flex items-center gap-2"
          >
            <RiSparklingLine className="h-4 w-4 text-orange-500" />
            <span className="text-xs font-medium text-gray-500">
              {responseTime}
            </span>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

export function SupportHero() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const prefersReducedMotion = useReducedMotion()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/support/faq?search=${encodeURIComponent(searchQuery)}`
    }
  }

  const handleScrollToTools = () => {
    const toolsSection = document.getElementById("tools-section")
    if (toolsSection) {
      toolsSection.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-orange-50 pt-32 pb-24">
      {/* Animated Background Elements */}
      <AnimatedGrid />
      <FloatingOrb delay={0} className="top-20 left-10 opacity-30" />
      <FloatingOrb delay={1.5} className="bottom-20 right-10 opacity-20" />

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(249,115,22,0.08),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(251,146,60,0.06),transparent_50%)]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main Hero Content */}
        <div className="text-center">
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-100 to-orange-50 px-4 py-2 text-sm font-medium text-orange-900 shadow-sm ring-1 ring-orange-200"
          >
            <RiSparklingLine className="h-4 w-4" />
            <span>Premium Support Experience</span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-barlow mt-8 text-5xl font-bold tracking-tight text-gray-900 sm:text-7xl lg:text-8xl"
          >
            We&apos;re here to{" "}
            <span className="relative inline-block">
              <motion.span
                className="relative z-10 bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                help
              </motion.span>
              <motion.svg
                className="absolute -bottom-2 left-0 w-full"
                viewBox="0 0 200 12"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.7 }}
                transition={{ delay: 0.8, duration: 0.8, ease: "easeInOut" }}
              >
                <motion.path
                  d="M0 6 Q 50 2, 100 6 T 200 6"
                  fill="none"
                  stroke="url(#underlineGradient)"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="underlineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#ea580c" />
                    <stop offset="100%" stopColor="#f97316" />
                  </linearGradient>
                </defs>
              </motion.svg>
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="font-colfax mx-auto mt-8 max-w-2xl text-xl leading-8 text-gray-600 sm:text-2xl"
          >
            Expert support for your presence sensors—installation guidance,
            warranty claims, calibration help, and everything in between.
          </motion.p>

          {/* Enhanced Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mx-auto mt-12 max-w-2xl"
          >
            <form onSubmit={handleSearch}>
              <motion.div
                animate={{
                  scale: isSearchFocused && !prefersReducedMotion ? 1.02 : 1,
                }}
                transition={{ type: "spring", stiffness: 300 }}
                className="relative group"
              >
                {/* Glow Effect on Focus */}
                <div className={`absolute -inset-1 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 opacity-0 blur-lg transition-opacity duration-500 ${isSearchFocused ? 'opacity-30' : ''}`} />

                <div className="relative flex items-center">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-5">
                    <AnimatedSearchIcon />
                  </div>
                  <Input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    placeholder="Search for help articles, guides, or ask a question..."
                    className="block w-full rounded-2xl border-0 bg-white/90 backdrop-blur-xl py-6 pl-12 pr-32 text-base text-gray-900 shadow-xl ring-1 ring-gray-900/10 placeholder:text-gray-400 focus:ring-2 focus:ring-orange-500 transition-all duration-300"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                    <Button
                      type="submit"
                      className="h-auto rounded-xl bg-gradient-to-r from-orange-600 to-orange-500 px-6 py-3 text-sm font-semibold shadow-lg hover:shadow-xl hover:from-orange-500 hover:to-orange-600 transition-all duration-300"
                    >
                      Search
                    </Button>
                  </div>
                </div>
              </motion.div>
            </form>

            {/* Quick Search Suggestions */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-4 flex flex-wrap items-center justify-center gap-2 text-sm"
            >
              <span className="text-gray-500">Popular:</span>
              {['Installation', 'Calibration', 'Warranty', 'Compatibility'].map((term, i) => (
                <motion.button
                  key={term}
                  onClick={() => setSearchQuery(term)}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="rounded-full bg-white px-4 py-1.5 text-gray-700 shadow-sm ring-1 ring-gray-900/10 hover:bg-orange-50 hover:ring-orange-200 transition-all duration-200"
                >
                  {term}
                </motion.button>
              ))}
            </motion.div>
          </motion.div>

          {/* Support Cards */}
          <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:gap-12 max-w-4xl mx-auto">
            <SupportCard
              icon={RiCustomerService2Line}
              title="Contact Support"
              description="Get personalized help from our expert team via email. We're here to solve any issue."
              actionLabel="Start a conversation"
              href={siteConfig.baseLinks.supportContact}
              responseTime="Response within 2 hours"
              delay={0.4}
            />
            <SupportCard
              icon={RiSparklingLine}
              title="Self-Service Tools"
              description="Track orders, manage billing, check sensor compatibility, and access installation guides."
              actionLabel="Browse tools"
              onClick={handleScrollToTools}
              responseTime="Available 24/7"
              delay={0.5}
            />
          </div>
        </div>
      </div>

      {/* Bottom Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
    </section>
  )
}
