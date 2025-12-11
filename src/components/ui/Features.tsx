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
    glow: "circle at 20% 20%",
  },
  {
    title: "Statistical Intelligence",
    description:
      "Z-score analysis adapts to the empty-room baseline so the sensor reacts to meaningful changes, not noise.",
    detail: "Works consistently across rooms, hardware revisions, and climates.",
    icon: RiRadarLine,
    glow: "circle at 80% 0%",
  },
  {
    title: "Privacy by Design",
    description:
      "Millimeter-wave radar knows that someone is in bed—never who. All computation happens locally.",
    detail: "Your automations stay private because nothing leaves the ESP32.",
    icon: RiEye2Line,
    glow: "circle at 15% 80%",
  },
  {
    title: "Stillness Resilience",
    description:
      "Absolute Clear Delay waits 30 seconds after the last confident reading before considering the bed empty.",
    detail: "No false OFF events when you lie perfectly still.",
    icon: RiSlideshowLine,
    glow: "circle at 70% 30%",
  },
  {
    title: "Fully Tunable",
    description:
      "Expose every threshold, timer, and debug state in Home Assistant so power users can tune live.",
    detail: "Change parameters and watch the engine respond in real time.",
    icon: RiTerminalBoxLine,
    glow: "circle at 30% 0%",
  },
  {
    title: "Built for Real Rooms",
    description:
      "Still-energy focus ignores fans, HVAC, and hallway traffic that defeat other sensors.",
    detail: "Pets jumping on the bed no longer ruin your automations.",
    icon: RiFingerprintLine,
    glow: "circle at 85% 70%",
  },
]

export default function Features() {
  return (
    <section
      aria-labelledby="value-propositions"
      className="relative mx-auto max-w-6xl scroll-my-24"
    >
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_10%_40%,rgba(255,153,0,0.08),transparent_45%),radial-gradient(circle_at_80%_10%,rgba(255,255,255,0.05),transparent_40%)]" />
      <div className="mb-12 space-y-4 text-center">
        <p className="font-jetbrains text-xs uppercase tracking-[3px] text-amber-300">
          Value Grid // Presence Engine
        </p>
        <h2
          id="value-propositions"
          className="text-4xl font-black tracking-[-0.03em] text-white md:text-6xl"
        >
          Built to fix every pain point smart homes have with bed sensors
        </h2>
        <p className="text-lg text-zinc-300 max-w-3xl mx-auto">
          Glassy, intentional cards that merge ASCII texture with optical glow make it easy to scan the core differentiators.
        </p>
      </div>
      <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
        {VALUE_PROPS.map((value, index) => {
          const Icon = value.icon
          return (
            <article
              key={value.title}
              style={{
                backgroundImage: `radial-gradient(${value.glow}, rgba(255,153,0,0.18), transparent 50%)`,
              }}
              className={cx(
                "group relative flex h-full flex-col overflow-hidden rounded-[22px] border border-white/10 bg-white/5 p-7",
                "backdrop-blur-2xl optic-grid optic-glow transition duration-300 hover:-translate-y-1"
              )}
            >
              <div className="absolute inset-0 opacity-70 blur-3xl transition duration-500 group-hover:opacity-100" style={{ background: "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.12), transparent 55%)" }} />
              <div className="relative flex h-full flex-col gap-6">
                <div className="flex items-start justify-between gap-6">
                  <div className="flex items-center gap-3">
                    <div className="flex size-12 items-center justify-center rounded-2xl border border-amber-400/40 bg-amber-500/10 text-amber-200 ring-1 ring-amber-300/35">
                      <Icon className="size-6" />
                    </div>
                    <div className="font-jetbrains text-[12px] uppercase tracking-[3px] text-white/70">
                      {String(index + 1).padStart(2, "0")}
                      <span className="text-amber-300">{' //'}</span>
                    </div>
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-jetbrains text-[11px] uppercase tracking-[3px] text-zinc-300">
                    Presence Stack
                  </span>
                </div>
                <div className="space-y-3">
                  <p className="font-jetbrains text-[12px] uppercase tracking-[3px] text-amber-300">
                    {value.title}
                  </p>
                  <p className="text-xl font-semibold leading-snug text-white sm:text-2xl">
                    {value.description}
                  </p>
                </div>
                <div className="mt-auto rounded-2xl border border-white/10 bg-black/40 p-5 text-sm text-zinc-200">
                  <p className="font-jetbrains text-[11px] uppercase tracking-[3px] text-amber-200">
                    Why it matters
                  </p>
                  <p className="mt-2 text-sm text-zinc-200/90">{value.detail}</p>
                </div>
                <div className="flex items-center justify-between text-xs font-jetbrains uppercase tracking-[3px] text-zinc-400">
                  <span className="text-[0.65rem] sm:text-xs">Engineered Presence</span>
                  <span className="text-[0.65rem] sm:text-xs">ASCII + Glass</span>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
