"use client"

/**
 * Preserves the original hero video background implementation so we can
 * redeploy the mmWave demo video on other routes without rebuilding it.
 * Currently unused on the landing page but intentionally exportable.
 */

import { FadeContainer, FadeDiv } from "../Fade"
import { VideoBackground } from "./VideoBackground"

interface HeroVideoShowcaseProps {
  videoUrl?: string
  posterUrl?: string
  headline?: string
  subline?: string
}

export function HeroVideoShowcase({
  videoUrl = "https://pub-7268d532bc454f39b3de3c39e3d5105b.r2.dev/demo-video.mp4",
  posterUrl,
  headline = "Visualize ultra-stable occupancy data",
  subline = "Side-by-side dashboards make it obvious how calm the Bed Presence Sensor is versus basic motion sensors.",
}: HeroVideoShowcaseProps) {
  return (
    <section
      aria-label="legacy-hero-video"
      className="relative mt-16 overflow-hidden rounded-3xl border border-white/10 bg-gray-950"
    >
      <FadeContainer className="relative z-10 flex flex-col gap-4 px-6 py-20 text-center text-white sm:px-16 lg:px-24">
        <FadeDiv>
          <p className="text-xs uppercase tracking-[0.4em] text-white/60">
            Legacy Video Capability
          </p>
        </FadeDiv>
        <FadeDiv>
          <h2 className="text-3xl font-semibold tracking-tight text-balance md:text-4xl">
            {headline}
          </h2>
        </FadeDiv>
        <FadeDiv>
          <p className="text-lg text-white/70">{subline}</p>
        </FadeDiv>
      </FadeContainer>
      <VideoBackground videoUrl={videoUrl} posterUrl={posterUrl} className="opacity-70" />
      <div className="absolute inset-0 bg-gradient-to-b from-gray-950/40 via-transparent to-gray-950/80" />
    </section>
  )
}

export default HeroVideoShowcase
