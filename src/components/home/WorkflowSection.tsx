import { workflowSteps } from "@/lib/marketingContent"

export function WorkflowSection() {
  return (
    <section className="mx-auto max-w-5xl py-24">
      <div className="text-center">
        <span className="inline-flex items-center rounded-full border border-indigo-200/80 bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-indigo-600">
          decision pipeline
        </span>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
          From mmWave reading to automations in four steps.
        </h2>
      </div>
      <ol className="mt-12 grid gap-6 md:grid-cols-2">
        {workflowSteps.map((step, index) => (
          <li key={step.title} className="flex h-full flex-col rounded-3xl border border-slate-100 bg-white/90 p-8 shadow-[0_20px_80px_-60px_rgba(15,23,42,0.35)]">
            <div className="flex items-center justify-between text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">
              <span>Step {index + 1}</span>
              <span>{step.duration}</span>
            </div>
            <h3 className="mt-6 text-xl font-semibold text-slate-900">{step.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.description}</p>
            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/60 p-4 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
              {step.outcome}
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
