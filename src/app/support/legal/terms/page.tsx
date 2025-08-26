import { Metadata } from "next"
import { FadeContainer, FadeDiv } from "@/components/Fade"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  RiScalesLine,
  RiMailLine,
  RiShoppingCartLine,
  RiToolsLine,
  RiShieldLine,
  RiAlertLine,
  RiFileTextLine
} from "@remixicon/react"
import Link from "next/link"
import { siteConfig } from "@/app/siteConfig"

export const metadata: Metadata = {
  title: "Terms of Service - OpticWorks Window Tinting",
  description: "Terms and conditions governing your use of OpticWorks products and services. Purchase terms, warranties, and legal agreements.",
  keywords: ["terms of service", "terms and conditions", "purchase agreement", "warranty", "legal"],
}

export default function TermsOfServicePage() {
  const lastUpdated = "January 15, 2025";

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-white to-gray-50 pt-24 pb-16">
        <FadeContainer className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <FadeDiv>
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
                <RiScalesLine className="h-8 w-8 text-orange-600" />
              </div>
              <h1 className="font-barlow text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                Terms of Service
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-xl leading-8 text-gray-600">
                Terms and conditions governing your use of our products and services.
              </p>
              <div className="mt-4 text-sm text-gray-500">
                Last updated: {lastUpdated}
              </div>
            </FadeDiv>
          </div>
        </FadeContainer>
      </section>

      {/* Terms Content */}
      <section className="py-16">
        <FadeContainer className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            
            {/* Acceptance */}
            <FadeDiv>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <RiFileTextLine className="h-6 w-6 text-blue-600" />
                    Acceptance of Terms
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose prose-gray max-w-none">
                  <p>
                    By accessing and using the OpticWorks website, purchasing our products, or using our services, 
                    you agree to be bound by these Terms of Service (&quot;Terms&quot;) and our Privacy Policy.
                  </p>
                  <p>
                    These Terms constitute a legally binding agreement between you and OpticWorks LLC (&quot;OpticWorks,&quot; &quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). 
                    If you do not agree to these Terms, do not use our website or services.
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                    <p className="text-sm text-blue-800 mb-0">
                      <strong>Important:</strong> We may update these Terms from time to time. 
                      Your continued use after changes constitutes acceptance of the new Terms.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </FadeDiv>

            {/* Products and Orders */}
            <FadeDiv>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <RiShoppingCartLine className="h-6 w-6 text-green-600" />
                    Products and Orders
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-lg mb-3">Product Information</h4>
                    <ul className="list-disc list-inside space-y-2 text-gray-600">
                      <li>We strive to provide accurate product descriptions, specifications, and pricing</li>
                      <li>Product images are for illustration purposes and may not reflect exact appearance</li>
                      <li>VLT (Visible Light Transmission) percentages may have ±3% manufacturing tolerance</li>
                      <li>We reserve the right to correct errors and update product information without notice</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-lg mb-3">Ordering Process</h4>
                    <ul className="list-disc list-inside space-y-2 text-gray-600">
                      <li>Orders are subject to acceptance and product availability</li>
                      <li>We may cancel or refuse orders at our discretion</li>
                      <li>Payment is required at time of order placement</li>
                      <li>Order confirmation emails constitute acceptance of your order</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-lg mb-3">Pricing and Payment</h4>
                    <ul className="list-disc list-inside space-y-2 text-gray-600">
                      <li>All prices are in USD and exclude applicable taxes and shipping</li>
                      <li>Prices are subject to change without notice until order confirmation</li>
                      <li>Payment processing is handled by secure third-party providers</li>
                      <li>Additional fees may apply for expedited shipping or special requests</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </FadeDiv>

            {/* Installation and DIY Terms */}
            <FadeDiv>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <RiToolsLine className="h-6 w-6 text-orange-600" />
                    Installation and DIY Terms
                    <Badge className="bg-yellow-100 text-yellow-800">Important</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <h4 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
                      <RiAlertLine className="h-5 w-5" />
                      Installation Responsibility and Liability
                    </h4>
                    <div className="space-y-3 text-sm text-red-700">
                      <p>
                        <strong>YOU ASSUME ALL RISK AND RESPONSIBILITY FOR DIY INSTALLATION.</strong> 
                        OpticWorks provides materials and guidance only.
                      </p>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li>Installation is performed entirely at your own risk</li>
                        <li>We are not responsible for damage to vehicles, property, or injury</li>
                        <li>Professional installation is recommended for valuable or complex vehicles</li>
                        <li>Vehicle modifications may void manufacturer warranties</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-lg mb-3">Installation Guidelines</h4>
                    <ul className="list-disc list-inside space-y-2 text-gray-600">
                      <li>Follow all provided instructions and safety guidelines</li>
                      <li>Ensure compliance with local tinting laws before installation</li>
                      <li>Installation should be performed in appropriate conditions (temperature, humidity, cleanliness)</li>
                      <li>Take your time - rushing increases risk of errors and damage</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-lg mb-3">Legal Compliance</h4>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-sm text-yellow-800">
                        <strong>You are responsible for ensuring compliance with all local, state, and federal tinting laws.</strong> 
                        OpticWorks provides general information only and is not responsible for legal violations or citations.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </FadeDiv>

            {/* Warranties */}
            <FadeDiv>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <RiShieldLine className="h-6 w-6 text-blue-600" />
                    Warranties and Returns
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-lg mb-3">Product Warranties</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-green-50 p-4 rounded-lg">
                        <h5 className="font-medium text-green-800 mb-2">Material Defects</h5>
                        <ul className="text-sm text-green-700 space-y-1">
                          <li>• Manufacturing defects in film material</li>
                          <li>• Adhesive failure under normal conditions</li>
                          <li>• Color or optical distortion defects</li>
                          <li>• Warranty period varies by product</li>
                        </ul>
                      </div>
                      
                      <div className="bg-red-50 p-4 rounded-lg">
                        <h5 className="font-medium text-red-800 mb-2">NOT Covered</h5>
                        <ul className="text-sm text-red-700 space-y-1">
                          <li>• Installation errors or damage</li>
                          <li>• Normal wear and tear</li>
                          <li>• Damage from cleaning or chemicals</li>
                          <li>• Improper removal attempts</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-lg mb-3">Return Policy</h4>
                    <ul className="list-disc list-inside space-y-2 text-gray-600">
                      <li><strong>30-Day Return Window:</strong> Unopened products may be returned within 30 days</li>
                      <li><strong>Restocking Fee:</strong> 15% restocking fee applies to opened or custom-cut products</li>
                      <li><strong>Return Shipping:</strong> Customer responsible for return shipping costs</li>
                      <li><strong>Refund Processing:</strong> Refunds processed within 5-7 business days after receipt</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-lg mb-3">Oops Protection Program</h4>
                    <p className="text-gray-600 text-sm mb-2">
                      Our Oops Protection program provides replacement films for installation mistakes at reduced cost. 
                      See our <Link href="/support/oops" className="text-orange-600 hover:text-orange-700 underline">Oops Protection Policy</Link> for full details.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </FadeDiv>

            {/* Limitations of Liability */}
            <FadeDiv>
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Limitations of Liability</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-6">
                    <h4 className="font-semibold text-lg mb-4">DISCLAIMER OF WARRANTIES</h4>
                    <p className="text-sm text-gray-700 mb-4">
                      EXCEPT AS EXPRESSLY PROVIDED IN OUR PRODUCT WARRANTIES, ALL PRODUCTS AND SERVICES ARE PROVIDED 
                      &quot;AS IS&quot; WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED.
                    </p>
                    <p className="text-sm text-gray-700">
                      WE DISCLAIM ALL IMPLIED WARRANTIES, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, 
                      AND NON-INFRINGEMENT.
                    </p>
                  </div>
                  
                  <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
                    <h4 className="font-semibold text-lg mb-4 text-red-800">LIMITATION OF LIABILITY</h4>
                    <div className="text-sm text-red-700 space-y-3">
                      <p>
                        IN NO EVENT SHALL OPTICWORKS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, 
                        CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO:
                      </p>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li>Vehicle damage or depreciation</li>
                        <li>Lost profits or business opportunities</li>
                        <li>Personal injury or property damage</li>
                        <li>Legal fees or citation costs</li>
                      </ul>
                      <p className="font-medium">
                        OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID FOR THE SPECIFIC PRODUCT GIVING RISE TO THE CLAIM.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </FadeDiv>

            {/* User Responsibilities */}
            <FadeDiv>
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">User Responsibilities</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-3">Prohibited Uses</h4>
                    <ul className="list-disc list-inside space-y-2 text-gray-600">
                      <li>Using our products for illegal purposes or in violation of local laws</li>
                      <li>Reselling products without authorization</li>
                      <li>Reverse engineering or copying our proprietary methods</li>
                      <li>Providing false information during purchases</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3">Account Security</h4>
                    <ul className="list-disc list-inside space-y-2 text-gray-600">
                      <li>Maintain confidentiality of your account credentials</li>
                      <li>Notify us immediately of unauthorized access</li>
                      <li>You are responsible for all activities under your account</li>
                      <li>Provide accurate and current information</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </FadeDiv>

            {/* Governing Law */}
            <FadeDiv>
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Governing Law and Disputes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-3">Jurisdiction</h4>
                    <p className="text-gray-600">
                      These Terms are governed by the laws of [State], without regard to conflict of law principles. 
                      Any disputes shall be resolved in the courts of [County], [State].
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3">Dispute Resolution</h4>
                    <ul className="list-disc list-inside space-y-2 text-gray-600">
                      <li>We encourage resolving disputes through direct communication first</li>
                      <li>Small claims court may be appropriate for minor disputes</li>
                      <li>Arbitration may be required for certain types of claims</li>
                      <li>Class action waivers may apply</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </FadeDiv>

            {/* Contact Information */}
            <FadeDiv>
              <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
                <CardContent className="p-8 text-center">
                  <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-orange-600">
                    <RiMailLine className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Questions About These Terms?
                  </h3>
                  <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
                    If you have questions about these Terms of Service or need clarification on any provisions, 
                    please contact our legal team.
                  </p>
                  
                  <div className="space-y-2 text-sm text-gray-600 mb-6">
                    <p><strong>Email:</strong> legal@opticworks.com</p>
                    <p><strong>Mail:</strong> OpticWorks LLC, Legal Department, [Address]</p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button asChild size="lg" className="bg-orange-600 hover:bg-orange-700">
                      <Link href={siteConfig.baseLinks.supportContact + "?category=legal"}>
                        <RiMailLine className="mr-2 h-4 w-4" />
                        Contact Legal Team
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg">
                      <Link href="/support/legal/privacy">
                        View Privacy Policy
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </FadeDiv>

          </div>
        </FadeContainer>
      </section>
    </main>
  )
}