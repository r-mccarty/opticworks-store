import Link from "next/link"

import { siteConfig } from "@/app/siteConfig"

interface ServiceUnavailableProps {
  title: string
  description: string
}

/**
 * Shown on legacy store, account and order routes while commerce is offline.
 * See src/lib/commerce.ts.
 */
export function ServiceUnavailable({ title, description }: ServiceUnavailableProps) {
  const { email } = siteConfig.contact

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 pt-28 pb-20 text-foreground">
      <div className="w-full max-w-xl rounded-xl border border-border bg-card p-8 text-center shadow-elevation-1 sm:p-10">
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">
          Temporarily unavailable
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-4 text-muted-foreground">{description}</p>
        <p className="mt-4 text-muted-foreground">
          For questions about an existing order or device, email{" "}
          <a href={`mailto:${email}`} className="font-medium text-foreground underline underline-offset-4">
            {email}
          </a>
          .
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href={siteConfig.baseLinks.products}
            className="rounded bg-amber-500 px-5 py-2.5 text-sm font-medium text-black transition-colors hover:bg-amber-400"
          >
            View products
          </Link>
          <Link
            href={siteConfig.baseLinks.home}
            className="rounded border border-white/20 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/5"
          >
            Return home
          </Link>
        </div>
      </div>
    </main>
  )
}
