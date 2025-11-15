"use client"

import { FadeDiv } from "@/components/Fade"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/solid"

const requirements = [
  { label: "Home Assistant 2024.12 or later", required: true },
  { label: "Bed Presence Sensor (any variant)", required: true },
  { label: "Lovelace dashboards enabled", required: true },
  { label: "HACS (for Apex Charts card)", required: false },
  { label: "Node-RED or AppDaemon", required: false },
]

export function Requirements() {
  return (
    <div className="px-6 py-24 bg-white lg:px-8">
      <div className="mx-auto max-w-4xl">
        <FadeDiv className="text-center mb-12">
          <p className="text-sm uppercase tracking-wider text-gray-500 mb-4">
            Technical Requirements
          </p>
          <h2 className="text-3xl font-semibold tracking-tight text-gray-900 mb-6">
            What you need to use this pack
          </h2>
        </FadeDiv>

        <FadeDiv>
          <Card className="border-2">
            <CardContent className="p-8">
              <div className="space-y-4">
                {requirements.map((req, index) => (
                  <div key={index} className="flex items-center justify-between py-3 border-b border-gray-200 last:border-0">
                    <span className="text-gray-900 font-medium">{req.label}</span>
                    <div className="flex items-center gap-2">
                      {req.required ? (
                        <>
                          <CheckCircleIcon className="w-5 h-5 text-green-500" />
                          <span className="text-sm text-green-600 font-medium">Required</span>
                        </>
                      ) : (
                        <>
                          <XCircleIcon className="w-5 h-5 text-gray-400" />
                          <span className="text-sm text-gray-500">Optional</span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-8 border-t border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3">Delivery & License</h4>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 mt-1">•</span>
                    Instant download as a ZIP archive containing YAML files and documentation
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 mt-1">•</span>
                    Household license—use across unlimited Home Assistant instances you control
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 mt-1">•</span>
                    Free updates for the lifetime of the product (delivered via email)
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 mt-1">•</span>
                    No DRM, no phone-home, no subscription required
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </FadeDiv>
      </div>
    </div>
  )
}
