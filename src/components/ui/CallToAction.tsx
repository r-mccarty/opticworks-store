import Link from "next/link"
import { Button } from "../Button"

export function CallToAction() {
  return (
    <section aria-labelledby="cta-title" className="mx-auto max-w-6xl">
      <div className="grid items-center gap-10 rounded-3xl border border-white/12 bg-white/5 p-10 text-white backdrop-blur-2xl optic-grid optic-glow lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="font-jetbrains text-xs uppercase tracking-[3px] text-amber-300">
            Ready for dependable automations?
          </p>
          <h2
            id="cta-title"
            className="mt-4 text-4xl font-black tracking-[-0.03em] text-balance text-white md:text-5xl"
          >
            Get the Bed Presence Sensor and finally trust your bedtime routines.
          </h2>
          <p className="mt-4 text-lg text-zinc-300">
            Primary CTA: <strong>Get Yours Today</strong>. Secondary: <strong>View Documentation</strong>. Tertiary: <strong>Read the Technical Architecture</strong>.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button asChild className="text-md rounded-full border border-amber-400/70 bg-white/10 px-6 py-3 font-semibold text-white backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-amber-300 hover:bg-white/15">
              <Link href="/store">Get Yours Today</Link>
            </Button>
            <Button
              asChild
              className="text-md rounded-full border border-white/30 bg-transparent px-6 py-3 text-white backdrop-blur hover:-translate-y-0.5 hover:bg-white/10"
              variant="secondary"
            >
              <Link href="https://github.com">View Documentation</Link>
            </Button>
            <Button
              asChild
              className="text-md rounded-full border border-white/30 bg-transparent px-6 py-3 text-white backdrop-blur hover:-translate-y-0.5 hover:bg-white/10"
              variant="secondary"
            >
              <Link href="/docs">Read Architecture</Link>
            </Button>
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/40 p-6 text-sm text-zinc-200">
          <p className="font-jetbrains text-[12px] uppercase tracking-[3px] text-amber-200">
            What you get
          </p>
          <ul className="mt-5 space-y-4 text-zinc-200">
            <li className="flex items-start gap-3">
              <span className="mt-1 inline-flex size-5 items-center justify-center rounded-full bg-emerald-400/20 text-emerald-300 ring-1 ring-emerald-300/40">
                •
              </span>
              <p>
                Complete mmWave sensor kit with tuned firmware and printed
                enclosure.
              </p>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 inline-flex size-5 items-center justify-center rounded-full bg-sky-400/20 text-sky-300 ring-1 ring-sky-300/40">
                •
              </span>
              <p>
                Live Home Assistant dashboard with tunable parameters and debug
                text sensor.
              </p>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 inline-flex size-5 items-center justify-center rounded-full bg-amber-400/20 text-amber-200 ring-1 ring-amber-300/40">
                •
              </span>
              <p>
                Documentation and GitHub repo with the full presence engine
                architecture.
              </p>
            </li>
          </ul>
        </div>
      </div>
    </section>
  )
}

export default CallToAction
