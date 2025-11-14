import { Metadata } from "next"
import { FadeContainer, FadeDiv } from "@/components/Fade"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const steps = [
  {
    title: "1. Mount the enclosure",
    description:
      "Attach the magnetic enclosure to the included bracket and secure it 18\" from the headboard, centered under the mattress. Adjustable bases can use the clip mounts.",
  },
  {
    title: "2. Route power + data",
    description:
      "Connect the USB-C cable to the ESP32 hub, then tuck the cable along the bed frame using the adhesive clips. Plug into a 5V power supply.",
  },
  {
    title: "3. Capture baseline",
    description:
      "Open Home Assistant → Integrations → OpticWorks Presence and start the baseline. Leave the bed empty for 60 seconds to record the still-energy offset.",
  },
  {
    title: "4. Validate confidence",
    description:
      "Lie on the bed and watch the console for presence confidence > 0.85. Stay still for 45 seconds to confirm Absolute Clear Delay behavior.",
  },
]

const checklist = [
  "Sensor mounted under bed rail",
  "USB-C cable strain relieved",
  "Baseline captured with empty bed",
  "Presence flips to Occupied within 2 seconds",
  "Clear delay holds for 30 seconds after getting up",
]

export const metadata: Metadata = {
  title: "Bed Presence Sensor Kit Install Guide",
  description:
    "Mounting, wiring, and calibration instructions for the OpticWorks Bed Presence Sensor Kit.",
}

export default function BedPresenceGuide() {
  return (
    <main className="min-h-screen bg-gray-50">
      <section className="bg-white pt-28 pb-16">
        <FadeContainer className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
          <FadeDiv>
            <Badge className="mb-6 rounded-full bg-orange-100 text-orange-700">
              Presence Sensors
            </Badge>
            <h1 className="text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
              Bed Presence Sensor Kit
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
              Follow these four steps to mount the mmWave module, capture a still-energy baseline,
              and validate your automations in Home Assistant.
            </p>
          </FadeDiv>
        </FadeContainer>
      </section>

      <section className="py-16">
        <FadeContainer className="mx-auto grid max-w-5xl gap-10 px-4 sm:px-6 lg:px-8 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Installation Steps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {steps.map((step) => (
                <div key={step.title} className="rounded-2xl border border-gray-200 bg-white p-6">
                  <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
                  <p className="mt-2 text-sm text-gray-600">{step.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Checklist</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {checklist.map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <span className="mt-1 inline-flex size-5 flex-none items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    ✓
                  </span>
                  <p className="text-sm text-gray-700">{item}</p>
                </div>
              ))}
              <div className="rounded-2xl bg-orange-50 p-4 text-left text-sm text-orange-800">
                Tip: expose `presence_reason` and `absolute_clear_timer` on your dashboard to watch the
                4-state machine change in real time.
              </div>
            </CardContent>
          </Card>
        </FadeContainer>
      </section>
    </main>
  )
}
