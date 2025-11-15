"use client"

import { FadeDiv } from "@/components/Fade"
import { Card } from "@/components/ui/card"
import { CheckCircleIcon } from "@heroicons/react/24/solid"

export function SyncAutomationBlueprint() {
  return (
    <div className="px-6 py-24 bg-gradient-to-br from-slate-50 to-white lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <FadeDiv>
            <p className="text-sm uppercase tracking-wider text-gray-500 mb-4">
              Included Automation Template
            </p>
            <h2 className="text-4xl font-semibold tracking-tight text-gray-900 mb-6">
              Coordinated logic
              <br />
              built for multi-room deployments
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              The Duo Pack includes a Home Assistant blueprint that coordinates both sensors
              without manual scripting. It handles state transitions, debounce coordination,
              and whole-home occupancy logic.
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircleIcon className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">
                    Unified Occupancy State
                  </h4>
                  <p className="text-gray-600">
                    Combine both sensors into a single &quot;home_occupied&quot; binary sensor
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircleIcon className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">
                    Zone-Specific Actions
                  </h4>
                  <p className="text-gray-600">
                    Trigger different scenes based on which room detected presence first
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircleIcon className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">
                    Shared Debounce Logic
                  </h4>
                  <p className="text-gray-600">
                    Prevents automation conflicts when both sensors transition simultaneously
                  </p>
                </div>
              </div>
            </div>
          </FadeDiv>

          <FadeDiv>
            <Card className="p-6 bg-slate-900 text-white border-0 shadow-2xl">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="ml-2 text-sm text-gray-400">duo_occupancy_blueprint.yaml</span>
              </div>
              <pre className="text-sm text-gray-300 overflow-x-auto">
                <code>{`blueprint:
  name: Duo Pack Unified Occupancy
  domain: automation
  input:
    sensor_master:
      name: Master Bedroom Sensor
      selector:
        entity:
          domain: binary_sensor
    sensor_guest:
      name: Guest Bedroom Sensor
      selector:
        entity:
          domain: binary_sensor

trigger:
  - platform: state
    entity_id: !input sensor_master
  - platform: state
    entity_id: !input sensor_guest

action:
  - service: input_boolean.turn_{{
      'on' if is_state(input.sensor_master, 'on')
      or is_state(input.sensor_guest, 'on')
      else 'off'
    }}
    target:
      entity_id: input_boolean.home_occupied`}</code>
              </pre>
            </Card>
          </FadeDiv>
        </div>
      </div>
    </div>
  )
}
