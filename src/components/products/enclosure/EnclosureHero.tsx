"use client"

import { FadeDiv } from "@/components/Fade"
import { Badge } from "@/components/ui/badge"

export function EnclosureHero() {
  return (
    <div className="relative bg-gradient-to-br from-slate-950 via-zinc-900 to-slate-950 text-white overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(161,161,170,0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(113,113,122,0.12),transparent_50%)]" />

      <div className="relative px-6 pt-32 pb-24 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <FadeDiv className="text-center">
            <Badge className="mb-6 bg-gradient-to-r from-zinc-600 to-slate-600 border-0 text-base px-4 py-1.5">
              Premium Accessory
            </Badge>
            <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl lg:text-7xl mb-6">
              Industrial design
              <br />
              meets stealth installation
            </h1>
            <p className="mx-auto max-w-3xl text-xl leading-8 text-white/70">
              Matte black 3D-printed enclosure with magnetic mounting, adjustable tilt bracket,
              and integrated cable management. Choose from adhesive pads, bed-rail clips, or
              magnetic attachment for invisible installs.
            </p>
          </FadeDiv>

          <FadeDiv className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-zinc-500/20 mb-4">
                <svg className="w-6 h-6 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Premium Materials</h3>
              <p className="text-white/60">
                PETG shell with soft-touch TPU feet and neodymium magnets
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-zinc-500/20 mb-4">
                <svg className="w-6 h-6 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Adjustable Tilt</h3>
              <p className="text-white/60">
                ±30° bracket for perfect radar aim regardless of bed height
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-zinc-500/20 mb-4">
                <svg className="w-6 h-6 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Clean Cable Path</h3>
              <p className="text-white/60">
                Integrated USB-C routing keeps wires hidden along bed frame
              </p>
            </div>
          </FadeDiv>
        </div>
      </div>
    </div>
  )
}
