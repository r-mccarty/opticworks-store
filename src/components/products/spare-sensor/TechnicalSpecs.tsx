"use client"

import { FadeDiv } from "@/components/Fade"
import { Card, CardContent } from "@/components/ui/card"

const specifications = [
  { label: "Frequency", value: "60GHz FMCW (ISM band)" },
  { label: "Detection Range", value: "0.3m to 3.2m (configurable)" },
  { label: "Beam Angle", value: "±40° horizontal, ±30° vertical" },
  { label: "Update Rate", value: "1 Hz (presence engine output)" },
  { label: "Power Input", value: "3.3V @ 120mA (via UART header)" },
  { label: "Interface", value: "UART (115200 baud) + I2C (0x42)" },
  { label: "Dimensions", value: "24mm × 16mm × 8mm" },
  { label: "Operating Temp", value: "-10°C to 60°C" },
]

const pinout = [
  { pin: "1", label: "VCC", description: "3.3V power input" },
  { pin: "2", label: "GND", description: "Ground reference" },
  { pin: "3", label: "TX", description: "UART transmit (sensor → host)" },
  { pin: "4", label: "RX", description: "UART receive (host → sensor)" },
  { pin: "5", label: "SDA", description: "I2C data line (optional)" },
  { pin: "6", label: "SCL", description: "I2C clock line (optional)" },
]

export function TechnicalSpecs() {
  return (
    <div className="px-6 py-24 bg-gradient-to-br from-slate-50 to-white lg:px-8">
      <div className="mx-auto max-w-6xl">
        <FadeDiv className="text-center mb-16">
          <p className="text-sm uppercase tracking-wider text-gray-500 mb-4">
            Technical Documentation
          </p>
          <h2 className="text-4xl font-semibold tracking-tight text-gray-900 mb-6">
            Specifications & integration guide
          </h2>
        </FadeDiv>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <FadeDiv>
            <Card className="border-2">
              <CardContent className="p-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">
                  Sensor Specifications
                </h3>
                <div className="space-y-4">
                  {specifications.map((spec, index) => (
                    <div key={index} className="flex justify-between items-start py-2 border-b border-gray-200 last:border-0">
                      <span className="font-medium text-gray-700">{spec.label}</span>
                      <span className="text-gray-900 text-right font-mono text-sm">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </FadeDiv>

          <FadeDiv>
            <Card className="border-2">
              <CardContent className="p-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">
                  6-Pin Header Pinout
                </h3>
                <div className="space-y-3">
                  {pinout.map((pin, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                        <span className="font-bold text-indigo-700 text-sm">{pin.pin}</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{pin.label}</p>
                        <p className="text-sm text-gray-600">{pin.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </FadeDiv>
        </div>

        <FadeDiv className="mt-12">
          <Card className="bg-indigo-50 border-2 border-indigo-200">
            <CardContent className="p-8">
              <h4 className="font-semibold text-gray-900 mb-4 text-lg">
                What&apos;s Included in the Spare Sensor Module:
              </h4>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-indigo-500 mt-1">•</span>
                  1× 60GHz mmWave sensor module (pre-flashed)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-500 mt-1">•</span>
                  6-pin JST-PH breakout cable (150mm)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-500 mt-1">•</span>
                  Integration guide (ESP32, Pi, Arduino examples)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-500 mt-1">•</span>
                  UART command reference card
                </li>
              </ul>
              <p className="mt-6 text-sm text-gray-600">
                <span className="font-semibold text-indigo-700">Note:</span> ESP32 gateway,
                enclosure, and USB power supply sold separately. This is a standalone sensor
                module for custom integrations.
              </p>
            </CardContent>
          </Card>
        </FadeDiv>
      </div>
    </div>
  )
}
