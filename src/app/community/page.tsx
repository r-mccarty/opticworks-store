import Link from "next/link"

import { PageHeader } from "@/components/shared/PageHeader"
import { communityResources } from "@/lib/marketingContent"

const contributionIdeas = [
  'Publish your automations and dashboards via the showcase.',
  'File firmware issues or feature requests on GitHub.',
  'Host a meetup or livestream in your region and share the replay.',
  'Translate documentation for your local community.',
]

export default function CommunityPage() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-16 px-4 pb-24 pt-28 sm:px-6 lg:px-8">
      <PageHeader
        eyebrow="community"
        title="Build the future of transparent sensing with us"
        description="OpticWorks is open source. Join builders, researchers, and home automation enthusiasts who are shaping the roadmap."
      />
      <section className="space-y-4">
        {communityResources.map((resource) => (
          <article key={resource.title} className="rounded-3xl border border-slate-100 bg-white/90 p-6">
            <div className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">{resource.type}</div>
            <h2 className="mt-2 text-xl font-semibold text-slate-900">{resource.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{resource.description}</p>
            <Link href={resource.link} className="mt-4 inline-flex text-sm font-semibold text-indigo-600 underline underline-offset-4">
              Join now
            </Link>
          </article>
        ))}
      </section>
      <section className="rounded-[2.5rem] border border-slate-200 bg-gradient-to-br from-indigo-50 via-white to-slate-100 p-10">
        <h2 className="text-xl font-semibold text-slate-900">How to contribute</h2>
        <ul className="mt-4 space-y-3 text-sm text-slate-600">
          {contributionIdeas.map((idea) => (
            <li key={idea} className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-indigo-500" />
              <span>{idea}</span>
            </li>
          ))}
        </ul>
      </section>
      <section className="rounded-3xl border border-slate-200 bg-slate-900 p-8 text-white">
        <h2 className="text-xl font-semibold">Code of conduct</h2>
        <p className="mt-3 text-sm leading-relaxed text-white/80">
          We expect respectful collaboration. Review the contributing guide and report any issues to community@optic.works.
        </p>
        <Link href="https://github.com/opticworks/opticworks-sensing/blob/main/CODE_OF_CONDUCT.md" className="mt-4 inline-flex text-sm font-semibold underline decoration-dotted underline-offset-4">
          Read the code of conduct
        </Link>
      </section>
    </div>
  )
}
