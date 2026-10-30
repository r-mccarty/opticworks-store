/**
 * Retired URLs from the previous Presence/CyberShade storefront.
 *
 * No hardware from that catalog shipped with ongoing support obligations, so its product,
 * install-guide and support pages answer 410 Gone (see src/middleware.ts). Pages whose
 * purpose still exists redirect to their replacement (see next.config.ts).
 */

export const GONE_PATHS = [
  "/products/ow-1-dev-kit",
  "/install-guides",
  "/support/faq",
  "/support/warranty",
  "/support/compatibility",
  "/support/legal/tinting-laws",
] as const

/** Prefixes whose entire subtree is gone. */
const GONE_PREFIXES = ["/install-guides/"] as const

export function isGonePath(pathname: string): boolean {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname
  return (
    (GONE_PATHS as readonly string[]).includes(path) || GONE_PREFIXES.some((prefix) => path.startsWith(prefix))
  )
}

export interface LegacyRedirect {
  source: string
  destination: string
  permanent: boolean
}

export const LEGACY_REDIRECTS: LegacyRedirect[] = [
  { source: "/support/contact", destination: "/contact", permanent: true },
  { source: "/support/orders", destination: "/support", permanent: true },
  { source: "/support/billing", destination: "/support", permanent: true },
  { source: "/support/legal", destination: "/support", permanent: true },
  // Temporary until the legal review (#126) moves the documents to /legal/*.
  { source: "/legal/privacy", destination: "/support/legal/privacy", permanent: false },
  { source: "/legal/terms", destination: "/support/legal/terms", permanent: false },
]

export function goneResponseHtml(siteUrl: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Page retired · OpticWorks</title>
<style>
  body{margin:0;min-height:100vh;display:flex;align-items:center;background:#0f0e0d;color:#ece8e1;font:16px/1.6 ui-sans-serif,system-ui,-apple-system,sans-serif}
  main{max-width:36rem;padding:3rem 1.5rem}
  p.label{font:12px ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.14em;text-transform:uppercase;color:#8f8a82}
  h1{font-weight:300;font-size:2.25rem;line-height:1.15;margin:.5rem 0 1rem}
  a{color:#f0a64a}
</style>
</head>
<body>
<main>
<p class="label">410 · Gone</p>
<h1>This page has been retired.</h1>
<p>It belonged to a previous OpticWorks product line that is no longer offered. Questions about a past order can go to <a href="mailto:support@optic.works">support@optic.works</a>.</p>
<p><a href="${siteUrl}/">Visit the current OpticWorks site →</a></p>
</main>
</body>
</html>
`
}
