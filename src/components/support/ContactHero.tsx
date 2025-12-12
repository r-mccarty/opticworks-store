"use client"

import { RiMailLine } from "@remixicon/react"
import { FadeContainer, FadeDiv } from "../Fade"

export function ContactHero() {
  return (
    <section className="relative bg-background py-20 sm:py-28 text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,oklch(0.75_0.18_55/0.12),transparent_55%)]" />

      <FadeContainer className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <FadeDiv>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-border bg-muted mb-6">
              <RiMailLine className="h-7 w-7 text-muted-foreground" />
            </div>
          </FadeDiv>

          <FadeDiv>
            <h1 className="font-barlow text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Get in touch
            </h1>
          </FadeDiv>

          <FadeDiv>
            <p className="font-colfax mx-auto mt-5 max-w-xl text-lg leading-7 text-muted-foreground">
              Talk directly with our presence engineers about installs, integrations, or tuning.
              We typically respond within 2 hours during business hours.
            </p>
          </FadeDiv>
        </div>
      </FadeContainer>
    </section>
  )
}
