import {
  RiDashboard2Line,
  RiRadarLine,
  RiRepeatLine,
  RiStackLine,
} from "@remixicon/react"

import { cx } from "@/lib/utils"

const HOW_IT_WORKS_STEPS = [
  {
    title: "The 4-state engine",
    description:
      "A finite state machine validates every transition before it ever flips the presence bit in Home Assistant.",
    detail:
      "Built to feel intentional: every move narrates itself in the debug sensor like a Grok trace.",
    icon: RiStackLine,
  },
  {
    title: "Temporal filtering",
    description:
      "Configurable debounce timers demand sustained signals before any change is announced.",
    detail:
      "Drive-bys drop out instantly; actual presence glides through.",
    icon: RiRepeatLine,
  },
  {
    title: "Absolute Clear Delay",
    description:
      "A 30s cooldown remembers the last confident presence so perfectly still sleepers do not trigger false off events.",
    detail:
      "Lights stay on while you rest, yet clear decisively when you stand.",
    icon: RiDashboard2Line,
  },
  {
    title: "Z-score intelligence",
    description:
      "Instead of raw amplitudes, the engine looks at deviation from an adaptive baseline—portable across rooms and boards.",
    detail:
      "You get mathematical calm, not guesswork.",
    icon: RiRadarLine,
  },
]

export function PresenceHowItWorks() {
  return (
    <section
      aria-labelledby="presence-how-it-works"
      className="relative mx-auto max-w-6xl text-white"
    >
      <div className="mb-12 space-y-4 text-center">
        <p className="text-xs uppercase tracking-[0.35em] text-white/50">
          How it works
        </p>
        <h2
          id="presence-how-it-works"
          className="text-3xl font-semibold tracking-tight text-balance md:text-5xl"
        >
          Reliability explained like an xAI system diagram
        </h2>
        <p className="text-lg text-balance text-white/70 md:text-xl">
          Each layer removes noise until only deliberate presence remains. Every threshold is visible, every timer logged.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {HOW_IT_WORKS_STEPS.map((step, idx) => {
          const Icon = step.icon
          return (
            <article
              key={step.title}
              className={cx(
                "relative h-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6",
                "shadow-[0_25px_120px_rgba(0,0,0,0.35)] backdrop-blur"
              )}
            >
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/0 via-white/5 to-white/0" />
              <div className="relative flex h-full flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm uppercase tracking-[0.25em] text-white/70">
                    <Icon className="size-5" />
                    <span>{step.title}</span>
                  </div>
                  <span className="text-xs uppercase tracking-[0.35em] text-white/40">0{idx + 1}</span>
                </div>
                <p className="text-lg font-semibold text-white">{step.description}</p>
                <p className="text-sm text-white/70">{step.detail}</p>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

export default PresenceHowItWorks
