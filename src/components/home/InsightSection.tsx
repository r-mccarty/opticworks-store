import { Sparkles } from "lucide-react"

const insights = [
  {
    title: "Decision inspector",
    description: "Watch the state machine change in real-time with z-scores, timers, and baseline adjustments visualised in the browser.",
  },
  {
    title: "Configuration snapshots",
    description: "Version every tuning change, diff presets, and roll back instantly from your Hetzner control plane.",
  },
  {
    title: "Worker telemetry",
    description: "Cloudflare Workers expose streaming events, WebSocket bridges, and structured logs for observability pipelines.",
  },
]

export function InsightSection() {
  return (
    <section className="mx-auto max-w-6xl py-24">
      <div className="rounded-[2.75rem] border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-slate-100 p-12 shadow-[0_40px_140px_-80px_rgba(15,23,42,0.45)]">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-lg">
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
              <Sparkles className="h-3.5 w-3.5" />
              observability
            </span>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
              Trust comes from seeing the signal.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-600">
              Instead of hiding decisions behind a binary entity, OpticWorks exposes every layer of the detection pipeline. That makes debugging faster and compliance conversations easier.
            </p>
          </div>
          <ul className="flex-1 space-y-6">
            {insights.map((insight) => (
              <li key={insight.title} className="rounded-3xl border border-slate-200 bg-white/80 p-6">
                <h3 className="text-lg font-semibold text-slate-900">{insight.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{insight.description}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
