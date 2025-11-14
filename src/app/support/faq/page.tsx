import { Metadata } from "next"
import { FAQHero } from "@/components/support/FAQHero"
import { FAQAccordion } from "@/components/support/FAQAccordion"

export const metadata: Metadata = {
  title: "Frequently Asked Questions - OpticWorks Presence Sensors",
  description: "Find answers to common questions about bed presence installs, calibration, shipping, warranty, and more.",
  keywords: ["FAQ", "presence sensors", "calibration", "support", "OpticWorks"],
}

export default function FAQPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <FAQHero />
      <FAQAccordion />
    </main>
  )
}
