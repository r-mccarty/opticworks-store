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
    title: "PREP THE GLASS",
    description: "Use the included professional-grade cleaning pads and low-tack dust removers for a perfectly clean surface. Our custom door skirt protects your interior from water.",
    image: generateGradientDataUrl('60a5fa', '3b82f6', 300, 200), // Glass blue
    duration: "10 min"
  },
  {
    step: 2,
    title: "CLICK & SECURE",
    description: "Snap our patent-pending Door Latch Tool into place. It raises the window for full coverage and prevents the door from accidentally closing on it. No more fighting with floppy window gaskets.",
    image: generateGradientDataUrl('f59e0b', 'd97706', 300, 200), // Orange
    duration: "5 min"
  },
  {
    step: 3,
    title: "PEEL & PLACE",
    description: "Spray the window and the film with our pre-mixed slip solution. The pre-cut film peels easily from its backing and glides right into position. No trimming, no shrinking, no stress.",
    image: generateGradientDataUrl('1f2937', '111827', 300, 200), // Tesla dark
    duration: "15 min"
  },
  {
    step: 4,
    title: "SQUEEGEE TO PERFECTION",
    description: "Use our 3D-printed, ergonomic hard card squeegee to push the solution out. The film locks into place, leaving a crystal-clear, bubble-free finish.",
    image: generateGradientDataUrl('e5e7eb', '9ca3af', 300, 200), // Chrome/metallic
    duration: "15 min"
  }
]

export function InstallProcess() {
  return (
    <div className="py-16">
      <div className="px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <FadeDiv>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                So Easy, It Feels Like Cheating.
              </h2>
              <p className="text-xl text-gray-600">
                Your flawless install in 4 simple steps.
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
                    Watch our 3-minute installation video to see just how easy 
                    the CyberShade IRX process really is.
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