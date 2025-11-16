import {
  RiDashboard2Line,
  RiRadarLine,
  RiRepeatLine,
  RiStackLine,
} from "@remixicon/react"

import { cx } from "@/lib/utils"

const HOW_IT_WORKS_STEPS = [
  {
    title: "The 4-State Presence Engine",
    description:
      "A deliberate finite state machine validates every transition before it ever flips the presence bit in Home Assistant.",
    detail:
      "It filters out drive-bys and pet hops by verifying that presence is intentional and sustained.",
    icon: RiStackLine,
  },
  {
    title: "Temporal Filtering",
    description:
      "Configurable 3s ON / 5s OFF debounce timers demand sustained signals before any change is announced.",
    detail:
      "No more twitchy sensors. The engine only moves when the signal proves it is real.",
    icon: RiRepeatLine,
  },
  {
    title: "Absolute Clear Delay",
    description:
      "A 30s cooldown remembers the last confident presence so perfectly still sleepers do not trigger false 'off' events.",
    detail:
      "Lights stay on while you rest, yet the system still reacts quickly once the bed is truly empty.",
    icon: RiDashboard2Line,
  },
  {
    title: "Z-Score Statistical Analysis",
    description:
      "Instead of raw amplitudes, we examine how far a reading deviates from the empty-bed baseline using z-scores.",
    detail:
      "This adaptive approach travels well between hardware variations and room conditions without manual retuning.",
    icon: RiRadarLine,
  },
]

export function PresenceHowItWorks() {
  return (
    <section
      aria-labelledby="presence-how-it-works"
      className="relative mx-auto max-w-6xl"
    >
      <div className="mb-10 space-y-4 text-center">
        <p className="text-sm uppercase tracking-[0.15em] text-blue-500 sm:tracking-[0.3em]">
          How It Works
        </p>
        <h2
          id="presence-how-it-works"
          className="text-3xl font-semibold tracking-tight text-gray-900 md:text-5xl"
        >
          Reliability engineered in four deliberate stages
        </h2>
        <p className="text-lg text-balance text-gray-600 md:text-xl">
          Each layer of the Bed Presence Sensor eliminates a class of false
          positives so your automations only fire when the bed is truly
          occupied—or truly empty.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {HOW_IT_WORKS_STEPS.map((step) => {
          const Icon = step.icon
          return (
            <article
              key={step.title}
              className={cx(
                "h-full rounded-2xl border border-white/40 bg-white/80 p-6 shadow-[0_30px_120px_rgba(15,23,42,0.08)] backdrop-blur",
                "ring-1 ring-gray-200 transition hover:-translate-y-1 hover:ring-blue-500/40"
              )}
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-full bg-blue-50 p-3 text-blue-600">
                  <Icon className="size-5" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {step.title}
                </h3>
              </div>
              <p className="text-base text-gray-700">{step.description}</p>
              <p className="mt-3 text-sm text-gray-500">{step.detail}</p>
            </article>
          )
        })}
      </div>
    </section>
  )
}

export default PresenceHowItWorks
