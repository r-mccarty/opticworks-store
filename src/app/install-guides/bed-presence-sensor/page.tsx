"use client"

import { useState } from "react"
import { FadeContainer, FadeDiv } from "@/components/Fade"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

const steps = [
  {
    title: "1. Mount the enclosure",
    description:
      "Attach the magnetic enclosure to the included bracket and secure it 18\" from the headboard, centered under the mattress. Adjustable bases can use the clip mounts.",
  },
  {
    title: "2. Route power + data",
    description:
      "Connect the USB-C cable to the ESP32 hub, then tuck the cable along the bed frame using the adhesive clips. Plug into a 5V power supply.",
  },
  {
    title: "3. Capture baseline",
    description:
      "Open Home Assistant → Integrations → OpticWorks Presence and start the baseline. Leave the bed empty for 60 seconds to record the still-energy offset.",
  },
  {
    title: "4. Validate confidence",
    description:
      "Lie on the bed and watch the console for presence confidence > 0.85. Stay still for 45 seconds to confirm Absolute Clear Delay behavior.",
  },
]

const checklist = [
  "Sensor mounted under bed rail",
  "USB-C cable strain relieved",
  "Baseline captured with empty bed",
  "Presence flips to Occupied within 2 seconds",
  "Clear delay holds for 30 seconds after getting up",
]

const sections = [
  {
    id: "before-begin",
    title: "Before You Begin",
    content: (
      <div className="space-y-4 text-sm text-gray-600">
        <div>
          <h4 className="font-semibold text-gray-900 mb-2">Prerequisites</h4>
          <ul className="space-y-2 ml-4">
            <li>• Home Assistant installed and running</li>
            <li>• ESPHome integration installed</li>
            <li>• Basic familiarity with Home Assistant automations</li>
            <li>• 2 hours of uninterrupted time</li>
            <li>• Comfortable connecting wires to electronic components</li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-gray-900 mb-2">What Makes This Different?</h4>
          <p>Unlike simple motion sensors, this system uses:</p>
          <ul className="space-y-2 ml-4 mt-2">
            <li>• <strong>Statistical Intelligence</strong> - Learns your bed&apos;s baseline</li>
            <li>• <strong>4-State Verification</strong> - No false alarms</li>
            <li>• <strong>Stillness Detection</strong> - Detects sleeping people</li>
            <li>• <strong>Complete Transparency</strong> - See why each decision is made</li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    id: "hardware",
    title: "Hardware Requirements & Assembly",
    content: (
      <div className="space-y-4 text-sm text-gray-600">
        <div>
          <h4 className="font-semibold text-gray-900 mb-2">Required Hardware</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-gray-200">
                <tr>
                  <th className="pb-2 font-semibold text-gray-900">Component</th>
                  <th className="pb-2 font-semibold text-gray-900">Description</th>
                  <th className="pb-2 font-semibold text-gray-900">Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="py-2">ESP32 Board</td>
                  <td>M5Stack Basic or any ESP32 dev board</td>
                  <td>$15-30</td>
                </tr>
                <tr>
                  <td className="py-2">LD2410 mmWave Sensor</td>
                  <td>24GHz radar module for presence detection</td>
                  <td>$8-15</td>
                </tr>
                <tr>
                  <td className="py-2">USB Cable</td>
                  <td>For programming the ESP32</td>
                  <td>$3-5</td>
                </tr>
                <tr>
                  <td className="py-2">Jumper Wires</td>
                  <td>4x female-to-female for UART connection</td>
                  <td>$2-5</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-gray-500"><strong>Total:</strong> ~$30-55</p>
        </div>

        <div>
          <h4 className="font-semibold text-gray-900 mb-2">Wiring Diagram</h4>
          <div className="bg-gray-50 rounded p-3 font-mono text-xs overflow-x-auto">
            <div>LD2410 Sensor  →  ESP32 (M5Stack)</div>
            <div>─────────────────────────────────────</div>
            <div>VCC (Power)    →  3.3V</div>
            <div>GND (Ground)   →  GND</div>
            <div>TX (Transmit)  →  GPIO 16 (RX)</div>
            <div>RX (Receive)   →  GPIO 17 (TX)</div>
          </div>
          <p className="mt-2 text-xs text-orange-700 bg-orange-50 p-2 rounded">
            <strong>Important:</strong> TX → RX and RX → TX (crossed). Use 3.3V, not 5V.
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-gray-900 mb-2">Physical Placement</h4>
          <ul className="space-y-2 ml-4">
            <li>• <strong>Height:</strong> 1-3 feet above the mattress</li>
            <li>• <strong>Position:</strong> Centered over where you sleep</li>
            <li>• <strong>Angle:</strong> Pointing straight down at bed surface</li>
            <li>• <strong>Avoid:</strong> Too far from bed, pointing at walls, near HVAC vents</li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    id: "software",
    title: "Software Setup",
    content: (
      <div className="space-y-4 text-sm text-gray-600">
        <div>
          <h4 className="font-semibold text-gray-900 mb-2">Option 1: ESPHome Dashboard (Recommended)</h4>
          <ol className="space-y-2 ml-4 list-decimal">
            <li>Access ESPHome Dashboard in Home Assistant</li>
            <li>Clone the repository: <code className="bg-gray-100 px-1 rounded text-xs">git clone https://github.com/r-mccarty/bed-presence-sensor.git</code></li>
            <li>Create <code className="bg-gray-100 px-1 rounded text-xs">secrets.yaml</code> with WiFi credentials</li>
            <li>Click &quot;NEW DEVICE&quot;, select USB port, wait for compilation (~5-10 minutes)</li>
            <li>Device will appear in Home Assistant automatically</li>
          </ol>
        </div>

        <div>
          <h4 className="font-semibold text-gray-900 mb-2">Option 2: ESPHome CLI (Advanced)</h4>
          <div className="bg-gray-50 rounded p-3 font-mono text-xs overflow-x-auto space-y-1">
            <div>pip install esphome</div>
            <div>git clone https://github.com/r-mccarty/bed-presence-sensor.git</div>
            <div>cd bed-presence-sensor/esphome</div>
            <div># Create secrets.yaml with WiFi credentials</div>
            <div>esphome run bed-presence-detector.yaml</div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "calibration",
    title: "Initial Calibration",
    content: (
      <div className="space-y-4 text-sm text-gray-600">
        <p>Calibration is <strong>critical</strong> for accurate detection. The sensor needs to learn what your empty bed looks like using z-score statistical analysis.</p>

        <div>
          <h4 className="font-semibold text-gray-900 mb-2">Calibration Procedure</h4>
          <ol className="space-y-2 ml-4 list-decimal">
            <li>Ensure the bed is completely empty (no people, pets, or objects)</li>
            <li>In Home Assistant: Developer Tools → Services</li>
            <li>Select: <code className="bg-gray-100 px-1 rounded text-xs">esphome.bed_presence_detector_calibrate_start_baseline</code></li>
            <li>Wait 60 seconds—do not disturb the bed</li>
            <li>Monitor the &quot;Presence Change Reason&quot; sensor</li>
          </ol>
        </div>

        <div>
          <h4 className="font-semibold text-gray-900 mb-2">Verify Calibration</h4>
          <ol className="space-y-2 ml-4 list-decimal">
            <li>Get into bed</li>
            <li>Within 3-5 seconds, <code className="bg-gray-100 px-1 rounded text-xs">binary_sensor.bed_occupied</code> should turn ON</li>
            <li>Get out of bed and wait 30-40 seconds</li>
            <li>Sensor should turn OFF</li>
          </ol>
        </div>
      </div>
    ),
  },
  {
    id: "understanding",
    title: "Understanding Your Sensor",
    content: (
      <div className="space-y-4 text-sm text-gray-600">
        <div>
          <h4 className="font-semibold text-gray-900 mb-2">Primary Entities</h4>

          <div className="space-y-3">
            <div className="bg-gray-50 p-3 rounded">
              <p className="font-semibold text-gray-900">binary_sensor.bed_occupied</p>
              <p className="text-xs mt-1">ON = occupied, OFF = empty. Use this in automations.</p>
            </div>

            <div className="bg-gray-50 p-3 rounded">
              <p className="font-semibold text-gray-900">text_sensor.presence_state_reason</p>
              <p className="text-xs mt-1">Shows debugging info: z-score, state, timers. Example: <code className="bg-white px-1">PRESENT (z=9.8, binary=ON)</code></p>
            </div>

            <div className="bg-gray-50 p-3 rounded">
              <p className="font-semibold text-gray-900">text_sensor.presence_change_reason</p>
              <p className="text-xs mt-1">Short reason for last state change: <code className="bg-white px-1">on:threshold_exceeded</code>, <code className="bg-white px-1">off:debounce_elapsed</code>, etc.</p>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-gray-900 mb-2">Tuning Controls</h4>
          <ul className="space-y-2 ml-4 text-xs">
            <li><strong>k_on</strong> (default 9.0): Z-score threshold to turn ON (0.0-15.0)</li>
            <li><strong>k_off</strong> (default 4.0): Z-score threshold to turn OFF (0.0-15.0)</li>
            <li><strong>on_debounce_ms</strong> (default 3000): Time high signal must be sustained</li>
            <li><strong>off_debounce_ms</strong> (default 5000): Time low signal must be sustained</li>
            <li><strong>absolute_clear_delay_ms</strong> (default 30000): Prevents clearing for this time after last strong presence</li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    id: "troubleshooting",
    title: "Troubleshooting",
    content: (
      <div className="space-y-4 text-sm text-gray-600">
        <div>
          <h4 className="font-semibold text-gray-900 mb-2">Device Not Appearing in Home Assistant</h4>
          <ul className="space-y-1 ml-4">
            <li>• Check WiFi credentials in <code className="bg-gray-100 px-1 rounded text-xs">secrets.yaml</code></li>
            <li>• Ensure ESP32 is on main network (not guest network)</li>
            <li>• Check ESPHome logs: <code className="bg-gray-100 px-1 rounded text-xs">esphome logs bed-presence-detector.yaml</code></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-gray-900 mb-2">Binary Sensor Always OFF</h4>
          <ul className="space-y-1 ml-4">
            <li>• Run calibration procedure with empty bed</li>
            <li>• Check sensor placement (should be 1-3 feet above mattress)</li>
            <li>• Verify wiring connections (TX/RX crossed, 3.3V power)</li>
            <li>• Check z-score value in state reason sensor</li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-gray-900 mb-2">Sensor Turns OFF While Sleeping</h4>
          <p className="mb-2">This is the most common issue. Quick fix:</p>
          <ol className="space-y-1 ml-4 list-decimal">
            <li>Increase <code className="bg-gray-100 px-1 rounded text-xs">absolute_clear_delay_ms</code> to 60000 (60 seconds)</li>
            <li>Test again</li>
            <li>If issue persists, try 120000 (2 minutes) and decrease <code className="bg-gray-100 px-1 rounded text-xs">k_off</code> to 3.0</li>
          </ol>
        </div>

        <div>
          <h4 className="font-semibold text-gray-900 mb-2">Rapid ON/OFF Flapping</h4>
          <ul className="space-y-1 ml-4">
            <li>• Widen hysteresis: increase k_on to 10.0, decrease k_off to 3.0</li>
            <li>• Increase debounce timers: 5000ms for on, 8000ms for off</li>
            <li>• Check wiring for loose connections</li>
          </ul>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded p-3 text-xs text-blue-800">
          <p><strong>Need More Help?</strong></p>
          <ul className="mt-2 ml-4 space-y-1 list-disc">
            <li>Check ESPHome logs and state reason sensor values</li>
            <li>Review current tuning parameters</li>
            <li>File an issue: <a href="https://github.com/r-mccarty/bed-presence-sensor/issues" className="underline">GitHub Issues</a></li>
          </ul>
        </div>
      </div>
    ),
  },
]

interface ExpandableSectionProps {
  section: (typeof sections)[0]
  isOpen: boolean
  onToggle: () => void
}

function ExpandableSection({ section, isOpen, onToggle }: ExpandableSectionProps) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <h3 className="font-semibold text-gray-900">{section.title}</h3>
        <ChevronDown
          className={cn(
            "size-5 text-gray-500 transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </button>
      {isOpen && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          {section.content}
        </div>
      )}
    </div>
  )
}

export default function BedPresenceGuide() {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["before-begin"]))

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId)
    } else {
      newExpanded.add(sectionId)
    }
    setExpandedSections(newExpanded)
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <section className="bg-white pt-28 pb-16">
        <FadeContainer className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
          <FadeDiv>
            <Badge className="mb-6 rounded-full bg-orange-100 text-orange-700">
              Presence Sensors
            </Badge>
            <h1 className="text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
              Bed Presence Sensor Kit
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
              Complete guide to mounting the mmWave module, calibrating, understanding entities, and
              troubleshooting your Home Assistant bed presence sensor.
            </p>
            <p className="mx-auto mt-4 text-sm text-gray-500">
              Time to Complete: ~2 hours · Skill Level: Intermediate
            </p>
          </FadeDiv>
        </FadeContainer>
      </section>

      <section className="py-16">
        <FadeContainer className="mx-auto grid max-w-5xl gap-10 px-4 sm:px-6 lg:px-8 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Installation Steps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {steps.map((step) => (
                <div key={step.title} className="rounded-2xl border border-gray-200 bg-white p-6">
                  <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
                  <p className="mt-2 text-sm text-gray-600">{step.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Checklist</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {checklist.map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <span className="mt-1 inline-flex size-5 flex-none items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    ✓
                  </span>
                  <p className="text-sm text-gray-700">{item}</p>
                </div>
              ))}
              <div className="rounded-2xl bg-orange-50 p-4 text-left text-sm text-orange-800">
                Tip: expose `presence_reason` and `absolute_clear_timer` on your dashboard to watch the
                4-state machine change in real time.
              </div>
            </CardContent>
          </Card>
        </FadeContainer>
      </section>

      <section className="py-16">
        <FadeContainer className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-8">Detailed Setup Guide</h2>
          <div className="space-y-3">
            {sections.map((section) => (
              <ExpandableSection
                key={section.id}
                section={section}
                isOpen={expandedSections.has(section.id)}
                onToggle={() => toggleSection(section.id)}
              />
            ))}
          </div>
        </FadeContainer>
      </section>

      <section className="py-16 bg-white">
        <FadeContainer className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-900">What You&apos;ll Achieve</CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-6">
              {[
                "Fully functional bed presence sensor",
                "Accurate detection even when lying perfectly still",
                "Zero false positives from fans, pets, or motion",
                "Complete transparency into sensor decisions",
                "Full control over tuning without reflashing firmware",
                "Reliable automations based on actual presence",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <span className="mt-1 text-blue-600 font-bold">✓</span>
                  <p className="text-sm text-blue-900">{item}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </FadeContainer>
      </section>
    </main>
  )
}
