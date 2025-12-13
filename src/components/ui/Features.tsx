"use client"

import { Eye, Brain, Shield, Cpu, Zap, Box } from "lucide-react"
import { FadeContainer, FadeDiv } from "../Fade"

const FEATURES = [
  {
    title: "Spatial Awareness",
    description:
      "Unlike PIR sensors that just see 'motion', OpticWorks sees people, pets, and posture. Know exactly where everyone is in the room.",
    icon: Eye,
  },
  {
    title: "Intent Inference",
    description:
      "Understands if you're reading on the couch or just walking past it. Automations that actually work because they understand context.",
    icon: Brain,
  },
  {
    title: "Private by Design",
    description:
      "No cameras. No cloud. Low-resolution mmWave radar data is processed entirely on-device. Your home stays private.",
    icon: Shield,
  },
  {
    title: "NPU Acceleration",
    description:
      "Dedicated neural processing unit runs lightweight spatial models for real-time classification without lag or cloud latency.",
    icon: Cpu,
  },
  {
    title: "Instant Response",
    description:
      "Sub-100ms latency means lights turn on before your foot hits the floor. Presence detection that feels like magic.",
    icon: Zap,
  },
  {
    title: "Home Assistant Native",
    description:
      "Exposes entities for everything: occupancy coordinates, posture, and gesture recognition. Integrate with any automation.",
    icon: Box,
  },
]

export default function Features() {
  return (
    <section
      aria-labelledby="capabilities"
      className="relative bg-neutral-950 py-24"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section header */}
        <FadeContainer className="mb-16 space-y-4">
          <FadeDiv>
            <h2 className="text-sm font-mono text-amber-500 tracking-widest uppercase">
              [ Capabilities ]
            </h2>
          </FadeDiv>
          <FadeDiv>
            <p
              id="capabilities"
              className="text-3xl font-display font-medium tracking-tight text-neutral-200 sm:text-4xl lg:text-5xl"
            >
              Presence sensing that understands your space
            </p>
          </FadeDiv>
          <FadeDiv>
            <p className="max-w-2xl text-lg text-neutral-400">
              Built from the ground up to solve the problems that defeat
              traditional motion sensors.
            </p>
          </FadeDiv>
        </FadeContainer>

        {/* Feature grid */}
        <FadeContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => {
            const Icon = feature.icon
            return (
              <FadeDiv key={feature.title}>
                <article className="group relative h-full rounded-xl border border-white/5 bg-white/[0.02] p-8 transition-colors hover:bg-white/[0.04]">
                  {/* Icon */}
                  <div className="mb-6 inline-flex items-center justify-center rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 transition-transform duration-300 group-hover:scale-110">
                    <Icon className="h-6 w-6 text-amber-500" />
                  </div>

                  {/* Content */}
                  <h3 className="mb-3 font-display text-xl font-medium text-neutral-200">
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-neutral-400">
                    {feature.description}
                  </p>
                </article>
              </FadeDiv>
            )
          })}
        </FadeContainer>
      </div>
    </section>
  )
}
