import {
  RiDropFill,
  RiNavigationFill,
  RiPieChartFill,
  RiRobot3Fill,
} from "@remixicon/react"
import { Divider } from "../Divider"
import AnalyticsIllustration from "./AnalyticsIllustration"
import { StickerCard } from "./StickerCard"

export function SolarAnalytics() {
  return (
    <section
      aria-labelledby="solar-analytics"
      className="relative mx-auto w-full max-w-6xl overflow-hidden"
    >
      <div>
        <h2
          id="solar-analytics"
          className="relative scroll-my-24 text-lg font-normal tracking-tight text-orange-500"
        >
          Tint Tools
          <div className="absolute top-1 -left-[8px] h-5 w-[3px] rounded-r-sm bg-orange-500" />
        </h2>
        <p className="mt-2 max-w-lg text-3xl font-medium tracking-tighter text-balance text-gray-900 md:text-4xl">
          Stay legal and cool with real-time tinting insights
        </p>
      </div>
      <div className="*:pointer-events-none">
        <AnalyticsIllustration />
      </div>
      <Divider className="mt-0"></Divider>
      <div className="grid grid-cols-1 grid-rows-2 gap-6 md:grid-cols-4 md:grid-rows-1">
        <StickerCard
          Icon={RiNavigationFill}
          title="Tint Law Checker"
          description="Instantly verify legal tint levels for every state."
        />
        <StickerCard
          Icon={RiRobot3Fill}
          title="Cut Template Library"
          description="Download precision patterns for every Tesla model."
        />
        <StickerCard
          Icon={RiDropFill}
          title="Install Guides"
          description="Step-by-step videos and tips for a flawless finish."
        />
        <StickerCard
          Icon={RiPieChartFill}
          title="Heat Rejection Stats"
          description="See how our ceramic film blocks heat and UV rays."
        />
      </div>
    </section>
  )
}
