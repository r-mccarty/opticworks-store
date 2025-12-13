"use client"

import Link from "next/link"
import { Home, Cpu } from "lucide-react"

import { FadeContainer, FadeDiv } from "../Fade"
import { Button } from "./button"
import { SpatialDemo } from "./SpatialDemo"

// Track button clicks
function trackButtonClick(buttonName: string, href: string) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "click", {
      event_category: "button",
      event_label: buttonName,
      value: href,
    })
  }
}

export function Hero() {
  return (
    <section
      aria-label="hero"
      className="relative overflow-hidden bg-neutral-950"
    >
      {/* Amber gradient background effects */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(245,158,11,0.15),_transparent_50%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(245,158,11,0.1),_transparent_50%)]" />

      <FadeContainer className="relative z-10 mx-auto grid min-h-[90vh] max-w-7xl items-center gap-12 px-6 py-24 lg:grid-cols-2 lg:px-8">
        {/* Left content */}
        <div className="space-y-8">
          {/* Badge */}
          <FadeDiv>
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-4 py-1.5 text-sm font-medium text-amber-500">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
              </span>
              Now shipping beta units
            </span>
          </FadeDiv>

          {/* Main headline */}
          <FadeDiv>
            <h1 className="font-display text-5xl font-medium tracking-tight text-neutral-200 sm:text-6xl lg:text-7xl">
              <span className="text-white">The home</span>{" "}
              <span className="text-neutral-500">that watches out</span>{" "}
              <span className="text-white">for you.</span>
            </h1>
          </FadeDiv>

          {/* Subheading */}
          <FadeDiv>
            <p className="max-w-xl text-lg leading-relaxed text-neutral-400 sm:text-xl">
              OpticWorks brings Tesla-like spatial awareness to Home Assistant.
              Presence sensors that{" "}
              <span className="text-neutral-200">visualize your surroundings</span>,{" "}
              <span className="text-neutral-200">infer intent locally</span>, and{" "}
              <span className="text-neutral-200">make automations feel obvious</span>{" "}
              to everyone in the home.
            </p>
          </FadeDiv>

          {/* CTA buttons */}
          <FadeDiv className="flex flex-wrap items-center gap-4">
            <Button
              asChild
              size="lg"
              className="bg-amber-500 text-neutral-950 font-semibold hover:bg-amber-400 transition-all"
            >
              <Link
                href="/store"
                onClick={() => trackButtonClick("Order Development Kit - Hero", "/store")}
              >
                Order Development Kit
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-white/20 text-white hover:bg-white/5 transition-colors"
            >
              <Link
                href="/support"
                onClick={() => trackButtonClick("Read the Whitepaper - Hero", "/support")}
              >
                Read the Whitepaper
              </Link>
            </Button>
          </FadeDiv>

          {/* Status indicators */}
          <FadeDiv className="flex flex-wrap items-center gap-4 pt-4">
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
              <Home className="h-4 w-4 text-green-500" />
              <span className="text-sm text-neutral-300">Works with Home Assistant</span>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
              <Cpu className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-neutral-300">100% Local Inference</span>
            </div>
          </FadeDiv>
        </div>

        {/* Right content - SpatialDemo */}
        <FadeDiv className="relative lg:pl-8">
          {/* Glow backdrop */}
          <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-br from-amber-500/20 via-transparent to-amber-500/10 blur-3xl" />
          <SpatialDemo />
        </FadeDiv>
      </FadeContainer>
    </section>
  )
}
