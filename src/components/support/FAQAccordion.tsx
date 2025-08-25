"use client"

import { useState, useEffect, useMemo, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { RiSearchLine, RiCloseLine } from "@remixicon/react"
import { FadeContainer, FadeDiv } from "../Fade"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { faqData } from "@/lib/faqData"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

const categories = [
  { id: 'all', name: 'All Questions', count: faqData.length },
  { id: 'installation', name: 'Installation', count: faqData.filter(f => f.category === 'installation').length },
  { id: 'products', name: 'Products', count: faqData.filter(f => f.category === 'products').length },
  { id: 'shipping', name: 'Shipping', count: faqData.filter(f => f.category === 'shipping').length },
  { id: 'warranty', name: 'Warranty', count: faqData.filter(f => f.category === 'warranty').length },
  { id: 'legal', name: 'Legal', count: faqData.filter(f => f.category === 'legal').length },
  { id: 'general', name: 'General', count: faqData.filter(f => f.category === 'general').length },
]

function FAQContent() {
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(searchParams?.get('search') || '')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [openItems, setOpenItems] = useState<string[]>([])

  // Filter FAQs based on search and category
  const filteredFAQs = useMemo(() => {
    let filtered = faqData

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(faq => faq.category === selectedCategory)
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(faq => 
        faq.question.toLowerCase().includes(query) ||
        faq.answer.toLowerCase().includes(query) ||
        faq.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }

    return filtered
  }, [searchQuery, selectedCategory])

  // Auto-open first result if searching
  useEffect(() => {
    if (searchQuery.trim() && filteredFAQs.length > 0) {
      setOpenItems([filteredFAQs[0].id])
    }
  }, [searchQuery, filteredFAQs])

  const toggleItem = (itemId: string) => {
    setOpenItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  const clearSearch = () => {
    setSearchQuery('')
    setSelectedCategory('all')
    setOpenItems([])
  }

  return (
    <section className="py-24 sm:py-32">
      <FadeContainer className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Search and Filters */}
        <FadeDiv>
          <div className="mb-12 space-y-6">
            {/* Search Bar */}
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <RiSearchLine className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search frequently asked questions..."
                className="block w-full rounded-lg border-gray-300 bg-white py-3 pl-10 pr-12 text-gray-900 placeholder:text-gray-400 focus:border-blue-600 focus:ring-blue-600"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                >
                  <RiCloseLine className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className="h-8"
                >
                  {category.name}
                  <Badge variant="secondary" className="ml-2">
                    {category.count}
                  </Badge>
                </Button>
              ))}
            </div>

            {/* Results Count */}
            {(searchQuery || selectedCategory !== 'all') && (
              <div className="text-sm text-gray-600">
                {filteredFAQs.length} question{filteredFAQs.length !== 1 ? 's' : ''} found
                {searchQuery && (
                  <span> for &quot;{searchQuery}&quot;</span>
                )}
              </div>
            )}
          </div>
        </FadeDiv>

        {/* FAQ Items */}
        <div className="space-y-4">
          {filteredFAQs.length === 0 ? (
            <FadeDiv>
              <div className="text-center py-12">
                <RiSearchLine className="mx-auto h-12 w-12 text-gray-300" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  No questions found
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Try a different search term or browse all categories.
                </p>
                <Button
                  variant="outline"
                  onClick={clearSearch}
                  className="mt-4"
                >
                  Clear filters
                </Button>
              </div>
            </FadeDiv>
          ) : (
            filteredFAQs.map((faq) => (
              <FadeDiv key={faq.id}>
                <Collapsible
                  open={openItems.includes(faq.id)}
                  onOpenChange={() => toggleItem(faq.id)}
                >
                  <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
                    <CollapsibleTrigger className="flex w-full items-center justify-between p-6 text-left hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-inset">
                      <span className="font-medium text-gray-900 pr-4">
                        {faq.question}
                      </span>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">
                          {faq.category}
                        </Badge>
                        <div className="flex h-5 w-5 items-center justify-center">
                          <div className={`transition-transform duration-200 ${
                            openItems.includes(faq.id) ? 'rotate-180' : 'rotate-0'
                          }`}>
                            ▼
                          </div>
                        </div>
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="border-t border-gray-100 px-6 py-4">
                        <div className="prose prose-sm max-w-none text-gray-600">
                          {faq.answer}
                        </div>
                        {faq.tags.length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-1">
                            {faq.tags.map((tag) => (
                              <Badge
                                key={tag}
                                variant="secondary"
                                className="text-xs cursor-pointer hover:bg-blue-100"
                                onClick={() => setSearchQuery(tag)}
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              </FadeDiv>
            ))
          )}
        </div>

        {/* Still Need Help Section */}
        <FadeDiv>
          <div className="mt-16 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-100 p-8 text-center">
            <h3 className="text-xl font-semibold text-gray-900">
              Didn&apos;t find what you&apos;re looking for?
            </h3>
            <p className="mt-2 text-gray-600">
              Our support team is ready to help with any specific questions
            </p>
            <div className="mt-6">
              <Button asChild className="bg-blue-600 hover:bg-blue-700">
                <a href="/support/contact">
                  Contact Support
                </a>
              </Button>
            </div>
          </div>
        </FadeDiv>
      </FadeContainer>
    </section>
  )
}

export function FAQAccordion() {
  return (
    <Suspense fallback={<div className="py-24 text-center">Loading...</div>}>
      <FAQContent />
    </Suspense>
  )
}