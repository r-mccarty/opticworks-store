import Link from "next/link"
import { Button } from "../Button"

export function CallToAction() {
  return (
    <section aria-labelledby="cta-title" className="mx-auto max-w-6xl text-white">
      <div className="grid items-center gap-10 rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 via-black/70 to-black p-10 shadow-[0_30px_120px_rgba(0,0,0,0.55)] lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-5">
          <p className="text-xs uppercase tracking-[0.35em] text-white/50">Ready for dependable automations?</p>
          <h2
            id="cta-title"
            className="text-3xl font-semibold tracking-tight text-balance text-white md:text-4xl"
          >
            Bring xAI-grade clarity to your Home Assistant routines.
          </h2>
          <p className="text-lg text-white/70">
            Ship the Bed Presence Sensor with a landing page that feels as intentional as the hardware. Explore the docs, peek at the architecture, and order a kit when you&apos;re ready.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button asChild className="text-md bg-white text-black hover:bg-white/90">
              <Link href="/store">Get Yours Today</Link>
            </Button>
            <Button
              asChild
              className="text-md border-white/40 bg-transparent text-white hover:border-white/60 hover:bg-white/10"
              variant="secondary"
            >
              <Link href="https://github.com">View Documentation</Link>
            </Button>
            <Button
              asChild
              className="text-md border-white/40 bg-transparent text-white hover:border-white/60 hover:bg-white/10"
              variant="secondary"
            >
              <Link href="/docs">Read Architecture</Link>
            </Button>
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/50 p-6 text-sm text-white/80">
          <p className="text-xs uppercase tracking-[0.25em] text-white/50">What you get</p>
          <ul className="mt-5 space-y-4">
            <li className="flex items-start gap-3">
              <span className="mt-1 inline-flex size-6 items-center justify-center rounded-full bg-white/10 text-emerald-300">
                •
              </span>
              <p>
                Complete mmWave sensor kit with tuned firmware and a Grok-inspired onboarding flow.
              </p>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 inline-flex size-6 items-center justify-center rounded-full bg-white/10 text-sky-300">
                •
              </span>
              <p>
                Live Home Assistant dashboard with tunable parameters and transparent debug text sensors.
              </p>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 inline-flex size-6 items-center justify-center rounded-full bg-white/10 text-amber-200">
                •
              </span>
              <p>
                Documentation and GitHub repo with the full presence engine architecture.
              </p>
            </li>
          </ul>
        </div>
      </div>
    </section>
  )
}

export default CallToAction
