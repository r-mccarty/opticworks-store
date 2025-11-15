"use client"

import { FadeDiv } from "@/components/Fade"
import { Card, CardContent } from "@/components/ui/card"
import { HomeIcon, UsersIcon, MoonIcon } from "@heroicons/react/24/outline"

const useCases = [
  {
    icon: HomeIcon,
    title: "Master + Guest Room Coverage",
    description: "Deploy one sensor in your primary bedroom and another in the guest suite. Automations adapt based on which rooms are occupied.",
    example: "Hallway lights stay on until both rooms show 'Clear' state",
  },
  {
    icon: UsersIcon,
    title: "Split or Bunk Bed Scenarios",
    description: "Offset mounting jig included for detecting two sleepers in close proximity without interference.",
    example: "Each side of a king bed can trigger independent reading lights",
  },
  {
    icon: MoonIcon,
    title: "Nursery + Parent Room Sync",
    description: "Coordinate nighttime routines—when both sensors detect presence, house mode switches to 'Everyone Sleeping'.",
    example: "HVAC adjusts to night mode only when both zones are occupied",
  },
]

export function MultiRoomUseCases() {
  return (
    <div className="px-6 py-24 bg-white lg:px-8">
      <div className="mx-auto max-w-6xl">
        <FadeDiv className="text-center mb-16">
          <p className="text-sm uppercase tracking-wider text-gray-500 mb-4">
            Multi-Room Scenarios
          </p>
          <h2 className="text-4xl font-semibold tracking-tight text-gray-900 mb-6">
            Perfect for complex deployments
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Two sensors unlock automation patterns that single-zone setups can&apos;t handle.
            Here are the most popular configurations.
          </p>
        </FadeDiv>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {useCases.map((useCase, index) => {
            const Icon = useCase.icon
            return (
              <FadeDiv key={index}>
                <Card className="h-full border-2 hover:border-orange-300 transition-colors">
                  <CardContent className="p-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 mb-6">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      {useCase.title}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {useCase.description}
                    </p>
                    <div className="pt-4 border-t border-gray-200">
                      <p className="text-sm font-medium text-gray-500 mb-1">Example automation:</p>
                      <p className="text-sm text-gray-900 font-mono bg-gray-50 p-3 rounded-lg">
                        {useCase.example}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </FadeDiv>
            )
          })}
        </div>
      </div>
    </div>
  )
}
