"use client"

import { FadeDiv } from "@/components/Fade"
import { Card, CardContent } from "@/components/ui/card"
import {
  CommandLineIcon,
  CircleStackIcon,
  CogIcon,
  ChartBarIcon
} from "@heroicons/react/24/outline"

const capabilities = [
  {
    icon: CommandLineIcon,
    title: "UART Serial Console",
    description: "Direct ESP32 log output at 115200 baud. See every state transition, z-score calculation, and threshold evaluation in real time.",
    feature: "Boot logs, crash dumps, debug printf statements",
  },
  {
    icon: CircleStackIcon,
    title: "Logic Analyzer Breakout",
    description: "Dedicated test pads expose I2C, SPI, and GPIO signals for protocol analysis with Saleae or similar tools.",
    feature: "Full bus visibility for mmWave sensor commands",
  },
  {
    icon: CogIcon,
    title: "OTA Toggle Flags",
    description: "Enable experimental detection modes via Home Assistant number entities—no reflashing required.",
    feature: "A/B test new algorithms without USB cables",
  },
  {
    icon: ChartBarIcon,
    title: "Extended Telemetry Stream",
    description: "Developer firmware publishes raw still-energy values, FFT bins, and confidence intervals to MQTT.",
    feature: "Build custom dashboards or feed data into ML pipelines",
  },
]

export function DebugCapabilities() {
  return (
    <div className="px-6 py-24 bg-white lg:px-8">
      <div className="mx-auto max-w-6xl">
        <FadeDiv className="text-center mb-16">
          <p className="text-sm uppercase tracking-wider text-gray-500 mb-4">
            Debug & Development Features
          </p>
          <h2 className="text-4xl font-semibold tracking-tight text-gray-900 mb-6">
            Visibility into every layer
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            The Developer Edition exposes hardware and software interfaces that standard
            kits keep abstracted. Perfect for academic research, OEM integration, or
            satisfying deep technical curiosity.
          </p>
        </FadeDiv>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {capabilities.map((cap, index) => {
            const Icon = cap.icon
            return (
              <FadeDiv key={index}>
                <Card className="h-full border-2 hover:border-purple-300 transition-colors">
                  <CardContent className="p-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 mb-6">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      {cap.title}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {cap.description}
                    </p>
                    <div className="pt-4 border-t border-gray-200">
                      <p className="text-sm font-medium text-purple-600">
                        {cap.feature}
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
