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
          Presence Toolkit
          <div className="absolute top-1 -left-[8px] h-5 w-[3px] rounded-r-sm bg-orange-500" />
        </h2>
        <p className="mt-2 max-w-lg text-3xl font-medium tracking-tighter text-balance text-gray-900 md:text-4xl">
          Visualize confidence scores and calibrate every bed zone
        </p>
      </div>
      <div className="*:pointer-events-none">
        <AnalyticsIllustration />
      </div>
      <Divider className="mt-0"></Divider>
      <div className="grid grid-cols-1 grid-rows-2 gap-6 md:grid-cols-4 md:grid-rows-1">
        <StickerCard
          Icon={RiNavigationFill}
          title="Calibration Coach"
          description="Guides you through sensor placement, baseline capture, and tuning."
        />
        <StickerCard
          Icon={RiRobot3Fill}
          title="Presence Engine Console"
          description="Live stats for z-score, hysteresis state, and stillness timers."
        />
        <StickerCard
          Icon={RiDropFill}
          title="Sleep Session Logs"
          description='See overnight confidence trends to validate "still energy" behavior.'
        />
        <StickerCard
          Icon={RiPieChartFill}
          title="Multi-Bed Analytics"
          description="Compare rooms, track false clears, and share insights with integrators."
        />
      </div>
    </section>
  )
}
