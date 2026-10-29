import { describe, expect, it } from "vitest"

import sitemap from "@/app/sitemap"
import { getPublishedEntries, getPublishedEntry } from "@/content/journal"
import { programs } from "@/content/programs"
import { buildJournalFeed } from "@/lib/journal-feed"

const priceLike = /\$\s?\d|\bUSD\b|\bpre-?order\b|\badd to cart\b|\bships?\b/i

describe("program content", () => {
  it("has unique slugs", () => {
    const slugs = programs.map((program) => program.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it("contains no prices, purchase or shipping claims", () => {
    expect(JSON.stringify(programs)).not.toMatch(priceLike)
  })

  it("does not mark anything validated or for sale yet", () => {
    for (const program of programs) {
      expect(program.stage).not.toBe("available")
      expect(program.commerce).toBeUndefined()
      expect(program.capabilities.every((capability) => capability.status !== "validated")).toBe(true)
    }
  })

  it("labels illustrations as not being photographs or CAD renders", () => {
    for (const media of programs.flatMap((program) => program.media)) {
      if (media.kind === "illustration") expect(media.caption).toMatch(/illustration/i)
    }
  })
})

describe("journal drafts", () => {
  it("are excluded from listings, lookups, the feed and the sitemap", () => {
    const published = getPublishedEntries()
    expect(published.every((entry) => !entry.draft)).toBe(true)

    expect(getPublishedEntry("scoping-the-first-vmc-build")).toBeUndefined()
    expect(buildJournalFeed()).not.toContain("scoping-the-first-vmc-build")
    expect(sitemap().some((entry) => entry.url.includes("/journal/scoping"))).toBe(false)
  })
})
