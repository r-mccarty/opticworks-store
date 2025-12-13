"use client"

import { Layers, Server, Wifi } from "lucide-react"
import Link from "next/link"
import { FadeContainer, FadeDiv } from "../Fade"
import { Button } from "./button"

const SPECS = [
  {
    icon: Layers,
    title: "60GHz mmWave Radar",
    description:
      "Automotive-grade resolution. Capable of detecting breathing from 5 meters away and tracking up to 5 people simultaneously.",
  },
  {
    icon: Server,
    title: "Dual-Core RISC-V",
    description:
      "Dedicated NPU for running lightweight spatial models. All inference happens on-device with zero cloud dependency.",
  },
  {
    icon: Wifi,
    title: "Matter over Thread",
    description:
      "Seamlessly joins your mesh network. Works with Apple Home, Google Home, and any Matter-compatible platform.",
  },
]

export function Specs() {
  return (
    <section aria-labelledby="specs" className="relative bg-neutral-200 py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <FadeContainer className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left: Product image placeholder */}
          <FadeDiv className="relative">
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-neutral-300">
              {/* Large product name overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-display text-[12rem] font-bold text-neutral-400/30 select-none">
                  OW-1
                </span>
              </div>
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-200/80 to-transparent" />
            </div>
          </FadeDiv>

          {/* Right: Specs and purchase */}
          <FadeDiv className="space-y-8">
            {/* Section label */}
            <div>
              <h2 className="text-sm font-mono text-neutral-600 tracking-widest uppercase">
                [ Technical Specifications ]
              </h2>
              <p
                id="specs"
                className="mt-4 font-display text-4xl font-medium tracking-tight text-neutral-900 lg:text-5xl"
              >
                Designed to disappear.
              </p>
              <p className="mt-4 text-lg text-neutral-600">
                Minimal footprint. Maximum intelligence. The OW-1 blends into any
                space while providing unmatched spatial awareness.
              </p>
            </div>

            {/* Spec items */}
            <div className="space-y-6">
              {SPECS.map((spec) => {
                const Icon = spec.icon
                return (
                  <div key={spec.title} className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-neutral-900 text-neutral-200">
                        <Icon className="h-6 w-6" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium text-neutral-900">
                        {spec.title}
                      </h3>
                      <p className="mt-1 text-sm text-neutral-600">
                        {spec.description}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Product card */}
            <div className="rounded-xl border border-neutral-300 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-display text-2xl font-medium text-neutral-900">
                    OW-1 Developer Kit
                  </h3>
                  <p className="mt-1 text-sm text-neutral-600">
                    Includes 1x Sensor Node, USB-C Cable, Wall Mount
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-display text-3xl font-semibold text-neutral-900">
                    $89
                  </span>
                </div>
              </div>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="flex-1 bg-neutral-900 text-white hover:bg-neutral-800"
                >
                  <Link href="/store">Add to Cart</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="flex-1 border-neutral-300 text-neutral-900 hover:bg-neutral-100"
                >
                  <Link href="/products">Learn More</Link>
                </Button>
              </div>
              <p className="mt-4 text-center text-xs text-neutral-500">
                Ships Q4 2025. Limited Batch.
              </p>
            </div>
          </FadeDiv>
        </FadeContainer>
      </div>
    </section>
  )
}

export default Specs
