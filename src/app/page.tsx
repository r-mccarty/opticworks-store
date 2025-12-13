import { Hero } from "@/components/ui/Hero"
import Features from "@/components/ui/Features"
import { Specs } from "@/components/ui/Specs"

export default function Home() {
  return (
    <main className="relative w-full bg-neutral-950 text-neutral-200">
      <Hero />
      <Features />
      <Specs />
    </main>
  )
}
