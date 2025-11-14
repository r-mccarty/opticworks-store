import { FadeDiv } from "@/components/Fade"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PlayIcon } from "@heroicons/react/24/solid"
import Image from "next/image"
import { generateGradientDataUrl } from "@/lib/gradients"

const installSteps = [
  {
    step: 1,
    title: "Mount the sensor",
    description:
      "Use the magnetic enclosure or clip mount to place the sensor at the foot of the bed. Aim the still-energy cone toward the pillows.",
    image: generateGradientDataUrl("0f172a", "1e293b", 300, 200),
    duration: "5 min",
  },
  {
    step: 2,
    title: "Connect to Home Assistant",
    description:
      "Plug the ESP32 gateway into USB-C power, open the onboarding flow, and add the sensor to Home Assistant via the included integration.",
    image: generateGradientDataUrl("38bdf8", "0ea5e9", 300, 200),
    duration: "3 min",
  },
  {
    step: 3,
    title: "Calibrate baseline",
    description:
      "Tap “Calibrate Empty Room” in the dashboard. The sensor records still-energy noise, calculates the baseline, and sets initial z-score targets.",
    image: generateGradientDataUrl("facc15", "f97316", 300, 200),
    duration: "2 min",
  },
  {
    step: 4,
    title: "Tune & deploy",
    description:
      "Use the Lovelace sliders to adjust debounce timers and Absolute Clear Delay while watching the live debug text sensor.",
    image: generateGradientDataUrl("9333ea", "c084fc", 300, 200),
    duration: "10 min",
  },
]

export function InstallProcess() {
  return (
    <div id="setup-process" className="py-16">
      <div className="px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <FadeDiv>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Setup built for Home Assistant power users
              </h2>
              <p className="text-xl text-gray-600">
                From mounting to calibration, you can be reliable in under 15 minutes.
              </p>
            </div>
            
            {/* Install Steps */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              {installSteps.map((step) => (
                <Card key={step.step} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video relative">
                    <Image
                      src={step.image}
                      alt={`Step ${step.step}: ${step.title}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    <div className="absolute top-4 left-4 flex items-center gap-2">
                      <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold">
                        {step.step}
                      </div>
                      <Badge className="bg-white/90 text-gray-900 hover:bg-white">
                        {step.duration}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {step.title}
                    </h3>
                    <p className="text-gray-600">
                      {step.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Video CTA */}
            <div className="text-center">
              <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white max-w-2xl mx-auto">
                <CardContent className="p-8">
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                      <PlayIcon className="w-8 h-8 text-white ml-1" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold mb-4">
                    See It in Action
                  </h3>
                  <p className="mb-6 text-orange-100">
                    Watch our 3-minute setup demo to see the calibration dashboard,
                    tuning sliders, and debug sensors in action.
                  </p>
                  <Button 
                    variant="secondary" 
                    size="lg"
                    className="bg-white text-orange-600 hover:bg-orange-50"
                  >
                    Watch Installation Video
                  </Button>
                </CardContent>
              </Card>
            </div>
          </FadeDiv>
        </div>
      </div>
    </div>
  )
}
