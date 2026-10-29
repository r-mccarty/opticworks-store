import { Metadata } from "next"
import { SupportEmailCard } from "@/components/support/SupportEmailCard"

export const metadata: Metadata = {
  title: "Order support - OpticWorks Presence Sensors",
  description: "Get help with an existing OpticWorks order by email.",
}

export default function OrdersPage() {
  return (
    <main className="min-h-screen bg-background pt-32 text-foreground">
      <div className="pb-16">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <h1 className="mb-8 text-center text-4xl font-semibold tracking-tight">Order support</h1>
          <SupportEmailCard
            title="Get help with an order"
            include={["Your order number and the email address used for the order", "What you need help with (status, shipping address, cancellation)"]}
          />
        </div>
      </div>
    </main>
  )
}
