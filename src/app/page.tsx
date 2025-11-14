import { CallToAction } from "@/components/ui/CallToAction"
import FeatureDivider from "@/components/ui/FeatureDivider"
import Features from "@/components/ui/Features"
import { Hero } from "@/components/ui/Hero"
import { PresenceHowItWorks } from "@/components/ui/PresenceHowItWorks"
import { PresenceStateEngine } from "@/components/ui/PresenceStateEngine"
import Testimonial from "@/components/ui/Testimonial"
import { TechnicalDifferentiators } from "@/components/ui/TechnicalDifferentiators"

export default function Home() {
  return (
    <main className="relative mx-auto flex flex-col">
      <Hero />
      <div className="mt-52 px-4 xl:px-0">
        <Features />
      </div>
      <FeatureDivider className="my-16 max-w-6xl" />
      <div className="px-4 xl:px-0">
        <PresenceHowItWorks />
      </div>
      <FeatureDivider className="my-16 max-w-6xl" />
      <div className="px-4 xl:px-0">
        <PresenceStateEngine />
      </div>
      <FeatureDivider className="my-16 max-w-6xl" />
      <div className="px-4 xl:px-0">
        <TechnicalDifferentiators />
      </div>
      <FeatureDivider className="my-16 max-w-6xl" />
      <div className="mt-12 px-4 xl:px-0">
        <Testimonial />
      </div>
      <FeatureDivider className="my-16 max-w-6xl" />
      <div className="mt-10 mb-40 px-4 xl:px-0">
        <CallToAction />
      </div>
    </main>
  )
}
