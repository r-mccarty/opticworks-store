import { FadeDiv } from "@/components/Fade"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircleIcon } from "@heroicons/react/24/solid"
import Image from "next/image"
import { generateGradientDataUrl } from "@/lib/gradients"

const kitItems = [
  "1× mmWave still-energy sensor (pre-soldered)",
  "1× ESP32-S3 gateway flashed with presence engine",
  "1× USB-C power cable + power brick",
  "1× Magnetic enclosure with tilt mount + clip adapter",
  "1× Set of adhesive pads + cable clips",
  "1× Calibration card with QR to dashboard import",
  "1× Debug quick-start guide and tuning checklist",
  "1× Spare sensor mounting plate",
]

const highlightedTools = [
  {
    name: "Still-energy mmWave module",
    description:
      "Purpose-tuned 60GHz radar module that prioritizes stationary human reflections instead of motion.",
    image:
      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8bGluZWFyR3JhZGllbnQgaWQ9ImEiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPgogICAgPHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9ImNvbG9yOiMzOGI5ZjgiIC8+CiAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJjb2xvcjojMDQwNDY2IiAvPgogIDwvbGluZWFyR3JhZGllbnQ+CiAgPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNhKSIgLz4KPC9zdmc+",
    highlight: "Still energy",
  },
  {
    name: "ESP32-S3 gateway",
    description:
      "Runs the entire 4-state presence engine locally, exposes HA entities, and supports OTA firmware updates.",
    image:
      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8bGluZWFyR3JhZGllbnQgaWQ9ImIiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPgogICAgPHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9ImNvbG9yOiMzMTg0ZmMiIC8+CiAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJjb2xvcjojMDA5M2ZiIiAvPgogIDwvbGluZWFyR3JhZGllbnQ+CiAgPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNiKSIgLz4KPC9zdmc+",
    highlight: "Local engine",
  },
  {
    name: "Magnetic enclosure kit",
    description:
      "Stealth enclosure with adjustable tilt and magnetic base so you can hide the sensor under bed frames or mount to rails.",
    image:
      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8bGluZWFyR3JhZGllbnQgaWQ9ImMiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPgogICAgPHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9ImNvbG9yOiM3Zjg0YWYiIC8+CiAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJjb2xvcjojZDllN2ZmIiAvPgogIDwvbGluZWFyR3JhZGllbnQ+CiAgPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNjKSIgLz4KPC9zdmc+",
    highlight: "Stealth mount",
  },
]

const heroImage = generateGradientDataUrl("020617", "0f172a", 1200, 600)

export function KitContents() {
  return (
    <div className="py-16">
      <div className="px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <FadeDiv>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Everything You Need for a Perfect Finish.
              </h2>
              <p className="text-lg text-gray-600">
                Our complete kit includes professional-grade tools and materials
                - no need to buy anything else.
              </p>
            </div>

            {/* Hero Kit Image */}
            <div className="mb-12">
              <Card className="overflow-hidden">
                <div className="aspect-video relative">
                  <Image
                    src={heroImage}
                    alt="Bed Presence Sensor kit contents placeholder"
                    className="absolute inset-0 h-full w-full object-cover"
                    fill
                    priority
                  />
                </div>
              </Card>
            </div>
            
            {/* Highlighted Tools */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {highlightedTools.map((tool, index) => (
                <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-[4/3] relative">
                    <Image
                      src={tool.image}
                      alt={tool.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded">
                        {tool.highlight}
                      </span>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-gray-900 mb-2">{tool.name}</h3>
                    <p className="text-sm text-gray-600">{tool.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Complete Kit Contents List */}
            <Card>
              <CardContent className="p-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
                  Complete Kit Contents
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {kitItems.map((item, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>

                {/* Value Callout */}
                <div className="mt-8 p-6 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="text-center">
                    <h4 className="text-lg font-semibold text-orange-800 mb-2">
                      Professional Kit Value: $300+
                    </h4>
                    <p className="text-orange-700 text-sm">
                      If you bought all these tools and materials separately, you&apos;d spend over $300.
                      Our complete kit gives you everything for just $149.99.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </FadeDiv>
        </div>
      </div>
    </div>
  )
}
