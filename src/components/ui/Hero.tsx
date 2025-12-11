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
      className="relative isolate overflow-hidden"
    >
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_12%_18%,_rgba(255,153,0,0.28),_transparent_40%),_radial-gradient(circle_at_80%_12%,_rgba(255,255,255,0.08),_transparent_45%)] opacity-80 blur-3xl" />
      <div className="absolute inset-0 -z-30 opacity-60">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,153,0,0.12),_transparent_55%)] blur-[140px]" />
        <div className="absolute inset-0 optic-grid" />
      </div>
      <FadeContainer className="relative z-10 mx-auto grid min-h-screen max-w-6xl items-center gap-14 px-4 py-24 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-8">
          <FadeDiv>
            <div className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/5 px-4 py-2 font-jetbrains text-[12px] uppercase tracking-[3px] text-amber-300 backdrop-blur-xl">
              <span className="inline-flex items-center gap-2 text-sm text-white/70">
                {'//'} Soft-Tech Launch Grid
              </span>
              <RiArrowRightUpLine className="size-4 text-white/70" />
            </div>
          </FadeDiv>
          <FadeDiv>
            <h1 className="text-balance text-4xl font-black leading-[1.02] tracking-[-0.03em] text-white sm:text-6xl lg:text-8xl">
              Stop detecting motion. Start understanding presence.
            </h1>
          </FadeDiv>
          <FadeDiv>
            <p className="text-lg text-balance text-zinc-300 sm:text-xl">
              A statistical presence engine with temporal filtering delivers rock-solid bed occupancy detection. No more lights turning off while you sleep. No more mystery triggers when a cat walks by.
            </p>
          </FadeDiv>
          <FadeDiv className="mt-4 flex flex-wrap gap-4">
            <Button
              asChild
              size="lg"
              className="relative overflow-hidden rounded-full border border-amber-400/70 bg-white/10 px-6 py-3 text-lg font-semibold text-white backdrop-blur-xl transition duration-200 hover:-translate-y-0.5 hover:border-amber-300 hover:bg-white/15"
            >
              <Link href="/store" onClick={() => trackButtonClick("Get Yours Today - Hero", "/store")}>
                <span className="mr-2 font-jetbrains text-[12px] uppercase tracking-[2px] text-amber-200">[ get yours ]</span>
                Bed Presence Sensor
              </Link>
            </Button>
            <Button
              asChild
              variant="secondary"
              size="lg"
              className="rounded-full border border-white/20 bg-white/5 px-6 py-3 font-semibold text-white backdrop-blur-xl transition duration-200 hover:-translate-y-0.5 hover:border-white/40 hover:bg-white/10"
            >
              <Link
                href="https://github.com"
                onClick={() => trackButtonClick("View Documentation - Hero", "https://github.com")}
                className="flex items-center gap-2 font-jetbrains text-[13px] uppercase tracking-[2px]"
              >
                <span className="text-amber-200">[ docs ]</span>
                <RiGithubFill className="size-5" />
              </Link>
            </Button>
          </FadeDiv>
          <FadeDiv className="mt-8 space-y-4">
              {PAIN_POINTS.map((point) => (
                <div
                  key={point}
                  className="group flex items-center gap-3 rounded-full border border-white/5 bg-white/5 px-4 py-3 text-white/90 backdrop-blur"
                >
                  <span className="inline-flex size-8 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-300 ring-1 ring-emerald-300/50">
                    <RiCheckLine className="size-4" />
                  </span>
                  <p className="text-base tracking-tight text-zinc-200">{point}</p>
                </div>
            ))}
          </FadeDiv>
        </div>
        <FadeDiv className="relative">
          <div
            className={cx(
              "relative overflow-hidden rounded-[28px] border border-white/10 bg-white/5 p-6 text-white",
              "backdrop-blur-2xl optic-grid optic-glow"
            )}
          >
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_25%_10%,rgba(255,153,0,0.2),transparent_42%),radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.12),transparent_50%)]" />
            <div className="flex items-center justify-between text-xs font-jetbrains uppercase tracking-[3px] text-white/70">
              <span className="text-[11px]">home assistant • live state</span>
              <span className="text-[11px] text-amber-200">optic.engine()</span>
            </div>
            <div className="mt-6 space-y-5">
              {DEBUG_STATES.map((state) => (
                <div
                  key={state.label}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4"
                >
                  <p className="break-all font-jetbrains text-[11px] uppercase tracking-[3px] text-white/50 sm:break-normal">
                    {state.label}
                  </p>
                  <p className={cx("mt-2 font-jetbrains text-2xl", state.accent)}>{state.value}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-xl border border-white/15 bg-black/50 p-4">
              <p className="font-jetbrains text-[11px] uppercase tracking-[3px] text-white/50">
                state machine log
              </p>
              <pre className="mt-3 rounded-lg bg-black/40 p-3 font-jetbrains text-sm leading-relaxed text-emerald-200">
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
