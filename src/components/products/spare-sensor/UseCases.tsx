"use client"

import { FadeDiv } from "@/components/Fade"
import { Card, CardContent } from "@/components/ui/card"

const useCases = [
  {
    title: "Office Chair Occupancy",
    description: "Detect when you&apos;re sitting at your desk—even when perfectly still. Trigger 'focus mode' scenes or mute smart speakers automatically.",
    technicalNote: "Mount sensor aimed at chair seat from desk underside",
  },
  {
    title: "Nursery Sleep Monitoring",
    description: "Non-contact presence detection for cribs and bassinets. Privacy-first alternative to camera-based baby monitors.",
    technicalNote: "Requires careful Z-score tuning for infant breathing rates",
  },
  {
    title: "Pet Bed Automation",
    description: "Know when your dog or cat is sleeping in their bed. Control nearby heating pads or track rest patterns for senior pets.",
    technicalNote: "Works best with pets >5kg due to radar cross-section",
  },
  {
    title: "Lab Equipment Monitoring",
    description: "Non-invasive occupancy detection for fume hoods, lab benches, or equipment stations without installing contact sensors.",
    technicalNote: "Stainless steel environments may require shielding adjustments",
  },
  {
    title: "Meditation Cushion Tracker",
    description: "Log meditation sessions based on stillness duration on your cushion. Export data to wellness apps via MQTT.",
    technicalNote: "Absolute Clear Delay should be extended to 60s+",
  },
  {
    title: "Redundancy Backup",
    description: "Keep a spare sensor on hand for critical automation deployments. Swap if primary sensor fails without waiting for shipping.",
    technicalNote: "Flash same entity IDs for drop-in replacement",
  },
]

export function UseCases() {
  return (
    <div className="px-6 py-24 bg-white lg:px-8">
      <div className="mx-auto max-w-6xl">
        <FadeDiv className="text-center mb-16">
          <p className="text-sm uppercase tracking-wider text-gray-500 mb-4">
            Beyond The Bedroom
          </p>
          <h2 className="text-4xl font-semibold tracking-tight text-gray-900 mb-6">
            Creative applications for still-energy detection
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            The same mmWave technology that powers bed presence works anywhere you need to
            detect stationary humans (or pets). Here are ideas from our community.
          </p>
        </FadeDiv>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {useCases.map((useCase, index) => (
            <FadeDiv key={index}>
              <Card className="h-full border-2 hover:border-indigo-300 transition-colors">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    {useCase.title}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {useCase.description}
                  </p>
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-xs font-medium text-gray-500 mb-1">Technical note:</p>
                    <p className="text-sm text-gray-700 font-mono bg-gray-50 p-2 rounded">
                      {useCase.technicalNote}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </FadeDiv>
          ))}
        </div>
      </div>
    </div>
  )
}
