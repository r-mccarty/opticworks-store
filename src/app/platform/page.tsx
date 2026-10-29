import type { Metadata } from "next"

import { platformPillars } from "@/content/company"
import { ArrowLink, PageIntro, Section, SectionHeading } from "@/components/site/primitives"
import { PlatformLayers } from "@/components/site/visuals"

export const metadata: Metadata = {
  title: "Platform",
  description:
    "The OpticWorks software platform: one environment for machine control, sensing, automation and AI-native workflows across our hardware. In development.",
}

export default function PlatformPage() {
  return (
    <main>
      <PageIntro
        label="Platform"
        title="One software environment across every machine."
        lede="Complex machines are hard to use because control, measurement and automation usually live in separate tools. We are building them as one system, shared by everything we make."
      >
        <p className="annotation">Status: in development. Not yet available.</p>
      </PageIntro>

      <Section labelledBy="layers-title">
        <div className="grid items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHeadingInline />
          </div>
          <div className="aspect-[3/2] lg:col-span-7">
            <PlatformLayers />
          </div>
        </div>
      </Section>

      <Section labelledBy="pillars-title">
        <SectionHeading
          id="pillars-title"
          index="02"
          label="Foundations"
          title="Four parts of one system."
        />
        <ol className="mt-12 grid gap-px overflow-hidden rounded-sm border border-line bg-line sm:grid-cols-2">
          {platformPillars.map((pillar, i) => (
            <li key={pillar.title} className="bg-ink p-8">
              <span className="font-mono text-xs text-amber">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-4 text-xl text-text">{pillar.title}</h3>
              <p className="mt-3 leading-relaxed text-text-muted">{pillar.description}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section>
        <SectionHeading
          index="03"
          label="First applications"
          title="Built alongside the hardware."
          lede="The platform is being developed together with the compact VMC, and the sensing and image-processing work from the Mach 1 program feeds into it. Details will be published in the journal as they are demonstrated."
        />
        <div className="mt-10 flex flex-wrap gap-3 lg:ml-[25%] lg:pl-2">
          <ArrowLink href="/products/vmc" variant="secondary">
            Compact VMC
          </ArrowLink>
          <ArrowLink href="/products/mach-1" variant="secondary">
            Mach 1
          </ArrowLink>
        </div>
      </Section>
    </main>
  )
}

function SectionHeadingInline() {
  return (
    <div>
      <p className="annotation flex items-center gap-3">
        <span className="text-amber">01</span>
        <span aria-hidden className="h-px w-6 bg-line-strong" />
        Architecture
      </p>
      <h2 id="layers-title" className="mt-6 text-balance text-3xl font-light tracking-tight text-text sm:text-4xl">
        Machines, sensing and software, registered to one another.
      </h2>
      <p className="mt-6 leading-relaxed text-text-muted">
        Each layer is designed with the others in mind. Software understands the machine because the machine was
        designed to be measured, and sensing is useful because the software knows what to do with it.
      </p>
    </div>
  )
}
