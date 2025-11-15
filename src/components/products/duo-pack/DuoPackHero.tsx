"use client"

import { FadeDiv } from "@/components/Fade"
import { Badge } from "@/components/ui/badge"
import { CheckCircleIcon } from "@heroicons/react/24/solid"

export function DuoPackHero() {
  return (
    <div className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(251,191,36,0.08),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(56,189,248,0.1),transparent_50%)]" />

      <div className="relative px-6 pt-32 pb-24 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <FadeDiv className="text-center">
            <Badge className="mb-6 bg-gradient-to-r from-orange-500 to-amber-500 border-0 text-base px-4 py-1.5">
              Multi-Room Bundle
            </Badge>
            <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl lg:text-7xl mb-6">
              Synchronized presence
              <br />
              across every bedroom
            </h1>
            <p className="mx-auto max-w-3xl text-xl leading-8 text-white/70">
              Two Bed Presence Sensors plus coordinated automation logic.
              Perfect for master + guest rooms, bunk beds, or split configurations.
              Ships pre-calibrated to avoid crosstalk.
            </p>
          </FadeDiv>

          <FadeDiv className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-orange-500/20 mb-4">
                <CheckCircleIcon className="w-6 h-6 text-orange-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Coordinated Logic</h3>
              <p className="text-white/60">
                Shared Home Assistant blueprint prevents automations from fighting each other
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-sky-500/20 mb-4">
                <CheckCircleIcon className="w-6 h-6 text-sky-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Anti-Crosstalk Calibration</h3>
              <p className="text-white/60">
                Factory-tuned detection zones ensure each sensor owns its space
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/20 mb-4">
                <CheckCircleIcon className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Save $29</h3>
              <p className="text-white/60">
                Bundle pricing includes mounting hardware and sync automation templates
              </p>
            </div>
          </FadeDiv>
        </div>
      </div>
    </div>
  )
}
