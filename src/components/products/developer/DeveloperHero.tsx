"use client"

import { FadeDiv } from "@/components/Fade"
import { Badge } from "@/components/ui/badge"
import { CodeBracketIcon, CpuChipIcon, BeakerIcon } from "@heroicons/react/24/outline"

export function DeveloperHero() {
  return (
    <div className="relative bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(147,51,234,0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(59,130,246,0.12),transparent_50%)]" />

      <div className="relative px-6 pt-32 pb-24 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <FadeDiv className="text-center">
            <Badge className="mb-6 bg-gradient-to-r from-purple-500 to-blue-500 border-0 text-base px-4 py-1.5">
              Developer Edition
            </Badge>
            <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl lg:text-7xl mb-6">
              Tinker with the
              <br />
              presence engine internals
            </h1>
            <p className="mx-auto max-w-3xl text-xl leading-8 text-white/70">
              Breakout headers, UART console access, and a weekly beta firmware channel.
              Perfect for engineers who want to experiment with new detection algorithms
              or integrate sensors into custom hardware.
            </p>
          </FadeDiv>

          <FadeDiv className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-500/20 mb-4">
                <CodeBracketIcon className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Full Debug Access</h3>
              <p className="text-white/60">
                UART + USB-C serial console with logic analyzer pads for low-level debugging
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-500/20 mb-4">
                <CpuChipIcon className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Beta Firmware Channel</h3>
              <p className="text-white/60">
                Weekly builds with experimental features and OTA toggles for A/B testing
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-cyan-500/20 mb-4">
                <BeakerIcon className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Private Lab Discord</h3>
              <p className="text-white/60">
                Direct line to engineers, shared experiments, and early feature previews
              </p>
            </div>
          </FadeDiv>
        </div>
      </div>
    </div>
  )
}
