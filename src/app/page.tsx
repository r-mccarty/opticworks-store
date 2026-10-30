import Link from "next/link"

import { siteConfig } from "@/app/siteConfig"
import { mission, platformPillars, principles } from "@/content/company"
import { getPublishedEntries } from "@/content/journal"
import { programs } from "@/content/programs"
import { JournalList } from "@/components/site/journal"
import { ArrowLink, Container, Section, SectionHeading } from "@/components/site/primitives"
import { ProgramFeature } from "@/components/site/programs"
import { PlatformLayers, SuperpositionField } from "@/components/site/visuals"

export default function HomePage() {
  const entries = getPublishedEntries().slice(0, 3)
  const [vmc, mach1] = programs

  return (
    <main>
      {/* 1 — Hero */}
      <section aria-labelledby="hero-title" className="relative overflow-hidden">
        <div aria-hidden className="registration-grid absolute inset-0 opacity-50 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
        <Container className="relative grid min-h-[calc(100svh-4rem)] items-center gap-12 py-16 lg:grid-cols-12 lg:py-24">
          <div className="lg:col-span-6">
            <p className="annotation">{siteConfig.company.name} · San Diego</p>
            <h1
              id="hero-title"
              className="mt-8 text-balance font-cta text-[2.75rem] font-normal uppercase leading-[1.05] tracking-tight text-text sm:text-6xl lg:text-7xl"
            >
              Expand what you can perceive.{" "}
              <span className="text-amber">And what you can make.</span>
            </h1>
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-text-muted">
              OpticWorks develops intelligent instruments for manufacturing, imaging, and the physical world.
              Advanced hardware and software designed to bring ambitious engineering within reach.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <ArrowLink href="/products" variant="primary">
                Explore our work
              </ArrowLink>
              <ArrowLink href="/journal" variant="secondary">
                Follow development
              </ArrowLink>
            </div>
          </div>
          <div className="relative mx-auto aspect-square w-full max-w-xl lg:col-span-6">
            <SuperpositionField />
          </div>
        </Container>
      </section>

      {/* 2 — Featured: Compact VMC */}
      <Section labelledBy="feature-vmc">
        <span id="feature-vmc" className="sr-only">
          Featured program: {vmc.name}
        </span>
        <ProgramFeature program={vmc} index="01" />
      </Section>

      {/* 3 — Featured: Mach 1 */}
      <Section labelledBy="feature-mach1">
        <span id="feature-mach1" className="sr-only">
          Featured program: {mach1.name}
        </span>
        <ProgramFeature program={mach1} index="02" reverse />
      </Section>

      {/* 4 — One connected platform */}
      <Section labelledBy="platform-title">
        <SectionHeading
          id="platform-title"
          index="03"
          label="Platform"
          title="One connected platform."
          lede="Our machines are designed to share one software environment, connecting control, sensing and automation so that complex equipment becomes easier to set up, understand and run."
        />
        <div className="mt-16 grid items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-6 lg:col-start-4">
            <div className="aspect-[3/2]">
              <PlatformLayers />
            </div>
          </div>
          <ul className="grid gap-px overflow-hidden rounded-sm border border-line bg-line sm:grid-cols-2 lg:col-span-12 lg:grid-cols-4">
            {platformPillars.map((pillar) => (
              <li key={pillar.title} className="bg-ink p-6">
                <h3 className="text-text">{pillar.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-text-muted">{pillar.description}</p>
              </li>
            ))}
          </ul>
        </div>
        <p className="mt-8 text-sm text-text-subtle">
          The platform is in development. <Link href="/platform" className="text-amber hover:text-amber-strong">Read about the direction →</Link>
        </p>
      </Section>

      {/* 5 — Engineering approach */}
      <Section labelledBy="approach-title">
        <SectionHeading
          id="approach-title"
          index="04"
          label="Engineering approach"
          title="Less complexity for the people using the machine."
          lede="Publishing a better specification is not the goal. We want capable equipment to need less specialist knowledge to set up, calibrate and run."
        />
        <ol className="mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {principles.map((principle, i) => (
            <li key={principle.title} className="border-t border-line-strong pt-6">
              <span className="font-mono text-xs text-amber">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-4 text-lg text-text">{principle.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-text-muted">{principle.description}</p>
            </li>
          ))}
        </ol>
      </Section>

      {/* 6 — Development journal */}
      <Section labelledBy="journal-title">
        <SectionHeading
          id="journal-title"
          index="05"
          label="Development journal"
          title="Real progress, published as it happens."
          lede="Prototypes, validation results and design decisions, including the ones that did not work."
        />
        <div className="mt-12 lg:ml-[25%]">
          <JournalList entries={entries} />
          <div className="mt-8">
            <ArrowLink href="/journal">Visit the journal</ArrowLink>
          </div>
        </div>
      </Section>

      {/* 7 — Mission and contact */}
      <Section labelledBy="mission-title">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="annotation flex items-center gap-3">
              <span className="text-amber">06</span>
              <span aria-hidden className="h-px w-6 bg-line-strong" />
              Company
            </p>
            <h2 id="mission-title" className="mt-6 text-balance text-3xl font-light leading-tight tracking-tight sm:text-4xl">
              {mission}
            </h2>
            <div className="mt-8">
              <ArrowLink href="/about">About OpticWorks</ArrowLink>
            </div>
          </div>
          <div className="rounded-sm border border-line p-8 lg:col-span-5">
            <h3 className="annotation">Contact</h3>
            <p className="mt-4 text-text-muted">
              Questions, partnerships or press: email us and a member of the team will reply.
            </p>
            <a
              href={`mailto:${siteConfig.contact.email}`}
              className="mt-6 inline-block text-xl text-text underline decoration-line-strong underline-offset-8 hover:decoration-amber"
            >
              {siteConfig.contact.email}
            </a>
            <address className="mt-8 text-sm not-italic leading-relaxed text-text-subtle">
              {siteConfig.company.name}
              {siteConfig.company.addressLines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </address>
          </div>
        </div>
      </Section>
    </main>
  )
}
