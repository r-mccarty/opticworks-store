import { PageHeader } from "@/components/shared/PageHeader"
import { featureHighlights } from "@/lib/marketingContent"

const featureCollections = [
  {
    name: 'Reliability stack',
    items: [
      'Per-device baselines tuned via Z-score and MAD analytics',
      'Independent on/off debounce with configurable buffers',
      'Absolute clear delay to protect against still sleepers',
    ],
  },
  {
    name: 'Privacy + security',
    items: [
      'Local-only processing with encrypted OTA channels',
      'Cloudflare Worker BFF authenticates every configuration change',
      'Hetzner node hardened with WireGuard and fail2ban presets',
    ],
  },
  {
    name: 'Transparency',
    items: [
      'Decision inspector with z-score graphs and timers',
      'Structured logs shipped to Loki + Grafana dashboard',
      'Versioned configuration snapshots with diff previews',
    ],
  },
]

export default function FeaturesPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-16 px-4 pb-24 pt-28 sm:px-6 lg:px-8">
      <PageHeader
        eyebrow="features"
        title="Designed for presence-critical automations"
        description="OpticWorks pairs dependable hardware with transparent software so you can build automations that never guess."
      />
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {featureHighlights.map((feature) => (
          <article key={feature.title} className="rounded-3xl border border-slate-100 bg-white/90 p-6 shadow-[0_20px_80px_-60px_rgba(15,23,42,0.35)]">
            <div className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">{feature.category}</div>
            <h2 className="mt-3 text-xl font-semibold text-slate-900">{feature.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{feature.description}</p>
            {feature.stats ? (
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">{feature.stats}</p>
            ) : null}
          </article>
        ))}
      </section>
      <section className="rounded-[2.5rem] border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-slate-100 p-10">
        <h2 className="text-xl font-semibold text-slate-900">Platform collections</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {featureCollections.map((collection) => (
            <div key={collection.name} className="rounded-3xl border border-white/70 bg-white/80 p-6">
              <h3 className="text-lg font-semibold text-slate-900">{collection.name}</h3>
              <ul className="mt-4 space-y-3 text-sm text-slate-600">
                {collection.items.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-slate-900" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-100 bg-white/90 p-8">
          <h2 className="text-xl font-semibold text-slate-900">Hardware stack</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            Built on the LD2410 mmWave radar and ESP32 platform. Every device ships with OTA-ready firmware and a printed mounting template for bed frames or headboards.
          </p>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            <li>• Adjustable field-of-view masks</li>
            <li>• Dedicated power filtering to suppress noise</li>
            <li>• I2C expansion header for auxiliary sensors</li>
          </ul>
        </div>
        <div className="rounded-3xl border border-slate-100 bg-slate-900 p-8 text-white">
          <h2 className="text-xl font-semibold">Software stack</h2>
          <p className="mt-3 text-sm leading-relaxed text-white/80">
            ESPHome handles the firmware layer, while the Worker BFF exposes REST, WebSocket, and MQTT endpoints. A Hetzner hosted API packages Grafana dashboards, Prometheus exporters, and OTA storage.
          </p>
          <ul className="mt-4 space-y-3 text-sm text-white/80">
            <li>• OTA firmware orchestrated via Workers KV</li>
            <li>• Durable Objects maintain per-device context</li>
            <li>• Postgres stores long-term telemetry and configuration history</li>
          </ul>
        </div>
      </section>
    </div>
  )
}
