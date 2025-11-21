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
        <p className="font-jetbrains text-xs uppercase tracking-[3px] text-amber-300">Technical differentiators</p>
        <h2
          id="technical-differentiators"
          className="text-4xl font-black tracking-[-0.03em] text-white md:text-6xl"
        >
          Built for real-world bedrooms, not lab demos
        </h2>
        <p className="mt-4 text-lg text-zinc-300">
          The Bed Presence Sensor&apos;s architecture attacks the three failure modes that frustrate smart home power users.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {DIFFERENTIATORS.map((difference) => {
          const Icon = difference.icon
          return (
            <article
              key={difference.title}
              className={cx(
                "flex h-full flex-col rounded-2xl border border-white/10 bg-white/5 p-6 text-white backdrop-blur-2xl optic-glow",
                "transition hover:-translate-y-1 hover:border-amber-400/40"
              )}
            >
              <div className="mb-4 inline-flex items-center gap-3 rounded-full border border-amber-300/40 bg-amber-500/10 px-4 py-2 text-amber-200 ring-1 ring-amber-300/30">
                <Icon className="size-5" />
                <span className="text-sm font-medium uppercase tracking-[2px]">
                  {difference.title}
                </span>
              </div>
              <p className="text-lg font-semibold leading-snug text-white">
                {difference.description}
              </p>
              <p className="mt-3 text-sm text-zinc-300">{difference.detail}</p>
            </article>
          )
        })}
      </div>
    </section>
  )
}

export default TechnicalDifferentiators
