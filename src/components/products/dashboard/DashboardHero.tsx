"use client"

import { FadeDiv } from "@/components/Fade"
import { Badge } from "@/components/ui/badge"
import { ChartBarIcon, AdjustmentsHorizontalIcon, ClockIcon } from "@heroicons/react/24/outline"

export function DashboardHero() {
  return (
    <div className="relative bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-950 text-white overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(16,185,129,0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(59,130,246,0.12),transparent_50%)]" />

      <div className="relative px-6 pt-32 pb-24 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <FadeDiv className="text-center">
            <Badge className="mb-6 bg-gradient-to-r from-emerald-500 to-teal-500 border-0 text-base px-4 py-1.5">
              Digital Download
            </Badge>
            <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl lg:text-7xl mb-6">
              Turn raw sensor data
              <br />
              into beautiful insights
            </h1>
            <p className="mx-auto max-w-3xl text-xl leading-8 text-white/70">
              Pre-built Home Assistant dashboards, YAML automation templates, and Lovelace
              cards that expose z-score charts, threshold tuning, and state-change history.
              Instant download, household license, no subscription required.
            </p>
          </FadeDiv>

          <FadeDiv className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/20 mb-4">
                <ChartBarIcon className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Live Z-Score Visualization</h3>
              <p className="text-white/60">
                See real-time still-energy values vs. detection thresholds on beautiful Apex charts
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-teal-500/20 mb-4">
                <AdjustmentsHorizontalIcon className="w-6 h-6 text-teal-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Interactive Tuning Controls</h3>
              <p className="text-white/60">
                Number sliders for every debounce, delay, and confidence parameter
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-cyan-500/20 mb-4">
                <ClockIcon className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">State History Timeline</h3>
              <p className="text-white/60">
                Track Clear → Observed → Occupied transitions with labeled timestamps
              </p>
            </div>
          </FadeDiv>
        </div>
      </div>
    </div>
  )
}
