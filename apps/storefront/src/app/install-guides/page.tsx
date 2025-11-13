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
  title: "Installation Guides - OpticWorks Window Tinting",
  description:
    "Step-by-step installation guides for OpticWorks window tinting kits. Professional results with foolproof DIY instructions.",
}

const installGuides = [
  {
    id: "cybershade-irx-tesla-model-y",
    title: "CyberShade IRX - Tesla Model Y (2025+ Juniper)",
    description:
      "Complete installation guide for the CyberShade IRX ceramic tint kit designed specifically for Tesla Model Y front windows.",
    image:
      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgICAgPGRlZnM+CiAgICAgICAgPGxpbmVhckdyYWRpZW50IGlkPSJncmFkIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj4KICAgICAgICAgIDxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNmNTllMGI7c3RvcC1vcGFjaXR5OjEiIC8+CiAgICAgICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNkOTc3MDY7c3RvcC1vcGFjaXR5OjEiIC8+CiAgICAgICAgPC9saW5lYXJHcmFkaWVudD4KICAgICAgPC9kZWZzPgogICAgICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyYWQpIiAvPgogICAgPC9zdmc+",
    difficulty: "Beginner",
    duration: "45-60 minutes",
    tools: "Included in kit",
    featured: true,
    href: "/install-guides/cybershade-irx-tesla-model-y",
  },
  {
    id: "general-side-window-tinting",
    title: "General Side Window Tinting",
    description:
      "Universal guide for applying window tint to any vehicle's side windows using OpticWorks films and tools.",
    image:
      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgICAgPGRlZnM+CiAgICAgICAgPGxpbmVhckdyYWRpZW50IGlkPSJncmFkIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj4KICAgICAgICAgIDxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiMzYjgyZjY7c3RvcC1vcGFjaXR5OjEiIC8+CiAgICAgICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiMxZDRlZDg7c3RvcC1vcGFjaXR5OjEiIC8+CiAgICAgICAgPC9saW5lYXJHcmFkaWVudD4KICAgICAgPC9kZWZzPgogICAgICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyYWQpIiAvPgogICAgPC9zdmc+",
    difficulty: "Intermediate",
    duration: "2-3 hours",
    tools: "Basic kit required",
    featured: false,
    href: "/install-guides/general-side-window-tinting",
  },
  {
    id: "rear-window-techniques",
    title: "Rear Window Installation",
    description:
      "Advanced techniques for applying tint to curved rear windows with professional results.",
    image:
      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgICAgPGRlZnM+CiAgICAgICAgPGxpbmVhckdyYWRpZW50IGlkPSJncmFkIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj4KICAgICAgICAgIDxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiMxZjI5Mzc7c3RvcC1vcGFjaXR5OjEiIC8+CiAgICAgICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiMxMTE4Mjc7c3RvcC1vcGFjaXR5OjEiIC8+CiAgICAgICAgPC9saW5lYXJHcmFkaWVudD4KICAgICAgPC9kZWZzPgogICAgICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyYWQpIiAvPgogICAgPC9zdmc+",
    difficulty: "Professional",
    duration: "1-2 hours",
    tools: "Heat gun required",
    featured: false,
    href: "/install-guides/rear-window-techniques",
  },
]

const difficultyColor = {
  Beginner: "bg-green-100 text-green-800",
  Intermediate: "bg-yellow-100 text-yellow-800",
  Professional: "bg-red-100 text-red-800",
}

export default function InstallGuidesPage() {
  const sortedGuides = [...installGuides].sort((a, b) =>
    a.featured === b.featured ? 0 : a.featured ? -1 : 1,
  )

  return (
    <main className="relative">
      <FadeContainer className="relative px-7 sm:px-6 lg:px-8 pt-28 pb-16">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <FadeDiv className="mb-16 text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              Installation Guides
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-gray-600">
              Professional-quality results with our step-by-step installation
              guides. From beginner-friendly kits to advanced techniques,
              we&apos;ll help you achieve a flawless finish every time.
            </p>
          </FadeDiv>

          {/* Guides Grid */}
          <FadeDiv>
            <h2 className="mb-8 text-2xl font-bold text-gray-900">
              Browse Guides
            </h2>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {sortedGuides.map((guide) => (
                <Card
                  key={guide.id}
                  className="flex flex-col overflow-hidden transition-shadow hover:shadow-lg"
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
                        <Badge className="absolute top-4 left-4 bg-orange-500 hover:bg-orange-600">
                          Featured
                        </Badge>
                      )}
                    </div>
                  </Link>
                  <CardHeader>
                    <Link href={guide.href}>
                      <CardTitle className="text-lg">{guide.title}</CardTitle>
                    </Link>
                    <p className="text-sm text-gray-600">{guide.description}</p>
                  </CardHeader>
                  <CardContent className="mt-auto">
                    <div className="mb-4 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <UserIcon className="h-4 w-4" />
                        <Badge
                          className={
                            difficultyColor[
                              guide.difficulty as keyof typeof difficultyColor
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
                      className="w-full"
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
            <div className="rounded-2xl bg-gray-50 p-8">
              <h3 className="mb-4 text-2xl font-bold text-gray-900">
                Need Additional Help?
              </h3>
              <p className="mx-auto mb-6 max-w-2xl text-gray-600">
                Our installation guides are designed to be foolproof, but if you
                have questions or need additional support, we&apos;re here to
                help.
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <Button asChild variant="outline">
                  <Link href="/support">Contact Support</Link>
                </Button>
                <Button asChild>
                  <Link href="/store">Shop Installation Kits</Link>
                </Button>
              </div>
            </div>
          </FadeDiv>
        </div>
      </FadeContainer>
    </main>
  )
}
