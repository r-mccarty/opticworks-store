import { Metadata } from "next"
import { SupportEmailCard } from "@/components/support/SupportEmailCard"

export const metadata: Metadata = {
  title: "Warranty Claims - OpticWorks Presence Sensors",
  description: "Request warranty support for your OpticWorks hardware by email.",
  keywords: ["warranty", "presence sensors", "claim", "replacement", "support"],
}

export default function WarrantyPage() {
  return (
    <main className="min-h-screen bg-background pt-32 text-foreground">
      <div className="pb-16">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <h1 className="mb-8 text-center text-4xl font-semibold tracking-tight">Warranty support</h1>
          <SupportEmailCard
            title="Request warranty support"
            include={[
              "Your order number and the email address used for the order",
              "The product and, if available, its serial number",
              "A description of the problem and photos if helpful",
            ]}
          />
        </div>
      </div>
    </main>
  )
}
