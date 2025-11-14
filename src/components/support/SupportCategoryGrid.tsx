"use client"

import { motion, useReducedMotion, useInView } from "framer-motion"
import { useRef } from "react"
import {
  RiToolsLine,
  RiShoppingBag3Line,
  RiRefreshLine,
  RiBankCardLine,
  RiCarLine,
  RiQuestionLine,
  RiFileTextLine,
  RiShieldCheckLine,
  RiCustomerService2Line
} from "@remixicon/react"
import { Button } from "../ui/button"
import Link from "next/link"
import { siteConfig } from "@/app/siteConfig"

// Animated SVG Icon Wrapper
interface AnimatedIconProps {
  icon: React.ComponentType<{ className?: string }>
  color: string
  delay: number
}

function AnimatedIcon({ icon: Icon, color, delay }: AnimatedIconProps) {
  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 15,
        delay
      }}
      className="relative"
    >
      {/* Animated glow background */}
      <motion.div
        className={`absolute inset-0 rounded-2xl ${color.split(' ')[0]} opacity-50 blur-xl`}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Icon container */}
      <motion.div
        className={`relative inline-flex rounded-2xl ${color} p-4`}
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 400 }}
      >
        <Icon className="h-7 w-7" />
      </motion.div>
    </motion.div>
  )
}

// Category Card Component
interface CategoryCardProps {
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  href: string
  color: string
  popular?: boolean
  index: number
}

function CategoryCard({ title, description, icon, href, color, popular, index }: CategoryCardProps) {
  const cardRef = useRef(null)
  const isInView = useInView(cardRef, { once: true, margin: "-100px" })
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: [0.21, 0.47, 0.32, 0.98]
      }}
      className="group relative h-full"
    >
      {/* Popular badge */}
      {popular && (
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: "spring",
            stiffness: 200,
            delay: index * 0.1 + 0.3
          }}
          className="absolute -top-3 -right-3 z-10"
        >
          <div className="relative">
            {/* Pulsing background */}
            <motion.div
              className="absolute inset-0 rounded-full bg-orange-400 blur-md"
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="relative inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 px-3 py-1 text-xs font-semibold text-white shadow-lg">
              <motion.span
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                ⭐
              </motion.span>
              Popular
            </span>
          </div>
        </motion.div>
      )}

      {/* Animated border gradient */}
      <motion.div
        className="absolute -inset-px rounded-3xl bg-gradient-to-br from-gray-300 via-gray-200 to-gray-300 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ filter: "blur(1px)" }}
      />

      {/* Card content */}
      <motion.div
        className="relative h-full rounded-3xl bg-white/90 backdrop-blur-sm p-8 shadow-lg ring-1 ring-gray-900/5 overflow-hidden"
        whileHover={{
          y: prefersReducedMotion ? 0 : -8,
          scale: prefersReducedMotion ? 1 : 1.02
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        {/* Background pattern */}
        <div className="absolute top-0 right-0 w-32 h-32 opacity-[0.03] pointer-events-none">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <pattern id={`pattern-${index}`} x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="10" cy="10" r="1" fill="currentColor" />
            </pattern>
            <rect width="100" height="100" fill={`url(#pattern-${index})`} />
          </svg>
        </div>

        {/* Animated shine effect on hover */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          initial={{ x: "-100%" }}
          whileHover={{ x: "100%" }}
          transition={{ duration: 0.6 }}
        />

        {/* Icon */}
        <div className="relative z-10">
          <AnimatedIcon icon={icon} color={color} delay={index * 0.1 + 0.2} />
        </div>

        {/* Content */}
        <div className="relative z-10 mt-6 flex-1">
          <motion.h3
            className="text-xl font-semibold leading-7 text-gray-900 group-hover:text-orange-600 transition-colors duration-300"
            whileHover={{ x: prefersReducedMotion ? 0 : 4 }}
          >
            {title}
          </motion.h3>
          <p className="mt-3 text-sm leading-6 text-gray-600">
            {description}
          </p>
        </div>

        {/* Action button */}
        <div className="relative z-10 mt-8">
          <Button
            asChild
            className="group/btn w-full bg-gray-900 hover:bg-gradient-to-r hover:from-orange-600 hover:to-orange-500 transition-all duration-300 shadow-md hover:shadow-xl"
          >
            <Link href={href} className="flex items-center justify-center gap-2">
              <span>Get Help</span>
              <motion.span
                className="inline-block"
                initial={{ x: 0 }}
                whileHover={{ x: 4 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                →
              </motion.span>
            </Link>
          </Button>
        </div>

        {/* Hover glow effect */}
        <motion.div
          className="absolute inset-0 rounded-3xl bg-gradient-to-br from-orange-500/0 to-orange-600/0 opacity-0 group-hover:from-orange-500/5 group-hover:to-orange-600/10 group-hover:opacity-100 transition-all duration-500 pointer-events-none"
        />
      </motion.div>
    </motion.div>
  )
}

// Section header component
function SectionHeader() {
  const headerRef = useRef(null)
  const isInView = useInView(headerRef, { once: true, margin: "-50px" })

  return (
    <div ref={headerRef} className="text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.5 }}
      >
        {/* Decorative element */}
        <motion.div
          className="inline-flex items-center justify-center"
          initial={{ scale: 0 }}
          animate={isInView ? { scale: 1 } : { scale: 0 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
        >
          <svg width="60" height="60" viewBox="0 0 60 60" className="text-orange-500">
            <motion.circle
              cx="30"
              cy="30"
              r="25"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="157"
              initial={{ strokeDashoffset: 157 }}
              animate={isInView ? { strokeDashoffset: 0 } : { strokeDashoffset: 157 }}
              transition={{ duration: 1, delay: 0.3 }}
            />
            <motion.path
              d="M30 20 L30 30 L35 35"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={isInView ? { pathLength: 1 } : { pathLength: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            />
          </svg>
        </motion.div>

        <motion.h2
          className="font-barlow mt-6 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          How can we{" "}
          <span className="relative inline-block">
            <span className="relative z-10 bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
              help you
            </span>
            {/* Animated underline */}
            <motion.svg
              className="absolute -bottom-1 left-0 w-full"
              viewBox="0 0 100 6"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={isInView ? { pathLength: 1, opacity: 0.4 } : { pathLength: 0, opacity: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <motion.path
                d="M0 3 Q 25 1, 50 3 T 100 3"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-orange-500"
              />
            </motion.svg>
          </span>{" "}
          today?
        </motion.h2>

        <motion.p
          className="font-colfax mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          Choose a category below to get the expert support you need
        </motion.p>
      </motion.div>
    </div>
  )
}

const supportCategories = [
  {
    title: "Installation Help & Guides",
    description: "Step-by-step instructions, troubleshooting tips, and calibration guides for your presence sensors",
    icon: RiToolsLine,
    href: siteConfig.baseLinks.installGuides,
    color: "bg-blue-50 text-blue-600",
    popular: true
  },
  {
    title: "Order & Shipping Questions",
    description: "Track your order, get shipping updates, and find answers to delivery questions",
    icon: RiShoppingBag3Line,
    href: siteConfig.baseLinks.supportOrders,
    color: "bg-green-50 text-green-600"
  },
  {
    title: "Returns & Warranty Claims",
    description: "Process returns, submit warranty claims, and get help with product defects",
    icon: RiRefreshLine,
    href: siteConfig.baseLinks.supportWarranty,
    color: "bg-orange-50 text-orange-600"
  },
  {
    title: "Oops Protection",
    description: "Damaged sensor during installation? Get a replacement for just the shipping cost",
    icon: RiShieldCheckLine,
    href: siteConfig.baseLinks.supportOops,
    color: "bg-emerald-50 text-emerald-600",
    popular: true
  },
  {
    title: "Payment & Billing Support",
    description: "Resolve payment issues, manage billing questions, and process refund requests",
    icon: RiBankCardLine,
    href: siteConfig.baseLinks.supportBilling,
    color: "bg-purple-50 text-purple-600"
  },
  {
    title: "Product Compatibility",
    description: "Check if our sensors work with your bed type, smart home system, or adjustable base",
    icon: RiCarLine,
    href: siteConfig.baseLinks.supportCompatibility,
    color: "bg-indigo-50 text-indigo-600"
  },
  {
    title: "Frequently Asked Questions",
    description: "Quick answers to the most common questions about our presence sensors",
    icon: RiQuestionLine,
    href: siteConfig.baseLinks.supportFaq,
    color: "bg-yellow-50 text-yellow-600",
    popular: true
  },
  {
    title: "Legal & Compliance",
    description: "Privacy policy, terms of service, sensor compliance, and regulatory information",
    icon: RiFileTextLine,
    href: "/support/legal",
    color: "bg-gray-50 text-gray-600"
  }
]

export function SupportCategoryGrid() {
  return (
    <section id="tools-section" className="relative py-24 bg-gradient-to-b from-white via-gray-50/50 to-white overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 -left-32 w-64 h-64 bg-orange-200/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-1/4 -right-32 w-64 h-64 bg-blue-200/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{
            duration: 8,
            delay: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader />

        {/* Category Grid */}
        <div className="mx-auto mt-20 grid max-w-2xl grid-cols-1 gap-8 sm:mt-24 lg:mx-0 lg:max-w-none lg:grid-cols-2 xl:grid-cols-3 xl:gap-10">
          {supportCategories.map((category, index) => (
            <CategoryCard
              key={category.title}
              {...category}
              index={index}
            />
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-24 text-center"
        >
          <div className="inline-flex flex-col items-center gap-6 rounded-3xl bg-gradient-to-br from-orange-50 to-orange-100/50 p-12 shadow-xl ring-1 ring-orange-200/50">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <RiCustomerService2Line className="h-12 w-12 text-orange-600" />
            </motion.div>
            <div>
              <h3 className="font-barlow text-2xl font-bold text-gray-900">
                Still need help?
              </h3>
              <p className="font-colfax mt-2 text-gray-600">
                Our support team is here 24/7 to help you with any questions
              </p>
            </div>
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-600 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Link href={siteConfig.baseLinks.supportContact} className="flex items-center gap-2">
                Contact Support Team
                <motion.span
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  →
                </motion.span>
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
