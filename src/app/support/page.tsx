import type { Metadata } from "next"
import Link from "next/link"

import { siteConfig } from "@/app/siteConfig"
import { PageIntro, Section } from "@/components/site/primitives"

export const metadata: Metadata = {
  title: "Support",
  description: `Support for OpticWorks customers is provided by email at ${siteConfig.contact.email}.`,
}

export default function SupportPage() {
  const { baseLinks, contact } = siteConfig
  const mail = `mailto:${contact.email}`

  return (
    <main>
      <PageIntro
        label="Support"
        title="Support is by email."
        lede={
          <>
            Our online store and customer accounts are offline while we rebuild them. For anything related to a past
            order, a payment or a device, email{" "}
            <a href={mail} className="text-text underline decoration-line-strong underline-offset-4 hover:decoration-amber">
              {contact.email}
            </a>
            .
          </>
        }
      />

      <Section>
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <h2 className="annotation">When you write to us</h2>
            <ul className="mt-6 divide-y divide-line border-y border-line">
              <li className="py-5 leading-relaxed text-text-muted">
                Include your order number or the email address used for the order, if you have them.
              </li>
              <li className="py-5 leading-relaxed text-text-muted">
                Describe the question or problem, and attach photos if they help.
              </li>
              <li className="py-5 leading-relaxed text-text-muted">
                Don&apos;t send card numbers or passwords by email. We will never ask for them.
              </li>
            </ul>
          </div>
          <div className="lg:col-span-4">
            <h2 className="annotation">Policies</h2>
            <ul className="mt-6 space-y-3">
              <li>
                <Link href={baseLinks.privacy} className="text-text-muted hover:text-amber">
                  Privacy policy
                </Link>
              </li>
              <li>
                <Link href={baseLinks.terms} className="text-text-muted hover:text-amber">
                  Terms of service
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </Section>
    </main>
  )
}
