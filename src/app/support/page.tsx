import { Metadata } from "next"

import { SupportCategoryGrid } from "@/components/support/SupportCategoryGrid"
import { SupportCTA } from "@/components/support/SupportCTA"
import { SupportExperienceStack } from "@/components/support/SupportExperienceStack"
import { SupportHero } from "@/components/support/SupportHero"
import { SupportHighlights } from "@/components/support/SupportHighlights"

export const metadata: Metadata = {
  title: "OpticWorks Concierge Support",
  description:
    "Access concierge help for CyberShade Presence sensors—installations, diagnostics, logistics, and billing with on-call specialists.",
  keywords: [
    "support",
    "concierge",
    "installation",
    "warranty",
    "presence sensors",
    "opticworks",
  ],
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
