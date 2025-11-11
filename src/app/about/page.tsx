import Link from "next/link"

import { PageHeader } from "@/components/shared/PageHeader"

const pillars = [
  {
    title: 'Project philosophy',
    description: 'We build sensors that respect privacy, explain decisions, and run on hardware you own.',
  },
  {
    title: 'Roadmap',
    description: 'Upcoming milestones include multi-bed orchestration, occupancy analytics, and new form factors for caregiving.',
  },
  {
    title: 'Open source license',
    description: 'Released under Apache 2.0 so teams can deploy commercially while contributing improvements upstream.',
  },
]

const team = [
  { name: 'Aria Patel', role: 'Founder & Sensing Architect' },
  { name: 'Mateo Alvarez', role: 'Firmware & OTA Systems' },
  { name: 'June Park', role: 'Cloudflare Workers Lead' },
  { name: 'Iris Chen', role: 'Home Assistant Integrations' },
]

export default function AboutPage() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-16 px-4 pb-24 pt-28 sm:px-6 lg:px-8">
      <PageHeader
        eyebrow="about"
        title="OpticWorks: sensing for homes that care"
        description="We started in automotive tinting. The pivot to sensing keeps the same obsession with craftsmanship — now focused on understanding presence in the spaces that matter most."
      />
      <section className="grid gap-6 md:grid-cols-3">
        {pillars.map((pillar) => (
          <article key={pillar.title} className="rounded-3xl border border-slate-100 bg-white/90 p-6">
            <h2 className="text-lg font-semibold text-slate-900">{pillar.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{pillar.description}</p>
          </article>
        ))}
      </section>
      <section className="rounded-3xl border border-slate-200 bg-slate-900 p-8 text-white">
        <h2 className="text-xl font-semibold">Team</h2>
        <ul className="mt-4 space-y-3 text-sm text-white/80">
          {team.map((member) => (
            <li key={member.name}>
              <span className="font-semibold text-white">{member.name}</span> — {member.role}
            </li>
          ))}
        </ul>
      </section>
      <section className="rounded-3xl border border-emerald-200 bg-emerald-50/80 p-8">
        <h2 className="text-xl font-semibold text-emerald-900">We are hiring contributors</h2>
        <p className="mt-3 text-sm leading-relaxed text-emerald-900">
          OpticWorks collaborates with firmware engineers, data scientists, and integrators. Join the contributor program to help bring transparent sensing to more homes.
        </p>
        <Link href="mailto:team@optic.works" className="mt-4 inline-flex text-sm font-semibold text-emerald-800 underline underline-offset-4">
          Email team@optic.works
        </Link>
      </section>
    </div>
  )
}
