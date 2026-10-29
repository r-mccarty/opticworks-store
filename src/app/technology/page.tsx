import type { Metadata } from "next"

import { areasOfWork, principles } from "@/content/company"
import { ArrowLink, PageIntro, Section, SectionHeading } from "@/components/site/primitives"

export const metadata: Metadata = {
  title: "Technology",
  description:
    "How OpticWorks approaches engineering: precision manufacturing, advanced imaging and intelligent software, designed to reduce complexity for the people using them.",
}

export default function TechnologyPage() {
  return (
    <main>
      <PageIntro
        label="Technology"
        title="Three disciplines, one engineering approach."
        lede="We work across precision mechanics, imaging and software because the hardest usability problems sit at the boundaries between them."
      />

      <Section labelledBy="areas-title">
        <SectionHeading id="areas-title" index="01" label="Areas of work" title="Where we focus." />
        <ul className="mt-12 grid gap-10 lg:grid-cols-3">
          {areasOfWork.map((area) => (
            <li key={area.title} className="flex flex-col border-t border-line-strong pt-6">
              <h3 className="text-xl text-text">{area.title}</h3>
              <p className="mt-3 flex-1 leading-relaxed text-text-muted">{area.description}</p>
              <div className="mt-6">
                <ArrowLink href={area.href}>Learn more</ArrowLink>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <Section labelledBy="principles-title">
        <SectionHeading
          id="principles-title"
          index="02"
          label="Principles"
          title="How we decide what to build."
        />
        <ol className="mt-12 divide-y divide-line border-y border-line lg:ml-[25%] lg:pl-2">
          {principles.map((principle, i) => (
            <li key={principle.title} className="grid gap-3 py-8 sm:grid-cols-[3rem_1fr]">
              <span className="font-mono text-xs text-amber">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <h3 className="text-lg text-text">{principle.title}</h3>
                <p className="mt-2 max-w-2xl leading-relaxed text-text-muted">{principle.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </Section>
    </main>
  )
}
