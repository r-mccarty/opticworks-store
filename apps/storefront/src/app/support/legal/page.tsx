import { Metadata } from "next"
import { FadeContainer, FadeDiv } from "@/components/Fade"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  RiFileTextLine,
  RiShieldCheckLine,
  RiScalesLine,
  RiMapPinLine,
  RiArrowRightLine,
  RiQuestionLine
} from "@remixicon/react"
import Link from "next/link"
import { siteConfig } from "@/app/siteConfig"

export const metadata: Metadata = {
  title: "Legal & Compliance - OpticWorks Window Tinting",
  description: "Access our privacy policy, terms of service, and tinting law information. Stay compliant and informed about window tinting regulations.",
  keywords: ["legal", "privacy policy", "terms of service", "tinting laws", "compliance", "regulations"],
}

const legalCategories = [
  {
    title: "Window Tinting Laws",
    description: "Check tinting laws for your state and ensure legal compliance",
    icon: RiMapPinLine,
    href: "/support/legal/tinting-laws",
    color: "bg-blue-50 text-blue-600",
    popular: true,
    details: "Interactive tool to check VLT requirements by state"
  },
  {
    title: "Privacy Policy", 
    description: "How we collect, use, and protect your personal information",
    icon: RiShieldCheckLine,
    href: "/support/legal/privacy",
    color: "bg-green-50 text-green-600",
    details: "GDPR & CCPA compliant privacy practices"
  },
  {
    title: "Terms of Service",
    description: "Terms governing your use of our products and services", 
    icon: RiScalesLine,
    href: "/support/legal/terms",
    color: "bg-orange-50 text-orange-600",
    details: "Purchase terms, warranties, and legal agreements"
  }
]

export default function LegalPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-white to-gray-50 pt-24 pb-16">
        <FadeContainer className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <FadeDiv>
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <RiFileTextLine className="h-8 w-8 text-gray-600" />
              </div>
              <h1 className="font-barlow text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                Legal & Compliance
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-xl leading-8 text-gray-600">
                Stay informed about tinting laws, privacy practices, and terms of service.
              </p>
            </FadeDiv>
          </div>
        </FadeContainer>
      </section>

      {/* Legal Categories */}
      <section className="py-16">
        <FadeContainer className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {legalCategories.map((category) => (
              <FadeDiv key={category.title}>
                <div className="group relative">
                  {category.popular && (
                    <div className="absolute -top-3 -right-3 z-10">
                      <span className="inline-flex items-center rounded-full bg-orange-100 px-2.5 py-1 text-xs font-medium text-orange-800">
                        Popular
                      </span>
                    </div>
                  )}
                  
                  <Card className="h-full transition-all duration-200 hover:shadow-lg">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <span className={`inline-flex rounded-lg p-3 ${category.color}`}>
                          <category.icon className="h-6 w-6" />
                        </span>
                      </div>
                      <CardTitle className="text-xl">{category.title}</CardTitle>
                      <CardDescription className="text-base">
                        {category.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <p className="text-sm text-gray-600 mb-6">
                        {category.details}
                      </p>
                      
                      <Button asChild className="w-full group-hover:bg-orange-50 group-hover:border-orange-300 group-hover:text-orange-700" variant="outline">
                        <Link href={category.href}>
                          View Details
                          <RiArrowRightLine className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </FadeDiv>
            ))}
          </div>
        </FadeContainer>
      </section>

      {/* Legal FAQ Section */}
      <section className="py-16 bg-white">
        <FadeContainer className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <FadeDiv>
            <div className="text-center mb-12">
              <h2 className="font-barlow text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Legal FAQ
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Quick answers to common legal and compliance questions
              </p>
            </div>
          </FadeDiv>

          <FadeDiv>
            <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-8 text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-600">
                  <RiQuestionLine className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Have Questions About Tinting Laws?
                </h3>
                <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
                  Check our comprehensive FAQ section for answers about legal requirements, installation questions, and more.
                </p>
                
                <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
                  <Link href={siteConfig.baseLinks.supportFaq + "?category=legal"}>
                    <RiQuestionLine className="mr-2 h-4 w-4" />
                    Browse Legal FAQ
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </FadeDiv>
        </FadeContainer>
      </section>

      {/* Contact Legal Section */}
      <section className="py-16">
        <FadeContainer className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <FadeDiv>
            <Card className="border-gray-200">
              <CardContent className="p-8">
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Need Legal Assistance?
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                    For legal inquiries, privacy requests, or compliance questions not covered here, 
                    please contact our support team.
                  </p>
                  
                  <Button asChild variant="outline" size="lg">
                    <Link href={siteConfig.baseLinks.supportContact + "?category=legal"}>
                      Contact Legal Support
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