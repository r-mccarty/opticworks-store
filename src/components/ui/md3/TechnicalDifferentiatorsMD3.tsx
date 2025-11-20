import { RiCloudOffLine, RiRadarLine, RiToggleLine } from "@remixicon/react"

import { cx } from "@/lib/utils"
import { Card } from "./Card"
import { Surface } from "./Surface"

const DIFFERENTIATORS = [
  {
    title: "Still Energy Intelligence",
    description:
      "We focus on still energy reflections so fans, HVAC, and hallway traffic do not register as presence.",
    detail:
      "Sleeping humans act like large stationary mirrors. That deliberate signal choice is why the sensor feels calm.",
    icon: RiRadarLine,
    color: "primary",
  },
  {
    title: "On-Device & Private",
    description:
      "Every z-score calculation, debounce decision, and binary flip happens on the ESP32—no cloud tether.",
    detail:
      "Latency disappears, privacy is intact, and your automations keep running if the internet blinks.",
    icon: RiCloudOffLine,
    color: "secondary",
  },
  {
    title: "Hysteresis by Design",
    description:
      "Two thresholds (k_on vs k_off) create a deliberate dead zone so the sensor never chatters at the edge.",
    detail:
      "That built-in hysteresis is the secret to keeping HA dashboards quiet even when signals hover near a boundary.",
    icon: RiToggleLine,
    color: "tertiary",
  },
]

type ColorType = "primary" | "secondary" | "tertiary"

const colorClasses: Record<ColorType, {
  icon: string
  badge: string
  surface: string
}> = {
  primary: {
    icon: "bg-[var(--color-md-primary-40)]",
    badge: "bg-[var(--color-md-primary-90)] text-[var(--color-md-primary-30)]",
    surface: "bg-[var(--color-md-primary-95)]",
  },
  secondary: {
    icon: "bg-[var(--color-md-secondary-40)]",
    badge: "bg-[var(--color-md-secondary-90)] text-[var(--color-md-secondary-30)]",
    surface: "bg-[var(--color-md-secondary-95)]",
  },
  tertiary: {
    icon: "bg-[var(--color-md-tertiary-40)]",
    badge: "bg-[var(--color-md-tertiary-90)] text-[var(--color-md-tertiary-30)]",
    surface: "bg-[var(--color-md-tertiary-95)]",
  },
}

export function TechnicalDifferentiatorsMD3() {
  return (
    <section
      aria-labelledby="technical-differentiators"
      className="relative mx-auto max-w-7xl px-6 py-24 lg:px-8"
    >
      {/* Section Header */}
      <div className="mb-16 text-center">
        <Surface
          elevation={0}
          shape="full"
          className="mx-auto mb-6 inline-flex bg-[var(--color-md-secondary-90)] px-4 py-2"
        >
          <span className="text-[var(--font-size-label-large)] font-semibold uppercase tracking-wider text-[var(--color-md-secondary-30)]">
            Technical Differentiators
          </span>
        </Surface>

        <h2
          id="technical-differentiators"
          className="mx-auto max-w-4xl text-[var(--font-size-headline-large)] font-bold leading-tight tracking-tight text-[var(--color-md-neutral-10)] md:text-[var(--font-size-display-small)]"
        >
          Built for real-world bedrooms, not lab demos
        </h2>

        <p className="mx-auto mt-4 max-w-3xl text-[var(--font-size-body-large)] text-[var(--color-md-neutral-30)]">
          The Bed Presence Sensor&apos;s architecture attacks the three failure
          modes that frustrate smart home power users.
        </p>
      </div>

      {/* Differentiators Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {DIFFERENTIATORS.map((difference) => {
          const Icon = difference.icon
          const colors = colorClasses[difference.color as ColorType]

          return (
            <Card
              key={difference.title}
              variant="elevated"
              interactive
              className="group flex h-full flex-col bg-[var(--color-md-neutral-99)] p-8 transition-all duration-300 [transition-timing-function:var(--ease-md-emphasized)]"
            >
              {/* Badge Header */}
              <Surface
                elevation={0}
                shape="full"
                className={cx(
                  "mb-6 inline-flex items-center gap-3 self-start px-4 py-2 transition-all duration-300 group-hover:[box-shadow:var(--shadow-md-elevation-1)]",
                  colors.badge
                )}
              >
                <Surface
                  elevation={2}
                  shape="full"
                  className={cx(
                    "flex size-8 items-center justify-center text-white transition-all duration-300 group-hover:scale-110",
                    colors.icon
                  )}
                >
                  <Icon className="size-4" />
                </Surface>
                <span className="text-[var(--font-size-label-medium)] font-bold uppercase tracking-wider">
                  {difference.title}
                </span>
              </Surface>

              {/* Description */}
              <p className="mb-4 flex-1 text-[var(--font-size-title-medium)] font-semibold leading-snug text-[var(--color-md-neutral-10)]">
                {difference.description}
              </p>

              {/* Detail */}
              <Surface
                elevation={0}
                shape="small"
                className={cx("p-4", colors.surface)}
              >
                <p className="text-[var(--font-size-body-small)] text-[var(--color-md-neutral-30)]">
                  {difference.detail}
                </p>
              </Surface>
            </Card>
          )
        })}
      </div>
    </section>
  )
}

export default TechnicalDifferentiatorsMD3
