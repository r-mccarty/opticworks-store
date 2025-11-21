import { RiCloudOffLine, RiRadarLine, RiToggleLine } from "@remixicon/react"

import { cx } from "@/lib/utils"

const DIFFERENTIATORS = [
  {
    title: "Still energy intelligence",
    description:
      "We focus on still energy reflections so fans, HVAC, and hallway traffic do not register as presence.",
    detail:
      "Sleeping humans act like large stationary mirrors. That deliberate signal choice is why the sensor feels calm.",
    icon: RiRadarLine,
  },
  {
    title: "On-device & private",
    description:
      "Every z-score calculation, debounce decision, and binary flip happens on the ESP32—no cloud tether.",
    detail:
      "Latency disappears, privacy is intact, and your automations keep running if the internet blinks.",
    icon: RiCloudOffLine,
  },
  {
    title: "Hysteresis by design",
    description:
      "Two thresholds (k_on vs k_off) create a deliberate dead zone so the sensor never chatters at the edge.",
    detail:
      "Built-in hysteresis keeps HA dashboards quiet even when signals hover near a boundary.",
    icon: RiToggleLine,
  },
]

export function TechnicalDifferentiators() {
  return (
    <section
      aria-labelledby="technical-differentiators"
      className="relative mx-auto max-w-6xl text-white"
    >
      <div className="mb-12 text-center">
        <p className="text-xs uppercase tracking-[0.35em] text-white/50">Technical differentiators</p>
        <h2
          id="technical-differentiators"
          className="text-3xl font-semibold tracking-tight text-balance md:text-5xl"
        >
          Designed like a model card, built for real bedrooms
        </h2>
        <p className="mt-4 text-lg text-white/70">
          The Bed Presence Sensor attacks the three failure modes that frustrate smart home power users.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {DIFFERENTIATORS.map((difference) => {
          const Icon = difference.icon
          return (
            <article
              key={difference.title}
              className={cx(
                "relative flex h-full flex-col rounded-2xl border border-white/10 bg-white/5 p-6",
                "shadow-[0_20px_90px_rgba(0,0,0,0.35)] backdrop-blur transition hover:-translate-y-1"
              )}
            >
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/0 via-white/5 to-white/0" />
              <div className="relative flex items-center gap-3 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-white">
                <Icon className="size-5" />
                <span className="text-sm font-medium uppercase tracking-[0.25em]">{difference.title}</span>
              </div>
              <p className="mt-6 text-lg font-semibold text-white">{difference.description}</p>
              <p className="mt-3 text-sm text-white/70">{difference.detail}</p>
            </article>
          )
        })}
      </div>
    </section>
  )
}

export default TechnicalDifferentiators
