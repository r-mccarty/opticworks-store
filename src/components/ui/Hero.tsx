'use client'

import { RiArrowRightUpLine } from "@remixicon/react"
import Link from "next/link"
import { FadeContainer, FadeDiv, FadeSpan } from "../Fade"
import { VideoBackground } from "./VideoBackground"

// Track button clicks
function trackButtonClick(buttonName: string, href: string) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'click', {
      event_category: 'button',
      event_label: buttonName,
      value: href
    })
    console.log(`GA4: Button click tracked - ${buttonName}`)
  }
}

export function Hero() {
  return (
    <section aria-label="hero" className="relative min-h-screen">
      <FadeContainer className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <FadeDiv className="mx-auto">
          <a
            aria-label="View latest update the changelog page"
            href="https://www.optic.works/products/cybershade-irx-tesla-model-y"

            className="mx-auto w-full"
          >
            <div className="inline-flex max-w-full items-center gap-3 rounded-full bg-white/5 px-2.5 py-0.5 pr-3 pl-0.5 text-gray-900 ring-1 shadow-lg shadow-orange-400/20 ring-black/10 filter backdrop-blur-[1px] transition-colors hover:bg-orange-500/[2.5%] focus:outline-hidden sm:text-sm">
              <span className="shrink-0 truncate rounded-full border bg-gray-50 px-2.5 py-1 text-sm text-gray-600 sm:text-xs">
                News
              </span>
              <span className="flex items-center gap-1 truncate">
                <span className="w-full truncate">
                  Now shipping CyberShade IRX kits
                </span>

                <RiArrowRightUpLine className="size-4 shrink-0 text-gray-700" />
              </span>
            </div>
          </a>
        </FadeDiv>
        <h1 className="font-barlow mt-8 text-center text-8xl font-normal tracking-[1px] text-white drop-shadow-2xl uppercase sm:leading-[5.5rem]">
          <FadeSpan>Tint</FadeSpan> <FadeSpan>Kits</FadeSpan> <FadeSpan>for</FadeSpan>
          <br />
          <FadeSpan>Every</FadeSpan> <FadeSpan>Tesla</FadeSpan>
        </h1>
        <p className="font-colfax mt-5 max-w-xl text-center text-2xl leading-[30px] text-balance text-white drop-shadow-lg sm:mt-8">
          <FadeSpan>Premium DIY window tinting</FadeSpan>{" "}
          <FadeSpan>kits, pro tools, and step-by-step guides</FadeSpan>{" "}
          <FadeSpan>for Tesla owners.</FadeSpan>
        </p>
        <FadeDiv>
          <Link
            className="font-colfax mt-6 inline-flex cursor-pointer flex-row items-center justify-center gap-1 rounded-md border-b-[1.5px] border-orange-700 bg-linear-to-b from-orange-400 to-orange-500 px-5 py-3 leading-4 font-medium tracking-wide whitespace-nowrap text-white shadow-[0_0_0_2px_rgba(0,0,0,0.04),0_0_14px_0_rgba(255,255,255,0.19)] transition-all duration-200 ease-in-out hover:shadow-orange-300"
            href="/products"
            onClick={() => trackButtonClick('Shop Tint Kits - Hero', '/products')}
          >
            Shop Tint Kits
          </Link>
        </FadeDiv>
        <div className="absolute inset-0 -z-10">
          <VideoBackground 
            videoUrl="https://pub-7268d532bc454f39b3de3c39e3d5105b.r2.dev/demo-video.mp4"
          />
        </div>
      </FadeContainer>
    </section>
  )
}
