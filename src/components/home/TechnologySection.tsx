import { technologyLayers } from "@/lib/marketingContent"

export function TechnologySection() {
  return (
    <section className="mx-auto max-w-5xl py-24">
      <div className="text-center">
        <span className="inline-flex items-center rounded-full border border-cyan-200/80 bg-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-cyan-600">
          architecture
        </span>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
          A transparent stack from sensor to automation.
        </h2>
        <p className="mt-3 text-base leading-relaxed text-slate-600">
          OpticWorks coordinates firmware, Workers, and a Hetzner backend into a single sensing platform that you control.
        </p>
      </div>
      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {technologyLayers.map((layer) => (
          <article
            key={layer.name}
            className="h-full rounded-3xl border border-slate-100 bg-white/90 p-8 shadow-[0_20px_80px_-60px_rgba(15,23,42,0.4)]"
          >
            <header className="flex items-baseline justify-between gap-4">
              <h3 className="text-xl font-semibold text-slate-900">{layer.name}</h3>
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                {layer.summary}
              </span>
            </header>
            <p className="mt-4 text-sm leading-relaxed text-slate-600">{layer.detail}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
