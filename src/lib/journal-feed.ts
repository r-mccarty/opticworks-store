import { siteConfig } from "@/app/siteConfig"
import { getPublishedEntries } from "@/content/journal"

const escapeXml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")

/** RSS 2.0 feed of published journal entries (drafts excluded). */
export function buildJournalFeed(): string {
  const journalUrl = `${siteConfig.url}${siteConfig.baseLinks.journal}`
  const items = getPublishedEntries()
    .map((entry) => {
      const url = `${journalUrl}/${entry.slug}`
      return [
        "    <item>",
        `      <title>${escapeXml(entry.title)}</title>`,
        `      <link>${url}</link>`,
        `      <guid isPermaLink="true">${url}</guid>`,
        `      <pubDate>${new Date(`${entry.date}T00:00:00Z`).toUTCString()}</pubDate>`,
        `      <description>${escapeXml(entry.summary)}</description>`,
        "    </item>",
      ].join("\n")
    })
    .join("\n")

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>OpticWorks development journal</title>
    <link>${journalUrl}</link>
    <atom:link href="${siteConfig.url}${siteConfig.baseLinks.journalFeed}" rel="self" type="application/rss+xml" />
    <description>Progress, validation results and design decisions from OpticWorks development programs.</description>
    <language>en-us</language>
${items}
  </channel>
</rss>
`
}
