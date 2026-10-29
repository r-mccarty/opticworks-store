import type { Metadata } from "next"

import { siteConfig } from "@/app/siteConfig"
import { getPublishedEntries } from "@/content/journal"
import { JournalList } from "@/components/site/journal"
import { PageIntro, Section } from "@/components/site/primitives"

export const metadata: Metadata = {
  title: "Development journal",
  description: "Progress, validation results and design decisions from OpticWorks development programs.",
  alternates: {
    canonical: "./",
    types: { "application/rss+xml": siteConfig.baseLinks.journalFeed },
  },
}

export default function JournalPage() {
  return (
    <main>
      <PageIntro
        label="Development journal"
        title="Real progress, published as it happens."
        lede="Notes from building our machines and instruments: what we tried, what we measured and what we changed. Entries describe work that has actually happened."
      >
        <a href={siteConfig.baseLinks.journalFeed} className="annotation text-amber hover:text-amber-strong">
          RSS feed →
        </a>
      </PageIntro>
      <Section>
        <JournalList entries={getPublishedEntries()} />
      </Section>
    </main>
  )
}
