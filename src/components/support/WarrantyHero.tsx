"use client"

import { RiShieldCheckLine } from "@remixicon/react"
import { FadeContainer, FadeDiv } from "../Fade"

export function WarrantyHero() {
  return (
    <section className="relative bg-gradient-to-br from-orange-50 via-white to-red-50 py-24 sm:py-32">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(249,115,22,0.1),transparent_50%)]" />
      
      <FadeContainer className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <FadeDiv>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 mb-6">
              <RiShieldCheckLine className="h-8 w-8 text-orange-600" />
            </div>
          </FadeDiv>
          
          <FadeDiv>
            <h1 className="font-barlow text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Warranty <span className="text-orange-600">Claims</span>
            </h1>
          </FadeDiv>
          
          <FadeDiv>
            <p className="font-colfax mx-auto mt-6 max-w-2xl text-xl leading-8 text-gray-600">
              Submit a warranty claim for defective products. Upload photos and get fast resolution 
              with our lifetime warranty coverage.
            </p>
          </FadeDiv>

          {/* Warranty Benefits */}
          <FadeDiv>
            <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 mb-4">
                  <span className="text-xl">⚡</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Fast Processing</h3>
                <p className="text-sm text-gray-600">Most claims resolved within 24 hours</p>
              </div>
              
              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 mb-4">
                  <span className="text-xl">🔄</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Easy Replacement</h3>
                <p className="text-sm text-gray-600">Free replacement films for valid claims</p>
              </div>
              
              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 mb-4">
                  <span className="text-xl">∞</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Lifetime Coverage</h3>
                <p className="text-sm text-gray-600">Warranty lasts as long as you own your vehicle</p>
              </div>
            </div>
          </FadeDiv>
        </div>
      </FadeContainer>
    </section>
  )
}