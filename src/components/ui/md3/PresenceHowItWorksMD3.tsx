import {
  RiDashboard2Line,
  RiRadarLine,
  RiRepeatLine,
  RiStackLine,
} from "@remixicon/react"

import { cx } from "@/lib/utils"
import { Card } from "./Card"
import { Surface } from "./Surface"

const HOW_IT_WORKS_STEPS = [
  {
    title: "The 4-State Presence Engine",
    description:
      "A deliberate finite state machine validates every transition before it ever flips the presence bit in Home Assistant.",
    detail:
      "It filters out drive-bys and pet hops by verifying that presence is intentional and sustained.",
    icon: RiStackLine,
    color: "primary",
  },
  {
    title: "Temporal Filtering",
    description:
      "Configurable 3s ON / 5s OFF debounce timers demand sustained signals before any change is announced.",
    detail:
      "No more twitchy sensors. The engine only moves when the signal proves it is real.",
    icon: RiRepeatLine,
    color: "secondary",
  },
  {
    title: "Absolute Clear Delay",
    description:
      "A 30s cooldown remembers the last confident presence so perfectly still sleepers do not trigger false 'off' events.",
    detail:
      "Lights stay on while you rest, yet the system still reacts quickly once the bed is truly empty.",
    icon: RiDashboard2Line,
    color: "tertiary",
  },
  {
    title: "Z-Score Statistical Analysis",
    description:
      "Instead of raw amplitudes, we examine how far a reading deviates from the empty-bed baseline using z-scores.",
    detail:
      "This adaptive approach travels well between hardware variations and room conditions without manual retuning.",
    icon: RiRadarLine,
    color: "primary",
  },
]

type ColorType = "primary" | "secondary" | "tertiary"

const colorClasses: Record<ColorType, {
  icon: string
  surface: string
}> = {
  primary: {
    icon: "bg-[var(--color-md-primary-40)] text-white",
    surface: "bg-[var(--color-md-primary-95)]",
  },
  secondary: {
    icon: "bg-[var(--color-md-secondary-40)] text-white",
    surface: "bg-[var(--color-md-secondary-95)]",
  },
  tertiary: {
    icon: "bg-[var(--color-md-tertiary-40)] text-white",
    surface: "bg-[var(--color-md-tertiary-95)]",
  },
}

export function PresenceHowItWorksMD3() {
  return (
    <section
      aria-labelledby="presence-how-it-works"
      className="relative mx-auto max-w-7xl px-6 py-24 lg:px-8"
    >
      {/* Section Header */}
      <div className="mb-16 space-y-4 text-center">
        <Surface
          elevation={0}
          shape="full"
          className="mx-auto inline-flex bg-[var(--color-md-primary-90)] px-4 py-2"
        >
          <span className="text-[var(--font-size-label-large)] font-semibold uppercase tracking-wider text-[var(--color-md-primary-30)]">
            How It Works
          </span>
        </Surface>

        <h2
          id="presence-how-it-works"
          className="mx-auto max-w-4xl text-[var(--font-size-headline-large)] font-bold leading-tight tracking-tight text-[var(--color-md-neutral-10)] md:text-[var(--font-size-display-small)]"
        >
          Reliability engineered in four deliberate stages
        </h2>

        <p className="mx-auto max-w-3xl text-[var(--font-size-body-large)] text-balance text-[var(--color-md-neutral-30)]">
          Each layer of the Bed Presence Sensor eliminates a class of false
          positives so your automations only fire when the bed is truly
          occupied—or truly empty.
        </p>
      </div>

      {/* Steps Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {HOW_IT_WORKS_STEPS.map((step, index) => {
          const Icon = step.icon
          const colors = colorClasses[step.color as ColorType]

          return (
            <Card
              key={step.title}
              variant="elevated"
              interactive
              className="group h-full bg-[var(--color-md-neutral-99)] p-8 transition-all duration-300 [transition-timing-function:var(--ease-md-emphasized)]"
            >
              {/* Header with Icon */}
              <div className="mb-6 flex items-center gap-4">
                <Surface
                  elevation={1}
                  shape="medium"
                  className={cx(
                    "flex size-14 items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:[box-shadow:var(--shadow-md-elevation-3)]",
                    colors.icon
                  )}
                >
                  <Icon className="size-7" />
                </Surface>

                <div className="flex-1">
                  <span className="text-[var(--font-size-label-small)] font-bold uppercase tracking-wider text-[var(--color-md-neutral-60)]">
                    Step {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-1 text-[var(--font-size-title-large)] font-bold text-[var(--color-md-neutral-10)]">
                    {step.title}
                  </h3>
                </div>
              </div>

              {/* Description */}
              <p className="mb-4 text-[var(--font-size-body-large)] leading-relaxed text-[var(--color-md-neutral-20)]">
                {step.description}
              </p>

              {/* Detail Surface */}
              <Surface
                elevation={0}
                shape="small"
                className={cx(
                  "border-l-4 p-4",
                  step.color === "primary" && "border-[var(--color-md-primary-40)]",
                  step.color === "secondary" && "border-[var(--color-md-secondary-40)]",
                  step.color === "tertiary" && "border-[var(--color-md-tertiary-40)]",
                  colors.surface
                )}
              >
                <p className="text-[var(--font-size-body-small)] text-[var(--color-md-neutral-30)]">
                  {step.detail}
                </p>
              </Surface>
            </Card>
          )
        })}
      </div>
    </section>
  )
}

export default PresenceHowItWorksMD3
