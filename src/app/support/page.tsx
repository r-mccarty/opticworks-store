import { Metadata } from "next"
import { SupportHero } from "@/components/support/SupportHero"
import { SupportCategoryGrid } from "@/components/support/SupportCategoryGrid"

export const metadata: Metadata = {
  title: "Customer Support - OpticWorks Window Tinting",
  description: "Get help with your window tinting installation, order questions, warranty claims, and more. Professional support for all your OpticWorks needs.",
  keywords: ["support", "help", "installation", "warranty", "window tinting"],
}

export default function SupportPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SupportHero />
        <SupportCategoryGrid />
      </div>
    </main>
  )
}