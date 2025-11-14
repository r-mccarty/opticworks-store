import Link from "next/link"
import { Button } from "../Button"

export function CallToAction() {
  return (
    <section aria-labelledby="cta-title" className="mx-auto max-w-6xl">
      <div className="grid items-center gap-10 rounded-3xl border border-white/40 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-10 text-white shadow-[0_25px_120px_rgba(15,23,42,0.45)] lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="text-sm uppercase tracking-[0.4em] text-white/60">
            Ready for dependable automations?
          </p>
          <h2
            id="cta-title"
            className="mt-4 text-3xl font-semibold tracking-tight text-balance text-white md:text-4xl"
          >
            Get the Bed Presence Sensor and finally trust your bedtime routines.
          </h2>
          <p className="mt-4 text-lg text-white/70">
            Primary CTA: <strong>Get Yours Today</strong>. Secondary:{" "}
            <strong>View Documentation</strong>. Tertiary:{" "}
            <strong>Read the Technical Architecture</strong>.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button asChild className="text-md bg-orange-500 hover:bg-orange-400">
              <Link href="/store">Get Yours Today</Link>
            </Button>
            <Button
              asChild
              className="text-md border-white/40 bg-transparent text-white hover:bg-white/10"
              variant="secondary"
            >
              <Link href="https://github.com">View Documentation</Link>
            </Button>
            <Button
              asChild
              className="text-md border-white/40 bg-transparent text-white hover:bg-white/10"
              variant="secondary"
            >
              <Link href="/docs">Read Architecture</Link>
            </Button>
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/80">
          <p className="text-xs uppercase tracking-[0.4em] text-white/60">
            What you get
          </p>
          <ul className="mt-5 space-y-4">
            <li className="flex items-start gap-3">
              <span className="mt-1 inline-flex size-5 items-center justify-center rounded-full bg-emerald-400/20 text-emerald-300">
                •
              </span>
              <p>
                Complete mmWave sensor kit with tuned firmware and printed
                enclosure.
              </p>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 inline-flex size-5 items-center justify-center rounded-full bg-sky-400/20 text-sky-300">
                •
              </span>
              <p>
                Live Home Assistant dashboard with tunable parameters and debug
                text sensor.
              </p>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 inline-flex size-5 items-center justify-center rounded-full bg-amber-400/20 text-amber-200">
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
