import { Metadata } from "next"

import { SupportCategoryGrid } from "@/components/support/SupportCategoryGrid"
import { SupportCTA } from "@/components/support/SupportCTA"
import { SupportExperienceStack } from "@/components/support/SupportExperienceStack"
import { SupportHero } from "@/components/support/SupportHero"
import { SupportHighlights } from "@/components/support/SupportHighlights"

export const metadata: Metadata = {
  title: "Customer Support - OpticWorks Presence Sensors",
  description: "Get help with bed presence sensor installs, calibration, warranty claims, subscriptions, and more.",
  keywords: ["support", "presence sensors", "calibration", "warranty", "OpticWorks"],
}

export default function SupportPage() {
  return (
    <main className="flex min-h-screen flex-col bg-[#03040a] text-white">
      <SupportHero />
      <SupportHighlights />
      <SupportCategoryGrid />
      <SupportExperienceStack />
      <SupportCTA />
    </main>
  )
}
