import { PageHeader } from "@/components/shared/PageHeader"
import { technologyLayers, workflowSteps } from "@/lib/marketingContent"

const stateMachine = [
  {
    state: 'IDLE',
    description: 'Sensor monitors baseline energy, waiting for significant deviation.',
  },
  {
    state: 'DEBOUNCING_ON',
    description: 'mmWave energy crosses threshold and must remain elevated for the configured on-delay.',
  },
  {
    state: 'PRESENT',
    description: 'Presence confirmed. Absolute clear delay engages to protect sleepers who stay still.',
  },
  {
    state: 'DEBOUNCING_OFF',
    description: 'Energy returns toward baseline. Off-delay must elapse before clearing the bed.',
  },
]

export default function HowItWorksPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-16 px-4 pb-24 pt-28 sm:px-6 lg:px-8">
      <PageHeader
        eyebrow="how it works"
        title="Inside the OpticWorks presence engine"
        description="We orchestrate firmware, analytics, and automation endpoints so you can understand exactly why the system made each decision."
      />
      <section className="grid gap-8 lg:grid-cols-[2fr,3fr]">
        <div className="rounded-3xl border border-slate-100 bg-white/90 p-8 shadow-[0_20px_100px_-70px_rgba(15,23,42,0.4)]">
          <h2 className="text-xl font-semibold text-slate-900">System overview</h2>
          <p className="mt-4 text-sm leading-relaxed text-slate-600">
            A Cloudflare Worker acts as the backend-for-frontend, mediating between the ESPHome firmware and the Hetzner backend. The Worker exposes APIs for telemetry, configuration updates, and OTA firmware bundles while persisting state in Workers KV and Durable Objects.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-slate-600">
            The Hetzner node hosts MQTT, PostgreSQL, and an observability stack so you can retain long-term history without introducing cloud dependencies into your automations.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          {technologyLayers.map((layer) => (
            <article key={layer.name} className="rounded-3xl border border-slate-100 bg-slate-50/80 p-6">
              <h3 className="text-lg font-semibold text-slate-900">{layer.name}</h3>
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">{layer.summary}</p>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{layer.detail}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="rounded-[2.5rem] border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-slate-50 p-10">
        <h2 className="text-xl font-semibold text-slate-900">State machine</h2>
        <p className="mt-2 text-sm text-slate-600">
          The four-state engine guarantees consistent presence detection by separating confirmation, sustainment, and clearing logic.
        </p>
        <ol className="mt-8 grid gap-4 sm:grid-cols-2">
          {stateMachine.map((state) => (
            <li key={state.state} className="rounded-2xl border border-white/60 bg-white/80 p-5">
              <div className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-500">{state.state}</div>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{state.description}</p>
            </li>
          ))}
        </ol>
      </section>
      <section className="grid gap-6 lg:grid-cols-[3fr,2fr]">
        <div className="rounded-3xl border border-slate-100 bg-white/90 p-8 shadow-[0_30px_120px_-80px_rgba(15,23,42,0.35)]">
          <h2 className="text-xl font-semibold text-slate-900">Workflow timeline</h2>
          <p className="mt-2 text-sm text-slate-600">
            Presence flows through a deterministic pipeline. Tweak each stage from the Hetzner control plane or the Worker API.
          </p>
          <ul className="mt-6 space-y-4">
            {workflowSteps.map((step, index) => (
              <li key={step.title} className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5">
                <div className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                  Step {index + 1} · {step.duration}
                </div>
                <h3 className="mt-2 text-lg font-semibold text-slate-900">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.description}</p>
                <p className="mt-3 text-xs font-semibold uppercase tracking-[0.3em] text-indigo-500">Outcome: {step.outcome}</p>
              </li>
            ))}
          </ul>
        </div>
        <aside className="flex flex-col gap-4 rounded-3xl border border-slate-100 bg-slate-900 p-8 text-white">
          <h2 className="text-lg font-semibold">Key latencies</h2>
          <dl className="mt-4 space-y-4 text-sm text-white/80">
            <div>
              <dt className="uppercase tracking-[0.3em] text-xs text-white/60">Sensor to Worker</dt>
              <dd className="mt-1 font-semibold text-white">&lt; 35ms over local WiFi</dd>
            </div>
            <div>
              <dt className="uppercase tracking-[0.3em] text-xs text-white/60">Worker to Hetzner</dt>
              <dd className="mt-1 font-semibold text-white">&lt; 50ms via durable object routing</dd>
            </div>
            <div>
              <dt className="uppercase tracking-[0.3em] text-xs text-white/60">Hetzner to Home Assistant</dt>
              <dd className="mt-1 font-semibold text-white">WebSocket push in &lt; 20ms</dd>
            </div>
          </dl>
          <p className="mt-auto text-xs text-white/60">
            Tunables are stored as versioned snapshots. Roll back instantly if a new preset over-corrects your environment.
          </p>
        </aside>
      </section>
    </div>
  )
}
