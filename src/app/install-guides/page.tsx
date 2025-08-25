import { Metadata } from "next"
import { FadeContainer, FadeDiv } from "@/components/Fade"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ClockIcon, UserIcon, WrenchScrewdriverIcon } from "@heroicons/react/24/outline"
import Link from "next/link"
import Image from "next/image"

export const metadata: Metadata = {
  title: "Installation Guides - OpticWorks Window Tinting",
  description: "Step-by-step installation guides for OpticWorks window tinting kits. Professional results with foolproof DIY instructions.",
}

const installGuides = [
  {
    id: "cybershade-irx-tesla-model-y",
    title: "CyberShade IRX - Tesla Model Y (2025+ Juniper)",
    description: "Complete installation guide for the CyberShade IRX ceramic tint kit designed specifically for Tesla Model Y front windows.",
    image: "https://via.placeholder.com/400x300/3498db/ffffff?text=Tesla+Model+Y+Install",
    difficulty: "Beginner",
    duration: "45-60 minutes",
    tools: "Included in kit",
    featured: true,
    href: "/install-guides/cybershade-irx-tesla-model-y"
  },
  {
    id: "general-side-window-tinting",
    title: "General Side Window Tinting",
    description: "Universal guide for applying window tint to any vehicle's side windows using OpticWorks films and tools.",
    image: "https://via.placeholder.com/400x300/2c3e50/ffffff?text=Side+Window+Guide",
    difficulty: "Intermediate",
    duration: "2-3 hours",
    tools: "Basic kit required",
    featured: false,
    href: "/install-guides/general-side-window-tinting"
  },
  {
    id: "rear-window-techniques",
    title: "Rear Window Installation",
    description: "Advanced techniques for applying tint to curved rear windows with professional results.",
    image: "https://via.placeholder.com/400x300/27ae60/ffffff?text=Rear+Window+Guide",
    difficulty: "Professional",
    duration: "1-2 hours",
    tools: "Heat gun required",
    featured: false,
    href: "/install-guides/rear-window-techniques"
  }
]

const difficultyColor = {
  "Beginner": "bg-green-100 text-green-800",
  "Intermediate": "bg-yellow-100 text-yellow-800", 
  "Professional": "bg-red-100 text-red-800"
}

export default function InstallGuidesPage() {
  const featuredGuides = installGuides.filter(guide => guide.featured)
  const otherGuides = installGuides.filter(guide => !guide.featured)

  return (
    <main className="relative">
      <FadeContainer className="relative px-6 pt-28 pb-16 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <FadeDiv className="text-center mb-16">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              Installation Guides
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 max-w-3xl mx-auto">
              Professional-quality results with our step-by-step installation guides. 
              From beginner-friendly kits to advanced techniques, we&apos;ll help you achieve 
              a flawless finish every time.
            </p>
          </FadeDiv>

          {/* Featured Guides */}
          {featuredGuides.length > 0 && (
            <FadeDiv className="mb-16">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Featured Guides</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {featuredGuides.map((guide) => (
                  <Card key={guide.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-video relative">
                      <Image
                        src={guide.image}
                        alt={guide.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 100vw, 50vw"
                      />
                      <Badge className="absolute top-4 left-4 bg-orange-500 hover:bg-orange-600">
                        Featured
                      </Badge>
                    </div>
                    <CardHeader>
                      <CardTitle className="text-xl">{guide.title}</CardTitle>
                      <p className="text-gray-600">{guide.description}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                        <div className="flex items-center gap-1">
                          <UserIcon className="w-4 h-4" />
                          <Badge className={difficultyColor[guide.difficulty as keyof typeof difficultyColor]}>
                            {guide.difficulty}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1">
                          <ClockIcon className="w-4 h-4" />
                          <span>{guide.duration}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <WrenchScrewdriverIcon className="w-4 h-4" />
                          <span>{guide.tools}</span>
                        </div>
                      </div>
                      <Button asChild className="w-full">
                        <Link href={guide.href}>View Installation Guide</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </FadeDiv>
          )}

          {/* Other Guides */}
          {otherGuides.length > 0 && (
            <FadeDiv>
              <h2 className="text-2xl font-bold text-gray-900 mb-8">All Installation Guides</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {otherGuides.map((guide) => (
                  <Card key={guide.id} className="hover:shadow-lg transition-shadow">
                    <div className="aspect-video relative">
                      <Image
                        src={guide.image}
                        alt={guide.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    </div>
                    <CardHeader>
                      <CardTitle className="text-lg">{guide.title}</CardTitle>
                      <p className="text-sm text-gray-600">{guide.description}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
                        <Badge className={difficultyColor[guide.difficulty as keyof typeof difficultyColor]}>
                          {guide.difficulty}
                        </Badge>
                        <span>{guide.duration}</span>
                      </div>
                      <Button asChild variant="outline" className="w-full">
                        <Link href={guide.href}>View Guide</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </FadeDiv>
          )}

          {/* Help Section */}
          <FadeDiv className="mt-16 text-center">
            <div className="bg-gray-50 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Need Additional Help?
              </h3>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Our installation guides are designed to be foolproof, but if you have questions 
                or need additional support, we&apos;re here to help.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
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