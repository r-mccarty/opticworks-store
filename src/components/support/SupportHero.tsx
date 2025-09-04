"use client"

import { useState } from "react"
import { RiSearchLine, RiMailLine, RiCustomerService2Line } from "@remixicon/react"
import { FadeContainer, FadeDiv } from "../Fade"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import Link from "next/link"
import { siteConfig } from "@/app/siteConfig"

export function SupportHero() {
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // Navigate to FAQ with search query
      window.location.href = `/support/faq?search=${encodeURIComponent(searchQuery)}`
    }
  }

  return (
    <section className="relative bg-gradient-to-br from-orange-50 via-white to-orange-50 pt-24 pb-16">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(251,146,60,0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(251,146,60,0.05),transparent_50%)]" />
      
      <FadeContainer className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <FadeDiv>
            <h1 className="font-barlow text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              We&apos;re here to <span className="text-orange-600">help</span>
            </h1>
          </FadeDiv>
          
          <FadeDiv>
            <p className="font-colfax mx-auto mt-6 max-w-2xl text-xl leading-8 text-gray-600">
              Get expert support for your window tinting installation, product questions, 
              warranty claims, and everything in between.
            </p>
          </FadeDiv>

          {/* Quick Search */}
          <FadeDiv>
            <form onSubmit={handleSearch} className="mx-auto mt-10 max-w-md">
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <RiSearchLine className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for help..."
                  className="block w-full rounded-lg border-0 bg-white py-3 pl-10 pr-20 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-orange-600 sm:text-sm sm:leading-6"
                />
                <div className="absolute inset-y-0 right-0 flex items-center">
                  <Button 
                    type="submit"
                    className="h-full rounded-l-none border-l border-gray-300 bg-orange-600 px-4 hover:bg-orange-700"
                  >
                    Search
                  </Button>
                </div>
              </div>
            </form>
          </FadeDiv>

          {/* Contact Options */}
          <FadeDiv>
            <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2 lg:gap-8 max-w-2xl mx-auto">
              <div className="group relative rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 hover:shadow-md transition-all duration-200">
                <div>
                  <span className="inline-flex rounded-lg bg-orange-50 p-3 ring-4 ring-white">
                    <RiMailLine className="h-6 w-6 text-orange-600" />
                  </span>
                </div>
                <div className="mt-4">
                  <h3 className="text-base font-semibold leading-7 text-gray-900">
                    Email Support
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    Get help via email
                  </p>
                  <Button asChild variant="outline" className="mt-3">
                    <Link href={siteConfig.baseLinks.supportContact}>
                      Contact Us
                    </Link>
                  </Button>
                  <p className="text-xs text-gray-500 mt-2">
                    Response within 2 hours
                  </p>
                </div>
              </div>

              <div className="group relative rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 hover:shadow-md transition-all duration-200">
                <div>
                  <span className="inline-flex rounded-lg bg-orange-50 p-3 ring-4 ring-white">
                    <RiCustomerService2Line className="h-6 w-6 text-orange-600" />
                  </span>
                </div>
                <div className="mt-4">
                  <h3 className="text-base font-semibold leading-7 text-gray-900">
                    Self-Service Tools
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    Track orders, check compatibility, manage billing
                  </p>
                  <Button
                    variant="outline"
                    className="mt-3"
                    onClick={() => {
                      const toolsSection = document.getElementById("tools-section")
                      if (toolsSection) {
                        toolsSection.scrollIntoView({ behavior: "smooth" })
                      }
                    }}
                  >
                    Browse Tools
                  </Button>
                  <p className="text-xs text-gray-500 mt-2">
                    Available 24/7
                  </p>
                </div>
              </div>
            </div>
          </FadeDiv>
        </div>
      </FadeContainer>
    </section>
  )
}