import { Metadata } from "next"
import { SupportEmailCard } from "@/components/support/SupportEmailCard"

export const metadata: Metadata = {
  title: "Compatibility - OpticWorks Presence Sensors",
  description: "Ask the OpticWorks team whether our presence sensors fit your space and integrations.",
}

export default function CompatibilityPage() {
  return (
    <main className="min-h-screen bg-background pt-32 text-foreground">
      <div className="pb-16">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <h1 className="mb-8 text-center text-4xl font-semibold tracking-tight">Compatibility</h1>
          <SupportEmailCard
            title="Ask about compatibility"
            include={[
              "The space or room you want to monitor",
              "Your home automation platform (for example, Home Assistant) and version",
              "Any mounting or power constraints",
            ]}
          />
        </div>
      </div>
    </main>
  )
}
