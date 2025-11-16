import { RiCloudOffLine, RiRadarLine, RiToggleLine } from "@remixicon/react"

import { cx } from "@/lib/utils"

const DIFFERENTIATORS = [
  {
    title: "Still Energy Intelligence",
    description:
      "We focus on still energy reflections so fans, HVAC, and hallway traffic do not register as presence.",
    detail:
      "Sleeping humans act like large stationary mirrors. That deliberate signal choice is why the sensor feels calm.",
    icon: RiRadarLine,
  },
  {
    title: "On-Device & Private",
    description:
      "Every z-score calculation, debounce decision, and binary flip happens on the ESP32—no cloud tether.",
    detail:
      "Latency disappears, privacy is intact, and your automations keep running if the internet blinks.",
    icon: RiCloudOffLine,
  },
  {
    title: "Hysteresis by Design",
    description:
      "Two thresholds (k_on vs k_off) create a deliberate dead zone so the sensor never chatters at the edge.",
    detail:
      "That built-in hysteresis is the secret to keeping HA dashboards quiet even when signals hover near a boundary.",
    icon: RiToggleLine,
  },
]

export function TechnicalDifferentiators() {
  return (
    <section
      aria-labelledby="technical-differentiators"
      className="relative mx-auto max-w-6xl"
    >
      <div className="mb-10 text-center">
        <p className="text-sm uppercase tracking-[0.15em] text-emerald-500 sm:tracking-[0.3em]">
          Technical Differentiators
        </p>
        <h2
          id="technical-differentiators"
          className="text-3xl font-semibold tracking-tight text-gray-900 md:text-5xl"
        >
          Built for real-world bedrooms, not lab demos
        </h2>
        <p className="mt-4 text-lg text-gray-600">
          The Bed Presence Sensor&apos;s architecture attacks the three failure
          modes that frustrate smart home power users.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {DIFFERENTIATORS.map((difference) => {
          const Icon = difference.icon
          return (
            <article
              key={difference.title}
              className={cx(
                "flex h-full flex-col rounded-2xl border border-white/50 bg-white/90 p-6 shadow-xl shadow-sky-950/5 backdrop-blur",
                "ring-1 ring-gray-200 transition hover:-translate-y-1 hover:ring-emerald-400/40"
              )}
            >
              <div className="mb-4 inline-flex items-center gap-3 rounded-full bg-emerald-50 px-4 py-2 text-emerald-600">
                <Icon className="size-5" />
                <span className="text-sm font-medium uppercase tracking-wide">
                  {difference.title}
                </span>
              </div>
              <p className="text-lg font-semibold text-gray-900">
                {difference.description}
              </p>
              <p className="mt-3 text-sm text-gray-600">{difference.detail}</p>
            </article>
          )
        })}
      </div>
    </section>
  )
}

export default TechnicalDifferentiators
