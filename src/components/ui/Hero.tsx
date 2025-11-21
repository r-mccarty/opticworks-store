'use client'

import {
  RiArrowRightUpLine,
  RiCheckLine,
  RiGithubFill,
  RiSparkling2Line
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

const SIGNAL_PROMISES = [
  "Engineered calm—no chatter, no ghost clears.",
  "Tune thresholds live like you would prompt Grok.",
  "Transparent telemetry for every transition."
]

const DEBUG_STATES = [
  { label: "binary_sensor.bed_occupied", value: "ON", accent: "text-emerald-300" },
  { label: "presence_engine.state", value: "PRESENT → DEBOUNCING_OFF", accent: "text-amber-200" },
  { label: "abs_clear_delay_remaining", value: "23.7 s", accent: "text-sky-200" }
]

const SIGNAL_METRICS = [
  { label: "Signal-to-noise", value: "18.4 dB", hint: "Gated and denoised" },
  { label: "False clears", value: "0.02%", hint: "30d moving window" },
  { label: "Edge compute", value: "100%", hint: "No cloud tether" }
]

export function Hero() {
  return (
    <section aria-label="hero" className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(124,151,255,0.16),transparent_45%),radial-gradient(circle_at_80%_10%,rgba(18,220,195,0.16),transparent_45%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(0deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:120px_120px] opacity-25" />
      <FadeContainer className="relative z-10 mx-auto grid min-h-[80vh] max-w-6xl items-center gap-12 px-4 py-24 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-7">
          <FadeDiv>
            <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.35em] text-white/70">
              <RiSparkling2Line className="size-4 text-emerald-300" />
              <span className="text-white">xAI-inspired presence engine</span>
            </div>
          </FadeDiv>
          <FadeDiv>
            <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
              Radical clarity for the bed presence signal.
            </h1>
          </FadeDiv>
          <FadeDiv>
            <p className="text-lg text-balance text-white/70 sm:text-xl">
              A cinematic, Grok-inspired interface for a sensor that behaves like code: deterministic, explainable, and designed for the quiet moments when you need automations to disappear into the background.
            </p>
          </FadeDiv>
          <FadeDiv className="flex flex-wrap gap-3">
            <Button asChild size="lg" className="bg-white text-black hover:bg-white/90">
              <Link href="/store" onClick={() => trackButtonClick("Get Yours Today - Hero", "/store")}>
                Get Yours Today
              </Link>
            </Button>
            <Button
              asChild
              variant="secondary"
              size="lg"
              className="border border-white/30 bg-transparent text-white hover:border-white/60 hover:bg-white/5"
            >
              <Link
                href="https://github.com"
                onClick={() => trackButtonClick("View Documentation - Hero", "https://github.com")}
              >
                <RiGithubFill className="size-5" />
                View Documentation
              </Link>
            </Button>
            <Button
              asChild
              variant="secondary"
              size="lg"
              className="border border-white/30 bg-transparent text-white hover:border-white/60 hover:bg-white/5"
            >
              <Link
                href="/products/bed-presence-sensor"
                onClick={() => trackButtonClick("Shipping Update - Hero", "/products/bed-presence-sensor")}
              >
                Shipping update
                <RiArrowRightUpLine className="ml-2 size-4" />
              </Link>
            </Button>
          </FadeDiv>
          <FadeDiv className="space-y-3">
            {SIGNAL_PROMISES.map((point) => (
              <div key={point} className="flex items-center gap-3 text-white/80">
                <span className="inline-flex size-7 items-center justify-center rounded-full bg-white/10 text-emerald-300">
                  <RiCheckLine className="size-4" />
                </span>
                <p className="text-base leading-relaxed">{point}</p>
              </div>
            ))}
          </FadeDiv>
        </div>
        <FadeDiv className="relative">
          <div className="absolute inset-0 -z-10 rounded-[36px] bg-[conic-gradient(from_120deg_at_50%_50%,rgba(140,123,255,0.1),rgba(92,225,230,0.08),rgba(255,255,255,0.04),rgba(140,123,255,0.1))] blur-3xl" />
          <div
            className={cx(
              "relative overflow-hidden rounded-[32px] border border-white/10 bg-white/5 p-6 text-white",
              "shadow-[0_30px_140px_rgba(0,0,0,0.55)] backdrop-blur"
            )}
          >
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.25em] text-white/60">
              <span>Home Assistant</span>
              <span>Presence Engine</span>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {DEBUG_STATES.map((state) => (
                <div
                  key={state.label}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-inner shadow-white/5"
                >
                  <p className="text-xs uppercase tracking-[0.25em] text-white/40">{state.label}</p>
                  <p className={cx("mt-3 font-mono text-2xl", state.accent)}>{state.value}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-2xl border border-white/10 bg-black/50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-white/40">Event log</p>
              <pre className="mt-2 text-sm leading-relaxed text-emerald-200">
                {`03:14:01  z_still = 9.8  →  DEBOUNCING_ON
03:14:04  timer met      →  PRESENT
03:18:29  z_still = 3.7  + abs_clear_delay running`}
              </pre>
            </div>
            <div className="mt-6 grid gap-3 md:grid-cols-3">
              {SIGNAL_METRICS.map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-xl border border-white/10 bg-gradient-to-br from-white/5 via-white/0 to-white/5 p-4"
                >
                  <p className="text-xs uppercase tracking-[0.2em] text-white/50">{metric.label}</p>
                  <p className="mt-2 text-xl font-semibold">{metric.value}</p>
                  <p className="text-xs text-white/50">{metric.hint}</p>
                </div>
              ))}
            </div>
          </div>
        </FadeDiv>
      </FadeContainer>
    </section>
  )
}
