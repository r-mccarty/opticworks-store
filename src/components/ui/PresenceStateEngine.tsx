import { RiNumber1, RiNumber2, RiNumber3, RiNumber4, RiNumber5 } from "@remixicon/react"

import { cx } from "@/lib/utils"

const ENGINE_STEPS = [
  {
    title: "IDLE",
    description:
      "The bed is confidently empty. The engine watches for a z-score that breaks above the high threshold (k_on = 9.0).",
    detail: "Transient blips fall away before automations ever notice.",
    Icon: RiNumber1,
  },
  {
    title: "DEBOUNCING_ON",
    description:
      "A strong signal appears, but the engine starts a 3-second timer instead of flipping to ON immediately.",
    detail: "If energy falters, it snaps back to IDLE. No pet triggers, no hallway chatter.",
    Icon: RiNumber2,
  },
  {
    title: "PRESENT",
    description:
      "The signal held for the entire debounce, so the binary sensor finally turns ON and logs the last high-confidence timestamp.",
    detail: "This timestamp powers the Absolute Clear Delay so still sleepers remain counted as present.",
    Icon: RiNumber3,
  },
  {
    title: "DEBOUNCING_OFF",
    description:
      "The signal dipped below k_off (4.0) and the engine verifies that at least 30 seconds have passed since the last strong presence.",
    detail: "Only then does a 5-second OFF debounce begin while the sensor remains logically ON.",
    Icon: RiNumber4,
  },
  {
    title: "Return to IDLE",
    description:
      "When the low signal holds through the OFF debounce, the system confidently declares the bed empty and resets to IDLE.",
    detail: "If presence returns at any point, it aborts and jumps back to PRESENT without confusing downstream automations.",
    Icon: RiNumber5,
  },
]

export function PresenceStateEngine() {
  return (
    <section
      aria-labelledby="presence-state-engine"
      className="relative mx-auto max-w-6xl text-white"
    >
      <div className="mb-12 text-center">
        <p className="text-xs uppercase tracking-[0.35em] text-white/50">Deep dive</p>
        <h2
          id="presence-state-engine"
          className="text-3xl font-semibold tracking-tight text-balance md:text-5xl"
        >
          The four-state presence engine, rendered in xAI minimalism
        </h2>
        <p className="mt-4 text-lg text-white/70">
          Guardrails, timers, and abort paths keep the sensor decisive without ever feeling twitchy.
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <ol className="relative space-y-4 before:absolute before:inset-y-0 before:left-5 before:w-px before:bg-white/10">
          {ENGINE_STEPS.map((step, idx) => (
            <li
              key={step.title}
              className={cx(
                "relative flex gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_20px_90px_rgba(0,0,0,0.35)] backdrop-blur",
                "transition hover:-translate-y-1"
              )}
            >
              <div className="relative z-10 flex size-10 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white">
                <step.Icon className="size-5" />
              </div>
              <div className="space-y-1.5 text-white">
                <p className="text-xs uppercase tracking-[0.3em] text-white/50">0{idx + 1}</p>
                <h3 className="text-xl font-semibold">{step.title}</h3>
                <p className="text-base text-white/80">{step.description}</p>
                <p className="text-sm text-white/60">{step.detail}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 via-black/60 to-black p-8 text-white shadow-[0_30px_100px_rgba(0,0,0,0.6)]">
          <p className="text-sm uppercase tracking-[0.25em] text-white/60">Thresholds &amp; timers</p>
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
              <span className="text-lg font-semibold text-sky-300">3,000 ms</span>
            </div>
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span>off_debounce_ms</span>
              <span className="text-lg font-semibold text-pink-300">5,000 ms</span>
            </div>
            <div className="flex items-center justify-between">
              <span>abs_clear_delay_ms</span>
              <span className="text-lg font-semibold text-violet-300">30,000 ms</span>
            </div>
          </div>
          <p className="mt-6 text-sm text-white/70">
            Defaults ship opinionated and calm. Every parameter remains transparent and tunable from the Home Assistant dashboard.
          </p>
        </div>
      </div>
    </section>
  )
}

export default PresenceStateEngine
