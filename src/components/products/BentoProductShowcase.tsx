'use client'

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import Link from "next/link"
import {
  RiRadarLine,
  RiCpuLine,
  RiShieldCheckLine,
  RiSparklingLine,
  RiArrowRightLine,
  RiTerminalBoxLine,
  RiWifiLine,
} from "@remixicon/react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/hooks/useCart"
import { products, type Product } from "@/lib/products"

// Animated SVG Background Component
function RadarWavesSVG() {
  return (
    <svg
      className="absolute inset-0 h-full w-full opacity-30"
      viewBox="0 0 400 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <motion.circle
        cx="200"
        cy="200"
        r="60"
        stroke="url(#gradient1)"
        strokeWidth="1"
        fill="none"
        initial={{ r: 60, opacity: 0.8 }}
        animate={{ r: 180, opacity: 0 }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeOut" }}
      />
      <motion.circle
        cx="200"
        cy="200"
        r="60"
        stroke="url(#gradient1)"
        strokeWidth="1"
        fill="none"
        initial={{ r: 60, opacity: 0.8 }}
        animate={{ r: 180, opacity: 0 }}
        transition={{ duration: 3, repeat: Infinity, delay: 1, ease: "easeOut" }}
      />
      <motion.circle
        cx="200"
        cy="200"
        r="60"
        stroke="url(#gradient1)"
        strokeWidth="1"
        fill="none"
        initial={{ r: 60, opacity: 0.8 }}
        animate={{ r: 180, opacity: 0 }}
        transition={{ duration: 3, repeat: Infinity, delay: 2, ease: "easeOut" }}
      />
      <defs>
        <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.4" />
        </linearGradient>
      </defs>
    </svg>
  )
}

// Circuit Pattern SVG
function CircuitPatternSVG() {
  return (
    <svg
      className="absolute inset-0 h-full w-full opacity-20"
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <motion.path
        d="M20 20 L80 20 L80 80 M120 20 L180 20 L180 80 M20 120 L80 120 L80 180 M120 120 L180 120 L180 180"
        stroke="currentColor"
        strokeWidth="0.5"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
      />
      <circle cx="20" cy="20" r="2" fill="currentColor" className="text-blue-400" />
      <circle cx="80" cy="80" r="2" fill="currentColor" className="text-purple-400" />
      <circle cx="180" cy="180" r="2" fill="currentColor" className="text-cyan-400" />
    </svg>
  )
}

// Hero Product Card
function HeroProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart()
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="group relative col-span-2 row-span-2 overflow-hidden rounded-[48px] border border-white/10 bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-slate-950/95 p-10 shadow-[0_30px_120px_rgba(0,0,0,0.5)] backdrop-blur-xl md:p-12"
    >
      {/* Animated Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(59,130,246,0.15),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(139,92,246,0.12),transparent_60%)]" />

      {/* SVG Background */}
      <div className="absolute right-0 top-0 h-96 w-96 text-blue-400">
        <RadarWavesSVG />
      </div>

      <div className="relative z-10 flex h-full flex-col">
        {/* Badge and Category */}
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            {product.badge && (
              <Badge className="bg-orange-500/90 px-4 py-1.5 text-sm font-semibold text-white backdrop-blur-sm">
                {product.badge}
              </Badge>
            )}
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">
              {product.category}
            </p>
          </div>
          {product.reviews && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
              transition={{ delay: 0.2 }}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-sm"
            >
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-white">★{product.reviews.rating}</span>
                <span className="text-sm text-white/60">({product.reviews.count})</span>
              </div>
            </motion.div>
          )}
        </div>

        {/* Product Name */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="mt-8 text-4xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl"
        >
          {product.name}
        </motion.h2>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mt-6 max-w-2xl text-lg leading-relaxed text-white/70 md:text-xl"
        >
          {product.description}
        </motion.p>

        {/* Key Benefits Grid */}
        {product.keyBenefits && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-8 grid gap-4 sm:grid-cols-2"
          >
            {product.keyBenefits.slice(0, 2).map((benefit) => (
              <div
                key={benefit.title}
                className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm transition duration-300 hover:bg-white/10"
              >
                <p className="text-sm font-semibold text-white">{benefit.title}</p>
                <p className="mt-1 text-xs text-white/60">{benefit.description}</p>
              </div>
            ))}
          </motion.div>
        )}

        {/* Price and CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-auto flex flex-wrap items-center gap-6 pt-8"
        >
          <div>
            <div className="flex items-baseline gap-3">
              <span className="text-5xl font-bold text-white">${product.price}</span>
              {product.originalPrice && (
                <span className="text-2xl text-white/40 line-through">
                  ${product.originalPrice}
                </span>
              )}
            </div>
            <p className="mt-2 text-sm text-white/60">Ships in 3-5 business days</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              size="lg"
              onClick={() => addToCart(product)}
              className="bg-orange-500 px-8 text-white transition hover:bg-orange-400"
            >
              Add to Cart
            </Button>
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="bg-white/10 px-8 text-white backdrop-blur-sm transition hover:bg-white/20"
            >
              <Link href={`/products/${product.id}`}>
                Learn More <RiArrowRightLine className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

// Medium Bento Card
function MediumBentoCard({ product, icon: Icon }: { product: Product; icon: React.ComponentType<{ className?: string }> }) {
  const { addToCart } = useCart()
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="group relative overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-slate-950/90 p-8 shadow-[0_20px_80px_rgba(0,0,0,0.4)] backdrop-blur-xl transition duration-500 hover:-translate-y-1 hover:shadow-[0_30px_100px_rgba(0,0,0,0.5)]"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.1),transparent_60%)]" />
      <div className="absolute right-0 top-0 h-64 w-64 text-blue-400/30">
        <CircuitPatternSVG />
      </div>

      <div className="relative z-10 flex h-full flex-col">
        {product.badge && (
          <Badge className="mb-4 w-fit bg-purple-500/80 px-3 py-1 text-xs font-semibold text-white">
            {product.badge}
          </Badge>
        )}

        <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/30">
          <Icon className="size-7" />
        </div>

        <h3 className="text-2xl font-bold text-white">{product.name}</h3>
        <p className="mt-3 text-sm leading-relaxed text-white/70">{product.description}</p>

        <div className="mt-6 flex items-baseline gap-2">
          <span className="text-3xl font-bold text-white">${product.price}</span>
          {product.originalPrice && (
            <span className="text-lg text-white/40 line-through">${product.originalPrice}</span>
          )}
        </div>

        <div className="mt-auto flex gap-2 pt-6">
          <Button
            onClick={() => addToCart(product)}
            className="flex-1 bg-orange-500 text-white transition hover:bg-orange-400"
            disabled={!product.inStock}
          >
            {product.inStock ? "Add to Cart" : "Out of Stock"}
          </Button>
          <Button
            asChild
            variant="secondary"
            className="bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
          >
            <Link href={`/products/${product.id}`}>
              <RiArrowRightLine className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

// Small Bento Card
function SmallBentoCard({ product, icon: Icon }: { product: Product; icon: React.ComponentType<{ className?: string }> }) {
  const { addToCart } = useCart()
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br from-slate-900/85 via-slate-900/75 to-slate-950/85 p-6 shadow-[0_15px_60px_rgba(0,0,0,0.3)] backdrop-blur-xl transition duration-500 hover:-translate-y-1 hover:shadow-[0_20px_80px_rgba(0,0,0,0.4)]"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.08),transparent_70%)]" />

      <div className="relative z-10 flex h-full flex-col">
        <div className="mb-3 flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/20">
          <Icon className="size-6" />
        </div>

        <h3 className="text-lg font-bold text-white">{product.name}</h3>
        <p className="mt-2 text-xs leading-relaxed text-white/60 line-clamp-2">{product.description}</p>

        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-white">${product.price}</span>
        </div>

        <Button
          onClick={() => addToCart(product)}
          size="sm"
          className="mt-auto bg-white/10 text-white backdrop-blur-sm transition hover:bg-white/20"
          disabled={!product.inStock}
        >
          {product.inStock ? "Add to Cart" : "Out of Stock"}
        </Button>
      </div>
    </motion.div>
  )
}

// Main Bento Showcase Component
export function BentoProductShowcase() {
  const flagship = products.find((p) => p.featured && p.badge === "Flagship")
  const duoPack = products.find((p) => p.id === "presence-sensor-duo-pack")
  const devEdition = products.find((p) => p.id === "presence-developer-edition")
  const dashboard = products.find((p) => p.id === "presence-dashboard-pack")
  const enclosure = products.find((p) => p.id === "presence-enclosure-pack")
  const spare = products.find((p) => p.id === "presence-spare-sensor")
  const lab = products.find((p) => p.id === "presence-lab-support")

  if (!flagship) return null

  return (
    <div className="mx-auto max-w-7xl">
      {/* Bento Grid */}
      <div className="grid auto-rows-fr gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Hero Card - Takes 2x2 space */}
        <HeroProductCard product={flagship} />

        {/* Medium Cards - Take 1x2 or 2x1 space */}
        {duoPack && (
          <div className="col-span-1 row-span-2">
            <MediumBentoCard product={duoPack} icon={RiWifiLine} />
          </div>
        )}

        {devEdition && (
          <div className="col-span-1 row-span-1">
            <MediumBentoCard product={devEdition} icon={RiTerminalBoxLine} />
          </div>
        )}

        {/* Small Cards */}
        {dashboard && (
          <SmallBentoCard product={dashboard} icon={RiCpuLine} />
        )}

        {enclosure && (
          <SmallBentoCard product={enclosure} icon={RiShieldCheckLine} />
        )}

        {spare && (
          <SmallBentoCard product={spare} icon={RiRadarLine} />
        )}

        {lab && (
          <SmallBentoCard product={lab} icon={RiSparklingLine} />
        )}
      </div>
    </div>
  )
}
