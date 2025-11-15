"use client"

import { FadeDiv } from "@/components/Fade"
import { Card } from "@/components/ui/card"

const dashboards = [
  {
    name: "Live Presence Overview",
    description: "Single-pane view of all sensors with binary state, confidence score, and time-since-last-change.",
    features: ["Entity cards with custom icons", "Conditional formatting based on state", "Quick-action buttons for manual override"],
  },
  {
    name: "Tuning & Diagnostics",
    description: "Adjust detection thresholds, debounce timers, and Absolute Clear Delay with instant feedback.",
    features: ["Number sliders for all parameters", "Live preview of state changes", "Reset to factory defaults button"],
  },
  {
    name: "Historical Analytics",
    description: "Week-over-week presence patterns, average occupancy duration, and automation trigger counts.",
    features: ["Apex Charts integration", "Exportable CSV data", "Custom time range picker"],
  },
]

export function DashboardScreenshots() {
  return (
    <div className="px-6 py-24 bg-white lg:px-8">
      <div className="mx-auto max-w-6xl">
        <FadeDiv className="text-center mb-16">
          <p className="text-sm uppercase tracking-wider text-gray-500 mb-4">
            What&apos;s Included
          </p>
          <h2 className="text-4xl font-semibold tracking-tight text-gray-900 mb-6">
            Three pre-built dashboards
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Each dashboard is delivered as a YAML file you can import into Home Assistant&apos;s
            Lovelace UI. Customize colors, layouts, and cards to match your setup.
          </p>
        </FadeDiv>

        <div className="space-y-12">
          {dashboards.map((dashboard, index) => (
            <FadeDiv key={index}>
              <Card className="overflow-hidden border-2 hover:shadow-xl transition-shadow">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                  <div className="p-8 lg:p-12 flex flex-col justify-center">
                    <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                      {dashboard.name}
                    </h3>
                    <p className="text-gray-600 mb-6">
                      {dashboard.description}
                    </p>
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-gray-500 mb-2">Key Features:</p>
                      {dashboard.features.map((feature, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                          <p className="text-gray-700">{feature}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-gray-900 to-slate-800 p-8 lg:p-12 flex items-center justify-center">
                    <div className="w-full aspect-video bg-gray-800 rounded-lg border border-gray-700 flex items-center justify-center">
                      <p className="text-gray-500 text-sm">Dashboard Preview</p>
                    </div>
                  </div>
                </div>
              </Card>
            </FadeDiv>
          ))}
        </div>
      </div>
    </div>
  )
}
