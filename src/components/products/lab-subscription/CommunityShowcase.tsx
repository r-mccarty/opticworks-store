"use client"

import { FadeDiv } from "@/components/Fade"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const showcaseProjects = [
  {
    author: "@HomeLabHero",
    title: "Multi-Zone Sleep Score Dashboard",
    description: "Tracked family sleep patterns across 4 bedrooms for 90 days using z-score histograms and Grafana.",
    tag: "Analytics",
  },
  {
    author: "@AutomationAce",
    title: "Adaptive HVAC Based on Bed Occupancy",
    description: "Dynamically adjusts thermostat setpoints based on real-time presence confidence scores to save 22% on heating costs.",
    tag: "Energy",
  },
  {
    author: "@TinkerTech",
    title: "Custom Multi-Target Algorithm",
    description: "Modified firmware to detect two sleepers in a king bed with independent confidence tracking per side.",
    tag: "Firmware Mod",
  },
  {
    author: "@DevOpsDoug",
    title: "Presence-Triggered Security Mode",
    description: "Whole-home security system that only arms doors/windows when all bed sensors show 'Clear' state for 15+ minutes.",
    tag: "Security",
  },
]

export function CommunityShowcase() {
  return (
    <div className="px-6 py-24 bg-gradient-to-br from-slate-50 to-white lg:px-8">
      <div className="mx-auto max-w-6xl">
        <FadeDiv className="text-center mb-16">
          <p className="text-sm uppercase tracking-wider text-gray-500 mb-4">
            Community Showcase
          </p>
          <h2 className="text-4xl font-semibold tracking-tight text-gray-900 mb-6">
            Built by lab members
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            The Reliability Lab Discord is filled with creative automation ideas, custom
            dashboards, and firmware experiments. Here are recent highlights.
          </p>
        </FadeDiv>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {showcaseProjects.map((project, index) => (
            <FadeDiv key={index}>
              <Card className="h-full border-2 hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <p className="text-sm font-medium text-gray-500">{project.author}</p>
                    <Badge className="bg-rose-100 text-rose-700 border-0 text-xs">
                      {project.tag}
                    </Badge>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    {project.title}
                  </h3>
                  <p className="text-gray-600">
                    {project.description}
                  </p>
                </CardContent>
              </Card>
            </FadeDiv>
          ))}
        </div>

        <FadeDiv className="mt-12 text-center">
          <Card className="inline-block bg-rose-50 border-2 border-rose-200">
            <CardContent className="p-6">
              <p className="text-gray-700">
                <span className="font-semibold text-rose-700">Want to share your project?</span>
                {" "}Lab members can submit showcase entries via Discord. The best projects get
                featured in monthly firmware release notes and our public documentation.
              </p>
            </CardContent>
          </Card>
        </FadeDiv>
      </div>
    </div>
  )
}
