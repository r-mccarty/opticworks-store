"use client"

import { RiQuestionLine } from "@remixicon/react"
import { FadeContainer, FadeDiv } from "../Fade"

export function FAQHero() {
  return (
    <section className="relative bg-background py-24 sm:py-32 text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,oklch(0.75_0.18_55/0.12),transparent_55%)]" />
      
      <FadeContainer className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <FadeDiv>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-6">
              <RiQuestionLine className="h-8 w-8 text-primary" />
            </div>
          </FadeDiv>
          
          <FadeDiv>
            <h1 className="font-barlow text-4xl font-semibold tracking-tight text-foreground sm:text-6xl">
              Frequently Asked <span className="text-primary">Questions</span>
            </h1>
          </FadeDiv>
          
          <FadeDiv>
            <p className="font-colfax mx-auto mt-6 max-w-2xl text-xl leading-8 text-muted-foreground">
              Dive into our knowledge base for installs, calibration, spatial dashboards,
              integrations, warranties, and everything in between.
            </p>
          </FadeDiv>
        </div>
      </FadeContainer>
    </section>
  )
}
