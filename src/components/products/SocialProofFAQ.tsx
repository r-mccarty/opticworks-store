"use client"

import { useState } from "react"
import { FadeDiv } from "@/components/Fade"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StarIcon } from "@heroicons/react/24/solid"
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline"

const testimonials = [
  {
    id: 1,
    name: "Mark T.",
    source: "Tesla Motors Club",
    rating: 5,
    text: "I was quoted $450 for the same thing. This kit was unbelievably easy and the results are perfect. The latch tool is a game-changer.",
    verified: true
  },
  {
    id: 2,
    name: "Jessica P.",
    source: "California",
    rating: 5,
    text: "Honestly, I was skeptical. But the pre-cut film fit like a glove. Took me 45 minutes from start to finish. 10/10.",
    verified: true
  },
  {
    id: 3,
    name: "David R.",
    source: "Tesla Owner",
    rating: 5,
    text: "Best investment I've made for my Model Y. The heat rejection is incredible and the install was actually fun. No bubbles, no stress.",
    verified: true
  },
  {
    id: 4,
    name: "Sarah M.",
    source: "DIY Enthusiast",
    rating: 5,
    text: "I've tried other DIY kits before and they were disasters. This is in a completely different league. Professional results without the pro price.",
    verified: true
  }
]

const faqs = [
  {
    id: 1,
    question: "What's the difference between 35%, 15%, and 5% VLT?",
    answer: "VLT (Visible Light Transmission) indicates how much light passes through the film. 35% allows more light and visibility (recommended for most users and legal in most states), 15% provides moderate darkness with good privacy, and 5% offers maximum privacy and heat rejection but may not be legal in all areas. We include a visual comparison guide with your kit."
  },
  {
    id: 2,
    question: "Is this really foolproof? What if I mess up?",
    answer: "We designed it to be as easy as possible. The pre-cut film and our revolutionary Door Latch Tool remove 99% of the risk. Plus, our video guide walks you through every step. We also offer our 'Oops Protection'—if you damage a film during install, we'll send a replacement for just the shipping & handling fee ($15)."
  },
  {
    id: 3,
    question: "Will this void my Tesla warranty?",
    answer: "No, cosmetic modifications like window tint do not void your vehicle's warranty. Tesla's warranty covers mechanical and electrical components, not cosmetic modifications. Window tinting is a common and accepted modification."
  },
  {
    id: 4,
    question: "How long will it last?",
    answer: "CyberShade IRX film is warrantied for life against bubbling, peeling, or fading. Our ceramic technology doesn't degrade like cheaper dyed films, so it will maintain its appearance and performance for the life of your vehicle."
  },
  {
    id: 5,
    question: "Do you offer kits for the rear windows or other cars?",
    answer: "The rear window kit for the Model Y is coming soon! We're also developing kits for Model 3, Model S, and other popular EVs. Sign up for our newsletter to be notified when new products are available."
  },
  {
    id: 6,
    question: "What if I live in an apartment and don't have a garage?",
    answer: "You can install CyberShade IRX in any shaded area - a covered parking garage, under a carport, or even in open shade on a calm day. The key is avoiding direct sunlight and wind. Many customers successfully install in public parking garages."
  }
]

export function SocialProofFAQ() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const toggleFaq = (id: number) => {
    setOpenFaq(openFaq === id ? null : id)
  }

  return (
    <div className="bg-gray-50 py-16">
      <div className="px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <FadeDiv>
            {/* Social Proof Header */}
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Join the OpticWorks Community.
              </h2>
              <p className="text-lg text-gray-600">
                See what other Tesla owners are saying.
              </p>
            </div>

            {/* Testimonials */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
              {testimonials.map((testimonial) => (
                <Card key={testimonial.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <StarIcon
                            key={i}
                            className="w-4 h-4 text-yellow-400"
                          />
                        ))}
                      </div>
                      {testimonial.verified && (
                        <Badge className="bg-green-100 text-green-800 text-xs">
                          Verified Purchase
                        </Badge>
                      )}
                    </div>
                    <p className="text-gray-700 mb-4 italic">
                      &ldquo;{testimonial.text}&rdquo;
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">
                        {testimonial.name}
                      </span>
                      <span className="text-sm text-gray-500">
                        {testimonial.source}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* User Generated Content Placeholder */}
            <div className="mb-16">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
                Share Your Install - #CyberShade
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i} className="aspect-square">
                    <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
                      <div className="text-center text-gray-400">
                        <div className="text-2xl mb-2">📸</div>
                        <p className="text-xs">Customer Photo {i}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* FAQ Section */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
                Frequently Asked Questions
              </h3>
              <div className="space-y-4">
                {faqs.map((faq) => (
                  <Card key={faq.id}>
                    <CardContent className="p-0">
                      <button
                        onClick={() => toggleFaq(faq.id)}
                        className="w-full p-6 text-left hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-gray-900 pr-8">
                            {faq.question}
                          </h4>
                          {openFaq === faq.id ? (
                            <ChevronUpIcon className="w-5 h-5 text-gray-500 flex-shrink-0" />
                          ) : (
                            <ChevronDownIcon className="w-5 h-5 text-gray-500 flex-shrink-0" />
                          )}
                        </div>
                      </button>
                      {openFaq === faq.id && (
                        <div className="px-6 pb-6">
                          <p className="text-gray-600 leading-relaxed">
                            {faq.answer}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </FadeDiv>
        </div>
      </div>
    </div>
  )
}