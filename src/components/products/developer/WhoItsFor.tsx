"use client"

import { FadeDiv } from "@/components/Fade"
import { Card, CardContent } from "@/components/ui/card"
import { AcademicCapIcon, WrenchScrewdriverIcon, BuildingOffice2Icon } from "@heroicons/react/24/outline"

const audiences = [
  {
    icon: AcademicCapIcon,
    title: "Researchers & Academics",
    description: "Study still-energy detection patterns, validate mmWave algorithms against ground truth data, or publish papers on presence sensing techniques.",
    examples: ["Sleep lab telemetry studies", "Multi-occupant detection research", "HVAC impact on sensor accuracy"],
  },
  {
    icon: WrenchScrewdriverIcon,
    title: "Hardware Tinkerers",
    description: "Build custom enclosures with integrated displays, add external antenna mods, or interface with non-standard automation platforms.",
    examples: ["Custom PCB integrations", "Third-party Matter/Zigbee bridges", "Battery-powered portable variants"],
  },
  {
    icon: BuildingOffice2Icon,
    title: "OEM & Integrators",
    description: "Evaluate the presence engine for commercial deployments, hotel room automation, or white-label smart furniture integrations.",
    examples: ["Adjustable bed manufacturers", "Senior living facility pilots", "Boutique hotel automation"],
  },
]

export function WhoItsFor() {
  return (
    <div className="px-6 py-24 bg-white lg:px-8">
      <div className="mx-auto max-w-6xl">
        <FadeDiv className="text-center mb-16">
          <p className="text-sm uppercase tracking-wider text-gray-500 mb-4">
            Target Audience
          </p>
          <h2 className="text-4xl font-semibold tracking-tight text-gray-900 mb-6">
            Built for technical depth
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            If you&apos;re satisfied with plug-and-play sensors, the standard Bed Presence Kit
            is the better choice. The Developer Edition is for teams and individuals who
            need low-level access.
          </p>
        </FadeDiv>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {audiences.map((audience, index) => {
            const Icon = audience.icon
            return (
              <FadeDiv key={index}>
                <Card className="h-full border-2 hover:border-purple-300 transition-colors">
                  <CardContent className="p-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-blue-100 mb-6">
                      <Icon className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      {audience.title}
                    </h3>
                    <p className="text-gray-600 mb-6">
                      {audience.description}
                    </p>
                    <div className="pt-4 border-t border-gray-200">
                      <p className="text-sm font-medium text-gray-500 mb-2">Example use cases:</p>
                      <ul className="space-y-1">
                        {audience.examples.map((example, i) => (
                          <li key={i} className="text-sm text-gray-700 flex items-start">
                            <span className="text-purple-500 mr-2">•</span>
                            {example}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </FadeDiv>
            )
          })}
        </div>

        <FadeDiv className="mt-12 text-center">
          <Card className="inline-block bg-purple-50 border-2 border-purple-200">
            <CardContent className="p-6">
              <p className="text-gray-700">
                <span className="font-semibold text-purple-700">Note:</span> Developer Edition
                purchases include standard Bed Presence Sensor hardware plus breakout board,
                dev cables, and beta firmware access. All standard warranty terms apply.
              </p>
            </CardContent>
          </Card>
        </FadeDiv>
      </div>
    </div>
  )
}
