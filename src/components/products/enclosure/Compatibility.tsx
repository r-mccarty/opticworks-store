"use client"

import { FadeDiv } from "@/components/Fade"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircleIcon } from "@heroicons/react/24/solid"

const compatibleProducts = [
  "Bed Presence Sensor Kit (all variants)",
  "Presence Sensor Duo Pack",
  "Presence Engine Developer Edition",
  "Spare mmWave Sensor Module",
]

export function Compatibility() {
  return (
    <div className="px-6 py-24 bg-white lg:px-8">
      <div className="mx-auto max-w-4xl">
        <FadeDiv className="text-center mb-12">
          <p className="text-sm uppercase tracking-wider text-gray-500 mb-4">
            Product Compatibility
          </p>
          <h2 className="text-3xl font-semibold tracking-tight text-gray-900 mb-6">
            Works with all OpticWorks sensors
          </h2>
          <p className="text-lg text-gray-600">
            The Magnetic Enclosure Pack is designed to fit every Bed Presence Sensor SKU
            we ship. Purchase extras for multi-room deployments or replacements.
          </p>
        </FadeDiv>

        <FadeDiv>
          <Card className="border-2">
            <CardContent className="p-8">
              <h3 className="font-semibold text-gray-900 mb-6 text-lg">Compatible Products:</h3>
              <div className="space-y-4">
                {compatibleProducts.map((product, index) => (
                  <div key={index} className="flex items-center gap-3 py-2">
                    <CheckCircleIcon className="w-6 h-6 text-green-500 flex-shrink-0" />
                    <span className="text-gray-900">{product}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-8 border-t border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-4">What&apos;s Included:</h4>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-zinc-500 mt-1">•</span>
                    1× Matte black PETG enclosure with magnetic backplate
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-zinc-500 mt-1">•</span>
                    1× Adjustable tilt bracket (±30° range)
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-zinc-500 mt-1">•</span>
                    4× Neodymium mounting magnets (pre-installed)
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-zinc-500 mt-1">•</span>
                    2× 3M VHB adhesive pads (backup + wall plate)
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-zinc-500 mt-1">•</span>
                    1× Spring-loaded bed-rail clip (10-40mm capacity)
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-zinc-500 mt-1">•</span>
                    Installation guide with mounting best practices
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-8 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">Note:</span> Sensor hardware
                  and USB-C cable sold separately. The Enclosure Pack is a mounting accessory
                  for existing OpticWorks presence sensors.
                </p>
              </div>
            </CardContent>
          </Card>
        </FadeDiv>
      </div>
    </div>
  )
}
