import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { claimStatusLabels, getProgram, programs, type ClaimStatus } from "@/content/programs"
import { ArrowLink, ClaimStatusTag, Container, Section, SectionHeading, StagePill } from "@/components/site/primitives"
import { ProgramFigure } from "@/components/site/programs"

export function generateStaticParams() {
  return programs.map((program) => ({ slug: program.slug }))
}

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const program = getProgram((await params).slug)
  if (!program) return {}
  return {
    title: program.name,
    description: program.summary,
    openGraph: { title: `${program.name} · OpticWorks`, description: program.summary },
  }
}

const statusDefinitions: Record<ClaimStatus, string> = {
  validated: "Demonstrated on hardware and approved for publication.",
  "in-development": "Being built or tested now; not yet demonstrated.",
  objective: "An intended property of the product; not yet built or tested.",
  vision: "Long-term direction beyond the current program.",
}

export default async function ProgramPage({ params }: Props) {
  const program = getProgram((await params).slug)
  if (!program) notFound()

  const usedStatuses = (Object.keys(claimStatusLabels) as ClaimStatus[]).filter((status) =>
    program.capabilities.some((capability) => capability.status === status),
  )

  return (
    <main>
      <section aria-labelledby="page-title" className="relative overflow-hidden">
        <div
          aria-hidden
          className="registration-grid absolute inset-0 opacity-40 [mask-image:linear-gradient(to_bottom,black,transparent)]"
        />
        <Container className="relative grid gap-12 pb-16 pt-20 sm:pt-28 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-6">
            <p className="annotation">{program.category}</p>
            <h1 id="page-title" className="mt-6 text-5xl font-light tracking-tight text-text sm:text-6xl">
              {program.name}
            </h1>
            <p className="mt-4 text-xl text-text">{program.tagline}</p>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-text-muted">{program.summary}</p>
            <div className="mt-8 rounded-sm border border-line bg-surface/50 p-5">
              <StagePill stage={program.stage} />
              <p className="mt-3 text-sm leading-relaxed text-text-muted">{program.statusNote}</p>
            </div>
          </div>
          <div className="lg:col-span-6">
            {program.media[0] && <ProgramFigure media={program.media[0]} />}
          </div>
        </Container>
      </section>

      {program.sections.map((section, i) => (
        <Section key={section.heading}>
          <SectionHeading
            index={String(i + 1).padStart(2, "0")}
            label="Overview"
            title={section.heading}
            lede={
              <div className="space-y-5">
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            }
          />
        </Section>
      ))}

      <Section labelledBy="capabilities-title">
        <SectionHeading
          id="capabilities-title"
          index={String(program.sections.length + 1).padStart(2, "0")}
          label="Capabilities"
          title="What we are building, and how far along it is."
        />
        <div className="mt-12 lg:ml-[25%] lg:pl-2">
          <ul className="divide-y divide-line border-y border-line">
            {program.capabilities.map((capability) => (
              <li key={capability.title} className="grid gap-3 py-6 sm:grid-cols-[1fr_auto] sm:gap-8">
                <div>
                  <h3 className="text-lg text-text">{capability.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-text-muted">{capability.description}</p>
                </div>
                <div className="sm:pt-1">
                  <ClaimStatusTag status={capability.status} />
                </div>
              </li>
            ))}
          </ul>
          <dl className="mt-8 grid gap-4 text-sm sm:grid-cols-2">
            {usedStatuses.map((status) => (
              <div key={status}>
                <dt>
                  <ClaimStatusTag status={status} />
                </dt>
                <dd className="mt-2 text-text-subtle">{statusDefinitions[status]}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Section>

      <Section>
        <div className="flex flex-col items-start justify-between gap-8 rounded-sm border border-line p-8 sm:flex-row sm:items-center sm:p-10">
          <div>
            <p className="annotation">Follow the program</p>
            <p className="mt-3 max-w-xl text-text-muted">
              Progress, test results and design decisions are published in the development journal.
            </p>
          </div>
          <ArrowLink href={program.cta.href} variant="primary">
            {program.cta.label}
          </ArrowLink>
        </div>
      </Section>
    </main>
  )
}
