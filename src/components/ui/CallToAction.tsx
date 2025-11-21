import Link from "next/link"
import { Button } from "../Button"
import { GlassCard } from "./GlassCard"

export function CallToAction() {
  return (
    <section aria-labelledby="cta-title" className="mx-auto max-w-7xl px-4">
      <GlassCard className="grid items-center gap-12 p-12 text-white lg:grid-cols-[1.1fr_0.9fr]" gradient="amber">
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-amber-400">
            {`// Ready for dependable automations?`}
          </p>
          <h2
            id="cta-title"
            className="mt-6 text-4xl font-black tracking-tight-cyber text-balance text-white md:text-5xl leading-tight"
          >
            Get the Bed Presence Sensor and finally trust your bedtime routines.
          </h2>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button asChild className="text-sm font-mono uppercase tracking-wider bg-amber-500 hover:bg-amber-400 text-cyber-black rounded-full h-12 px-8">
              <Link href="/store">Get Yours Today</Link>
            </Button>
            <Button
              asChild
              className="text-sm font-mono uppercase tracking-wider glass-card text-white hover:border-white/20 rounded-full h-12 px-8"
              variant="secondary"
            >
              <Link href="https://github.com">Documentation</Link>
            </Button>
            <Button
              asChild
              className="text-sm font-mono uppercase tracking-wider glass-card text-white hover:border-white/20 rounded-full h-12 px-8"
              variant="secondary"
            >
              <Link href="/docs">Architecture</Link>
            </Button>
          </div>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm text-sm text-white/80">
          <p className="font-mono text-xs uppercase tracking-wider text-white/40 mb-6">
            [[ What you get ]]
          </p>
          <ul className="space-y-5">
            <li className="flex items-start gap-4">
              <span className="mt-1 font-mono text-emerald-400">
                +
              </span>
              <p className="leading-relaxed-cyber">
                Complete mmWave sensor kit with tuned firmware and printed
                enclosure.
              </p>
            </li>
            <li className="flex items-start gap-4">
              <span className="mt-1 font-mono text-sky-400">
                +
              </span>
              <p className="leading-relaxed-cyber">
                Live Home Assistant dashboard with tunable parameters and debug
                text sensor.
              </p>
            </li>
            <li className="flex items-start gap-4">
              <span className="mt-1 font-mono text-amber-400">
                +
              </span>
              <p className="leading-relaxed-cyber">
                Documentation and GitHub repo with the full presence engine
                architecture.
              </p>
            </li>
          </ul>
        </div>
      </GlassCard>
    </section>
  )
}

export default CallToAction
