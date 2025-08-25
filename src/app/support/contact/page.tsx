import { Metadata } from "next"
import { ContactHero } from "@/components/support/ContactHero"
import { ContactForm } from "@/components/support/ContactForm"

export const metadata: Metadata = {
  title: "Contact Support - OpticWorks Window Tinting",
  description: "Get personalized help from our window tinting experts. Submit a support request and we'll get back to you quickly.",
  keywords: ["contact", "support", "help", "customer service"],
}

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <ContactHero />
      <div className="py-16">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <ContactForm />
        </div>
      </div>
    </main>
  )
}