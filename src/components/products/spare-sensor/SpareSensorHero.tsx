"use client"

import { FadeDiv } from "@/components/Fade"
import { Badge } from "@/components/ui/badge"

export function SpareSensorHero() {
  return (
    <div className="relative bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 text-white overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(99,102,241,0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(139,92,246,0.12),transparent_50%)]" />

      <div className="relative px-6 pt-32 pb-24 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <FadeDiv className="text-center">
            <Badge className="mb-6 bg-gradient-to-r from-indigo-500 to-violet-500 border-0 text-base px-4 py-1.5">
              Standalone Module
            </Badge>
            <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl lg:text-7xl mb-6">
              Expand beyond
              <br />
              the bedroom
            </h1>
            <p className="mx-auto max-w-3xl text-xl leading-8 text-white/70">
              Individual 60GHz mmWave sensor module for labs, redundancy builds, or creative
              automations outside the bedroom. Ships pre-flashed with the same still-energy
              presence engine—just wire to your ESP32 and go.
            </p>
          </FadeDiv>

          <FadeDiv className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-500/20 mb-4">
                <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Pre-Flashed Firmware</h3>
              <p className="text-white/60">
                Same 4-state presence engine as the flagship kit—no compiling required
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-violet-500/20 mb-4">
                <svg className="w-6 h-6 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">UART + I2C Breakout</h3>
              <p className="text-white/60">
                Interface with any microcontroller or SBC via standard protocols
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-500/20 mb-4">
                <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Experimental Use Cases</h3>
              <p className="text-white/60">
                Office chairs, nurseries, pet beds—anywhere stillness detection matters
              </p>
            </div>
          </FadeDiv>
        </div>
      </div>
    </div>
  )
}
