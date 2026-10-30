import { buildJournalFeed } from "@/lib/journal-feed"

export const dynamic = "force-static"

export function GET() {
  return new Response(buildJournalFeed(), {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  })
}
