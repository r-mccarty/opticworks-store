import { Metadata } from "next"
import { FadeContainer, FadeDiv } from "@/components/Fade"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
  title: "Legal & Compliance - OpticWorks Presence Sensors",
  description: "Review our privacy practices, terms of service, and presence compliance resources for residential and clinical deployments.",
  keywords: ["legal", "privacy policy", "terms of service", "presence compliance", "regulations"],
}

const legalCategories = [
  {
    title: "Privacy Policy", 
    description: "How we collect, use, and protect your personal information",
    icon: RiShieldCheckLine,
    href: "/support/legal/privacy",
    color: "bg-muted text-primary",
    details: "GDPR & CCPA compliant privacy practices"
  },
  {
    title: "Terms of Service",
    description: "Terms governing your use of our products and services", 
    icon: RiScalesLine,
    href: "/support/legal/terms",
    color: "bg-muted text-primary",
    details: "Purchase terms, warranties, and legal agreements"
  },
  {
    title: "Presence Compliance (Beta)",
    description: "Understand regional privacy expectations for mmWave sensors",
    icon: RiMapPinLine,
    href: "/support/legal/tinting-laws",
    color: "bg-muted text-primary",
    popular: true,
    details: "Updated guidance for residential + clinical deployments"
  }
]

export default function LegalPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-background to-muted/40 pt-24 pb-16">
        <FadeContainer className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <FadeDiv>
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <RiFileTextLine className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl font-display">
                Legal & Compliance
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-xl leading-8 text-muted-foreground">
                Stay informed about privacy, terms, and the compliance posture of our presence hardware.
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
                      <Badge variant="secondary" className="text-xs">
                        Popular
                      </Badge>
                    </div>
                  )}
                  
                  <Card className="h-full transition-all duration-200 hover:shadow-elevation-2">
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
                      <p className="mb-6 text-sm text-muted-foreground">
                        {category.details}
                      </p>
                      
                      <Button asChild className="w-full" variant="outline">
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
      <section className="py-16 bg-background">
        <FadeContainer className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <FadeDiv>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl font-display">
                Legal FAQ
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Quick answers to common legal and compliance questions
              </p>
            </div>
          </FadeDiv>

          <FadeDiv>
            <Card className="border-border bg-muted/30">
              <CardContent className="p-8 text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <RiQuestionLine className="h-8 w-8 text-primary" />
                </div>
                <h3 className="mb-4 text-2xl font-semibold text-foreground">
                  Need Presence Compliance Guidance?
                </h3>
                <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
                  Check our legal FAQ section for answers about privacy requests, local regulations, and approved deployment scenarios.
                </p>
                
                <Button asChild size="lg">
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
            <Card className="border-border">
              <CardContent className="p-8">
                <div className="text-center">
                  <h3 className="mb-4 text-xl font-semibold text-foreground">
                    Need Legal Assistance?
                  </h3>
                  <p className="mx-auto mb-6 max-w-2xl text-muted-foreground">
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
