import { Metadata } from "next"
import { FadeContainer, FadeDiv } from "@/components/Fade"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const phases = [
  {
    title: "Mount sensors with offset cones",
    bullets: [
      "Place sensors 12\" apart laterally to avoid overlapping still-energy zones.",
      "Aim each enclosure toward its mattress section; adjustable rails can use the clip mounts.",
      "Label the USB-C cables (Left / Right) before routing to the hub.",
    ],
  },
  {
    title: "Pair devices in Home Assistant",
    bullets: [
      "Add both ESP32 hubs via the OpticWorks integration.",
      "Assign friendly names (e.g., `primary_bed_presence`, `guest_bed_presence`).",
      "Enable the Duo Pack blueprint to keep debounced states in sync.",
    ],
  },
  {
    title: "Calibrate and test multi-room logic",
    bullets: [
      "Run the baseline wizard with each bed empty.",
      "Trigger presence on one bed at a time, verifying automations fire independently.",
      "Use the \"Linked Scenes\" helper if both beds should trigger the same lighting scene.",
    ],
  },
]

export const metadata: Metadata = {
  title: "Presence Sensor Duo Pack Install Guide",
  description: "Deploy two synchronized bed presence sensors without cross-talk or missed clears.",
}

export default function PresenceDuoPackGuide() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="bg-background pt-28 pb-16">
        <FadeContainer className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
          <FadeDiv>
            <Badge variant="secondary" className="mb-6 rounded-full">
              Multi‑room blueprint
            </Badge>
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl font-display">
              Presence Sensor Duo Pack
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              Install two synchronized sensors for split beds, primary + guest rooms, or clinic bays.
              Follow the phases below to prevent cross-triggering and keep automations coordinated.
            </p>
          </FadeDiv>
        </FadeContainer>
      </section>

      <section className="py-16">
        <FadeContainer className="mx-auto grid max-w-5xl gap-8 px-4 sm:px-6 lg:px-8">
          {phases.map((phase) => (
            <Card key={phase.title}>
              <CardHeader>
                <CardTitle>{phase.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                {phase.bullets.map((bullet) => (
                  <div key={bullet} className="flex gap-3">
                    <span className="mt-1 inline-flex size-5 flex-none items-center justify-center rounded-full bg-muted text-foreground">
                      ●
                    </span>
                    <p>{bullet}</p>
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
