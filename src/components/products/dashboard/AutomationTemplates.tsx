"use client"

import { FadeDiv } from "@/components/Fade"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const templates = [
  {
    name: "Goodnight Scene",
    description: "Trigger when sensor transitions to 'Occupied' after 10pm",
    yaml: `trigger:
  - platform: state
    entity_id: binary_sensor.bed_presence
    to: 'on'
condition:
  - condition: time
    after: '22:00:00'
action:
  - service: scene.turn_on
    target:
      entity_id: scene.goodnight`,
  },
  {
    name: "Morning Wake Sequence",
    description: "Gradual light ramp when sensor clears between 6-9am",
    yaml: `trigger:
  - platform: state
    entity_id: binary_sensor.bed_presence
    to: 'off'
    for: '00:05:00'
condition:
  - condition: time
    after: '06:00:00'
    before: '09:00:00'
action:
  - service: light.turn_on
    data:
      brightness_pct: 1
      transition: 60`,
  },
  {
    name: "Vacation Mode Override",
    description: "Disable automations when vacation mode is active",
    yaml: `condition:
  - condition: state
    entity_id: input_boolean.vacation_mode
    state: 'off'`,
  },
]

export function AutomationTemplates() {
  return (
    <div className="px-6 py-24 bg-gradient-to-br from-slate-50 to-white lg:px-8">
      <div className="mx-auto max-w-6xl">
        <FadeDiv className="text-center mb-16">
          <p className="text-sm uppercase tracking-wider text-gray-500 mb-4">
            Automation Templates
          </p>
          <h2 className="text-4xl font-semibold tracking-tight text-gray-900 mb-6">
            Common patterns, ready to deploy
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            The Dashboard Pack includes YAML snippets for the most popular presence-driven
            automations. Copy, paste, and customize for your setup.
          </p>
        </FadeDiv>

        <div className="space-y-6">
          {templates.map((template, index) => (
            <FadeDiv key={index}>
              <Card className="overflow-hidden border-2 hover:border-emerald-300 transition-colors">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {template.name}
                      </h3>
                      <p className="text-gray-600">
                        {template.description}
                      </p>
                    </div>
                    <Badge className="bg-emerald-100 text-emerald-700 border-0">
                      YAML
                    </Badge>
                  </div>
                  <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-sm text-gray-300">
                      <code>{template.yaml}</code>
                    </pre>
                  </div>
                </div>
              </Card>
            </FadeDiv>
          ))}
        </div>

        <FadeDiv className="mt-12 text-center">
          <Card className="inline-block bg-emerald-50 border-2 border-emerald-200">
            <div className="p-6">
              <p className="text-gray-700">
                <span className="font-semibold text-emerald-700">Bonus:</span> Package also
                includes template sensors for calculating &quot;time in bed tonight&quot; and &quot;average
                sleep duration this week&quot; using Home Assistant&apos;s built-in statistics platform.
              </p>
            </div>
          </Card>
        </FadeDiv>
      </div>
    </div>
  )
}
