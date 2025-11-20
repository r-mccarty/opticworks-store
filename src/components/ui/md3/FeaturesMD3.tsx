import {
  RiEye2Line,
  RiFingerprintLine,
  RiRadarLine,
  RiShieldCheckLine,
  RiSlideshowLine,
  RiTerminalBoxLine,
} from "@remixicon/react"

import { cx } from "@/lib/utils"
import { Card } from "./Card"
import { Surface } from "./Surface"

const VALUE_PROPS = [
  {
    title: "Unmatched Reliability",
    description:
      "Temporal filtering plus a 4-state machine require a sustained signal before flipping ON or OFF.",
    detail: "Sleep through the night without your lights randomly clearing.",
    icon: RiShieldCheckLine,
    color: "primary",
  },
  {
    title: "Statistical Intelligence",
    description:
      "Z-score analysis adapts to the empty-room baseline so the sensor reacts to meaningful changes, not noise.",
    detail: "Works consistently across rooms, hardware revisions, and climates.",
    icon: RiRadarLine,
    color: "secondary",
  },
  {
    title: "Privacy by Design",
    description:
      "Millimeter-wave radar knows that someone is in bed—never who. All computation happens locally.",
    detail: "Your automations stay private because nothing leaves the ESP32.",
    icon: RiEye2Line,
    color: "tertiary",
  },
  {
    title: "Stillness Resilience",
    description:
      "Absolute Clear Delay waits 30 seconds after the last confident reading before considering the bed empty.",
    detail: "No false OFF events when you lie perfectly still.",
    icon: RiSlideshowLine,
    color: "primary",
  },
  {
    title: "Fully Tunable",
    description:
      "Expose every threshold, timer, and debug state in Home Assistant so power users can tune live.",
    detail: "Change parameters and watch the engine respond in real time.",
    icon: RiTerminalBoxLine,
    color: "secondary",
  },
  {
    title: "Built for Real Rooms",
    description:
      "Still-energy focus ignores fans, HVAC, and hallway traffic that defeat other sensors.",
    detail: "Pets jumping on the bed no longer ruin your automations.",
    icon: RiFingerprintLine,
    color: "tertiary",
  },
]

type ColorType = "primary" | "secondary" | "tertiary"

const colorClasses: Record<ColorType, {
  icon: string
  badge: string
  accent: string
}> = {
  primary: {
    icon: "bg-[var(--color-md-primary-40)] text-white",
    badge: "bg-[var(--color-md-primary-90)] text-[var(--color-md-primary-30)]",
    accent: "bg-[var(--color-md-primary-95)]",
  },
  secondary: {
    icon: "bg-[var(--color-md-secondary-40)] text-white",
    badge: "bg-[var(--color-md-secondary-90)] text-[var(--color-md-secondary-30)]",
    accent: "bg-[var(--color-md-secondary-95)]",
  },
  tertiary: {
    icon: "bg-[var(--color-md-tertiary-40)] text-white",
    badge: "bg-[var(--color-md-tertiary-90)] text-[var(--color-md-tertiary-30)]",
    accent: "bg-[var(--color-md-tertiary-95)]",
  },
}

export default function FeaturesMD3() {
  return (
    <section
      aria-labelledby="value-propositions"
      className="relative mx-auto max-w-7xl scroll-my-24 px-6 py-24 lg:px-8"
    >
      {/* Section Header */}
      <div className="mb-16 space-y-4 text-center">
        <Surface
          elevation={0}
          shape="full"
          className="mx-auto inline-flex bg-[var(--color-md-tertiary-90)] px-4 py-2"
        >
          <span className="text-[var(--font-size-label-large)] font-semibold uppercase tracking-wider text-[var(--color-md-tertiary-30)]">
            Value Propositions
          </span>
        </Surface>

        <h2
          id="value-propositions"
          className="mx-auto max-w-4xl text-[var(--font-size-headline-large)] font-bold leading-tight tracking-tight text-[var(--color-md-neutral-10)] md:text-[var(--font-size-display-small)]"
        >
          Built to fix every pain point smart homes have with bed sensors
        </h2>

        <p className="mx-auto max-w-2xl text-[var(--font-size-body-large)] text-[var(--color-md-neutral-30)]">
          These are the headline features customers should see the moment they
          land on the site.
        </p>
      </div>

      {/* Feature Grid */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {VALUE_PROPS.map((value, index) => {
          const Icon = value.icon
          const colors = colorClasses[value.color as ColorType]

          return (
            <Card
              key={value.title}
              variant="elevated"
              interactive
              className="group flex h-full flex-col bg-[var(--color-md-neutral-99)] p-8 transition-all duration-300 [transition-timing-function:var(--ease-md-emphasized)]"
            >
              {/* Header with Icon and Number */}
              <div className="mb-6 flex items-start justify-between gap-4">
                <Surface
                  elevation={2}
                  shape="large"
                  className={cx(
                    "flex size-16 items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:[box-shadow:var(--shadow-md-elevation-3)]",
                    colors.icon
                  )}
                >
                  <Icon className="size-8" />
                </Surface>

                <span className="text-[var(--font-size-label-small)] font-bold uppercase tracking-wider text-[var(--color-md-neutral-60)]">
                  {String(index + 1).padStart(2, "0")} / {String(VALUE_PROPS.length).padStart(2, "0")}
                </span>
              </div>

              {/* Content */}
              <div className="mb-6 flex-1 space-y-3">
                <h3 className="text-[var(--font-size-title-medium)] font-bold uppercase tracking-wider text-[var(--color-md-neutral-40)]">
                  {value.title}
                </h3>

                <p className="text-[var(--font-size-title-large)] font-medium leading-snug text-[var(--color-md-neutral-10)]">
                  {value.description}
                </p>
              </div>

              {/* Detail Badge */}
              <Surface
                elevation={0}
                shape="medium"
                className={cx(
                  "p-4",
                  colors.accent
                )}
              >
                <p className="text-[var(--font-size-label-large)] font-semibold text-[var(--color-md-neutral-20)]">
                  Why it matters
                </p>
                <p className="mt-1 text-[var(--font-size-body-small)] text-[var(--color-md-neutral-30)]">
                  {value.detail}
                </p>
              </Surface>

              {/* Footer Label */}
              <div className="mt-6 flex items-center justify-between border-t border-[var(--color-md-neutral-90)] pt-4">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-md-neutral-50)]">
                  Engineered Precision
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-md-neutral-50)]">
                  Premium Quality
                </span>
              </div>
            </Card>
          )
        })}
      </div>
    </section>
  )
}
