import { Metadata } from "next"
import { FadeContainer, FadeDiv } from "@/components/Fade"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  RiShieldCheckLine,
  RiCustomerService2Line,
  RiTimeLine,
  RiMailLine,
  RiCheckboxCircleLine,
  RiInformationLine
} from "@remixicon/react"
import Link from "next/link"
import { siteConfig } from "@/app/siteConfig"

export const metadata: Metadata = {
  title: "Oops Protection Policy - OpticWorks Presence Sensors",
  description: "Damaged a sensor, cable, or mount during install? Our Oops Protection policy ships replacements for just a small handling fee.",
  keywords: ["oops protection", "presence sensors", "replacement hardware", "installation mistake", "support"],
}

export default function OopsPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative bg-background pt-24 pb-16">
        <FadeContainer className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <FadeDiv>
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <RiShieldCheckLine className="h-8 w-8 text-primary" />
              </div>
              <h1 className="font-barlow text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                Oops Protection Policy
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-xl leading-8 text-muted-foreground">
                Mistakes happen. That&apos;s why we&apos;ve got you covered with our Oops Protection program.
              </p>
              <Badge variant="secondary" className="mt-4">
                Hassle-Free Replacements
              </Badge>
            </FadeDiv>
          </div>
        </FadeContainer>
      </section>

      {/* What is Oops Protection */}
      <section className="py-16">
        <FadeContainer className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <FadeDiv>
            <Card className="shadow-elevation-1">
              <CardHeader className="bg-primary text-primary-foreground">
                <CardTitle className="text-2xl font-bold">What is Oops Protection?</CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <p className="text-lg leading-relaxed text-muted-foreground mb-6">
                  We know that even with our foolproof installation system, sometimes things don&apos;t go as planned. 
                  Maybe the sensor took a drop during mounting, or perhaps you kinked a cable and want to start over.
                </p>
                <p className="text-lg leading-relaxed text-muted-foreground mb-6">
                  Our <strong>Oops Protection</strong> program ensures you can get replacement hardware quickly and affordably,
                  so your DIY project doesn&apos;t turn into a costly mistake.
                </p>
                <div className="bg-muted/60 border border-border rounded-lg p-6">
                  <div className="flex items-start gap-3">
                    <RiInformationLine className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-foreground">Key benefit</h4>
                      <p className="text-muted-foreground text-sm mt-1">
                        Get replacement hardware for just <strong>$15 shipping & handling</strong> — no questions asked.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </FadeDiv>
        </FadeContainer>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-background">
        <FadeContainer className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <FadeDiv>
            <div className="text-center mb-12">
              <h2 className="font-barlow text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                How Oops Protection Works
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Getting a replacement is simple and fast
              </p>
            </div>
          </FadeDiv>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FadeDiv>
              <Card className="text-center h-full">
                <CardContent className="p-8">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <span className="text-xl font-semibold text-primary">1</span>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">Contact us</h3>
                  <p className="text-muted-foreground">
                    Reach out through our contact form or email within 30 days of your original order.
                  </p>
                </CardContent>
              </Card>
            </FadeDiv>

            <FadeDiv>
              <Card className="text-center h-full">
                <CardContent className="p-8">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <span className="text-xl font-semibold text-primary">2</span>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">Pay shipping</h3>
                  <p className="text-muted-foreground">
                    Pay the $15 shipping & handling fee. We&apos;ll send you a secure payment link.
                  </p>
                </CardContent>
              </Card>
            </FadeDiv>

            <FadeDiv>
              <Card className="text-center h-full">
                <CardContent className="p-8">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <span className="text-xl font-semibold text-primary">3</span>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">Get your hardware</h3>
                  <p className="text-muted-foreground">
                    We&apos;ll ship your replacement sensor or accessory the same or next business day. Try again with confidence!
                  </p>
                </CardContent>
              </Card>
            </FadeDiv>
          </div>
        </FadeContainer>
      </section>

      {/* Policy Details */}
      <section className="py-16">
        <FadeContainer className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <FadeDiv>
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <RiCheckboxCircleLine className="h-6 w-6 text-secondary" />
                    <CardTitle className="text-xl">What&apos;s Covered</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-muted-foreground">
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-secondary rounded-full flex-shrink-0 mt-2"></div>
                      <span>Sensor or cable damaged during installation</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-secondary rounded-full flex-shrink-0 mt-2"></div>
                      <span>Installation mistakes requiring a do-over</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-secondary rounded-full flex-shrink-0 mt-2"></div>
                      <span>Signal issues caused by debris or mounting errors</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-secondary rounded-full flex-shrink-0 mt-2"></div>
                      <span>Positioning errors that can&apos;t be corrected</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </FadeDiv>

            <FadeDiv>
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <RiTimeLine className="h-6 w-6 text-primary" />
                    <CardTitle className="text-xl">Important Details</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-muted-foreground">
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2"></div>
                      <span><strong>30-day window:</strong> Must request within 30 days of original order</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2"></div>
                      <span><strong>One replacement per order:</strong> Additional replacements at full price</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2"></div>
                      <span><strong>Same specification:</strong> Replacement will match your original order</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2"></div>
                      <span><strong>Fast processing:</strong> Ships same or next business day</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </FadeDiv>
          </div>
        </FadeContainer>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-background">
        <FadeContainer className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <FadeDiv>
            <Card>
              <CardContent className="p-8 text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary">
                  <RiCustomerService2Line className="h-8 w-8 text-primary-foreground" />
                </div>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  Ready to Request a Replacement?
                </h2>
                <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Our support team is here to help. Contact us today and we&apos;ll get your replacement hardware on the way.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild size="lg">
                    <Link href={siteConfig.baseLinks.supportContact}>
                      <RiMailLine className="mr-2 h-4 w-4" />
                      Contact Support
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link href={siteConfig.baseLinks.supportFaq}>
                      Browse FAQ
                    </Link>
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-6">
                  Have your order number ready to speed up the process
                </p>
              </CardContent>
            </Card>
          </FadeDiv>
        </FadeContainer>
      </section>
    </main>
  )
}
