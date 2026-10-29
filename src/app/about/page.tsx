import type { Metadata } from "next"

import { siteConfig } from "@/app/siteConfig"
import { areasOfWork, mission } from "@/content/company"
import { ArrowLink, PageIntro, Section, SectionHeading } from "@/components/site/primitives"

export const metadata: Metadata = {
  title: "About",
  description: `${siteConfig.company.name} is a San Diego company developing intelligent instruments for manufacturing, imaging and the physical world.`,
}

export default function AboutPage() {
  const { company, contact } = siteConfig
  return (
    <main>
      <PageIntro label="About" title={mission} />

      <Section labelledBy="what-title">
        <SectionHeading
          id="what-title"
          index="01"
          label="What we do"
          title="Ambitious engineering, within reach."
          lede="Capable machines and instruments tend to demand specialist knowledge, space and budget. We design hardware and software together so that more people can use serious equipment well."
        />
        <ul className="mt-12 divide-y divide-line border-y border-line lg:ml-[25%] lg:pl-2">
          {areasOfWork.map((area) => (
            <li key={area.title} className="py-6">
              <h3 className="text-lg text-text">{area.title}</h3>
              <p className="mt-2 max-w-2xl leading-relaxed text-text-muted">{area.description}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section labelledBy="company-title">
        <SectionHeading id="company-title" index="02" label="Company" title={company.name} />
        <div className="mt-10 grid gap-10 sm:grid-cols-2 lg:ml-[25%] lg:pl-2">
          <div>
            <h3 className="annotation">Address</h3>
            <address className="mt-3 not-italic leading-relaxed text-text-muted">
              {company.addressLines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </address>
          </div>
          <div>
            <h3 className="annotation">Email</h3>
            <a href={`mailto:${contact.email}`} className="mt-3 inline-block text-text-muted hover:text-amber">
              {contact.email}
            </a>
          </div>
        </div>
        <div className="mt-10 lg:ml-[25%] lg:pl-2">
          <ArrowLink href="/journal">Follow development</ArrowLink>
        </div>
      </Section>
    </main>
  )
}
