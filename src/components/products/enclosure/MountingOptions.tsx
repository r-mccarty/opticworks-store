"use client"

import { FadeDiv } from "@/components/Fade"
import { Card, CardContent } from "@/components/ui/card"

const mountingMethods = [
  {
    name: "Magnetic Mount",
    description: "Four embedded neodymium magnets attach to metal bed frames, nightstands, or wall plates.",
    bestFor: "Metal bed frames, IKEA furniture with steel components",
    strength: "Holds up to 2kg (4.4 lbs)",
    removable: true,
  },
  {
    name: "Adhesive Pad",
    description: "3M VHB double-sided tape for permanent attachment to wood, drywall, or painted surfaces.",
    bestFor: "Wooden headboards, wall mounting, platform beds",
    strength: "Rated for 3kg (6.6 lbs) on smooth surfaces",
    removable: false,
  },
  {
    name: "Bed-Rail Clip",
    description: "Spring-loaded clamp fits rails from 10mm to 40mm thick. Tool-free installation.",
    bestFor: "Adjustable bases, metal bed rails, guest rooms",
    strength: "Clamp force rated for 1.5kg (3.3 lbs)",
    removable: true,
  },
]

export function MountingOptions() {
  return (
    <div className="px-6 py-24 bg-white lg:px-8">
      <div className="mx-auto max-w-6xl">
        <FadeDiv className="text-center mb-16">
          <p className="text-sm uppercase tracking-wider text-gray-500 mb-4">
            Installation Flexibility
          </p>
          <h2 className="text-4xl font-semibold tracking-tight text-gray-900 mb-6">
            Three mounting methods included
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Every Enclosure Pack ships with all three mounting options so you can choose
            the best method for your bedroom setup. Switch between methods without buying
            additional hardware.
          </p>
        </FadeDiv>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {mountingMethods.map((method, index) => (
            <FadeDiv key={index}>
              <Card className="h-full border-2 hover:border-zinc-300 transition-colors">
                <CardContent className="p-8">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-zinc-200 to-slate-300 mb-6">
                    <span className="text-xl font-bold text-zinc-700">{index + 1}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {method.name}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {method.description}
                  </p>
                  <div className="space-y-3 pt-6 border-t border-gray-200">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Best for:</p>
                      <p className="text-sm text-gray-900">{method.bestFor}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Holding strength:</p>
                      <p className="text-sm text-gray-900">{method.strength}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Removable:</p>
                      <p className={`text-sm font-semibold ${method.removable ? 'text-green-600' : 'text-amber-600'}`}>
                        {method.removable ? 'Yes, no residue' : 'Permanent installation'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </FadeDiv>
          ))}
        </div>
      </div>
    </div>
  )
}
