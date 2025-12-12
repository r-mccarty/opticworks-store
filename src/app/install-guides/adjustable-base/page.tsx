import { Metadata } from "next"
import { FadeContainer, FadeDiv } from "@/components/Fade"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const sections = [
  {
    title: "Hardware Prep",
    details: [
      "Power down the adjustable base and move it to the flat position.",
      "Attach the angled bracket to the enclosure so the mmWave cone clears the moving rails.",
      "Snap the strain-relief clip on the USB-C cable to prevent tugging during motion.",
    ],
  },
  {
    title: "Mount + Cable Management",
    details: [
      "Use the adhesive flex mount on the stationary cross member, not the moving lift arms.",
      "Route the cable through the included braided sleeve and zip-tie it alongside factory harnesses.",
      "Test full articulation of the base to ensure nothing snags or pinches.",
    ],
  },
  {
    title: "Calibration Adjustments",
    details: [
      "Increase Absolute Clear Delay to 45s to account for base motion after exiting the bed.",
      "Enable \"Motion Dampening\" in the console if the base vibration triggers false readings.",
      "Log one full night and check the confidence chart before deploying new automations.",
    ],
  },
]

export const metadata: Metadata = {
  title: "Adjustable Base Install Guide",
  description: "Mount OpticWorks presence sensors on adjustable or split bases without false triggers.",
}

export default function AdjustableBaseGuide() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="bg-background pt-28 pb-16">
        <FadeContainer className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
          <FadeDiv>
            <Badge variant="secondary" className="mb-6 rounded-full">
              Advanced install
            </Badge>
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl font-display">
              Adjustable Base & Split Beds
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              Keep presence readings accurate even when the bed frame moves. This guide covers mounting,
              cable management, and calibration tweaks for adjustable platforms.
            </p>
          </FadeDiv>
        </FadeContainer>
      </section>

      <section className="py-16">
        <FadeContainer className="mx-auto grid max-w-5xl gap-8 px-4 sm:px-6 lg:px-8">
          {sections.map((section) => (
            <Card key={section.title}>
              <CardHeader>
                <CardTitle>{section.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                {section.details.map((detail) => (
                  <div key={detail} className="flex gap-3">
                    <span className="mt-1 inline-flex size-5 flex-none items-center justify-center rounded-full bg-muted text-foreground">
                      ●
                    </span>
                    <p>{detail}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </FadeContainer>
      </section>
    </main>
  )
}
