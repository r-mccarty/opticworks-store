"use client"

import { RiMailLine } from "@remixicon/react"
import { FadeContainer, FadeDiv } from "../Fade"

export function ContactHero() {
  return (
    <section className="relative bg-gradient-to-br from-green-50 via-white to-emerald-50 py-24 sm:py-32">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(34,197,94,0.1),transparent_50%)]" />
      
      <FadeContainer className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <FadeDiv>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-6">
              <RiMailLine className="h-8 w-8 text-green-600" />
            </div>
          </FadeDiv>
          
          <FadeDiv>
            <h1 className="font-barlow text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Contact <span className="text-green-600">Support</span>
            </h1>
          </FadeDiv>
          
          <FadeDiv>
            <p className="font-colfax mx-auto mt-6 max-w-2xl text-xl leading-8 text-gray-600">
              Get personalized help from our window tinting experts. 
              We typically respond within 2 hours during business hours.
            </p>
          </FadeDiv>
        </div>
      </FadeContainer>
    </section>
  )
}