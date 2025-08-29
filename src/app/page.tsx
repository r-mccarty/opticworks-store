import { CallToAction } from "@/components/ui/CallToAction"
import FeatureDivider from "@/components/ui/FeatureDivider"
import Features from "@/components/ui/Features"
import { Hero } from "@/components/ui/Hero"
import { Map } from "@/components/ui/Map/Map"
import { SolarAnalytics } from "@/components/ui/SolarAnalytics"
import Testimonial from "@/components/ui/Testimonial"

export default function Home() {
  return (
    <>
      <Hero />
      <div className="mt-52">
        <Features />
      </div>
      <div className="mt-32">
        <Testimonial />
      </div>
      <FeatureDivider className="my-16 max-w-6xl" />
      <div className="">
        <Map />
      </div>
      <FeatureDivider className="my-16 max-w-6xl" />
      <div className="mt-12 mb-40">
        <SolarAnalytics />
      </div>
      <FeatureDivider className="my-16 max-w-6xl" />
      <div className="mt-10 mb-40">
        <CallToAction />
      </div>
    </>
  )
}