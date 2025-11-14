import { RiNumber1, RiNumber2, RiNumber3, RiNumber4, RiNumber5 } from "@remixicon/react"

import { cx } from "@/lib/utils"

const ENGINE_STEPS = [
  {
    title: "IDLE",
    description:
      "The bed is confidently empty. The engine watches for a z-score that breaks above the high threshold (k_on = 9.0).",
    detail: "Any transient blip that drops below k_on aborts the attempt before automations ever notice.",
    Icon: RiNumber1,
  },
  {
    title: "DEBOUNCING_ON",
    description:
      "A strong signal appears, but the engine starts a 3-second timer instead of flipping to ON immediately.",
    detail:
      "If the energy falters during this window, it snaps back to IDLE. No false triggers from pets or hallway motion.",
    Icon: RiNumber2,
  },
  {
    title: "PRESENT",
    description:
      "The signal held for the entire debounce, so the binary sensor finally turns ON and logs the last high-confidence timestamp.",
    detail:
      "This timestamp powers the Absolute Clear Delay so still sleepers remain counted as present.",
    Icon: RiNumber3,
  },
  {
    title: "DEBOUNCING_OFF",
    description:
      "The signal dipped below the k_off threshold (4.0), but the engine verifies that at least 30 seconds have passed since the last strong presence.",
    detail:
      "Only after those conditions does a 5-second OFF debounce begin while the sensor remains logically ON.",
    Icon: RiNumber4,
  },
  {
    title: "Return to IDLE",
    description:
      "When the low signal holds through the OFF debounce, the system confidently declares the bed empty and resets to IDLE.",
    detail:
      "If presence returns at any point, it aborts and jumps back to PRESENT without confusing downstream automations.",
    Icon: RiNumber5,
  },
]

export function PresenceStateEngine() {
  return (
    <section
      aria-labelledby="presence-state-engine"
      className="relative mx-auto max-w-6xl"
    >
      <div className="mb-10 text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-indigo-500">
          Deep Dive
        </p>
        <h2
          id="presence-state-engine"
          className="text-3xl font-semibold tracking-tight text-gray-900 md:text-5xl"
        >
          The 4-state presence engine makes binary sensors feel intentional
        </h2>
        <p className="mt-4 text-lg text-gray-600">
          Each transition has guardrails, timers, and abort paths so the Bed
          Presence Sensor behaves like the presence engine it is.
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <ol className="space-y-4">
          {ENGINE_STEPS.map((step) => (
            <li
              key={step.title}
              className={cx(
                "flex gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-lg shadow-slate-900/5 backdrop-blur",
                "ring-1 ring-gray-200 transition hover:shadow-xl hover:ring-indigo-500/30"
              )}
            >
              <div className="shrink-0 rounded-full bg-indigo-50 p-3 text-indigo-600">
                <step.Icon className="size-5" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-xl font-semibold text-gray-900">
                  {step.title}
                </h3>
                <p className="text-base text-gray-700">{step.description}</p>
                <p className="text-sm text-gray-500">{step.detail}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="rounded-3xl border border-white/40 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-8 text-white shadow-[0_30px_80px_rgba(15,23,42,0.6)]">
          <p className="text-sm uppercase tracking-[0.25em] text-white/70">
            Thresholds & Timers
          </p>
          <div className="mt-6 space-y-4 font-mono text-sm text-white/90">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span>k_on</span>
              <span className="text-lg font-semibold text-emerald-300">9.0</span>
            </div>
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span>k_off</span>
              <span className="text-lg font-semibold text-amber-300">4.0</span>
            </div>
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span>on_debounce_ms</span>
              <span className="text-lg font-semibold text-sky-300">
                3,000 ms
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span>off_debounce_ms</span>
              <span className="text-lg font-semibold text-pink-300">
                5,000 ms
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>abs_clear_delay_ms</span>
              <span className="text-lg font-semibold text-violet-300">
                30,000 ms
              </span>
            </div>
          </div>
          <p className="mt-6 text-sm text-white/80">
            These defaults ship ready for reliable presence out of the box, yet
            every parameter is adjustable live from the Home Assistant dashboard.
          </p>
        </div>
      </div>
    </section>
  )
}

export default PresenceStateEngine
