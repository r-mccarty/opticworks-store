import { Metadata } from "next"
import { SupportHero } from "@/components/support/SupportHero"
import { SupportCategoryGrid } from "@/components/support/SupportCategoryGrid"

export const metadata: Metadata = {
  title: "Customer Support - OpticWorks Presence Sensors",
  description: "Get help with bed presence sensor installs, calibration, warranty claims, subscriptions, and more.",
  keywords: ["support", "presence sensors", "calibration", "warranty", "OpticWorks"],
}

export default function SupportPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <SupportHero />
      <SupportCategoryGrid />
    </main>
  )
}
