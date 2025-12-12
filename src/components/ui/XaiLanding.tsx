"use client"

import {
  RiAiGenerate,
  RiArrowRightUpLine,
  RiBarChart2Line,
  RiCompass3Line,
  RiSparkling2Line,
  RiThunderstormsLine,
} from "@remixicon/react"
import Link from "next/link"

import { FadeContainer, FadeDiv } from "../Fade"
import { Button } from "./button"

const shellPadding = "px-5 sm:px-8 lg:px-12"
const sectionSpacing = "py-14 sm:py-16 lg:py-20"
const columnGap = "gap-8 sm:gap-10 lg:gap-12"
const cardGlass =
  "rounded-3xl border border-white/10 bg-white/5 shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur"
const subheading =
  "text-xs sm:text-sm uppercase tracking-[0.22em] text-white/60"
const contentWidth = "max-w-7xl mx-auto"

const featureSignals = [
  {
    title: "Multi-sensor fusion",
    body: "Blend mmWave, bed sensors, and ambient data into a single Grok-like context engine that stays confident even when the room is noisy.",
    icon: RiSparkling2Line,
  },
  {
    title: "Reasoned automations",
    body: "Temporal filters and likelihood scoring keep lights on when someone is still, and disengage only when presence is truly gone.",
    icon: RiCompass3Line,
  },
  {
    title: "Glass-box telemetry",
    body: "Live presence traces, debounce windows, and raw signal views help you debug without guessing what the model decided.",
    icon: RiBarChart2Line,
  },
]

const pulseStats = [
  { label: "Latency", value: "31 ms", description: "edge inference per pulse" },
  { label: "Confidence", value: "98.4%", description: "bed occupancy accuracy" },
  { label: "Uptime", value: "24/7", description: "home-safe supervision" },
]

const productTiles = [
  {
    badge: "Flagship",
    title: "Bed Presence Sensor",
    copy: "Detect stillness, micro-movements, and bedtime routines with Grok-level patience and reliability.",
    href: "/products/bed-presence-sensor",
  },
  {
    badge: "mmWave",
    title: "Presence Engine",
    copy: "A tuned state machine that speaks fluent Home Assistant with transparent reasoning for every transition.",
    href: "/store",
  },
]

const labNotes = [
  "Debounce windows that adapt to occupant behavior in real time.",
  "Signal traces stay local; cloud is for optional insights only.",
  "Integrates with Automations, Scenes, and voice assistants out of the box.",
]

export function XaiLanding() {
  return (
    <div className="relative overflow-hidden bg-[#05060a] text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(120,119,198,0.18),transparent_25%),radial-gradient(circle_at_80%_10%,rgba(56,189,248,0.18),transparent_22%),radial-gradient(circle_at_50%_80%,rgba(14,165,233,0.12),transparent_28%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0)_20%,rgba(255,255,255,0)_80%,rgba(255,255,255,0.08)_100%)] opacity-30" />
      <div className="relative flex min-h-screen flex-col pb-24 pt-12">
        {/* Hero */}
        <FadeContainer className={`${sectionSpacing} ${shellPadding} ${contentWidth} space-y-10`}>
          <FadeDiv className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-sm text-white/80">
            <span className="flex items-center gap-2 font-semibold tracking-tight text-cyan-300">
              <RiAiGenerate className="size-4" />
              Grok-inspired interface
            </span>
            <span className="h-1 w-1 rounded-full bg-white/40" />
            <span>Presence intelligence for the physical world</span>
          </FadeDiv>
          <FadeDiv>
            <h1 className="text-balance text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              Spatial awareness built like xAI—minimal, confident, and always in view.
            </h1>
          </FadeDiv>
          <FadeDiv>
            <p className="max-w-3xl text-lg leading-relaxed text-white/75 sm:text-xl">
              OpticWorks pairs mmWave sensing with a transparent presence engine so your automations feel intentional.
              Designed with the stark, cinematic aesthetic of x.ai: clear lines, glowing gradients, and interfaces that tell you exactly what happens next.
            </p>
          </FadeDiv>
          <FadeDiv className="flex flex-wrap items-center gap-4">
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-cyan-400 to-indigo-400 text-slate-950 shadow-[0_20px_50px_rgba(45,212,191,0.35)] hover:from-cyan-300 hover:to-indigo-300"
            >
              <Link href="/store">Explore the collection</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-white/30 bg-white/10 text-white hover:border-cyan-300 hover:text-cyan-100"
            >
              <Link href="/support">Talk to the team</Link>
            </Button>
            <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70">
              <span className="inline-flex size-2 animate-pulse rounded-full bg-emerald-400" />
              Live signal previews refreshed every pulse
            </div>
          </FadeDiv>
        </FadeContainer>

        {/* Signal + Stats */}
        <FadeContainer className={`${sectionSpacing} ${shellPadding} ${contentWidth}`}>
          <div className={`grid ${columnGap} lg:grid-cols-[1.1fr_0.9fr]`}>
          <FadeDiv className={`relative overflow-hidden ${cardGlass} p-8`}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(56,189,248,0.2),transparent_35%)]" />
            <div className="relative flex items-center justify-between text-xs uppercase tracking-[0.2em] text-white/50">
              <span>Signal trace</span>
              <span>Presence engine</span>
            </div>
            <div className="relative mt-6 rounded-2xl border border-white/10 bg-black/50 p-6 font-mono text-sm text-cyan-100">
              <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-white/40">
                <span>Pulse</span>
                <span>Reasoning</span>
              </div>
              <div className="mt-4 space-y-3 text-left">
                <p className="text-white/80">t+00.00s • mmWave amplitude ↑</p>
                <p className="text-emerald-300">t+00.12s • stillness lock engaged</p>
                <p className="text-white/80">t+00.47s • debounce window +9.0s</p>
                <p className="text-amber-200">t+09.12s • exit check: occupancy true</p>
                <p className="text-sky-200">t+27.90s • abs_clear_delay running</p>
              </div>
              <div className="mt-6 flex items-center justify-between text-xs text-white/60">
                <span className="inline-flex items-center gap-2">
                  <span className="size-2 rounded-full bg-emerald-400" />
                  Confident
                </span>
                <span className="inline-flex items-center gap-2 text-white/70">
                  <RiArrowRightUpLine className="size-4" />
                  Export to Home Assistant
                </span>
              </div>
            </div>
          </FadeDiv>

          <FadeDiv className="grid content-between gap-6">
            <div className={`${cardGlass} p-6 shadow-[0_20px_60px_rgba(0,0,0,0.4)]`}>
              <p className={subheading}>Precision, not just presence</p>
              <h2 className="mt-3 text-2xl font-semibold text-white">A Grok-like layer between your rooms and your automations</h2>
              <p className="mt-3 text-white/70">
                The interface stays simple: black, sharp gradients, minimal chrome. The engine underneath reconciles noisy input into
                readable state so your routines stay accurate—even when someone barely moves.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {pulseStats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center shadow-[0_20px_50px_rgba(0,0,0,0.35)]"
                >
                  <p className="text-xs uppercase tracking-[0.2em] text-white/50">{stat.label}</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{stat.value}</p>
                  <p className="mt-1 text-sm text-white/60">{stat.description}</p>
                </div>
              ))}
            </div>
          </FadeDiv>
          </div>
        </FadeContainer>

        {/* Features */}
        <FadeContainer className={`${sectionSpacing} ${shellPadding} ${contentWidth}`}>
          <div className={`grid ${columnGap} lg:grid-cols-3`}>
            {featureSignals.map((feature) => (
              <FadeDiv key={feature.title} className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-black/40 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
                <div className="flex items-center gap-3 text-lg font-semibold text-white">
                  <feature.icon className="size-5 text-cyan-300" />
                  {feature.title}
                </div>
                <p className="text-white/70 leading-relaxed">{feature.body}</p>
                <div className="inline-flex items-center gap-2 text-sm text-cyan-200">
                  <span className="size-2 rounded-full bg-cyan-400" />
                  Designed with x.ai minimalism
                </div>
              </FadeDiv>
            ))}
          </div>
        </FadeContainer>

        {/* Catalog + Lab notes */}
        <FadeContainer className={`${sectionSpacing} ${shellPadding} ${contentWidth}`}>
          <div className={`grid ${columnGap} lg:grid-cols-[1.1fr_0.9fr]`}>
          <FadeDiv className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 via-white/0 to-white/5 p-8 shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
            <p className={subheading}>Catalog</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">Hardware that matches the interface</h2>
            <p className="mt-3 text-white/70">
              Every device ships with firmware tuned for the presence engine and a UI that mirrors x.ai—clean edges, bold type, and calm gradients.
              Pair in seconds, see live traces, and push your own automations with confidence.
            </p>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {productTiles.map((product) => (
                <div key={product.title} className="group rounded-2xl border border-white/10 bg-black/40 p-5 transition hover:border-cyan-300/60">
                  <div className="flex items-center justify-between text-sm text-white/60">
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-white/60">
                      {product.badge}
                    </span>
                    <RiArrowRightUpLine className="size-5 text-white/40 transition group-hover:text-cyan-200" />
                  </div>
                  <h3 className="mt-4 text-xl font-semibold text-white">{product.title}</h3>
                  <p className="mt-2 text-sm text-white/70">{product.copy}</p>
                  <Link
                    href={product.href}
                    className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-cyan-200 transition hover:text-cyan-100"
                  >
                    View product
                    <RiArrowRightUpLine className="size-4" />
                  </Link>
                </div>
              ))}
            </div>
          </FadeDiv>

          <FadeDiv className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b0c12] p-8 shadow-[0_30px_80px_rgba(0,0,0,0.5)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(56,189,248,0.2),transparent_40%)]" />
            <p className={`relative ${subheading}`}>Lab notes</p>
            <h3 className="relative mt-3 text-2xl font-semibold text-white">How we keep presence trustworthy</h3>
            <ul className="relative mt-4 space-y-3 text-white/70">
              {labNotes.map((note) => (
                <li key={note} className="flex items-start gap-3">
                  <span className="mt-1 inline-flex size-2 rounded-full bg-indigo-300" />
                  <span>{note}</span>
                </li>
              ))}
            </ul>
            <div className="relative mt-6 rounded-2xl border border-white/10 bg-black/50 p-5 text-sm text-white/70">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/50">
                <RiThunderstormsLine className="size-4 text-cyan-300" />
                Automation preview
              </div>
              <p className="mt-3 font-mono text-cyan-100">
                {"if presence == \"CONFIDENT\": scene \u2192 Night Glow;"} <br />
                {"if presence == \"CLEAR\": climate \u2192 Eco Recovery;"}
              </p>
              <p className="mt-3 text-white/60">Your routines stay terse, readable, and resilient to false clears.</p>
            </div>
          </FadeDiv>
          </div>
        </FadeContainer>

        {/* CTA */}
        <FadeContainer className={`${sectionSpacing} ${shellPadding} ${contentWidth}`}>
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-cyan-500/15 via-indigo-500/10 to-slate-900 p-10 shadow-[0_40px_100px_rgba(0,0,0,0.5)]">
            <FadeDiv className="flex flex-col gap-4 text-center">
              <p className="text-sm uppercase tracking-[0.22em] text-white/60">Ready to automate with confidence</p>
              <h2 className="text-3xl font-semibold text-white sm:text-4xl">Join the presence network built with x.ai precision</h2>
              <p className="text-white/70 leading-relaxed">
                Ship sensors that think like Grok and pair seamlessly with your smart home. Clear UI, visible reasoning, and automations that respect context.
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-4">
                <Button
                  asChild
                  size="lg"
                  className="bg-gradient-to-r from-cyan-300 to-indigo-400 text-slate-950 shadow-[0_20px_60px_rgba(59,130,246,0.35)] hover:from-cyan-200 hover:to-indigo-300"
                >
                  <Link href="/products">Browse products</Link>
                </Button>
                <Button
                  asChild
                  variant="secondary"
                  size="lg"
                  className="border-white/20 bg-white/5 text-white hover:border-cyan-200 hover:text-cyan-50"
                >
                  <Link href="/support">Book a walkthrough</Link>
                </Button>
              </div>
            </FadeDiv>
          </div>
        </FadeContainer>
      </div>
    </div>
  )
}
