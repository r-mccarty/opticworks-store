"use client"

import type { LucideIcon } from "lucide-react"
import { Eye, Shield, Cpu, Zap, Box, Brain } from "lucide-react"

const features: Array<{
  icon: LucideIcon
  title: string
  description: string
  anchorId?: string
}> = [
  {
    icon: Eye,
    title: "Spatial Awareness",
    description:
      "Unlike PIR sensors that just see 'motion', OpticWorks sees people, pets, and posture.",
  },
  {
    icon: Brain,
    title: "Intent Inference",
    description:
      "Understands if you're reading on the couch or just walking past it. Automations that actually work.",
  },
  {
    icon: Shield,
    title: "Private by Design",
    description:
      "No cameras. No cloud. Low-resolution mmWave radar data is processed entirely on-device.",
    anchorId: "privacy",
  },
  {
    icon: Cpu,
    title: "NPU Acceleration",
    description:
      "Built-in Neural Processing Unit handles real-time classification at 60Hz without lagging your network.",
  },
  {
    icon: Zap,
    title: "Instant Response",
    description: "Sub-100ms latency. Lights turn on before your foot hits the floor.",
  },
  {
    icon: Box,
    title: "Home Assistant Native",
    description:
      "Exposes entities for everything: occupancy coordinates, posture, and gesture recognition.",
    anchorId: "integrations",
  },
]

export default function Features() {
  return (
    <section
      id="technology"
      className="border-t border-white/5 bg-neutral-950 py-24"
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16">
          <h2 className="mb-4 text-sm font-mono tracking-widest text-amber-500 uppercase">
            [ Capabilities ]
          </h2>
          <h3 className="max-w-2xl font-display text-3xl font-medium text-white md:text-5xl">
            More than just a motion sensor. <br />
            It&apos;s a spatial computer.
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <div
                key={feature.title}
                id={feature.anchorId}
                className="group rounded-xl border border-white/5 bg-white/[0.02] p-8 transition-colors hover:bg-white/[0.04]"
              >
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg border border-white/5 bg-neutral-900 transition-transform duration-300 group-hover:scale-110">
                  <Icon className="h-6 w-6 text-amber-500" />
                </div>
                <h4 className="mb-3 text-xl font-medium text-white">
                  {feature.title}
                </h4>
                <p className="leading-relaxed text-neutral-400">
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
