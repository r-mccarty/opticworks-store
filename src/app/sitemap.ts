import type { MetadataRoute } from "next"

import { siteConfig } from "@/app/siteConfig"
import { getPublishedEntries } from "@/content/journal"
import { programs } from "@/content/programs"

/** Public company pages only: no legacy store/account routes, retired pages or journal drafts. */
export default function sitemap(): MetadataRoute.Sitemap {
  const { baseLinks, url } = siteConfig
  const staticPaths = [
    baseLinks.home,
    baseLinks.products,
    baseLinks.platform,
    baseLinks.technology,
    baseLinks.journal,
    baseLinks.about,
    baseLinks.contact,
    baseLinks.support,
    baseLinks.privacy,
    baseLinks.terms,
  ]

  return [
    ...staticPaths.map((path) => ({ url: `${url}${path === "/" ? "" : path}` })),
    ...programs.map((program) => ({ url: `${url}/products/${program.slug}` })),
    ...getPublishedEntries().map((entry) => ({ url: `${url}/journal/${entry.slug}`, lastModified: entry.date })),
  ]
}
