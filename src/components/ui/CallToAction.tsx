import Link from "next/link"
import { Button } from "../Button"

export function CallToAction() {
  return (
    <section aria-labelledby="cta-title" className="mx-auto max-w-6xl text-white">
      <div className="grid items-center gap-10 rounded-3xl glass-panel border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-black p-10 shadow-[0_25px_120px_rgba(0,0,0,0.5)] lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="mono-meta text-sm uppercase tracking-[0.25em] text-white/60 sm:tracking-[0.35em]">
            Ready for dependable automations?
          </p>
          <h2
            id="cta-title"
            className="mt-4 text-3xl font-black tracking-[-0.02em] text-balance text-white md:text-4xl"
          >
            Get the Bed Presence Sensor and finally trust your bedtime routines.
          </h2>
          <p className="mt-4 text-lg text-white/70">
            Primary CTA: <strong>Get Yours Today</strong>. Secondary:{" "}
            <strong>View Documentation</strong>. Tertiary:{" "}
            <strong>Read the Technical Architecture</strong>.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button asChild className="text-md pill-button bg-orange-500/90 hover:bg-orange-500 font-semibold mono-meta">
              <Link href="/store">Get Yours Today</Link>
            </Button>
            <Button
              asChild
              className="text-md pill-button border-white/30 bg-transparent text-white hover:bg-white/10 font-semibold mono-meta"
              variant="secondary"
            >
              <Link href="https://github.com">View Documentation</Link>
            </Button>
            <Button
              asChild
              className="text-md pill-button border-white/30 bg-transparent text-white hover:bg-white/10 font-semibold mono-meta"
              variant="secondary"
            >
              <Link href="/docs">Read Architecture</Link>
            </Button>
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/80 glass-panel">
          <p className="mono-meta text-xs uppercase tracking-[0.2em] text-white/60 sm:tracking-[0.35em]">
            What you get
          </p>
          <ul className="mt-5 space-y-4">
            <li className="flex items-start gap-3">
              <span className="mt-1 inline-flex size-6 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-300 glass-panel">
                •
              </span>
              <p>
                Complete mmWave sensor kit with tuned firmware and printed
                enclosure.
              </p>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 inline-flex size-6 items-center justify-center rounded-full bg-sky-400/20 text-sky-300 glass-panel">
                •
              </span>
              <p>
                Live Home Assistant dashboard with tunable parameters and debug
                text sensor.
              </p>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 inline-flex size-6 items-center justify-center rounded-full bg-amber-400/20 text-amber-200 glass-panel">
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
