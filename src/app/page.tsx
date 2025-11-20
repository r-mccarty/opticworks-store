import { HeroMD3 } from "@/components/ui/md3/HeroMD3"
import FeaturesMD3 from "@/components/ui/md3/FeaturesMD3"
import { PresenceHowItWorksMD3 } from "@/components/ui/md3/PresenceHowItWorksMD3"
import { TechnicalDifferentiatorsMD3 } from "@/components/ui/md3/TechnicalDifferentiatorsMD3"
import { PresenceStateEngine } from "@/components/ui/PresenceStateEngine"
import Testimonial from "@/components/ui/Testimonial"
import { CallToAction } from "@/components/ui/CallToAction"

export default function Home() {
  return (
    <main className="relative mx-auto flex w-full flex-col overflow-x-hidden bg-[var(--color-md-neutral-99)]">
      <HeroMD3 />
      <FeaturesMD3 />
      <PresenceHowItWorksMD3 />
      <PresenceStateEngine />
      <TechnicalDifferentiatorsMD3 />
      <Testimonial />
      <CallToAction />
    </main>
  )
}
