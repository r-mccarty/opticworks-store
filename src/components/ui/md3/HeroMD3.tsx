'use client'

import {
  RiArrowRightLine,
  RiCheckLine,
  RiGithubFill,
  RiShoppingBag3Line,
} from "@remixicon/react"
import Link from "next/link"

import { cx } from "@/lib/utils"

import { Card } from "./Card"
import { FAB } from "./FAB"
import { Surface } from "./Surface"

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
  "Lights stay on while you're still in bed.",
  "Pets and fans stop triggering false automations.",
  "You can tune every parameter live in Home Assistant.",
]

const DEBUG_STATES = [
  { label: "binary_sensor.bed_occupied", value: "ON", color: "text-[var(--color-md-secondary-40)]" },
  { label: "text_sensor.presence_state_reason", value: "DEBOUNCING_OFF • 02.1s", color: "text-[var(--color-md-tertiary-50)]" },
  { label: "sensor.abs_clear_delay_remaining", value: "27.9s", color: "text-[var(--color-md-primary-50)]" },
]

export function HeroMD3() {
  return (
    <section
      aria-label="hero"
      className="relative min-h-screen overflow-hidden bg-[var(--color-md-neutral-99)]"
    >
      {/* Background Pattern - Material Design 3 style */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, var(--color-md-primary-40) 1px, transparent 0)`,
          backgroundSize: '32px 32px'
        }} />
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-md-primary-95)] via-[var(--color-md-neutral-99)] to-[var(--color-md-secondary-95)] opacity-60" />

      <div className="relative z-10 mx-auto grid min-h-screen max-w-7xl items-center gap-16 px-6 py-24 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
        {/* Left Column - Content */}
        <div className="space-y-8">
          {/* Announcement Chip */}
          <Surface
            as="a"
            href="https://www.optic.works/products/bed-presence-sensor"
            aria-label="Read the latest shipping update"
            elevation={0}
            shape="full"
            className="inline-flex items-center gap-3 border border-[var(--color-md-primary-80)] bg-[var(--color-md-primary-95)] px-4 py-2 transition-all duration-300 hover:[box-shadow:var(--shadow-md-elevation-1)]"
          >
            <span className="rounded-full bg-[var(--color-md-primary-40)] px-3 py-1 text-xs font-medium uppercase tracking-wider text-white">
              News
            </span>
            <span className="flex items-center gap-2 text-sm font-medium text-[var(--color-md-primary-20)]">
              Now shipping the Bed Presence Sensor
              <RiArrowRightLine className="size-4" />
            </span>
          </Surface>

          {/* Headline - Display Large */}
          <h1 className="text-[var(--font-size-display-small)] font-bold leading-tight tracking-tight text-[var(--color-md-neutral-10)] lg:text-[var(--font-size-display-medium)]">
            Stop detecting motion.{' '}
            <span className="text-[var(--color-md-primary-40)]">
              Start understanding presence.
            </span>
          </h1>

          {/* Body - Body Large */}
          <p className="max-w-2xl text-[var(--font-size-body-large)] leading-relaxed text-[var(--color-md-neutral-30)]">
            A statistical presence engine with temporal filtering delivers
            rock-solid bed occupancy detection. No more lights turning off
            while you sleep. No more mystery triggers when a cat walks by.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-4">
            <Link
              href="/store"
              onClick={() => trackButtonClick("Get Yours Today - Hero", "/store")}
              className="inline-flex"
            >
              <FAB
                variant="primary"
                size="medium"
                label="Get Yours Today"
                icon={<RiShoppingBag3Line className="size-6" />}
              />
            </Link>

            <Link
              href="https://github.com"
              onClick={() => trackButtonClick("View Documentation - Hero", "https://github.com")}
            >
              <Surface
                as="button"
                elevation={0}
                shape="large"
                className="inline-flex h-14 items-center gap-2 border border-[var(--color-md-primary-80)] bg-[var(--color-md-surface-variant)] px-6 text-[var(--color-md-primary-40)] transition-all duration-300 hover:bg-[var(--color-md-neutral-95)] hover:[box-shadow:var(--shadow-md-elevation-1)]"
              >
                <RiGithubFill className="size-5" />
                <span className="text-[var(--font-size-label-large)] font-medium">
                  Documentation
                </span>
              </Surface>
            </Link>
          </div>

          {/* Feature Checks */}
          <div className="space-y-4 pt-4">
            {PAIN_POINTS.map((point) => (
              <div key={point} className="flex items-start gap-3">
                <Surface
                  elevation={0}
                  shape="full"
                  className="flex size-6 items-center justify-center bg-[var(--color-md-secondary-90)] text-[var(--color-md-secondary-30)]"
                >
                  <RiCheckLine className="size-4" />
                </Surface>
                <p className="flex-1 text-[var(--font-size-body-medium)] text-[var(--color-md-neutral-20)]">
                  {point}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column - Debug Panel Card */}
        <div className="relative">
          <Card
            variant="elevated"
            className="overflow-hidden bg-[var(--color-md-neutral-99)] p-8"
          >
            {/* Header */}
            <div className="mb-6 flex items-center justify-between border-b border-[var(--color-md-neutral-90)] pb-4">
              <span className="text-[var(--font-size-title-small)] font-medium uppercase tracking-wider text-[var(--color-md-neutral-40)]">
                Home Assistant
              </span>
              <span className="text-[var(--font-size-title-small)] font-medium uppercase tracking-wider text-[var(--color-md-neutral-40)]">
                Presence Engine
              </span>
            </div>

            {/* Debug States */}
            <div className="space-y-4">
              {DEBUG_STATES.map((state) => (
                <Card
                  key={state.label}
                  variant="filled"
                  className="bg-[var(--color-md-neutral-95)] p-5"
                >
                  <p className="text-[var(--font-size-label-medium)] font-medium uppercase tracking-wider text-[var(--color-md-neutral-50)]">
                    {state.label}
                  </p>
                  <p className={cx(
                    "mt-2 font-mono text-[var(--font-size-title-large)] font-bold",
                    state.color
                  )}>
                    {state.value}
                  </p>
                </Card>
              ))}
            </div>

            {/* State Machine Log */}
            <Card
              variant="outlined"
              className="mt-6 bg-[var(--color-md-neutral-10)] p-5"
            >
              <p className="text-[var(--font-size-label-small)] font-medium uppercase tracking-wider text-[var(--color-md-neutral-80)]">
                State Machine Log
              </p>
              <pre className="mt-3 text-[var(--font-size-body-small)] leading-relaxed text-[var(--color-md-secondary-70)]">
                {`03:14:01  z_still = 9.8  →  DEBOUNCING_ON
03:14:04  timer met      →  PRESENT
03:18:29  z_still = 3.7  + abs_clear_delay running`}
              </pre>
            </Card>
          </Card>

          {/* Decorative Accent */}
          <div className="absolute -right-8 -top-8 size-32 rounded-full bg-[var(--color-md-primary-90)] opacity-40 blur-3xl" />
          <div className="absolute -bottom-8 -left-8 size-32 rounded-full bg-[var(--color-md-secondary-90)] opacity-40 blur-3xl" />
        </div>
      </div>
    </section>
  )
}
