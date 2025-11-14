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
    name: "Rina Patel",
    source: "Home Assistant Discord",
    rating: 5,
    text: "My lights finally stay on while I read in bed. The debug text sensor is worth the price alone—I can see every state change.",
    verified: true,
  },
  {
    id: 2,
    name: "Logan F.",
    source: "YouTube Review",
    rating: 5,
    text: "Cats jumping on the bed no longer trigger my morning routine. The Absolute Clear Delay concept makes so much sense.",
    verified: true,
  },
  {
    id: 3,
    name: "Mara V.",
    source: "HA Podcast",
    rating: 5,
    text: "It&apos;s the first sensor that gave me transparent tuning. Changing debounce timers while watching z-scores updates instantly.",
    verified: true,
  },
  {
    id: 4,
    name: "Alex Nguyen",
    source: "Beta Program",
    rating: 5,
    text: "Setup was 12 minutes from unboxing to automations. Being able to export the dashboards was chef&apos;s kiss.",
    verified: true,
  },
]

const faqs = [
  {
    id: 1,
    question: "How does it differ from a normal mmWave presence sensor?",
    answer:
      "The Bed Presence Sensor runs a 4-state finite state machine that looks at still-energy reflections, z-score significance, and temporal filtering. Cheap mmWave sensors expose a binary signal tied directly to motion. We expose every variable so you know exactly why a state changed.",
  },
  {
    id: 2,
    question: "Will it work with my existing Home Assistant setup?",
    answer:
      "Yes. The ESP32 gateway connects over Wi-Fi, exposes sensors/entities natively, and ships with Lovelace dashboards + helper templates. No cloud, no additional hub.",
  },
  {
    id: 3,
    question: "What is Absolute Clear Delay?",
    answer:
      "It&apos;s a cooldown timer that starts when the engine last saw high-confidence presence. Even if the signal dips, we wait (default 30s) before considering the bed empty so sleepers aren’t cleared while still.",
  },
  {
    id: 4,
    question: "Can I tune the thresholds?",
    answer:
      "Every threshold and debounce is exposed as a number slider in Home Assistant. You can watch z-scores and debug text sensors live while adjusting.",
  },
  {
    id: 5,
    question: "What about privacy?",
    answer:
      "The sensor uses mmWave radar to detect that someone is present—not who. All processing is local on the ESP32. No camera, no cloud dependency.",
  },
  {
    id: 6,
    question: "Do you offer replacements if I damage the sensor?",
    answer:
      "Yes. Our Oops Protection covers the first replacement sensor head for the cost of shipping. Developer kits also include spare breakout boards.",
  },
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
                Stories from Home Assistant builders and reliability nerds.
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
                Share your dashboard - #PresenceEngine
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
            <div id="faq">
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
