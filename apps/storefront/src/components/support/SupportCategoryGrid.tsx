"use client"

import { 
  RiToolsLine, 
  RiShoppingBag3Line, 
  RiRefreshLine, 
  RiBankCardLine,
  RiCarLine,
  RiQuestionLine,
  RiFileTextLine
} from "@remixicon/react"
import { FadeContainer, FadeDiv } from "../Fade"
import { Button } from "../ui/button"
import Link from "next/link"
import { siteConfig } from "@/app/siteConfig"

const supportCategories = [
  {
    title: "Installation Help & Guides",
    description: "Step-by-step instructions, troubleshooting, and installation tips",
    icon: RiToolsLine,
    href: siteConfig.baseLinks.installGuides,
    color: "bg-info-light text-info-dark",
    popular: true
  },
  {
    title: "Order & Shipping Questions",
    description: "Track your order, shipping info, and delivery questions",
    icon: RiShoppingBag3Line,
    href: siteConfig.baseLinks.supportOrders,
    color: "bg-success-light text-success"
  },
  {
    title: "Returns & Warranty Claims",
    description: "Process returns, warranty claims, and product defects",
    icon: RiRefreshLine,
    href: siteConfig.baseLinks.supportWarranty,
    color: "bg-warning-light text-warning-dark"
  },
  {
    title: "Oops Protection",
    description: "Damaged film during install? Get a replacement for just shipping cost",
    icon: RiRefreshLine,
    href: siteConfig.baseLinks.supportOops,
    color: "bg-success-light text-success",
    popular: true
  },
  {
    title: "Payment & Billing Support",
    description: "Payment issues, billing questions, and refund requests",
    icon: RiBankCardLine,
    href: siteConfig.baseLinks.supportBilling,
    color: "bg-brand-modal-100 text-brand-modal-700"
  },
  {
    title: "Product Compatibility",
    description: "Check if our kits work with your vehicle make and model",
    icon: RiCarLine,
    href: siteConfig.baseLinks.supportCompatibility,
    color: "bg-info-light text-info-dark"
  },
  {
    title: "Frequently Asked Questions",
    description: "Quick answers to the most common questions",
    icon: RiQuestionLine,
    href: siteConfig.baseLinks.supportFaq,
    color: "bg-warning-light text-warning",
    popular: true
  },
  {
    title: "Legal & Compliance",
    description: "Tinting laws, privacy policy, terms of service",
    icon: RiFileTextLine,
    href: "/support/legal",
    color: "bg-gray-50 text-gray-600"
  }
]

export function SupportCategoryGrid() {
  return (
    <section id="tools-section" className="py-16">
      <FadeContainer className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <FadeDiv>
          <div className="text-center">
            <h2 className="font-barlow text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              How can we help you today?
            </h2>
            <p className="font-colfax mx-auto mt-4 max-w-2xl text-lg leading-8 text-gray-600">
              Choose a category below to get the support you need
            </p>
          </div>
        </FadeDiv>

        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-2 xl:grid-cols-3">
          {supportCategories.map((category) => (
            <FadeDiv key={category.title}>
              <div className="group relative">
                {category.popular && (
                  <div className="absolute -top-3 -right-3 z-10">
                    <span className="inline-flex items-center rounded-full bg-warning-light px-2.5 py-1 text-xs font-medium text-warning-dark">
                      Popular
                    </span>
                  </div>
                )}

                <div className="relative flex h-full flex-col rounded-2xl bg-white p-8 shadow-sm ring-1 ring-border transition-all duration-200 hover:shadow-lg hover:ring-border">
                  <div>
                    <span className={`inline-flex rounded-lg p-3 ${category.color}`}>
                      <category.icon className="h-6 w-6" />
                    </span>
                  </div>
                  
                  <div className="mt-6 flex-1">
                    <h3 className="text-lg font-semibold leading-7 text-gray-900">
                      {category.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-gray-600">
                      {category.description}
                    </p>
                  </div>
                  
                  <div className="mt-6">
                    <Button
                      asChild
                      variant="outline"
                      className="w-full border-border text-foreground transition-colors group-hover:border-warning group-hover:bg-warning-light group-hover:text-warning-dark"
                    >
                      <Link href={category.href}>
                        Get Help
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </FadeDiv>
          ))}
        </div>

      </FadeContainer>
    </section>
  )
}