import {
  RiEye2Line,
  RiFingerprintLine,
  RiRadarLine,
  RiShieldCheckLine,
  RiSlideshowLine,
  RiTerminalBoxLine,
} from "@remixicon/react"

import { GlassCard } from "./GlassCard"

const VALUE_PROPS = [
  {
    title: "Unmatched Reliability",
    description:
      "Temporal filtering plus a 4-state machine require a sustained signal before flipping ON or OFF.",
    detail: "Sleep through the night without your lights randomly clearing.",
    icon: RiShieldCheckLine,
    accent: {
      gradient:
        "linear-gradient(135deg, rgba(255,249,242,0.95) 0%, rgba(255,255,255,0.85) 55%, rgba(255,255,255,0.75) 100%)",
      glow: "radial-gradient(circle at 20% 20%, rgba(255,196,150,0.55), transparent 60%)",
      icon: "from-orange-500 via-amber-400 to-yellow-300",
      detailBg: "from-orange-500/10 via-amber-200/30 to-transparent",
    },
  },
  {
    title: "Statistical Intelligence",
    description:
      "Z-score analysis adapts to the empty-room baseline so the sensor reacts to meaningful changes, not noise.",
    detail: "Works consistently across rooms, hardware revisions, and climates.",
    icon: RiRadarLine,
    accent: {
      gradient:
        "linear-gradient(135deg, rgba(242,248,255,0.96) 0%, rgba(255,255,255,0.88) 60%, rgba(240,247,255,0.8) 100%)",
      glow: "radial-gradient(circle at 80% 0%, rgba(134,189,255,0.45), transparent 55%)",
      icon: "from-sky-500 via-blue-500 to-cyan-400",
      detailBg: "from-sky-500/15 via-cyan-200/30 to-transparent",
    },
  },
  {
    title: "Privacy by Design",
    description:
      "Millimeter-wave radar knows that someone is in bed—never who. All computation happens locally.",
    detail: "Your automations stay private because nothing leaves the ESP32.",
    icon: RiEye2Line,
    accent: {
      gradient:
        "linear-gradient(145deg, rgba(239,249,247,0.95) 0%, rgba(255,255,255,0.85) 65%, rgba(239,249,247,0.75) 100%)",
      glow: "radial-gradient(circle at 15% 80%, rgba(90,214,189,0.45), transparent 55%)",
      icon: "from-emerald-500 via-teal-500 to-cyan-400",
      detailBg: "from-emerald-500/10 via-teal-200/30 to-transparent",
    },
  },
  {
    title: "Stillness Resilience",
    description:
      "Absolute Clear Delay waits 30 seconds after the last confident reading before considering the bed empty.",
    detail: "No false OFF events when you lie perfectly still.",
    icon: RiSlideshowLine,
    accent: {
      gradient:
        "linear-gradient(145deg, rgba(243,246,255,0.96) 0%, rgba(255,255,255,0.88) 60%, rgba(243,246,255,0.75) 100%)",
      glow: "radial-gradient(circle at 70% 30%, rgba(150,174,255,0.45), transparent 55%)",
      icon: "from-indigo-500 via-blue-500 to-purple-400",
      detailBg: "from-indigo-500/15 via-blue-200/30 to-transparent",
    },
  },
  {
    title: "Fully Tunable",
    description:
      "Expose every threshold, timer, and debug state in Home Assistant so power users can tune live.",
    detail: "Change parameters and watch the engine respond in real time.",
    icon: RiTerminalBoxLine,
    accent: {
      gradient:
        "linear-gradient(150deg, rgba(247,244,255,0.96) 0%, rgba(255,255,255,0.85) 55%, rgba(244,240,255,0.78) 100%)",
      glow: "radial-gradient(circle at 30% 0%, rgba(206,170,255,0.5), transparent 60%)",
      icon: "from-purple-500 via-fuchsia-500 to-pink-500",
      detailBg: "from-purple-500/15 via-fuchsia-200/30 to-transparent",
    },
  },
  {
    title: "Built for Real Rooms",
    description:
      "Still-energy focus ignores fans, HVAC, and hallway traffic that defeat other sensors.",
    detail: "Pets jumping on the bed no longer ruin your automations.",
    icon: RiFingerprintLine,
    accent: {
      gradient:
        "linear-gradient(150deg, rgba(244,253,244,0.96) 0%, rgba(255,255,255,0.85) 55%, rgba(233,250,238,0.78) 100%)",
      glow: "radial-gradient(circle at 85% 70%, rgba(112,221,148,0.45), transparent 60%)",
      icon: "from-lime-500 via-emerald-500 to-teal-500",
      detailBg: "from-emerald-500/15 via-lime-200/30 to-transparent",
    },
  },
]

export default function Features() {
  return (
    <section
      aria-labelledby="value-propositions"
      className="relative mx-auto max-w-7xl scroll-my-24 px-4"
    >
      <div className="mb-16 space-y-6 text-center">
        <p className="font-mono text-xs uppercase tracking-wider text-amber-400">
          {`// Value Propositions`}
        </p>
        <h2
          id="value-propositions"
          className="text-4xl font-black tracking-tight-cyber text-white md:text-6xl leading-tight"
        >
          Built to fix every pain point smart homes have with bed sensors
        </h2>
        <p className="text-xl text-white/60 leading-relaxed-cyber max-w-3xl mx-auto">
          These are the headline features customers should see the moment they
          land on the site.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {VALUE_PROPS.map((value, index) => {
          const Icon = value.icon
          const gradients = ['amber', 'blue', 'violet', 'amber', 'blue', 'violet'] as const
          return (
            <GlassCard
              key={value.title}
              className="group flex h-full flex-col p-8 transition-all duration-300"
              hover={true}
              gradient={gradients[index % gradients.length]}
            >
              <div className="relative flex h-full flex-col gap-6">
                <div className="flex items-start justify-between gap-6">
                  <div className="flex size-14 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-amber-400 transition-all duration-300 group-hover:bg-amber-500/20 group-hover:border-amber-500/30 group-hover:scale-110">
                    <Icon className="size-7" />
                  </div>
                  <span className="font-mono text-xs uppercase tracking-wider text-white/30">
                    [{String(index + 1).padStart(2, "0")}]
                  </span>
                </div>
                <div className="space-y-4">
                  <p className="font-mono text-xs uppercase tracking-wider text-white/50">
                    + {value.title}
                  </p>
                  <p className="text-2xl font-bold leading-tight text-white">
                    {value.description}
                  </p>
                </div>
                <div className="mt-auto rounded-2xl border border-white/5 bg-white/5 p-4 backdrop-blur-sm">
                  <p className="font-mono text-xs uppercase tracking-wider text-amber-400 mb-2">
                    {`// Why it matters`}
                  </p>
                  <p className="text-sm text-white/70 leading-relaxed-cyber">{value.detail}</p>
                </div>
              </div>
            </GlassCard>
          )
        })}
      </div>
    </section>
  )
}
