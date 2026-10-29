import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { getPublishedEntries, getPublishedEntry } from "@/content/journal"
import { formatJournalDate } from "@/components/site/journal"
import { ArrowLink, Container } from "@/components/site/primitives"

export function generateStaticParams() {
  return getPublishedEntries().map((entry) => ({ slug: entry.slug }))
}

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const entry = getPublishedEntry((await params).slug)
  if (!entry) return {}
  return {
    title: entry.title,
    description: entry.summary,
    openGraph: { type: "article", title: entry.title, description: entry.summary, publishedTime: entry.date },
  }
}

export default async function JournalEntryPage({ params }: Props) {
  const entry = getPublishedEntry((await params).slug)
  if (!entry) notFound()

  return (
    <main>
      <Container className="max-w-3xl pb-24 pt-20 sm:pt-28">
        <article>
          <p className="annotation">
            <time dateTime={entry.date}>{formatJournalDate(entry.date)}</time>
          </p>
          <h1 className="mt-6 text-balance text-4xl font-light tracking-tight text-text sm:text-5xl">{entry.title}</h1>
          <p className="mt-6 text-lg leading-relaxed text-text-muted">{entry.summary}</p>
          <div className="prose-ow mt-12 border-t border-line pt-12">
            {entry.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </article>
        <div className="mt-16">
          <ArrowLink href="/journal">All journal entries</ArrowLink>
        </div>
      </Container>
    </main>
  )
}
