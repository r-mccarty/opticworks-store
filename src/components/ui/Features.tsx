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
    title: "Presence over motion",
    description:
      "Grok-like signal processing that refuses to chatter. The engine waits for intent before it ever declares someone present.",
    detail: "A 4-state machine with debounced transitions keeps dashboards silent until the signal is proven.",
    icon: RiShieldCheckLine,
    accent: "from-[#8c7bff]/40 via-white/10 to-[#5ce1e6]/30"
  },
  {
    title: "Statistical intuition",
    description:
      "Z-score analysis adapts to your room, hardware, and climate so you never retune for seasons or firmware updates.",
    detail: "A clean, xAI-inspired layer reveals every threshold while the math runs locally on the ESP32.",
    icon: RiRadarLine,
    accent: "from-[#5ce1e6]/40 via-white/10 to-[#8c7bff]/20"
  },
  {
    title: "Privacy is default",
    description:
      "On-device inference means no cloud to trust and nothing to leak—only the binary presence bit leaves the board.",
    detail: "Designed for the bedroom, engineered like an offline model with transparent logs.",
    icon: RiEye2Line,
    accent: "from-white/10 via-[#5ce1e6]/20 to-white/10"
  },
  {
    title: "Stillness resilience",
    description:
      "Absolute Clear Delay preserves state while you sleep. Stillness is treated as a feature, not a failure mode.",
    detail: "Lights stay on, automations stay predictable, and wake-up transitions are crisp.",
    icon: RiSlideshowLine,
    accent: "from-[#8c7bff]/30 via-white/5 to-[#5ce1e6]/30"
  },
  {
    title: "Live tuning",
    description:
      "Expose every timer, hysteresis, and debug sensor in Home Assistant. Adjust live the way you iterate on prompts.",
    detail: "Change a value and watch the state engine narrate why it moves.",
    icon: RiTerminalBoxLine,
    accent: "from-white/10 via-[#8c7bff]/20 to-white/10"
  },
  {
    title: "Built for real rooms",
    description:
      "Fans, HVAC, and hallway traffic are filtered out. The sensor is calm near noise but decisive when you roll over.",
    detail: "Presence is derived from still-energy mirrors, not twitchy motion signatures.",
    icon: RiFingerprintLine,
    accent: "from-[#5ce1e6]/25 via-white/10 to-[#8c7bff]/20"
  },
]

export default function Features() {
  return (
    <section
      aria-labelledby="value-propositions"
      className="relative mx-auto max-w-6xl scroll-my-24 text-white"
    >
      <div className="mb-12 grid gap-4 text-center">
        <p className="text-xs uppercase tracking-[0.35em] text-white/50">
          Presence engineered for quiet rooms
        </p>
        <h2
          id="value-propositions"
          className="text-3xl font-semibold tracking-tight text-balance md:text-5xl"
        >
          A Grok-inspired visual language for the sensor you trust at 2 a.m.
        </h2>
        <p className="text-lg text-white/70">
          Monochrome gradients, precise edges, and transparent data make the hardware feel like software.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {VALUE_PROPS.map((value, index) => {
          const Icon = value.icon
          return (
            <article
              key={value.title}
              className={cx(
                "group relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6",
                "shadow-[0_25px_120px_rgba(0,0,0,0.35)] backdrop-blur transition duration-500 hover:-translate-y-2"
              )}
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-0 transition duration-700 group-hover:opacity-100"
              >
                <div className={cx("absolute inset-0 bg-gradient-to-br blur-3xl", value.accent)} />
              </div>
              <div className="relative flex h-full flex-col gap-5">
                <div className="flex items-start justify-between gap-6">
                  <div
                    className="flex size-12 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-white"
                  >
                    <Icon className="size-6" />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">
                    {String(index + 1).padStart(2, "0")} / {String(VALUE_PROPS.length).padStart(2, "0")}
                  </span>
                </div>
                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/50">
                    {value.title}
                  </p>
                  <p className="text-xl font-semibold leading-snug text-white sm:text-2xl">
                    {value.description}
                  </p>
                </div>
                <div className="mt-auto rounded-2xl border border-white/10 bg-gradient-to-r from-white/5 to-white/0 p-4 text-sm text-white/80">
                  <p className="text-sm font-semibold text-white">Why it matters</p>
                  <p className="mt-1 text-sm text-white/70">{value.detail}</p>
                </div>
                <div className="flex items-center justify-between text-[0.7rem] uppercase tracking-[0.25em] text-white/40">
                  <span>Edge compute</span>
                  <span>Signal clarity</span>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
