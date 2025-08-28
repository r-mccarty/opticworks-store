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
  title: "Hot Reload Policy - OpticWorks Window Tinting",
  description: "Damaged a film during installation? No problem! Our Hot Reload policy provides replacement films for just a small shipping & handling fee.",
  keywords: ["hot reload", "replacement", "damaged film", "installation mistake", "support"],
}

export default function HotReloadPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-white to-gray-50 pt-24 pb-16">
        <FadeContainer className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <FadeDiv>
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
                <RiShieldCheckLine className="h-8 w-8 text-orange-600" />
              </div>
              <h1 className="font-barlow text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                Hot Reload Policy
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-xl leading-8 text-gray-600">
                Mistakes happen. That&apos;s why we&apos;ve got you covered with our Hot Reload program.
              </p>
              <Badge className="mt-4 bg-green-100 text-green-800 hover:bg-green-200">
                Hassle-Free Replacements
              </Badge>
            </FadeDiv>
          </div>
        </FadeContainer>
      </section>

      {/* What is Hot Reload */}
      <section className="py-16">
        <FadeContainer className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <FadeDiv>
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                <CardTitle className="text-2xl font-bold">What is Hot Reload?</CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <p className="text-lg leading-relaxed text-gray-700 mb-6">
                  We know that even with our foolproof installation system, sometimes things don&apos;t go as planned. 
                  Maybe the film got damaged during installation, or perhaps you want to start over for the perfect finish.
                </p>
                <p className="text-lg leading-relaxed text-gray-700 mb-6">
                  Our <strong>Hot Reload</strong> program ensures you can get a replacement film quickly and affordably,
                  so your DIY project doesn&apos;t turn into a costly mistake.
                </p>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                  <div className="flex items-start gap-3">
                    <RiInformationLine className="h-6 w-6 text-orange-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-orange-900">Key Benefit</h4>
                      <p className="text-orange-800 text-sm mt-1">
                        Get a replacement film for just <strong>$15 shipping & handling</strong> — no questions asked.
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
      <section className="py-16 bg-white">
        <FadeContainer className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <FadeDiv>
            <div className="text-center mb-12">
              <h2 className="font-barlow text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                How Hot Reload Works
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Getting a replacement is simple and fast
              </p>
            </div>
          </FadeDiv>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FadeDiv>
              <Card className="text-center h-full">
                <CardContent className="p-8">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
                    <span className="text-xl font-bold text-orange-600">1</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Contact Us</h3>
                  <p className="text-gray-600">
                    Reach out through our contact form or email within 30 days of your original order.
                  </p>
                </CardContent>
              </Card>
            </FadeDiv>

            <FadeDiv>
              <Card className="text-center h-full">
                <CardContent className="p-8">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
                    <span className="text-xl font-bold text-orange-600">2</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Pay Shipping</h3>
                  <p className="text-gray-600">
                    Pay the $15 shipping & handling fee. We&apos;ll send you a secure payment link.
                  </p>
                </CardContent>
              </Card>
            </FadeDiv>

            <FadeDiv>
              <Card className="text-center h-full">
                <CardContent className="p-8">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
                    <span className="text-xl font-bold text-orange-600">3</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Get Your Film</h3>
                  <p className="text-gray-600">
                    We&apos;ll ship your replacement film the same or next business day. Try again with confidence!
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
                    <RiCheckboxCircleLine className="h-6 w-6 text-green-600" />
                    <CardTitle className="text-xl">What&apos;s Covered</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0 mt-2"></div>
                      <span>Film damaged during installation</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0 mt-2"></div>
                      <span>Installation mistakes requiring a do-over</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0 mt-2"></div>
                      <span>Contamination or debris under the film</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0 mt-2"></div>
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
                    <RiTimeLine className="h-6 w-6 text-blue-600" />
                    <CardTitle className="text-xl">Important Details</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                      <span><strong>30-day window:</strong> Must request within 30 days of original order</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                      <span><strong>One replacement per order:</strong> Additional replacements at full price</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                      <span><strong>Same specification:</strong> Replacement will match your original order</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
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
      <section className="py-16 bg-white">
        <FadeContainer className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <FadeDiv>
            <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
              <CardContent className="p-8 text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-orange-600">
                  <RiCustomerService2Line className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Ready to Request a Replacement?
                </h2>
                <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
                  Our support team is here to help. Contact us today and we&apos;ll get your replacement film on the way.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild size="lg" className="bg-orange-600 hover:bg-orange-700">
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
                <p className="text-sm text-gray-600 mt-6">
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