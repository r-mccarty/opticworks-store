import Link from "next/link"

import { heroContent } from "@/lib/marketingContent"
import { cx } from "@/lib/utils"

const highlightGradient =
  "bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.25),_transparent_60%)]"

export function HomeHero() {
  return (
    <section className="relative isolate overflow-hidden rounded-[2.5rem] border border-white/20 bg-slate-950 px-6 py-24 shadow-[0_40px_120px_-60px_rgba(15,23,42,0.8)] sm:px-12">
      <div className="absolute inset-0 -z-10">
        <div className={cx("absolute inset-0 opacity-80 blur-3xl", highlightGradient)} />
        <div className="absolute inset-x-8 inset-y-10 rounded-[2rem] border border-white/10" />
        <div className="absolute left-1/2 top-8 h-1 w-32 -translate-x-1/2 bg-gradient-to-r from-cyan-400/70 via-sky-500 to-indigo-500/70" />
      </div>
      <div className="mx-auto max-w-5xl text-center text-white">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-slate-200">
          OpticWorks sensing platform
        </div>
        <h1 className="font-barlow mt-6 text-4xl leading-tight tracking-tight text-balance sm:text-5xl md:text-6xl">
          {heroContent.headline}
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-slate-200 sm:text-xl">
          {heroContent.subheadline}
        </p>
        <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            href={heroContent.primaryCta.href}
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-cyan-400 via-sky-500 to-indigo-500 px-8 py-3 text-sm font-semibold uppercase tracking-wide text-slate-950 shadow-lg shadow-cyan-500/25 transition hover:from-cyan-300 hover:via-sky-400 hover:to-indigo-400"
          >
            {heroContent.primaryCta.label}
          </Link>
          <Link
            href={heroContent.secondaryCta.href}
            className="inline-flex items-center justify-center rounded-full border border-white/20 px-8 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:border-white/40 hover:bg-white/10"
          >
            {heroContent.secondaryCta.label}
          </Link>
        </div>
        <div className="mt-12 flex flex-wrap justify-center gap-4 text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
          {heroContent.trustedBy.map((item) => (
            <span key={item} className="rounded-full border border-white/10 px-4 py-2 text-[0.65rem]">
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
