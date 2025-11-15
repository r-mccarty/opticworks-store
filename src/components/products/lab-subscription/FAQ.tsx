"use client"

import { FadeDiv } from "@/components/Fade"
import { Card, CardContent } from "@/components/ui/card"

const faqs = [
  {
    question: "Do I need special hardware to join the Lab?",
    answer: "No—any OpticWorks Bed Presence Sensor (including the Developer Edition, Duo Pack, or Spare Module) works with Lab firmware. You just need an active sensor and Home Assistant.",
  },
  {
    question: "What&apos;s the difference between Lab firmware and public releases?",
    answer: "Lab firmware includes experimental feature toggles and early access to new detection modes (typically 4-6 weeks ahead of public releases). Public firmware is more conservative and battle-tested by the Lab community first.",
  },
  {
    question: "Can I cancel anytime?",
    answer: "Yes—it's a true month-to-month subscription with no long-term commitment. Cancel via the self-service portal and you'll retain access until the end of your current billing period.",
  },
  {
    question: "Do I keep firmware updates after canceling?",
    answer: "You keep any firmware you downloaded while subscribed, but won't receive new builds after cancellation. Your sensor continues to work with the last firmware you installed—no lockout or expiration.",
  },
  {
    question: "Is the Discord channel included?",
    answer: "Yes—Discord access is included for all active subscribers. You'll lose access to the private Lab channel if you cancel, but can rejoin anytime by reactivating your subscription.",
  },
  {
    question: "Can I submit feature requests?",
    answer: "Absolutely. Lab members get a dedicated #feature-requests channel where engineers actively participate. Popular ideas often make it into the roadmap within 2-3 months.",
  },
]

export function FAQ() {
  return (
    <div className="px-6 py-24 bg-white lg:px-8">
      <div className="mx-auto max-w-4xl">
        <FadeDiv className="text-center mb-16">
          <p className="text-sm uppercase tracking-wider text-gray-500 mb-4">
            Frequently Asked Questions
          </p>
          <h2 className="text-4xl font-semibold tracking-tight text-gray-900 mb-6">
            Common questions about the Lab
          </h2>
        </FadeDiv>

        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <FadeDiv key={index}>
              <Card className="border-2 hover:border-rose-200 transition-colors">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    {faq.question}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {faq.answer}
                  </p>
                </CardContent>
              </Card>
            </FadeDiv>
          ))}
        </div>

        <FadeDiv className="mt-12 text-center">
          <Card className="bg-gradient-to-br from-rose-50 to-pink-50 border-2 border-rose-200">
            <CardContent className="p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Still have questions?
              </h3>
              <p className="text-gray-700 mb-6">
                Email us at{" "}
                <a href="mailto:lab@opticworks.com" className="font-semibold text-rose-600 hover:text-rose-700">
                  lab@opticworks.com
                </a>
                {" "}or join our public Discord for a preview of the community before subscribing.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="mailto:lab@opticworks.com"
                  className="inline-flex items-center justify-center px-6 py-3 border-2 border-rose-600 text-rose-600 font-semibold rounded-lg hover:bg-rose-50 transition-colors"
                >
                  Email Support
                </a>
                <a
                  href="https://discord.gg/opticworks"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-6 py-3 bg-rose-600 text-white font-semibold rounded-lg hover:bg-rose-700 transition-colors"
                >
                  Join Public Discord
                </a>
              </div>
            </CardContent>
          </Card>
        </FadeDiv>
      </div>
    </div>
  )
}
