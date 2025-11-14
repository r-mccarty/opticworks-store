import {
  RiEye2Line,
  RiFingerprintLine,
  RiRadarLine,
  RiShieldCheckLine,
  RiSlideshowLine,
  RiTerminalBoxLine,
} from "@remixicon/react"

import { cx } from "@/lib/utils"

const VALUE_PROPS = [
  {
    title: "Unmatched Reliability",
    description:
      "Temporal filtering plus a 4-state machine require a sustained signal before flipping ON or OFF.",
    detail: "Sleep through the night without your lights randomly clearing.",
    icon: RiShieldCheckLine,
  },
  {
    title: "Statistical Intelligence",
    description:
      "Z-score analysis adapts to the empty-room baseline so the sensor reacts to meaningful changes, not noise.",
    detail: "Works consistently across rooms, hardware revisions, and climates.",
    icon: RiRadarLine,
  },
  {
    title: "Privacy by Design",
    description:
      "Millimeter-wave radar knows that someone is in bed—never who. All computation happens locally.",
    detail: "Your automations stay private because nothing leaves the ESP32.",
    icon: RiEye2Line,
  },
  {
    title: "Stillness Resilience",
    description:
      "Absolute Clear Delay waits 30 seconds after the last confident reading before considering the bed empty.",
    detail: "No false OFF events when you lie perfectly still.",
    icon: RiSlideshowLine,
  },
  {
    title: "Fully Tunable",
    description:
      "Expose every threshold, timer, and debug state in Home Assistant so power users can tune live.",
    detail: "Change parameters and watch the engine respond in real time.",
    icon: RiTerminalBoxLine,
  },
  {
    title: "Built for Real Rooms",
    description:
      "Still-energy focus ignores fans, HVAC, and hallway traffic that defeat other sensors.",
    detail: "Pets jumping on the bed no longer ruin your automations.",
    icon: RiFingerprintLine,
  },
]

export default function Features() {
  return (
    <section
      aria-labelledby="value-propositions"
      className="relative mx-auto max-w-6xl scroll-my-24"
    >
      <div className="mb-12 space-y-4 text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-orange-500">
          Value Propositions
        </p>
        <h2
          id="value-propositions"
          className="text-3xl font-semibold tracking-tight text-gray-900 md:text-5xl"
        >
          Built to fix every pain point smart homes have with bed sensors
        </h2>
        <p className="text-lg text-gray-600">
          These are the headline features customers should see the moment they
          land on the site.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {VALUE_PROPS.map((value) => {
          const Icon = value.icon
          return (
            <article
              key={value.title}
              className={cx(
                "flex h-full flex-col rounded-3xl border border-white/40 bg-white/90 p-6 shadow-[0_25px_80px_rgba(15,23,42,0.12)]",
                "backdrop-blur ring-1 ring-gray-200 transition hover:-translate-y-1 hover:ring-orange-400/50"
              )}
            >
              <div className="mb-4 inline-flex items-center gap-3 rounded-full bg-orange-100 px-4 py-2 text-orange-600">
                <Icon className="size-5" />
                <span className="text-sm font-semibold uppercase tracking-wide">
                  {value.title}
                </span>
              </div>
              <p className="text-lg font-semibold text-gray-900">
                {value.description}
              </p>
              <p className="mt-3 text-sm text-gray-600">{value.detail}</p>
            </article>
          )
        })}
      </div>
    </section>
  )
}
