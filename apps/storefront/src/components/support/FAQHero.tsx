"use client"

import { RiQuestionLine } from "@remixicon/react"
import { FadeContainer, FadeDiv } from "../Fade"

export function FAQHero() {
  return (
    <section className="relative bg-gradient-to-br from-primary-light via-card to-brand-modal-50 py-24 sm:py-32">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(163,230,53,0.14),transparent_55%)]" />
      
      <FadeContainer className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <FadeDiv>
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-info-light">
              <RiQuestionLine className="h-8 w-8 text-info" />
            </div>
          </FadeDiv>
          
          <FadeDiv>
            <h1 className="font-barlow text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Frequently Asked <span className="text-info">Questions</span>
            </h1>
          </FadeDiv>
          
          <FadeDiv>
            <p className="font-colfax mx-auto mt-6 max-w-2xl text-xl leading-8 text-gray-600">
              Find quick answers to the most common questions about window tinting, 
              installation, warranties, and more.
            </p>
          </FadeDiv>
        </div>
      </FadeContainer>
    </section>
  )
}