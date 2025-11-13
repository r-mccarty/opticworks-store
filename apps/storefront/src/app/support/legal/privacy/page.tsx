import { Metadata } from "next"
import { FadeContainer, FadeDiv } from "@/components/Fade"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  RiShieldCheckLine,
  RiMailLine,
  RiLockLine,
  RiEyeLine,
  RiDeleteBinLine
} from "@remixicon/react"
import Link from "next/link"
import { siteConfig } from "@/app/siteConfig"

export const metadata: Metadata = {
  title: "Privacy Policy - OpticWorks Window Tinting",
  description: "Learn how OpticWorks collects, uses, and protects your personal information. GDPR and CCPA compliant privacy practices.",
  keywords: ["privacy policy", "data protection", "GDPR", "CCPA", "personal information", "cookies"],
}

export default function PrivacyPolicyPage() {
  const lastUpdated = "January 15, 2025";

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-white to-gray-50 pt-24 pb-16">
        <FadeContainer className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <FadeDiv>
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <RiShieldCheckLine className="h-8 w-8 text-green-600" />
              </div>
              <h1 className="font-barlow text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                Privacy Policy
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-xl leading-8 text-gray-600">
                How we collect, use, and protect your personal information.
              </p>
              <div className="mt-4 text-sm text-gray-500">
                Last updated: {lastUpdated}
              </div>
            </FadeDiv>
          </div>
        </FadeContainer>
      </section>

      {/* Privacy Policy Content */}
      <section className="py-16">
        <FadeContainer className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            
            {/* Overview */}
            <FadeDiv>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <RiEyeLine className="h-6 w-6 text-blue-600" />
                    Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose prose-gray max-w-none">
                  <p>
                    OpticWorks LLC (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) respects your privacy and is committed to protecting your personal data. 
                    This privacy policy explains how we collect, use, disclose, and safeguard your information when you visit 
                    our website, use our services, or purchase our products.
                  </p>
                  <p>
                    This policy applies to all information collected through our website, mobile applications, 
                    and any related services, sales, marketing, or events.
                  </p>
                </CardContent>
              </Card>
            </FadeDiv>

            {/* Information We Collect */}
            <FadeDiv>
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Information We Collect</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-lg mb-3">Personal Information You Provide</h4>
                    <ul className="list-disc list-inside space-y-2 text-gray-600">
                      <li><strong>Contact Information:</strong> Name, email address, mailing address</li>
                      <li><strong>Account Information:</strong> Username, password, profile information</li>
                      <li><strong>Payment Information:</strong> Credit card details, billing address (processed securely by our payment processors)</li>
                      <li><strong>Order Information:</strong> Purchase history, product preferences, vehicle information</li>
                      <li><strong>Communication Data:</strong> Messages sent through contact forms, support tickets, reviews</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-lg mb-3">Information Automatically Collected</h4>
                    <ul className="list-disc list-inside space-y-2 text-gray-600">
                      <li><strong>Device Information:</strong> IP address, browser type, operating system, device identifiers</li>
                      <li><strong>Usage Data:</strong> Pages visited, time spent, clicks, search terms, referral sources</li>
                      <li><strong>Location Data:</strong> General geographic location (city/state level) based on IP address</li>
                      <li><strong>Cookies and Tracking:</strong> Session data, preferences, analytics information</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </FadeDiv>

            {/* How We Use Information */}
            <FadeDiv>
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">How We Use Your Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Service Delivery & Operations</h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-600 text-sm">
                        <li>Process orders and payments</li>
                        <li>Ship products and provide order updates</li>
                        <li>Provide customer support and respond to inquiries</li>
                        <li>Maintain and improve our website and services</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">Marketing & Communications</h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-600 text-sm">
                        <li>Send promotional emails and product updates (with your consent)</li>
                        <li>Display personalized advertisements and content</li>
                        <li>Conduct surveys and collect feedback</li>
                        <li>Analyze usage patterns to improve our offerings</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">Legal & Security</h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-600 text-sm">
                        <li>Comply with legal obligations and industry standards</li>
                        <li>Protect against fraud, abuse, and security threats</li>
                        <li>Enforce our terms of service and policies</li>
                        <li>Resolve disputes and investigate complaints</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </FadeDiv>

            {/* Information Sharing */}
            <FadeDiv>
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Information Sharing and Disclosure</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-gray-700">
                      We do not sell, trade, or rent your personal information to third parties. We may share your information in the following circumstances:
                    </p>
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Service Providers</h4>
                        <p className="text-sm text-gray-600">
                          Payment processors, shipping companies, email services, analytics providers, 
                          and other vendors who help us operate our business (under strict confidentiality agreements).
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-2">Legal Requirements</h4>
                        <p className="text-sm text-gray-600">
                          When required by law, court order, or government regulation, or to protect our rights, 
                          property, or safety of our users.
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-2">Business Transfers</h4>
                        <p className="text-sm text-gray-600">
                          In connection with a merger, acquisition, or sale of assets, your information may be 
                          transferred to the new entity (with prior notice).
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </FadeDiv>

            {/* Data Security */}
            <FadeDiv>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <RiLockLine className="h-6 w-6 text-green-600" />
                    Data Security
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-gray-700">
                      We implement industry-standard security measures to protect your personal information:
                    </p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-green-50 p-4 rounded-lg">
                        <h5 className="font-medium text-green-800 mb-2">Technical Safeguards</h5>
                        <ul className="text-sm text-green-700 space-y-1">
                          <li>• SSL/TLS encryption for data transmission</li>
                          <li>• Secure data storage and backup systems</li>
                          <li>• Regular security audits and updates</li>
                          <li>• Access controls and authentication</li>
                        </ul>
                      </div>
                      
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h5 className="font-medium text-blue-800 mb-2">Operational Safeguards</h5>
                        <ul className="text-sm text-blue-700 space-y-1">
                          <li>• Employee training and confidentiality agreements</li>
                          <li>• Limited access on need-to-know basis</li>
                          <li>• Incident response and breach notification procedures</li>
                          <li>• Regular security assessments</li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-sm text-yellow-800">
                        <strong>Important:</strong> While we implement robust security measures, no system is 100% secure. 
                        We cannot guarantee absolute security of your information transmitted to our site.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </FadeDiv>

            {/* Your Rights */}
            <FadeDiv>
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Your Privacy Rights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <p className="text-gray-700">
                      Depending on your location, you may have the following rights regarding your personal information:
                    </p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <RiEyeLine className="h-4 w-4 text-blue-600" />
                          Access & Portability
                        </h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• Request a copy of your personal data</li>
                          <li>• Receive data in a structured, portable format</li>
                          <li>• Understand how your data is processed</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <RiDeleteBinLine className="h-4 w-4 text-red-600" />
                          Correction & Deletion
                        </h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• Correct inaccurate or incomplete data</li>
                          <li>• Request deletion of your personal data</li>
                          <li>• Withdraw consent for data processing</li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-800 mb-2">How to Exercise Your Rights</h4>
                      <p className="text-sm text-blue-700 mb-3">
                        To exercise any of these rights, please contact us using the information provided below. 
                        We will respond to your request within 30 days.
                      </p>
                      <Button asChild variant="outline" size="sm" className="border-blue-300 text-blue-700 hover:bg-blue-100">
                        <Link href={siteConfig.baseLinks.supportContact + "?category=privacy"}>
                          Submit Privacy Request
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </FadeDiv>

            {/* Cookies */}
            <FadeDiv>
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Cookies and Tracking Technologies</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-gray-700">
                      We use cookies and similar technologies to enhance your browsing experience and analyze site usage.
                    </p>
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Types of Cookies We Use</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                          <div>
                            <strong>Essential Cookies:</strong> Required for website functionality
                          </div>
                          <div>
                            <strong>Analytics Cookies:</strong> Help us understand site usage
                          </div>
                          <div>
                            <strong>Preference Cookies:</strong> Remember your settings and choices
                          </div>
                          <div>
                            <strong>Marketing Cookies:</strong> Deliver relevant advertisements
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">Managing Cookies</h4>
                        <p className="text-sm text-gray-600">
                          You can control cookies through your browser settings. Note that disabling certain cookies 
                          may affect website functionality. Most browsers allow you to refuse or delete cookies.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </FadeDiv>

            {/* Contact Information */}
            <FadeDiv>
              <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                <CardContent className="p-8 text-center">
                  <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-600">
                    <RiMailLine className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Questions About Your Privacy?
                  </h3>
                  <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
                    If you have questions about this privacy policy or how we handle your personal information, 
                    please don&apos;t hesitate to contact us.
                  </p>
                  
                  <div className="space-y-2 text-sm text-gray-600 mb-6">
                    <p><strong>Email:</strong> privacy@opticworks.com</p>
                    <p><strong>Mail:</strong> OpticWorks LLC, Privacy Department, [Address]</p>
                  </div>
                  
                  <Button asChild size="lg" className="bg-green-600 hover:bg-green-700">
                    <Link href={siteConfig.baseLinks.supportContact + "?category=privacy"}>
                      <RiMailLine className="mr-2 h-4 w-4" />
                      Contact Privacy Team
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </FadeDiv>

          </div>
        </FadeContainer>
      </section>
    </main>
  )
}