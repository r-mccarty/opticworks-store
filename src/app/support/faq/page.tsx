import { Metadata } from "next"
import { FAQHero } from "@/components/support/FAQHero"
import { FAQAccordion } from "@/components/support/FAQAccordion"

export const metadata: Metadata = {
  title: "Frequently Asked Questions - OpticWorks Window Tinting",
  description: "Find answers to common questions about window tinting installation, product specifications, shipping, warranty, and more.",
  keywords: ["FAQ", "questions", "answers", "help", "window tinting", "installation"],
}

export default function FAQPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <FAQHero />
      <FAQAccordion />
    </main>
  )
}