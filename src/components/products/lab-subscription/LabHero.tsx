"use client"

import { FadeDiv } from "@/components/Fade"
import { Badge } from "@/components/ui/badge"

export function LabHero() {
  return (
    <div className="relative bg-gradient-to-br from-slate-950 via-rose-950 to-slate-950 text-white overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(244,63,94,0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(251,113,133,0.12),transparent_50%)]" />

      <div className="relative px-6 pt-32 pb-24 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <FadeDiv className="text-center">
            <Badge className="mb-6 bg-gradient-to-r from-rose-500 to-pink-500 border-0 text-base px-4 py-1.5">
              Monthly Subscription
            </Badge>
            <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl lg:text-7xl mb-6">
              Join the
              <br />
              Reliability Lab
            </h1>
            <p className="mx-auto max-w-3xl text-xl leading-8 text-white/70">
              Monthly firmware drops, guided tuning sessions with engineers, and early access
              to experimental features. For enthusiasts who want to push presence detection
              to its limits—and share findings with the community.
            </p>
          </FadeDiv>

          <FadeDiv className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-rose-500/20 mb-4">
                <svg className="w-6 h-6 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Monthly Firmware Builds</h3>
              <p className="text-white/60">
                Stable feature releases plus experimental toggles for power users
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-pink-500/20 mb-4">
                <svg className="w-6 h-6 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Private Discord Channel</h3>
              <p className="text-white/60">
                Direct access to engineers, office hours, and community experiments
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-500/20 mb-4">
                <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Early Feature Access</h3>
              <p className="text-white/60">
                Test new detection modes before they hit the public firmware track
              </p>
            </div>
          </FadeDiv>

          <FadeDiv className="mt-12 text-center">
            <p className="text-white/50 text-sm">
              $19/month • Cancel anytime • No long-term commitment
            </p>
          </FadeDiv>
        </div>
      </div>
    </div>
  )
}
