import { Metadata } from "next"
import { ContactHero } from "@/components/support/ContactHero"
import { ContactForm } from "@/components/support/ContactForm"

export const metadata: Metadata = {
  title: "Contact Support - OpticWorks Presence Sensors",
  description: "Get personalized help from the OpticWorks presence engineering team. Submit a request and we'll respond quickly.",
  keywords: ["contact", "support", "presence sensors", "OpticWorks"],
}

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-black">
      <ContactHero />
      <div className="py-16 sm:py-20">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <ContactForm />
        </div>
      </div>
    </main>
  )
}
