import Link from "next/link"

export function CallToActionSection() {
  return (
    <section className="mx-auto max-w-5xl rounded-[2.5rem] border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-950 to-black px-10 py-16 text-white shadow-[0_40px_120px_-60px_rgba(15,23,42,0.7)]">
      <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-xl">
          <span className="inline-flex items-center rounded-full border border-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
            ready to deploy
          </span>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-balance">
            Automations that respect sleep, privacy, and observability.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-white/70">
            Follow the getting started guide to assemble your sensor, deploy the Hetzner backend, and connect the Cloudflare Worker BFF. The entire stack is open source and production ready.
          </p>
        </div>
        <div className="flex flex-col gap-4 lg:text-right">
          <Link
            href="/getting-started"
            className="inline-flex items-center justify-center rounded-full bg-white px-8 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-slate-900 shadow-lg shadow-white/25 transition hover:bg-slate-100"
          >
            Read the build guide
          </Link>
          <Link
            href="/community"
            className="inline-flex items-center justify-center rounded-full border border-white/30 px-8 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-white/10"
          >
            Join the community
          </Link>
        </div>
      </div>
    </section>
  )
}
