import { Metadata } from "next"
import { FadeContainer, FadeDiv } from "@/components/Fade"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  ClockIcon,
  UserIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline"
import Link from "next/link"
import Image from "next/image"

export const metadata: Metadata = {
  title: "Installation Guides - OpticWorks Presence Sensors",
  description:
    "Step-by-step install and calibration guides for the OpticWorks OW-1 presence sensor. Wall mounting, Home Assistant integration, and calibration.",
}

const installGuides = [
  {
    id: "ow-1-quick-start",
    title: "OW-1 Quick Start Guide",
    description:
      "Get your OW-1 presence sensor up and running in under 15 minutes. Covers wall mounting, power connection, and Home Assistant discovery.",
    image:
      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgICAgPGRlZnM+CiAgICAgICAgPGxpbmVhckdyYWRpZW50IGlkPSJncmFkIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj4KICAgICAgICAgIDxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiMxYTFhMWEiIC8+CiAgICAgICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiMyYTJhMmEiIC8+CiAgICAgICAgPC9saW5lYXJHcmFkaWVudD4KICAgICAgPC9kZWZzPgogICAgICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyYWQpIiAvPgogICAgPC9zdmc+",
    difficulty: "Beginner",
    duration: "10-15 minutes",
    tools: "Included in kit",
    featured: true,
    href: "/support", // Placeholder until guide is created
  },
  {
    id: "ow-1-multi-zone",
    title: "Multi-Zone Deployment",
    description:
      "Deploy multiple OW-1 sensors for whole-home coverage. Learn zone coordination, entity naming, and multi-room automation strategies.",
    image:
      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgICAgPGRlZnM+CiAgICAgICAgPGxpbmVhckdyYWRpZW50IGlkPSJncmFkIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj4KICAgICAgICAgIDxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiMyMjIyMjIiIC8+CiAgICAgICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiMzMzMzMzMiIC8+CiAgICAgICAgPC9saW5lYXJHcmFkaWVudD4KICAgICAgPC9kZWZzPgogICAgICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyYWQpIiAvPgogICAgPC9zdmc+",
    difficulty: "Intermediate",
    duration: "30-45 minutes",
    tools: "Multiple OW-1 sensors",
    featured: false,
    href: "/support", // Placeholder until guide is created
  },
  {
    id: "ow-1-calibration",
    title: "Advanced Calibration",
    description:
      "Fine-tune detection zones, sensitivity thresholds, and inference parameters. Optimize for your specific room geometry and use case.",
    image:
      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgICAgPGRlZnM+CiAgICAgICAgPGxpbmVhckdyYWRpZW50IGlkPSJncmFkIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj4KICAgICAgICAgIDxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiMxZTFlMWUiIC8+CiAgICAgICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiMyZDJkMmQiIC8+CiAgICAgICAgPC9saW5lYXJHcmFkaWVudD4KICAgICAgPC9kZWZzPgogICAgICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyYWQpIiAvPgogICAgPC9zdmc+",
    difficulty: "Professional",
    duration: "45-60 minutes",
    tools: "Home Assistant access",
    featured: false,
    href: "/support", // Placeholder until guide is created
  },
]

const difficultyVariant = {
  Beginner: "secondary",
  Intermediate: "outline",
  Professional: "destructive",
} as const

export default function InstallGuidesPage() {
  const sortedGuides = [...installGuides].sort((a, b) =>
    a.featured === b.featured ? 0 : a.featured ? -1 : 1,
  )

  return (
    <main className="relative min-h-screen bg-neutral-950 text-neutral-200">
      <FadeContainer className="relative px-7 sm:px-6 lg:px-8 pt-28 pb-16">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <FadeDiv className="mb-16 text-center">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl font-display text-white">
              Installation Guides
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-neutral-400">
              Step-by-step guides for installing, configuring, and optimizing
              your OW-1 presence sensors for any room or deployment scenario.
            </p>
          </FadeDiv>

          {/* Guides Grid */}
          <FadeDiv>
            <h2 className="mb-8 text-2xl font-semibold text-white font-display">
              Browse Guides
            </h2>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {sortedGuides.map((guide) => (
                <Card
                  key={guide.id}
                  className="flex flex-col overflow-hidden bg-neutral-900 border-white/10 transition-shadow hover:shadow-elevation-2"
                >
                  <Link href={guide.href}>
                    <div className="relative aspect-video">
                      <Image
                        src={guide.image}
                        alt={guide.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                      {guide.featured && (
                        <Badge className="absolute top-4 left-4 rounded-full bg-amber-500 text-neutral-950">
                          Featured
                        </Badge>
                      )}
                    </div>
                  </Link>
                  <CardHeader>
                    <Link href={guide.href}>
                      <CardTitle className="text-lg text-white">{guide.title}</CardTitle>
                    </Link>
                    <p className="text-sm text-neutral-400">{guide.description}</p>
                  </CardHeader>
                  <CardContent className="mt-auto">
                    <div className="mb-4 flex flex-wrap items-center gap-3 text-xs text-neutral-400">
                      <div className="flex items-center gap-1">
                        <UserIcon className="h-4 w-4" />
                        <Badge
                          variant={
                            difficultyVariant[
                              guide.difficulty as keyof typeof difficultyVariant
                            ]
                          }
                        >
                          {guide.difficulty}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        <ClockIcon className="h-4 w-4" />
                        <span>{guide.duration}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <WrenchScrewdriverIcon className="h-4 w-4" />
                        <span>{guide.tools}</span>
                      </div>
                    </div>
                    <Button
                      asChild
                      variant={guide.featured ? "default" : "outline"}
                      className={guide.featured ? "w-full bg-amber-500 text-neutral-950 hover:bg-amber-400" : "w-full border-white/20 text-white hover:bg-white/5"}
                    >
                      <Link href={guide.href}>
                        {guide.featured
                          ? "View Installation Guide"
                          : "View Guide"}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </FadeDiv>

          {/* Help Section */}
          <FadeDiv className="mt-16 text-center">
            <div className="rounded-2xl border border-white/10 bg-neutral-900/50 p-8">
              <h3 className="mb-4 text-2xl font-semibold text-white">
                Need Additional Help?
              </h3>
              <p className="mx-auto mb-6 max-w-2xl text-neutral-400">
                Our installation guides are designed to be straightforward, but if you
                have questions or need additional support, we&apos;re here to
                help.
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <Button asChild variant="outline" className="border-white/20 text-white hover:bg-white/5">
                  <Link href="/support">Contact Support</Link>
                </Button>
                <Button asChild className="bg-amber-500 text-neutral-950 hover:bg-amber-400">
                  <Link href="/store">Order OW-1 Dev Kit</Link>
                </Button>
              </div>
            </div>
          </FadeDiv>
        </div>
      </FadeContainer>
    </main>
  )
}
