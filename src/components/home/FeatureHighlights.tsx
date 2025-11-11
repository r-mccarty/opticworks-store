import { featureHighlights } from "@/lib/marketingContent"

const accentMap: Record<string, string> = {
  reliability: "from-emerald-500/10 to-emerald-100/10 text-emerald-600",
  privacy: "from-slate-900/10 to-slate-900/5 text-slate-900",
  transparency: "from-sky-500/10 to-sky-100/10 text-sky-600",
  integration: "from-indigo-500/10 to-indigo-100/10 text-indigo-600",
  hardware: "from-amber-500/10 to-amber-100/10 text-amber-600",
  software: "from-purple-500/10 to-purple-100/10 text-purple-600",
}

export function FeatureHighlights() {
  return (
    <section className="mx-auto max-w-6xl py-24">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
            platform pillars
          </span>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
            Hardware + software engineered to stay in sync.
          </h2>
        </div>
        <p className="max-w-xl text-sm leading-relaxed text-slate-600">
          Each pillar unlocks a different moment in your automations — from the stillness of deep sleep to the transparency auditors expect when deploying in research environments.
        </p>
      </div>
      <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {featureHighlights.map((feature) => (
          <article
            key={feature.title}
            className="h-full rounded-3xl border border-slate-100 bg-white/90 p-6 shadow-[0_20px_80px_-60px_rgba(15,23,42,0.4)]"
          >
            <div
              className={`inline-flex rounded-full bg-gradient-to-r ${accentMap[feature.category]} px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em]`}
            >
              {feature.category}
            </div>
            <h3 className="mt-4 text-xl font-semibold text-slate-900">{feature.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{feature.description}</p>
            {feature.stats ? (
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                {feature.stats}
              </p>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  )
}
