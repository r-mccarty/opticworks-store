import { Metadata } from "next"
import { WarrantyHero } from "@/components/support/WarrantyHero"
import { WarrantyClaimForm } from "@/components/support/WarrantyClaimForm"

export const metadata: Metadata = {
  title: "Warranty Claims - OpticWorks Window Tinting",
  description: "Submit a warranty claim for your OpticWorks window tinting kit. Upload photos and get fast resolution for defective products.",
  keywords: ["warranty", "claim", "defective", "replacement", "support"],
}

export default function WarrantyPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <WarrantyHero />
      <div className="py-16">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <WarrantyClaimForm />
        </div>
      </div>
    </main>
  )
}