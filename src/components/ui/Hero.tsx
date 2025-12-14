"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"

import SpatialDemo from "./SpatialDemo"

export function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col justify-center px-6 pt-32 pb-20">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-16 lg:grid-cols-2">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-mono tracking-wider uppercase text-amber-500">
            <span>Now shipping beta units</span>
          </div>

          <h1 className="font-display text-5xl font-medium leading-[1.1] tracking-tight md:text-7xl">
            The home <br />
            <span className="text-neutral-500">that watches out</span> <br />
            for you.
          </h1>

          <p className="max-w-md text-lg leading-relaxed text-neutral-400">
            OpticWorks brings Tesla‑like spatial awareness to Home Assistant.
            Presence sensors that visualize your surroundings, infer intent
            locally, and make automations feel obvious.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/store"
              className="group relative flex items-center gap-2 rounded bg-amber-500 px-8 py-4 font-semibold text-black transition-all hover:bg-amber-400"
            >
              Order Development Kit
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="https://docs.optic.works"
              className="rounded border border-white/20 bg-transparent px-8 py-4 font-medium text-white transition-colors hover:bg-white/5"
            >
              Read the Whitepaper
            </Link>
          </div>

          <div className="flex items-center gap-8 border-t border-white/10 pt-8 text-sm text-neutral-500">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              <span>Works with Home Assistant</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-blue-500" />
              <span>100% Local Inference</span>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-4 rounded-full bg-amber-500/20 blur-3xl opacity-20" />
          <SpatialDemo />
          <div className="mt-6 flex items-end justify-between">
            <div className="font-mono text-xs text-neutral-500">
              [ LIVE VISUALIZATION ]
            </div>
            <div className="text-right font-mono text-xs text-neutral-500">
              35.1495°N, 90.049°W <br />
              DEVICE_ID: OW-1-ALPHA
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
