import { Metadata } from "next"
import { SupportEmailCard } from "@/components/support/SupportEmailCard"

export const metadata: Metadata = {
  title: "Billing support - OpticWorks Presence Sensors",
  description: "Get help with OpticWorks invoices, charges, or refunds by email.",
}

export default function BillingPage() {
  return (
    <main className="min-h-screen bg-background pt-32 text-foreground">
      <div className="pb-16">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <h1 className="mb-8 text-center text-4xl font-semibold tracking-tight">Billing support</h1>
          <SupportEmailCard
            title="Get help with billing"
            include={["Your order or invoice number and the email address used for the order", "What you need help with (receipt, charge, refund)"]}
          />
        </div>
      </div>
    </main>
  )
}
