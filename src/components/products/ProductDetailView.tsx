"use client"

import { useState } from "react"
import { Product } from "@/lib/products"
import { FadeContainer } from "@/components/Fade"
import { ProductHero } from "./ProductHero"

// Flagship Bed Sensor sections
import { ProblemSolution } from "./ProblemSolution"
import { InstallProcess } from "./InstallProcess"
import { TechnologyComparison } from "./TechnologyComparison"
import { KitContents } from "./KitContents"
import { SocialProofFAQ } from "./SocialProofFAQ"
import { FinalCTA } from "./FinalCTA"

// Duo Pack sections
import { DuoPackHero } from "./duo-pack/DuoPackHero"
import { MultiRoomUseCases } from "./duo-pack/MultiRoomUseCases"
import { SyncAutomationBlueprint } from "./duo-pack/SyncAutomationBlueprint"
import { PackageContents } from "./duo-pack/PackageContents"

// Developer Edition sections
import { DeveloperHero } from "./developer/DeveloperHero"
import { DebugCapabilities } from "./developer/DebugCapabilities"
import { BetaFirmware } from "./developer/BetaFirmware"
import { WhoItsFor } from "./developer/WhoItsFor"

// Dashboard Pack sections
import { DashboardHero } from "./dashboard/DashboardHero"
import { DashboardScreenshots } from "./dashboard/DashboardScreenshots"
import { AutomationTemplates } from "./dashboard/AutomationTemplates"
import { Requirements } from "./dashboard/Requirements"

// Enclosure Pack sections
import { EnclosureHero } from "./enclosure/EnclosureHero"
import { MountingOptions } from "./enclosure/MountingOptions"
import { DesignDetails } from "./enclosure/DesignDetails"
import { Compatibility } from "./enclosure/Compatibility"

// Spare Sensor sections
import { SpareSensorHero } from "./spare-sensor/SpareSensorHero"
import { UseCases } from "./spare-sensor/UseCases"
import { TechnicalSpecs } from "./spare-sensor/TechnicalSpecs"

// Lab Subscription sections
import { LabHero } from "./lab-subscription/LabHero"
import { MemberBenefits } from "./lab-subscription/MemberBenefits"
import { CommunityShowcase } from "./lab-subscription/CommunityShowcase"
import { FAQ } from "./lab-subscription/FAQ"

interface ProductDetailViewProps {
  product: Product
}

export function ProductDetailView({ product }: ProductDetailViewProps) {
  const [selectedVariant, setSelectedVariant] = useState(
    product.variants ? product.variants[0] : null
  )

  // Render flagship bed sensor landing page
  if (product.id === "bed-presence-sensor-kit") {
    return (
      <main className="relative">
        <FadeContainer className="relative">
          <ProductHero
            product={product}
            selectedVariant={selectedVariant}
            onVariantChange={setSelectedVariant}
          />
          <ProblemSolution />
          <InstallProcess />
          <TechnologyComparison />
          <KitContents />
          <SocialProofFAQ />
          <FinalCTA
            product={product}
            selectedVariant={selectedVariant}
          />
        </FadeContainer>
      </main>
    )
  }

  // Render Duo Pack landing page
  if (product.id === "presence-sensor-duo-pack") {
    return (
      <main className="relative">
        <FadeContainer className="relative">
          <ProductHero
            product={product}
            selectedVariant={selectedVariant}
            onVariantChange={setSelectedVariant}
          />
          <DuoPackHero />
          <MultiRoomUseCases />
          <SyncAutomationBlueprint />
          <PackageContents />
          <FinalCTA
            product={product}
            selectedVariant={selectedVariant}
          />
        </FadeContainer>
      </main>
    )
  }

  // Render Developer Edition landing page
  if (product.id === "presence-developer-edition") {
    return (
      <main className="relative">
        <FadeContainer className="relative">
          <ProductHero
            product={product}
            selectedVariant={selectedVariant}
            onVariantChange={setSelectedVariant}
          />
          <DeveloperHero />
          <DebugCapabilities />
          <BetaFirmware />
          <WhoItsFor />
          <FinalCTA
            product={product}
            selectedVariant={selectedVariant}
          />
        </FadeContainer>
      </main>
    )
  }

  // Render Dashboard Pack landing page
  if (product.id === "presence-dashboard-pack") {
    return (
      <main className="relative">
        <FadeContainer className="relative">
          <ProductHero
            product={product}
            selectedVariant={selectedVariant}
            onVariantChange={setSelectedVariant}
          />
          <DashboardHero />
          <DashboardScreenshots />
          <AutomationTemplates />
          <Requirements />
          <FinalCTA
            product={product}
            selectedVariant={selectedVariant}
          />
        </FadeContainer>
      </main>
    )
  }

  // Render Enclosure Pack landing page
  if (product.id === "presence-enclosure-pack") {
    return (
      <main className="relative">
        <FadeContainer className="relative">
          <ProductHero
            product={product}
            selectedVariant={selectedVariant}
            onVariantChange={setSelectedVariant}
          />
          <EnclosureHero />
          <MountingOptions />
          <DesignDetails />
          <Compatibility />
          <FinalCTA
            product={product}
            selectedVariant={selectedVariant}
          />
        </FadeContainer>
      </main>
    )
  }

  // Render Spare Sensor landing page
  if (product.id === "presence-spare-sensor") {
    return (
      <main className="relative">
        <FadeContainer className="relative">
          <ProductHero
            product={product}
            selectedVariant={selectedVariant}
            onVariantChange={setSelectedVariant}
          />
          <SpareSensorHero />
          <UseCases />
          <TechnicalSpecs />
          <FinalCTA
            product={product}
            selectedVariant={selectedVariant}
          />
        </FadeContainer>
      </main>
    )
  }

  // Render Lab Subscription landing page
  if (product.id === "presence-lab-support") {
    return (
      <main className="relative">
        <FadeContainer className="relative">
          <ProductHero
            product={product}
            selectedVariant={selectedVariant}
            onVariantChange={setSelectedVariant}
          />
          <LabHero />
          <MemberBenefits />
          <CommunityShowcase />
          <FAQ />
          <FinalCTA
            product={product}
            selectedVariant={selectedVariant}
          />
        </FadeContainer>
      </main>
    )
  }

  // Fallback for any other products
  return (
    <main className="relative">
      <FadeContainer className="relative">
        <ProductHero
          product={product}
          selectedVariant={selectedVariant}
          onVariantChange={setSelectedVariant}
        />
        <FinalCTA
          product={product}
          selectedVariant={selectedVariant}
        />
      </FadeContainer>
    </main>
  )
}
