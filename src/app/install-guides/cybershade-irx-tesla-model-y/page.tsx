import { Metadata } from "next"
import { FadeContainer, FadeDiv } from "@/components/Fade"
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
import Tesla3DSection from "@/components/products/Tesla3DSection"

export const metadata: Metadata = {
  title: "CyberShade IRX Tesla Model Y Installation Guide - OpticWorks",
  description: "Complete step-by-step installation guide for CyberShade IRX ceramic window tint on Tesla Model Y (2025+ Juniper). Professional results in under an hour.",
}

const installSteps = [
  {
    step: 1,
    title: "PREP THE GLASS",
    description: "Use the included professional-grade cleaning pads and low-tack dust removers for a perfectly clean surface. Our custom door skirt protects your interior from water.",
    image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgICAgPGRlZnM+CiAgICAgICAgPGxpbmVhckdyYWRpZW50IGlkPSJncmFkIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj4KICAgICAgICAgIDxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiMzYjgyZjY7c3RvcC1vcGFjaXR5OjEiIC8+CiAgICAgICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiMwZjc2OGE7c3RvcC1vcGFjaXR5OjEiIC8+CiAgICAgICAgPC9saW5lYXJHcmFkaWVudD4KICAgICAgPC9kZWZzPgogICAgICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyYWQpIiAvPgogICAgPC9zdmc+",
    duration: "10 minutes",
    tips: [
      "Work in shade, avoid direct sunlight",
      "Clean windows inside and out thoroughly", 
      "Use the included dust removal stickers for any particles"
    ]
  },
  {
    step: 2,
    title: "CLICK & SECURE",
    description: "Snap our patent-pending Door Latch Tool into place. It raises the window for full coverage and prevents the door from accidentally closing on it. No more fighting with floppy window gaskets.",
    image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgICAgPGRlZnM+CiAgICAgICAgPGxpbmVhckdyYWRpZW50IGlkPSJncmFkIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj4KICAgICAgICAgIDxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiM4YjVjZjY7c3RvcC1vcGFjaXR5OjEiIC8+CiAgICAgICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiM2MzY2ZjE7c3RvcC1vcGFjaXR5OjEiIC8+CiAgICAgICAgPC9saW5lYXJHcmFkaWVudD4KICAgICAgPC9kZWZzPgogICAgICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyYWQpIiAvPgogICAgPC9zdmc+",
    duration: "5 minutes",
    tips: [
      "Ensure the latch tool clicks securely into place",
      "Window should be held firmly in the up position",
      "Door will not close while tool is engaged"
    ]
  },
  {
    step: 3,
    title: "PEEL & PLACE",
    description: "Spray the window and the film with our pre-mixed slip solution. The pre-cut film peels easily from its backing and glides right into position. No trimming, no shrinking, no stress.",
    image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgICAgPGRlZnM+CiAgICAgICAgPGxpbmVhckdyYWRpZW50IGlkPSJncmFkIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj4KICAgICAgICAgIDxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiMxMGI5ODI7c3RvcC1vcGFjaXR5OjEiIC8+CiAgICAgICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiMwNTk2Njk7c3RvcC1vcGFjaXR5OjEiIC8+CiAgICAgICAgPC9saW5lYXJHcmFkaWVudD4KICAgICAgPC9kZWZzPgogICAgICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyYWQpIiAvPgogICAgPC9zdmc+",
    duration: "15 minutes",
    tips: [
      "Wet hands and window generously with slip solution",
      "Peel liner slowly to avoid film stretching",
      "Film should slide easily for positioning"
    ]
  },
  {
    step: 4,
    title: "SQUEEGEE TO PERFECTION",
    description: "Use our 3D-printed, ergonomic hard card squeegee to push the solution out. The film locks into place, leaving a crystal-clear, bubble-free finish.",
    image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgICAgPGRlZnM+CiAgICAgICAgPGxpbmVhckdyYWRpZW50IGlkPSJncmFkIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj4KICAgICAgICAgIDxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNmNTllMGI7c3RvcC1vcGFjaXR5OjEiIC8+CiAgICAgICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNkYzI2MjY7c3RvcC1vcGFjaXR5OjEiIC8+CiAgICAgICAgPC9saW5lYXJHcmFkaWVudD4KICAgICAgPC9kZWZzPgogICAgICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyYWQpIiAvPgogICAgPC9zdmc+",
    duration: "15 minutes",
    tips: [
      "Work from center outward in overlapping strokes",
      "Use firm, consistent pressure",
      "Check edges for complete adhesion"
    ]
  }
]

const kitContents = [
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

const troubleshooting = [
  {
    problem: "Air bubbles under the film",
    solution: "Work bubbles toward the nearest edge using the squeegee with firm pressure. Small bubbles will disappear within 24-48 hours.",
    severity: "low"
  },
  {
    problem: "Film won't stick to the edge",
    solution: "Ensure the edge is completely clean and dry. Use the hard card to press firmly along the window seal.",
    severity: "medium"
  },
  {
    problem: "Film tears during application",
    solution: "Contact our support team immediately for assistance with replacement options.",
    severity: "high"
  }
]

export default function CyberShadeIRXInstallGuide() {
  return (
    <main className="relative min-h-screen bg-background text-foreground">
      <FadeContainer className="relative px-6 pt-28 pb-16 lg:px-8">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <FadeDiv className="mb-12">
            <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
              <Link href="/install-guides" className="hover:text-primary">Install Guides</Link>
              <span>→</span>
              <span>CyberShade IRX Tesla Model Y</span>
            </div>
            
            <h1 className="mb-6 text-4xl font-semibold tracking-tight sm:text-5xl font-display">
              CyberShade IRX Installation Guide
            </h1>
            <p className="mb-8 text-xl text-muted-foreground">
              Tesla Model Y (2025+ &ldquo;Juniper&rdquo;) Front Window Tinting
            </p>
            
            <div className="mb-8 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <UserIcon className="h-5 w-5 text-muted-foreground" />
                <Badge variant="secondary">Beginner Friendly</Badge>
              </div>
              <div className="flex items-center gap-2">
                <ClockIcon className="h-5 w-5 text-muted-foreground" />
                <span className="text-muted-foreground">45-60 minutes</span>
              </div>
              <div className="flex items-center gap-2">
                <WrenchScrewdriverIcon className="h-5 w-5 text-muted-foreground" />
                <span className="text-muted-foreground">All tools included</span>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-muted/30 p-6">
              <div className="flex items-start gap-3">
                <LightBulbIcon className="mt-0.5 h-6 w-6 flex-shrink-0 text-primary" />
                <div>
                  <h3 className="mb-2 font-semibold text-foreground">
                    So Easy, It Feels Like Cheating
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Our revolutionary Door Latch Tool and pre-cut films eliminate 99% of the difficulty 
                    in window tinting. Follow these 4 simple steps for professional results.
                  </p>
                </div>
              </div>
            </div>
          </FadeDiv>

          {/* Interactive 3D Tesla Model */}
          <Tesla3DSection />

          {/* Installation Steps */}
          <FadeDiv className="mb-12">
            <h2 className="mb-8 text-3xl font-semibold text-foreground font-display">Installation Steps</h2>
            
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
                      <div className="mb-4 flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                          {step.step}
                        </div>
                        <h3 className="text-xl font-semibold text-foreground">{step.title}</h3>
                        <Badge variant="outline">{step.duration}</Badge>
                      </div>
                      
                      <p className="mb-4 text-muted-foreground">{step.description}</p>
                      
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-foreground">Pro Tips:</h4>
                        {step.tips.map((tip, tipIndex) => (
                          <div key={tipIndex} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <CheckCircleIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
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
          <FadeDiv className="mb-12">
            <h2 className="mb-6 text-3xl font-semibold text-foreground font-display">What&apos;s Included in Your Kit</h2>
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {kitContents.map((item, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircleIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                      <span className="text-muted-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </FadeDiv>

          {/* Troubleshooting */}
          <FadeDiv className="mb-12">
            <h2 className="mb-6 text-3xl font-semibold text-foreground font-display">Troubleshooting</h2>
            <div className="space-y-4">
              {troubleshooting.map((item) => (
                <Card key={item.problem}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <ExclamationTriangleIcon 
                        className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                          item.severity === 'high' ? 'text-destructive' :
                          item.severity === 'medium' ? 'text-primary' :
                          'text-muted-foreground'
                        }`} 
                      />
                      <div className="flex-1">
                        <h3 className="mb-2 font-semibold text-foreground">{item.problem}</h3>
                        <p className="text-muted-foreground">{item.solution}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </FadeDiv>

          {/* CTA Section */}
          <FadeDiv className="text-center">
            <Card className="border-border bg-muted/30">
              <CardContent className="p-8">
                <h3 className="mb-4 text-2xl font-semibold text-foreground">
                  Ready to Transform Your Tesla?
                </h3>
                <p className="mx-auto mb-6 max-w-2xl text-muted-foreground">
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
      </FadeContainer>
    </main>
  )
}
