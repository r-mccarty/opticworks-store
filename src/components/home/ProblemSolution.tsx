import { ShieldCheck, Waves, Activity, Binary } from "lucide-react"

const painPoints = [
  {
    title: "Lights that shut off mid-dream",
    description: "Traditional motion sensors drop to 'clear' the moment the room goes still, breaking sleep-friendly automations.",
    icon: Activity,
  },
  {
    title: "False positives from pets and fans",
    description: "Airflow and pets trigger generic presence sensors, flooding your routines with noise.",
    icon: Waves,
  },
  {
    title: "Opaque black boxes",
    description: "Most sensors hide their reasoning. You get a binary signal with zero insight into why it changed state.",
    icon: Binary,
  },
]

const solutions = [
  {
    title: "4-state verification engine",
    description: "Presence is confirmed only after sustained mmWave activity. Independent on/off debounce timers stop flapping.",
  },
  {
    title: "Statistical intelligence",
    description: "Adaptive baselines understand your specific room, ignoring drift and micro-disturbances without losing sensitivity.",
  },
  {
    title: "Auditable decisions",
    description: "Every transition is logged with raw readings, z-scores, and timers so you can trust the automation chain.",
  },
]

export function ProblemSolution() {
  return (
    <section className="mx-auto grid max-w-5xl gap-12 py-24 md:grid-cols-2">
      <div>
        <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
          why legacy sensors fail
        </span>
        <h2 className="mt-6 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
          Smart homes deserve smarter presence data.
        </h2>
        <p className="mt-4 text-base leading-relaxed text-slate-600">
          We designed the OpticWorks bed presence sensor because motion-based occupancy was never enough. Our hardware and software pair to understand intent, not just movement.
        </p>
        <dl className="mt-10 space-y-6">
          {painPoints.map((point) => (
            <div key={point.title} className="flex gap-4 rounded-3xl border border-slate-200 bg-white/70 p-6 shadow-sm shadow-slate-200/50">
              <div className="mt-1 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white">
                <point.icon className="h-6 w-6" />
              </div>
              <div>
                <dt className="text-lg font-semibold text-slate-900">{point.title}</dt>
                <dd className="mt-2 text-sm text-slate-600">{point.description}</dd>
              </div>
            </div>
          ))}
        </dl>
      </div>
      <div className="rounded-[2.25rem] border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-10 shadow-[0_40px_120px_-60px_rgba(15,23,42,0.2)]">
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
          how opticworks fixes it
        </div>
        <ul className="mt-6 space-y-6">
          {solutions.map((solution) => (
            <li key={solution.title} className="rounded-2xl border border-slate-100 bg-white/80 p-6">
              <h3 className="text-lg font-semibold text-slate-900">{solution.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{solution.description}</p>
            </li>
          ))}
        </ul>
        <div className="mt-8 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 text-emerald-900">
          <ShieldCheck className="h-5 w-5" />
          <p className="text-sm font-medium">
            Verified across multi-week soak tests in 50+ deployments. No phantom clears. No missed sleepers.
          </p>
        </div>
      </div>
    </section>
  )
}
