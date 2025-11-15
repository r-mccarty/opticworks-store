"use client"

import { FadeDiv } from "@/components/Fade"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircleIcon } from "@heroicons/react/24/solid"

const benefits = [
  {
    title: "Monthly Firmware Releases",
    description: "Stable builds with new features, performance improvements, and bug fixes delivered the first Friday of each month.",
    details: [
      "Full changelog with technical notes",
      "OTA update support for all hardware",
      "Rollback instructions if issues arise",
    ],
  },
  {
    title: "Guided Tuning Sessions",
    description: "Bi-weekly live sessions where engineers walk through optimal threshold settings, automation patterns, and troubleshooting.",
    details: [
      "Recorded for timezone flexibility",
      "Q&A with firmware developers",
      "Dashboard reviews for your specific setup",
    ],
  },
  {
    title: "Experimental Feature Toggles",
    description: "Early access to detection modes under active development. Test adaptive thresholds, multi-target tracking, and HVAC filters.",
    details: [
      "Safe A/B testing via feature flags",
      "Direct feedback channel to engineering",
      "First to know about roadmap changes",
    ],
  },
  {
    title: "Private Discord Lab Channel",
    description: "Dedicated space to share automation YAML, troubleshoot edge cases, and collaborate on detection algorithm improvements.",
    details: [
      "Direct engineer participation",
      "Community experiment library",
      "Priority support for lab members",
    ],
  },
  {
    title: "Lab Equipment Discounts",
    description: "15% off all hardware purchases while your subscription is active. Applies to sensors, enclosures, and developer editions.",
    details: [
      "Stackable with bundle pricing",
      "No purchase limits",
      "Discount code auto-applied at checkout",
    ],
  },
  {
    title: "Firmware Source Access",
    description: "Read-only repository access to the presence engine codebase. Study the state machine, z-score logic, and debounce implementation.",
    details: [
      "PlatformIO build environment",
      "Code annotations and architecture docs",
      "Submit pull requests for consideration",
    ],
  },
]

export function MemberBenefits() {
  return (
    <div className="px-6 py-24 bg-white lg:px-8">
      <div className="mx-auto max-w-6xl">
        <FadeDiv className="text-center mb-16">
          <p className="text-sm uppercase tracking-wider text-gray-500 mb-4">
            Member Benefits
          </p>
          <h2 className="text-4xl font-semibold tracking-tight text-gray-900 mb-6">
            What&apos;s included in your subscription
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            The Reliability Lab is designed for enthusiasts who want to stay on the bleeding
            edge of presence detection technology and contribute to the platform&apos;s evolution.
          </p>
        </FadeDiv>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {benefits.map((benefit, index) => (
            <FadeDiv key={index}>
              <Card className="h-full border-2 hover:border-rose-300 transition-colors">
                <CardContent className="p-8">
                  <div className="flex items-start gap-3 mb-4">
                    <CheckCircleIcon className="w-6 h-6 text-rose-500 flex-shrink-0 mt-1" />
                    <h3 className="text-xl font-semibold text-gray-900">
                      {benefit.title}
                    </h3>
                  </div>
                  <p className="text-gray-600 mb-6">
                    {benefit.description}
                  </p>
                  <div className="space-y-2">
                    {benefit.details.map((detail, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="text-rose-400 mt-1 text-sm">•</span>
                        <p className="text-sm text-gray-700">{detail}</p>
                      </div>
                    ))}
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
