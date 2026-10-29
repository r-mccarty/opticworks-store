import Link from "next/link"

import { siteConfig } from "@/app/siteConfig"
import type { JournalEntry } from "@/content/journal"

const programLabels: Record<JournalEntry["program"], string> = {
  vmc: "Compact VMC",
  "mach-1": "Mach 1",
  platform: "Platform",
  company: "Company",
}

export function formatJournalDate(date: string) {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  })
}

export function JournalList({ entries }: { entries: JournalEntry[] }) {
  if (entries.length === 0) {
    return (
      <div className="rounded-sm border border-dashed border-line-strong p-8">
        <p className="annotation">No entries yet</p>
        <p className="mt-4 max-w-xl leading-relaxed text-text-muted">
          The first entries are being written and reviewed. We publish them once the work they
          describe is ready to be shown. Add the{" "}
          <a href={siteConfig.baseLinks.journalFeed} className="text-amber hover:text-amber-strong">
            RSS feed
          </a>{" "}
          to your feed reader to see new entries when they appear.
        </p>
      </div>
    )
  }

  return (
    <ul className="divide-y divide-line border-y border-line">
      {entries.map((entry) => (
        <li key={entry.slug}>
          <Link href={`/journal/${entry.slug}`} className="group grid gap-2 py-6 sm:grid-cols-[10rem_1fr] sm:gap-8">
            <span className="annotation pt-1">
              <time dateTime={entry.date}>{formatJournalDate(entry.date)}</time>
            </span>
            <span>
              <span className="annotation text-amber">{programLabels[entry.program]}</span>
              <span className="mt-2 block text-xl text-text transition-colors group-hover:text-amber-strong">
                {entry.title}
              </span>
              <span className="mt-2 block text-sm leading-relaxed text-text-muted">{entry.summary}</span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
