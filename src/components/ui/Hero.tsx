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
      className="relative overflow-hidden ascii-surface"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(255,204,112,0.1),transparent_35%),radial-gradient(circle_at_90%_0%,rgba(94,234,212,0.14),transparent_36%),radial-gradient(circle_at_50%_60%,rgba(94,129,255,0.1),transparent_40%)]" />
      <FadeContainer className="relative z-10 mx-auto grid min-h-screen max-w-6xl items-center gap-12 px-4 py-24 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <FadeDiv>
            <a
              aria-label="Read the latest shipping update"
              href="https://www.optic.works/products/bed-presence-sensor"
              className="pill-button inline-flex items-center gap-3 bg-white/5 px-5 py-2 text-xs uppercase tracking-[0.2em] text-white mono-meta"
            >
              <span className="rounded-full bg-white/10 px-2 py-1 text-[11px] font-semibold tracking-[0.25em]">news</span>
              <span className="flex items-center gap-2 text-sm font-semibold tracking-tight">
                Now shipping the Bed Presence Sensor
                <RiArrowRightUpLine className="size-4" />
              </span>
            </a>
          </FadeDiv>
          <FadeDiv>
            <h1 className="mt-8 text-4xl font-black tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl xl:text-7xl">
              Stop detecting motion. Start understanding presence.
            </h1>
          </FadeDiv>
          <FadeDiv>
            <p className="mt-6 text-lg text-balance text-white/70 sm:text-xl leading-relaxed">
              A statistical presence engine with temporal filtering delivers
              rock-solid bed occupancy detection. No more lights turning off
              while you sleep. No more mystery triggers when a cat walks by.
            </p>
          </FadeDiv>
          <FadeDiv className="mt-8 flex flex-wrap gap-4">
            <Button
              asChild
              size="lg"
              className="pill-button bg-orange-500/90 text-white hover:bg-orange-400 font-semibold mono-meta"
            >
              <Link
                href="/store"
                onClick={() => trackButtonClick("Get Yours Today - Hero", "/store")}
              >
                Get Yours Today
              </Link>
            </Button>
            <Button
              asChild
              variant="secondary"
              size="lg"
              className="pill-button bg-white/5 text-white hover:bg-white/15 font-semibold mono-meta"
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
              <div key={point} className="flex items-center gap-3 text-white/80">
                <span className="inline-flex size-8 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-300 glass-panel">
                  <RiCheckLine className="size-4" />
                </span>
                <p className="text-base text-white/80">{point}</p>
              </div>
            ))}
          </FadeDiv>
        </div>
        <FadeDiv className="relative">
          <div
            className={cx(
              "relative overflow-hidden rounded-[32px] glass-panel border-white/10 p-6 text-white",
              "shadow-[0_25px_100px_rgba(0,0,0,0.45)]"
            )}
          >
            <div className="flex items-center justify-between text-sm uppercase tracking-[0.1em] text-white/70 sm:tracking-[0.3em] mono-meta">
              <span className="text-xs sm:text-sm">Home Assistant</span>
              <span className="text-xs sm:text-sm">Presence Engine</span>
            </div>
            <div className="mt-6 space-y-5">
              {DEBUG_STATES.map((state) => (
                <div key={state.label} className="rounded-2xl border border-white/15 bg-white/5 p-4">
                  <p className="break-all text-xs uppercase tracking-[0.1em] text-white/60 sm:break-normal sm:tracking-[0.3em] mono-meta">
                    {state.label}
                  </p>
                  <p className={cx("mt-2 text-2xl mono-meta", state.accent)}>
                    {state.value}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-xl border border-white/15 bg-black/40 p-4">
              <p className="text-xs uppercase tracking-[0.1em] text-white/50 sm:tracking-[0.3em] mono-meta">
                State Machine Log
              </p>
              <pre className="mt-2 text-sm leading-relaxed text-emerald-200 mono-meta">
                {`03:14:01  z_still = 9.8  →  DEBOUNCING_ON
03:14:04  timer met      →  PRESENT
03:18:29  z_still = 3.7  + abs_clear_delay running`}
              </pre>
            </div>
          </div>
        </FadeDiv>
      </FadeContainer>
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.12),_transparent_45%)]" />
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_center,_rgba(251,191,36,0.08),_transparent_60%)]" />
    </section>
  )
}
