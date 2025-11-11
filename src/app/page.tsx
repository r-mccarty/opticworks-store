import { CallToActionSection } from "@/components/home/CallToActionSection"
import { FeatureHighlights } from "@/components/home/FeatureHighlights"
import { HomeHero } from "@/components/home/Hero"
import { InsightSection } from "@/components/home/InsightSection"
import { ProblemSolution } from "@/components/home/ProblemSolution"
import { TechnologySection } from "@/components/home/TechnologySection"
import { WorkflowSection } from "@/components/home/WorkflowSection"

export default function Home() {
  return (
    <main className="relative mx-auto flex flex-col gap-12 px-4 pb-24 pt-28 sm:px-6 lg:px-8">
      <HomeHero />
      <ProblemSolution />
      <TechnologySection />
      <FeatureHighlights />
      <InsightSection />
      <WorkflowSection />
      <CallToActionSection />
    </main>
  )
}
