"use client"

import { FadeDiv } from "@/components/Fade"
import { Card, CardContent } from "@/components/ui/card"

const contents = [
  {
    quantity: "2×",
    item: "Bed Presence Sensor Modules",
    details: "60GHz mmWave w/ still-energy focus, pre-flashed firmware",
  },
  {
    quantity: "2×",
    item: "ESP32-S3 Gateway Units",
    details: "Wi-Fi + BLE, 4-state presence engine, OTA update ready",
  },
  {
    quantity: "2×",
    item: "Magnetic Enclosures",
    details: "Matte black PETG, adjustable tilt brackets, adhesive + clip options",
  },
  {
    quantity: "2×",
    item: "USB-C Power Cables",
    details: "2m braided cables with 5V adapters",
  },
  {
    quantity: "1×",
    item: "Offset Mounting Jig",
    details: "For split beds and bunk configurations",
  },
  {
    quantity: "1×",
    item: "Home Assistant Blueprint Pack",
    details: "YAML templates for coordinated automations + dashboard cards",
  },
]

export function PackageContents() {
  return (
    <div className="px-6 py-24 bg-white lg:px-8">
      <div className="mx-auto max-w-6xl">
        <FadeDiv className="text-center mb-16">
          <p className="text-sm uppercase tracking-wider text-gray-500 mb-4">
            What&apos;s Included
          </p>
          <h2 className="text-4xl font-semibold tracking-tight text-gray-900 mb-6">
            Everything you need for two zones
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            The Duo Pack arrives flashed, calibrated, and ready to pair with Home Assistant.
            No soldering, no firmware compiling—just mount, plug in, and configure.
          </p>
        </FadeDiv>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {contents.map((item, index) => (
            <FadeDiv key={index}>
              <Card className="h-full border-2 hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center">
                      <span className="text-lg font-bold text-orange-600">{item.quantity}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-2">
                        {item.item}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {item.details}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </FadeDiv>
          ))}
        </div>

        <FadeDiv className="mt-12 text-center">
          <p className="text-gray-600">
            All components backed by our{" "}
            <span className="font-semibold text-gray-900">2-year hardware warranty</span>.
          </p>
        </FadeDiv>
      </div>
    </div>
  )
}
