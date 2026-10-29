import type { Metadata } from "next"

import { programs } from "@/content/programs"
import { PageIntro, Section } from "@/components/site/primitives"
import { ProgramFeature } from "@/components/site/programs"

export const metadata: Metadata = {
  title: "Products and programs",
  description:
    "OpticWorks development programs: a compact vertical machining center and the Mach 1 high-speed imaging program. Development status is stated on every page.",
}

export default function ProductsPage() {
  return (
    <main>
      <PageIntro
        label="Products"
        title="Instruments in development."
        lede="Our hardware programs are in development and none is available to buy yet. Each page states the program's status and labels every capability as validated, in development, an objective or a long-term vision."
      />
      {programs.map((program, i) => (
        <Section key={program.slug}>
          <ProgramFeature
            program={program}
            index={String(i + 1).padStart(2, "0")}
            reverse={i % 2 === 1}
          />
        </Section>
      ))}
    </main>
  )
}
