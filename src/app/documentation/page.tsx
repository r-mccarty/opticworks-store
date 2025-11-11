import Link from "next/link"

import { PageHeader } from "@/components/shared/PageHeader"
import { documentationSections } from "@/lib/marketingContent"

const developerDocs = [
  {
    title: 'API endpoints',
    summary: 'Telemetry, configuration, OTA firmware, and decision logs exposed through the Worker BFF.',
    link: '/openapi.json',
  },
  {
    title: 'Telemetry schema',
    summary: 'Detailed event payloads for the presence stream, suitable for ingestion by Prometheus or Loki.',
    link: '/docs/API_ARCHITECTURE.md',
  },
  {
    title: 'Deployment runbooks',
    summary: 'Hetzner provisioning and Cloudflare Workers deployment scripts in the monorepo.',
    link: '/docs/INFRASTRUCTURE_HETZNER_CF.md',
  },
]

export default function DocumentationPage() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-16 px-4 pb-24 pt-28 sm:px-6 lg:px-8">
      <PageHeader
        eyebrow="documentation"
        title="Everything you need to build, deploy, and maintain"
        description="Technical references, API docs, and troubleshooting guides for the OpticWorks sensing stack."
      />
      <section className="grid gap-6 sm:grid-cols-2">
        {documentationSections.map((section) => (
          <article key={section.title} className="rounded-3xl border border-slate-100 bg-white/90 p-6">
            <div className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">{section.audience}</div>
            <h2 className="mt-2 text-xl font-semibold text-slate-900">{section.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">{section.summary}</p>
            <Link href={section.link} className="mt-5 inline-flex text-sm font-semibold text-indigo-600 underline underline-offset-4">
              View details
            </Link>
          </article>
        ))}
      </section>
      <section className="rounded-3xl border border-slate-200 bg-slate-900 p-8 text-white">
        <h2 className="text-xl font-semibold">Developer assets</h2>
        <ul className="mt-4 space-y-3 text-sm text-white/80">
          {developerDocs.map((doc) => (
            <li key={doc.title}>
              <Link href={doc.link} className="underline decoration-dotted underline-offset-4">
                {doc.title} — {doc.summary}
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <section className="rounded-3xl border border-amber-200 bg-amber-50/70 p-8">
        <h2 className="text-xl font-semibold text-amber-900">Support and troubleshooting</h2>
        <p className="mt-3 text-sm leading-relaxed text-amber-900">
          Our troubleshooting library covers radar placement, interference mitigation, firmware recovery, and integration with Home Assistant.
        </p>
        <Link href="/docs/migration-plan.md" className="mt-4 inline-flex text-sm font-semibold text-amber-800 underline underline-offset-4">
          Read the migration playbook
        </Link>
      </section>
    </div>
  )
}
