'use client'

import {
  RiArrowRightUpLine,
  RiCheckLine,
  RiGithubFill,
} from "@remixicon/react"
import Link from "next/link"

import { cx } from "@/lib/utils"

import { FadeContainer, FadeDiv } from "../Fade"
import { Button } from "./button"

// Track button clicks
function trackButtonClick(buttonName: string, href: string) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "click", {
      event_category: "button",
      event_label: buttonName,
      value: href
    })
    console.log(`GA4: Button click tracked - ${buttonName}`)
  }
}

const PAIN_POINTS = [
  "Lights stay on while you’re still in bed.",
  "Pets and fans stop triggering false automations.",
  "You can tune every parameter live in Home Assistant.",
]

const DEBUG_STATES = [
  { label: "binary_sensor.bed_occupied", value: "ON", accent: "text-emerald-400" },
  { label: "text_sensor.presence_state_reason", value: "DEBOUNCING_OFF • 02.1s", accent: "text-amber-300" },
  { label: "sensor.abs_clear_delay_remaining", value: "27.9s", accent: "text-sky-300" },
]

export function Hero() {
  return (
    <section
      aria-label="hero"
      className="relative overflow-hidden bg-void ascii-grid"
    >
      {/* Optical Glows - replacing solid gradients */}
      <div className="absolute inset-x-0 top-20 mx-auto hidden max-w-5xl rounded-full glow-amber-lg opacity-20 lg:block h-96" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,_rgba(255,153,0,0.15),_transparent_50%)]" />

      <FadeContainer className="relative z-10 mx-auto grid min-h-screen max-w-6xl items-center gap-12 px-4 py-24 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <FadeDiv>
            <a
              aria-label="Read the latest shipping update"
              href="https://www.optic.works/products/bed-presence-sensor"
              className="inline-flex items-center gap-3 rounded-pill glass-card px-4 py-1 text-sm text-white transition hover:bg-white/10 glow-white"
            >
              <span className="rounded-pill bg-amber-500/20 px-2 py-0.5 text-eyebrow text-amber-400 border border-amber-500/30">
                News
              </span>
              <span className="flex items-center gap-2 text-sm font-mono">
                {'// '}Now shipping the Bed Presence Sensor
                <RiArrowRightUpLine className="size-4" />
              </span>
            </a>
          </FadeDiv>
          <FadeDiv>
            <h1 className="mt-8 text-headline-massive text-5xl sm:text-6xl lg:text-7xl text-white">
              Stop detecting motion. Start understanding presence.
            </h1>
          </FadeDiv>
          <FadeDiv>
            <p className="mt-6 text-lg text-balance text-white/60 sm:text-xl font-light">
              A statistical presence engine with temporal filtering delivers
              rock-solid bed occupancy detection. No more lights turning off
              while you sleep. No more mystery triggers when a cat walks by.
            </p>
          </FadeDiv>
          <FadeDiv className="mt-8 flex flex-wrap gap-4">
            <Button asChild size="lg" variant="default">
              <Link
                href="/store"
                onClick={() => trackButtonClick("Get Yours Today - Hero", "/store")}
              >
                Get Yours Today
              </Link>
            </Button>
            <Button
              asChild
              variant="glass"
              size="lg"
            >
              <Link
                href="https://github.com"
                onClick={() => trackButtonClick("View Documentation - Hero", "https://github.com")}
              >
                <RiGithubFill className="size-5" />
                View Documentation
              </Link>
            </Button>
          </FadeDiv>
          <FadeDiv className="mt-10 space-y-3">
            {PAIN_POINTS.map((point) => (
              <div key={point} className="flex items-center gap-3 text-white/70">
                <span className="inline-flex size-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <RiCheckLine className="size-5" />
                </span>
                <p className="text-base font-light">{point}</p>
              </div>
            ))}
          </FadeDiv>
        </div>
        <FadeDiv className="relative">
          <div
            className={cx(
              "relative overflow-hidden smooth-corners-lg glass-card-light p-6 text-white glow-amber ascii-slash"
            )}
          >
            <div className="flex items-center justify-between text-eyebrow text-white/50">
              <span>[ Home Assistant ]</span>
              <span>[ Presence Engine ]</span>
            </div>
            <div className="mt-6 space-y-5">
              {DEBUG_STATES.map((state) => (
                <div key={state.label} className="smooth-corners-sm glass-card p-4 glow-white">
                  <p className="break-all text-eyebrow text-white/40 sm:break-normal">
                    {state.label}
                  </p>
                  <p className={cx("mt-2 font-mono text-2xl font-bold", state.accent)}>
                    {state.value}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-6 smooth-corners-sm glass-card p-4 bg-void-50/80">
              <p className="text-eyebrow text-white/30">
                [ State Machine Log ]
              </p>
              <pre className="mt-2 text-sm leading-relaxed text-amber-300/80 font-mono">
                {`03:14:01  z_still = 9.8  →  DEBOUNCING_ON
03:14:04  timer met      →  PRESENT
03:18:29  z_still = 3.7  + abs_clear_delay running`}
              </pre>
            </div>
          </div>
        </FadeDiv>
      </FadeContainer>
    </section>
  )
}
