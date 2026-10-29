import { describe, expect, it } from "vitest"

import sitemap from "@/app/sitemap"
import { LEGACY_REDIRECTS, isGonePath } from "@/lib/legacy-routes"

describe("isGonePath", () => {
  it.each([
    "/products/ow-1-dev-kit",
    "/products/ow-1-dev-kit/",
    "/install-guides",
    "/install-guides/presence-duo-pack",
    "/install-guides/cybershade-irx-tesla-model-y",
    "/support/faq",
    "/support/warranty",
    "/support/compatibility",
    "/support/legal/tinting-laws",
  ])("retires %s", (path) => {
    expect(isGonePath(path)).toBe(true)
  })

  it.each(["/", "/products", "/products/vmc", "/products/mach-1", "/support", "/support/legal/privacy", "/install"])(
    "keeps %s",
    (path) => {
      expect(isGonePath(path)).toBe(false)
    },
  )
})

describe("legacy redirects", () => {
  it("never point at a retired page", () => {
    for (const redirect of LEGACY_REDIRECTS) expect(isGonePath(redirect.destination)).toBe(false)
  })

  it("keep legal redirects temporary until the legal review", () => {
    const legal = LEGACY_REDIRECTS.filter((redirect) => redirect.source.startsWith("/legal/"))
    expect(legal).toHaveLength(2)
    expect(legal.every((redirect) => !redirect.permanent)).toBe(true)
  })

  it("are not listed in the sitemap, and neither are retired pages", () => {
    const paths = sitemap().map((entry) => new URL(entry.url).pathname)
    for (const path of paths) {
      expect(isGonePath(path)).toBe(false)
      expect(LEGACY_REDIRECTS.some((redirect) => redirect.source === path)).toBe(false)
    }
  })
})
