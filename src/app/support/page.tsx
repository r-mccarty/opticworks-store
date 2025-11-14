import { Metadata } from "next"
import { SupportHero } from "@/components/support/SupportHero"
import { SupportCategoryGrid } from "@/components/support/SupportCategoryGrid"

export const metadata: Metadata = {
  title: "Customer Support - OpticWorks Presence Intelligence",
  description: "Get expert support for your presence sensors—installation guidance, calibration help, warranty claims, and more. Premium support for your smart home.",
  keywords: ["support", "help", "installation", "warranty", "presence sensors", "calibration", "smart home"],
}

export default function SupportPage() {
  return (
    <main className="min-h-screen bg-white">
      <SupportHero />
      <SupportCategoryGrid />
    </main>
  )
}