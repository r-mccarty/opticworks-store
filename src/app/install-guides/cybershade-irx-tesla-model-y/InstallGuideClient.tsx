'use client'

import { FadeDiv } from "@/components/Fade"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  ClockIcon,
  UserIcon,
  WrenchScrewdriverIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  LightBulbIcon
} from "@heroicons/react/24/outline"
import Link from "next/link"
import Image from "next/image"
import dynamic from "next/dynamic"
import { useScrollProgress } from "@/hooks/useScrollProgress"
import ThreeDErrorBoundary from "@/components/3d/ErrorBoundary"

const Tesla3DViewer = dynamic(() => import('@/components/3d/Tesla3DViewer'), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 bg-gray-100 flex items-center justify-center">
      <p className="text-gray-600">Loading 3D Background...</p>
    </div>
  )
})

import { InstallStep, TroubleshootingItem } from "@/types/installs";

// These props would be passed from the server component
interface InstallGuideClientProps {
  installSteps: InstallStep[]
  kitContents: string[]
  troubleshooting: TroubleshootingItem[]
}

export default function InstallGuideClient({ installSteps, kitContents, troubleshooting }: InstallGuideClientProps) {
  const scrollProgress = useScrollProgress()

  return (
    <>
      <div className="fixed inset-0 h-screen w-screen">
        <ThreeDErrorBoundary>
          <Tesla3DViewer scrollProgress={scrollProgress} />
        </ThreeDErrorBoundary>
      </div>

      <main className="relative">
        <div className="relative px-6 pt-28 pb-16 lg:px-8 isolate">
          <div className="mx-auto max-w-4xl">
            {/* Header */}
            <FadeDiv className="mb-12 bg-white/80 backdrop-blur-md rounded-2xl p-8 ring-1 ring-black/5">
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                <Link href="/install-guides" className="hover:text-orange-600">Install Guides</Link>
                <span>→</span>
                <span>CyberShade IRX Tesla Model Y</span>
              </div>

              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl mb-6">
                CyberShade IRX Installation Guide
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Tesla Model Y (2025+ &ldquo;Juniper&rdquo;) Front Window Tinting
              </p>

              <div className="flex flex-wrap items-center gap-4 mb-8">
                <div className="flex items-center gap-2">
                  <UserIcon className="w-5 h-5 text-gray-400" />
                  <Badge className="bg-green-100 text-green-800">Beginner Friendly</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <ClockIcon className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-600">45-60 minutes</span>
                </div>
                <div className="flex items-center gap-2">
                  <WrenchScrewdriverIcon className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-600">All tools included</span>
                </div>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                <div className="flex items-start gap-3">
                  <LightBulbIcon className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-orange-800 mb-2">
                      So Easy, It Feels Like Cheating
                    </h3>
                    <p className="text-orange-700 text-sm">
                      Our revolutionary Door Latch Tool and pre-cut films eliminate 99% of the difficulty
                      in window tinting. Follow these 4 simple steps for professional results.
                    </p>
                  </div>
                </div>
              </div>
            </FadeDiv>

            {/* Spacer to push content down */}
            <div className="h-[50vh]"></div>

            {/* Installation Steps */}
            <FadeDiv className="mb-12 bg-white/80 backdrop-blur-md rounded-2xl p-8 ring-1 ring-black/5">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Installation Steps</h2>

              <div className="space-y-8">
                {installSteps.map((step) => (
                  <Card key={step.step} className="overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                      <div className="aspect-video md:aspect-auto">
                        <Image
                          src={step.image}
                          alt={`Step ${step.step}: ${step.title}`}
                          width={400}
                          height={300}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold">
                            {step.step}
                          </div>
                          <h3 className="text-xl font-bold text-gray-900">{step.title}</h3>
                          <Badge variant="outline">{step.duration}</Badge>
                        </div>

                        <p className="text-gray-600 mb-4">{step.description}</p>

                        <div className="space-y-2">
                          <h4 className="font-semibold text-gray-900 text-sm">Pro Tips:</h4>
                          {step.tips.map((tip, tipIndex) => (
                            <div key={tipIndex} className="flex items-start gap-2 text-sm text-gray-600">
                              <CheckCircleIcon className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                              <span>{tip}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </FadeDiv>

            {/* What's in the Kit */}
            <FadeDiv className="mb-12 bg-white/80 backdrop-blur-md rounded-2xl p-8 ring-1 ring-black/5">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">What&apos;s Included in Your Kit</h2>
              <Card>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {kitContents.map((item, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </FadeDiv>

            {/* Troubleshooting */}
            <FadeDiv className="mb-12 bg-white/80 backdrop-blur-md rounded-2xl p-8 ring-1 ring-black/5">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Troubleshooting</h2>
              <div className="space-y-4">
                {troubleshooting.map((item) => (
                  <Card key={item.problem}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-3">
                        <ExclamationTriangleIcon
                          className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                            item.severity === 'high' ? 'text-red-500' :
                            item.severity === 'medium' ? 'text-yellow-500' :
                            'text-blue-500'
                          }`}
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-2">{item.problem}</h3>
                          <p className="text-gray-600">{item.solution}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </FadeDiv>

            {/* CTA Section */}
            <FadeDiv className="text-center">
              <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Ready to Transform Your Tesla?
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                    Get professional-quality window tinting results with our foolproof CyberShade IRX kit.
                    Everything you need is included, backed by our lifetime warranty.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button asChild size="lg">
                      <Link href="/products/cybershade-irx-tesla-model-y">Shop CyberShade IRX Kit</Link>
                    </Button>
                    <Button asChild variant="outline" size="lg">
                      <Link href="/store">Browse All Products</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </FadeDiv>
          </div>
        </div>
      </main>
    </>
  )
}
