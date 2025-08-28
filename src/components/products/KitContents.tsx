import { FadeDiv } from "@/components/Fade"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircleIcon } from "@heroicons/react/24/solid"
import Image from "next/image"

const kitItems = [
  "2x Pre-cut, Pre-shrunk CyberShade IRX Front Window Films",
  "1x 3D-Printed OpticWorks Door Latch Tool",
  "1x OpticWorks Door Skirt Water Shield",
  "1x Pre-mixed Slip Solution Spray Bottle",
  "1x Distilled Water Rinse Bottle",
  "1x Professional Hard Card Squeegee",
  "1x Scotch-Brite™ Window Cleaning Pad",
  "2x Lint-Free Microfiber Cloths",
  "1x Set of Low-Tack Dust Removal Stickers",
  "1x Plastic Razor Tool for Cleaning",
  "Quick Start Guide with QR Code to Install Video"
]

const highlightedTools = [
  {
    name: "3D-Printed Door Latch Tool",
    description: "Our patent-pending tool that secures your window in the perfect position and prevents accidental door closure.",
    image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgIDxkZWZzPgogICAgICA8bGluZWFyR3JhZGllbnQgaWQ9ImdyYWQxIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj4KICAgICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojMzMzMzk5O3N0b3Atb3BhY2l0eToxIiAvPgogICAgICAgIDxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6IzY2NjZiYjtzdG9wLW9wYWNpdHk6MSIgLz4KICAgICAgPC9saW5lYXJHcmFkaWVudD4KICAgIDwvZGVmcz4KICAgIDxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JhZDEpIiAvPgo8L3N2Zz4=",
    highlight: "Game Changer"
  },
  {
    name: "Pre-cut CyberShade IRX Film",
    description: "Precision-cut and pre-shrunk films that fit your Model Y perfectly. No measuring, no cutting, no stress.",
    image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgIDxkZWZzPgogICAgICA8bGluZWFyR3JhZGllbnQgaWQ9ImdyYWQyIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj4KICAgICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojMTBiOTgyO3N0b3Atb3BhY2l0eToxIiAvPgogICAgICAgIDxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6IzA1OTY2OTtzdG9wLW9wYWNpdHk6MSIgLz4KICAgICAgPC9saW5lYXJHcmFkaWVudD4KICAgIDwvZGVmcz4KICAgIDxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JhZDIpIiAvPgo8L3N2Zz4=",
    highlight: "Perfect Fit"
  },
  {
    name: "Professional Squeegee Set",
    description: "Ergonomic hard card squeegee designed specifically for bubble-free application and professional results.",
    image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgIDxkZWZzPgogICAgICA8bGluZWFyR3JhZGllbnQgaWQ9ImdyYWQzIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj4KICAgICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojZjU5ZTBiO3N0b3Atb3BhY2l0eToxIiAvPgogICAgICAgIDxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6I2RjMjYyNjtzdG9wLW9wYWNpdHk6MSIgLz4KICAgICAgPC9saW5lYXJHcmFkaWVudD4KICAgIDwvZGVmcz4KICAgIDxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JhZDMpIiAvPgo8L3N2Zz4=",
    highlight: "Pro Quality"
  }
]

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
                    src="https://pub-e97850e2b6554798b4b0ec23548c975d.r2.dev/cybershade-kit-mockup.png"
                    alt="Complete CyberShade IRX Tesla Model Y Kit Contents - Professional flat-lay showing all tools, films, and accessories"
                    className="absolute inset-0 w-full h-full object-cover"
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