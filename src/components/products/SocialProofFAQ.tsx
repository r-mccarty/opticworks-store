"use client"

import { useState } from "react"
import { FadeDiv } from "@/components/Fade"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline"

const faqs = [
  {
    id: 1,
    question: "How does it differ from a normal mmWave presence sensor?",
    answer:
      "The Presence Sensor Kit runs a multi‑state engine that fuses still‑energy reflections, z‑score significance, and temporal filtering. Cheap mmWave sensors expose a raw binary tied directly to motion. We expose every variable so you know exactly why a state changed.",
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
      "It’s a cooldown timer that starts when the engine last saw high‑confidence presence. Even if the signal dips, we wait (default 30s) before clearing a zone so still people aren’t dropped.",
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
      "Contact our support team for assistance with replacement hardware.",
  },
]

export function SocialProofFAQ() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const toggleFaq = (id: number) => {
    setOpenFaq(openFaq === id ? null : id)
  }

  return (
    <div className="bg-background py-20 text-foreground">
      <div className="px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <FadeDiv>
            {/* FAQ Section */}
            <div id="faq">
              <h3 className="text-2xl font-semibold text-foreground mb-8 text-center">
                Frequently Asked Questions
              </h3>
              <div className="space-y-4">
                {faqs.map((faq) => (
                  <Card key={faq.id}>
                    <CardContent className="p-0">
                      <button
                        onClick={() => toggleFaq(faq.id)}
                        className="w-full p-6 text-left hover:bg-muted/60 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-foreground pr-8">
                            {faq.question}
                          </h4>
                          {openFaq === faq.id ? (
                            <ChevronUpIcon className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                          ) : (
                            <ChevronDownIcon className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                          )}
                        </div>
                      </button>
                      {openFaq === faq.id && (
                        <div className="px-6 pb-6">
                          <p className="text-muted-foreground leading-relaxed">
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
