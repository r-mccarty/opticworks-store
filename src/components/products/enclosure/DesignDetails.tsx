"use client"

import { FadeDiv } from "@/components/Fade"
import { Card } from "@/components/ui/card"

const designFeatures = [
  {
    title: "Matte Black Finish",
    description: "Powder-coated PETG with a soft-touch surface that resists fingerprints and matches premium furniture aesthetics.",
  },
  {
    title: "Ventilation Slots",
    description: "Precision-cut airflow channels prevent ESP32 thermal throttling during long detection sessions.",
  },
  {
    title: "Cable Strain Relief",
    description: "Molded USB-C port guard protects cable from bending damage when routed along bed rails.",
  },
  {
    title: "Status LED Window",
    description: "Frosted acrylic diffuser for the ESP32's onboard LED—see power/activity without harsh glare.",
  },
  {
    title: "Radar-Transparent Front",
    description: "0.8mm PETG wall thickness optimized for 60GHz mmWave signal penetration without attenuation.",
  },
  {
    title: "TPU Damping Feet",
    description: "Soft-touch thermoplastic feet prevent scratches on nightstands and absorb vibration from adjustable bases.",
  },
]

export function DesignDetails() {
  return (
    <div className="px-6 py-24 bg-gradient-to-br from-slate-50 to-white lg:px-8">
      <div className="mx-auto max-w-6xl">
        <FadeDiv className="text-center mb-16">
          <p className="text-sm uppercase tracking-wider text-gray-500 mb-4">
            Engineering Details
          </p>
          <h2 className="text-4xl font-semibold tracking-tight text-gray-900 mb-6">
            Every detail considered
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            We obsessed over material selection, wall thickness, and thermal dynamics so the
            enclosure enhances sensor performance instead of compromising it.
          </p>
        </FadeDiv>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {designFeatures.map((feature, index) => (
            <FadeDiv key={index}>
              <Card className="h-full p-6 border-2 hover:shadow-lg transition-shadow">
                <h3 className="font-semibold text-gray-900 mb-3 text-lg">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            </FadeDiv>
          ))}
        </div>

        <FadeDiv className="mt-16">
          <Card className="bg-zinc-50 border-2 border-zinc-200 p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <p className="text-3xl font-bold text-gray-900 mb-2">58mm</p>
                <p className="text-sm text-gray-600">Width × 45mm Height × 22mm Depth</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900 mb-2">±30°</p>
                <p className="text-sm text-gray-600">Adjustable tilt range for radar aiming</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900 mb-2">42g</p>
                <p className="text-sm text-gray-600">Total weight with sensor installed</p>
              </div>
            </div>
          </Card>
        </FadeDiv>
      </div>
    </div>
  )
}
