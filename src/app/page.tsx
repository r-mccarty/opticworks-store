import { Hero } from "@/components/ui/Hero"
import Features from "@/components/ui/Features"
import { Specs } from "@/components/ui/Specs"
import Newsletter from "@/components/ui/Newsletter"

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-200">
      <Hero />
      <Features />
      <Specs />
      <Newsletter />
    </main>
  )
}
