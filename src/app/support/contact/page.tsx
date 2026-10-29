import { Metadata } from "next"
import { ContactHero } from "@/components/support/ContactHero"
import { SupportEmailCard } from "@/components/support/SupportEmailCard"

export const metadata: Metadata = {
  title: "Contact Support - OpticWorks Presence Sensors",
  description: "Contact the OpticWorks team by email about installs, integrations, tuning, or an existing order.",
  keywords: ["contact", "support", "presence sensors", "OpticWorks"],
}

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <ContactHero />
      <div className="pb-16 sm:pb-20">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <SupportEmailCard
            title="Contact us by email"
            include={[
              "Your name and the best way to reach you",
              "Your order number, if your question is about an order",
              "A short description of your question or issue",
            ]}
          />
        </div>
      </div>
    </main>
  )
}
