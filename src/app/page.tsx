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
    <main className="relative mx-auto flex w-full flex-col overflow-x-hidden">
      <Hero />
      <div className="mt-52 w-full px-4 xl:px-0">
        <Features />
      </div>
      <div className="w-full px-4 xl:px-0">
        <FeatureDivider className="my-16 max-w-6xl" />
      </div>
      <div className="w-full px-4 xl:px-0">
        <PresenceHowItWorks />
      </div>
      <div className="w-full px-4 xl:px-0">
        <FeatureDivider className="my-16 max-w-6xl" />
      </div>
      <div className="w-full px-4 xl:px-0">
        <PresenceStateEngine />
      </div>
      <div className="w-full px-4 xl:px-0">
        <FeatureDivider className="my-16 max-w-6xl" />
      </div>
      <div className="w-full px-4 xl:px-0">
        <TechnicalDifferentiators />
      </div>
      <div className="w-full px-4 xl:px-0">
        <FeatureDivider className="my-16 max-w-6xl" />
      </div>
      <div className="mt-12 w-full px-4 xl:px-0">
        <Testimonial />
      </div>
      <div className="w-full px-4 xl:px-0">
        <FeatureDivider className="my-16 max-w-6xl" />
      </div>
      <div className="mt-10 mb-40 w-full px-4 xl:px-0">
        <CallToAction />
      </div>
    </main>
  )
}
