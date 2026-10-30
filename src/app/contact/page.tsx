import type { Metadata } from "next"

import { siteConfig } from "@/app/siteConfig"
import { PageIntro, Section } from "@/components/site/primitives"

export const metadata: Metadata = {
  title: "Contact",
  description: `Contact ${siteConfig.company.name} by email at ${siteConfig.contact.email}.`,
}

const topics = [
  { title: "General and partnerships", description: "Questions about OpticWorks, our programs or working together." },
  { title: "Press", description: "Media enquiries and requests for information." },
  { title: "Existing orders", description: "Questions about a past order, payment or device. Include your order number if you have it." },
]

export default function ContactPage() {
  const { company, contact } = siteConfig
  return (
    <main>
      <PageIntro
        label="Contact"
        title="Talk to us."
        lede="Email is the best way to reach us. A member of the team reads every message."
      >
        <a
          href={`mailto:${contact.email}`}
          className="text-2xl text-text underline decoration-line-strong underline-offset-8 hover:decoration-amber sm:text-3xl"
        >
          {contact.email}
        </a>
      </PageIntro>

      <Section>
        <div className="grid gap-12 lg:grid-cols-12">
          <ul className="divide-y divide-line border-y border-line lg:col-span-8">
            {topics.map((topic) => (
              <li key={topic.title} className="py-6">
                <h2 className="text-lg text-text">{topic.title}</h2>
                <p className="mt-2 leading-relaxed text-text-muted">{topic.description}</p>
              </li>
            ))}
          </ul>
          <div className="lg:col-span-4">
            <h2 className="annotation">Mailing address</h2>
            <address className="mt-3 not-italic leading-relaxed text-text-muted">
              {company.name}
              {company.addressLines.map((line) => (
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
