import type { Metadata } from "next"
import Link from "next/link"

import { FadeContainer, FadeDiv } from "@/components/Fade"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { siteConfig } from "@/app/siteConfig"
import {
  RiEyeLine,
  RiInformationLine,
  RiLockLine,
  RiMapPinLine,
  RiShieldCheckLine,
} from "@remixicon/react"

export const metadata: Metadata = {
  title: "Presence Compliance by Region - OpticWorks Presence",
  description:
    "High-level privacy and deployment guidance for OpticWorks mmWave presence sensors across the US. Not legal advice.",
  keywords: [
    "presence compliance",
    "mmWave privacy",
    "regional guidance",
    "Home Assistant presence",
    "OpticWorks",
  ],
}

type RegionGuidance = {
  code: string
  name: string
  notice: string
  commercial: string
  recording: string
  lastUpdated: string
}

const regions: RegionGuidance[] = [
  {
    code: "CA",
    name: "California",
    notice:
      "Notice is strongly recommended anywhere a guest could be present. Avoid installations in private guest bedrooms without clear disclosure.",
    commercial:
      "Signage is required for clinics, rentals, and offices. If a space is monitored for safety or automation, make it explicit.",
    recording:
      "Our default mode does not capture audio/video. If you enable spatial visualization storage, keep it local or obtain explicit consent.",
    lastUpdated: "2025-01-15",
  },
  {
    code: "NY",
    name: "New York",
    notice:
      "Household installs are generally permitted with reasonable notice to occupants and guests.",
    commercial:
      "Post signage at entrances and include presence monitoring in your privacy policy for shared buildings.",
    recording:
      "Do not store identifiable traces without consent. Use occupancy‑only mode for public areas.",
    lastUpdated: "2025-01-15",
  },
  {
    code: "TX",
    name: "Texas",
    notice:
      "Residential installs are permitted; disclose to household members and caretakers.",
    commercial:
      "Signage recommended for rentals and workplaces. Obtain written consent for sensitive environments.",
    recording:
      "Prefer local retention; delete traces on request. Avoid any use that could be interpreted as covert surveillance.",
    lastUpdated: "2025-01-15",
  },
  {
    code: "FL",
    name: "Florida",
    notice:
      "Inform occupants if sensors are installed in bedrooms, nurseries, or assisted‑living suites.",
    commercial:
      "Use clear signage and maintain a public policy describing monitoring purpose and retention.",
    recording:
      "Only retain what you need for automation. Use anonymized heatmaps rather than raw traces.",
    lastUpdated: "2025-01-15",
  },
]

const deploymentChecklist = [
  "Place sensors only where monitoring is appropriate and expected.",
  "Disclose presence sensing to household members, guests, staff, or patients.",
  "Use occupancy‑only mode for shared/public spaces whenever possible.",
  "If storing spatial visualizations, keep retention short and honor deletion requests.",
  "Never pair presence data with identifying audio/video without explicit consent.",
]

export default function PresenceCompliancePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="relative bg-gradient-to-b from-background to-muted/40 pt-24 pb-16">
        <FadeContainer className="mx-auto max-w-6xl px-6 lg:px-8 text-center">
          <FadeDiv>
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <RiMapPinLine className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl font-display">
              Presence compliance by region
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
              This page summarizes common expectations for mmWave presence sensing
              in residential and light‑commercial deployments. It is not legal
              advice — when in doubt, consult local counsel.
            </p>
          </FadeDiv>
        </FadeContainer>
      </section>

      <section className="py-16">
        <FadeContainer className="mx-auto max-w-6xl px-6 lg:px-8 space-y-10">
          <FadeDiv className="grid gap-6 md:grid-cols-3">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <RiEyeLine className="h-5 w-5 text-primary" />
                  What we sense
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                OpticWorks Presence uses mmWave radar to estimate motion and
                stillness. No cameras or microphones are required for core
                operation.
              </CardContent>
            </Card>
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <RiLockLine className="h-5 w-5 text-primary" />
                  Data defaults
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Presence state, confidence, and change reasons stay local by
                default. Cloud sync and spatial trace storage are opt‑in.
              </CardContent>
            </Card>
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <RiShieldCheckLine className="h-5 w-5 text-primary" />
                  Best practice
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Disclose sensing, avoid covert deployments, and minimize
                retention. Use occupancy‑only mode whenever possible.
              </CardContent>
            </Card>
          </FadeDiv>

          <FadeDiv>
            <h2 className="text-2xl font-semibold tracking-tight font-display">
              US highlights
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Summaries are intentionally high‑level. We’ll expand coverage as
              regulations evolve.
            </p>
          </FadeDiv>

          <FadeDiv className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {regions.map((region) => (
              <Card key={region.code} className="h-full">
                <CardHeader className="flex flex-row items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg">
                      {region.name}
                    </CardTitle>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Last updated {region.lastUpdated}
                    </p>
                  </div>
                  <Badge variant="outline">{region.code}</Badge>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-muted-foreground">
                  <div>
                    <p className="font-medium text-foreground">Residential notice</p>
                    <p className="mt-1">{region.notice}</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Commercial / clinical</p>
                    <p className="mt-1">{region.commercial}</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Spatial recording</p>
                    <p className="mt-1">{region.recording}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </FadeDiv>

          <FadeDiv>
            <Card className="border-border bg-muted/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RiInformationLine className="h-5 w-5 text-primary" />
                  Deployment checklist
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                  {deploymentChecklist.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-1 inline-flex size-5 items-center justify-center rounded-full bg-muted text-foreground">
                        •
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </FadeDiv>
        </FadeContainer>
      </section>

      <section className="py-16">
        <FadeContainer className="mx-auto max-w-4xl px-6 lg:px-8">
          <FadeDiv>
            <Card className="border-border bg-card shadow-elevation-1">
              <CardContent className="p-8 text-center">
                <h3 className="text-2xl font-semibold text-foreground">
                  Need a compliance review?
                </h3>
                <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
                  Share your deployment plan and we’ll help you choose the
                  safest configuration for your region.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <Button asChild size="lg">
                    <Link href={siteConfig.baseLinks.supportContact + "?category=legal"}>
                      Contact compliance
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link href={siteConfig.baseLinks.supportFaq}>
                      Browse legal FAQ
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </FadeDiv>
        </FadeContainer>
      </section>
    </main>
  )
}
