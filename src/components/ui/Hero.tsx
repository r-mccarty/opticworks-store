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
      className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950"
    >
      <div className="absolute inset-x-0 top-10 mx-auto hidden max-w-5xl rounded-full bg-white/5 blur-3xl lg:block" />
      <FadeContainer className="relative z-10 mx-auto grid min-h-screen max-w-6xl items-center gap-12 px-4 py-24 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <FadeDiv>
            <a
              aria-label="Read the latest shipping update"
              href="https://www.optic.works/products/bed-presence-sensor"
              className="inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/5 px-4 py-1 text-sm text-white transition hover:border-white/40"
            >
              <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs uppercase tracking-wide">
                News
              </span>
              <span className="flex items-center gap-2 text-sm">
                Now shipping the Bed Presence Sensor
                <RiArrowRightUpLine className="size-4" />
              </span>
            </a>
          </FadeDiv>
          <FadeDiv>
            <h1 className="mt-8 text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Stop detecting motion. Start understanding presence.
            </h1>
          </FadeDiv>
          <FadeDiv>
            <p className="mt-6 text-lg text-balance text-white/70 sm:text-xl">
              A statistical presence engine with temporal filtering delivers
              rock-solid bed occupancy detection. No more lights turning off
              while you sleep. No more mystery triggers when a cat walks by.
            </p>
          </FadeDiv>
          <FadeDiv className="mt-8 flex flex-wrap gap-4">
            <Button asChild size="lg" className="bg-orange-500 text-white hover:bg-orange-400">
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
              className="bg-white/10 text-white hover:bg-white/20"
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
                <span className="inline-flex size-7 items-center justify-center rounded-full bg-emerald-400/20 text-emerald-300">
                  <RiCheckLine className="size-4" />
                </span>
                <p className="text-base">{point}</p>
              </div>
            ))}
          </FadeDiv>
        </div>
        <FadeDiv className="relative">
          <div
            className={cx(
              "relative overflow-hidden rounded-[32px] border border-white/10 bg-white/5 p-6 text-white",
              "shadow-[0_25px_100px_rgba(15,23,42,0.6)] backdrop-blur"
            )}
          >
            <div className="flex items-center justify-between text-sm uppercase tracking-[0.3em] text-white/60">
              <span>Home Assistant</span>
              <span>Presence Engine</span>
            </div>
            <div className="mt-6 space-y-5">
              {DEBUG_STATES.map((state) => (
                <div key={state.label} className="rounded-2xl border border-white/15 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-white/50">
                    {state.label}
                  </p>
                  <p className={cx("mt-2 font-mono text-2xl", state.accent)}>
                    {state.value}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-xl border border-white/15 bg-black/40 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-white/40">
                State Machine Log
              </p>
              <pre className="mt-2 text-sm leading-relaxed text-emerald-200">
                {`03:14:01  z_still = 9.8  →  DEBOUNCING_ON
03:14:04  timer met      →  PRESENT
03:18:29  z_still = 3.7  + abs_clear_delay running`}
              </pre>
            </div>
          </div>
        </FadeDiv>
      </FadeContainer>
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.2),_transparent_55%)]" />
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_center,_rgba(251,191,36,0.08),_transparent_60%)]" />
    </section>
  )
}
