import { FadeContainer, FadeDiv, FadeSpan } from "../Fade"
import { VideoBackground } from "./VideoBackground"

export function Hero() {
  return (
    <section aria-label="hero" className="relative min-h-screen">
      <FadeContainer className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <h1 className="font-barlow mt-8 text-center text-8xl font-normal tracking-[1px] text-white drop-shadow-2xl uppercase sm:leading-[5.5rem]">
          <FadeSpan>Precision</FadeSpan> <FadeSpan>Tinting,</FadeSpan>
          <br />
          <FadeSpan>Perfected</FadeSpan>
        </h1>
        <p className="font-colfax mt-5 max-w-xl text-center text-2xl leading-[30px] text-balance text-white drop-shadow-lg sm:mt-8">
          <FadeSpan>Professional-grade DIY window tinting kits</FadeSpan>{" "}
          <FadeSpan>and installation solutions. Transform your</FadeSpan>{" "}
          <FadeSpan>vehicle with precision-cut ceramic films.</FadeSpan>
        </p>
        <FadeDiv>
          <a
            className="font-colfax mt-6 inline-flex cursor-pointer flex-row items-center justify-center gap-1 rounded-md border-b-[1.5px] border-orange-700 bg-linear-to-b from-orange-400 to-orange-500 px-5 py-3 leading-4 font-medium tracking-wide whitespace-nowrap text-white shadow-[0_0_0_2px_rgba(0,0,0,0.04),0_0_14px_0_rgba(255,255,255,0.19)] transition-all duration-200 ease-in-out hover:shadow-orange-300"
            href="/store"
          >
            Shop Kits
          </a>
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
